import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronRight,
  MoreHorizontal,
  Circle,
  Timer,
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Link,
  FileText,
  History,
  ListTodo,
  Plus,
  Send,
  Pencil,
  Trash2,
  ArrowLeftRight,
  UserPlus,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { AddTaskModal } from "@/features/projects/components/AddTaskModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusConfig = {
  todo: { label: "To Do", icon: Circle, color: "text-muted-foreground", bg: "bg-muted" },
  in_progress: { label: "In Progress", icon: Timer, color: "text-info", bg: "bg-info/10" },
  blocked: { label: "Blocked", icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
  done: { label: "Done", icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
};

const priorityColors = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning/10 text-warning",
  high: "bg-destructive/10 text-destructive",
};

// Utility: convert input to total minutes
function parseToMinutes(input: string): number {
  let total = 0;
  const dayMatch = input.match(/(\d+)\s*d/i);
  const hourMatch = input.match(/(\d+)\s*h/i);
  const minMatch = input.match(/(\d+)\s*m/i);
  if (dayMatch) total += parseInt(dayMatch[1]) * 8 * 60; // 1 day = 8 hours
  if (hourMatch) total += parseInt(hourMatch[1]) * 60;
  if (minMatch) total += parseInt(minMatch[1]);
  return total;
}

// Utility: convert minutes to formatted string (nd nh nm)
function formatMinutes(minutes: number): string {
  if (minutes <= 0) return "0m";
  const days = Math.floor(minutes / (8 * 60));
  const remainingAfterDays = minutes % (8 * 60);
  const hours = Math.floor(remainingAfterDays / 60);
  const mins = remainingAfterDays % 60;
  let result = "";
  if (days > 0) result += `${days}d `;
  if (hours > 0) result += `${hours}h `;
  if (mins > 0) result += `${mins}m`;
  return result.trim() || "0m";
}

interface EstimationPeriod {
  id: string;
  input: string;
  minutes: number;
}

interface ProgressLog {
  id: string;
  input: string;
  minutes: number;
  date: string;
}

type ApiTaskDetail = {
  id: string;
  title?: string;
  description?: string | null;
  status?: string;
  priority?: string;
  dueDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  createdById?: string;
  createdBy?: {
    id?: string;
    name?: string;
  };
  projectId?: string | null;
  estimatedHours?: number | null;
  assignments?: Array<{ user?: { id?: string; name?: string } }>;
};

type ApiTaskComment = {
  id: string;
  content?: string;
  createdAt?: string;
  author?: { name?: string };
};

type ApiWorkLog = {
  id: string;
  hours?: number;
  loggedAt?: string;
};

type ApiActivityEvent = {
  id: string;
  type?: string;
  message?: string;
  occurredAt?: string;
  actor?: {
    name?: string;
  };
};

type ApiTaskAttachment = {
  id: string;
  fileId?: string;
  addedAt?: string;
  file?: {
    id?: string;
    name?: string;
  };
};

type TeamDriveFile = {
  id: string;
  name: string;
};

type ResourceLink = {
  id: string;
  title: string;
  url: string;
  createdAt?: string;
};

type ChildTask = {
  id: string;
  title: string;
  status?: string;
  description?: string | null;
};

type ApiProjectTaskRecord = {
  id?: string;
  taskId?: string;
  title?: string;
  status?: string;
  description?: string | null;
  task?: {
    id?: string;
    title?: string;
    status?: string;
    description?: string | null;
  };
};

type TeamMemberOption = {
  userId: string;
  userName: string;
};

type HistoryEntry = {
  id: string;
  at: string;
  action: string;
  details: string;
  actor?: string;
  source: "activity" | "comment" | "worklog" | "attachment" | "resource" | "task";
};

type TabId = "story" | "resources" | "estimate" | "children" | "comments" | "history";

const tabs = [
  { id: "story" as TabId, label: "User Story", icon: FileText },
  { id: "resources" as TabId, label: "Resources", icon: Link },
  { id: "estimate" as TabId, label: "Estimate", icon: Clock },
  { id: "children" as TabId, label: "Child Tasks", icon: ListTodo },
  { id: "comments" as TabId, label: "Comments", icon: MessageSquare },
  { id: "history" as TabId, label: "History", icon: History },
];

const TASK_RESOURCE_LINK_PREFIX = "__TASK_RESOURCE_LINK__";
const TASK_CHILD_MARKER_PREFIX = "__PARENT_TASK__:";

function extractParentTaskId(description?: string | null): string | null {
  if (!description) return null;
  const firstLine = description.split("\n")[0]?.trim() || "";
  if (!firstLine.startsWith(TASK_CHILD_MARKER_PREFIX)) return null;
  const parentId = firstLine.slice(TASK_CHILD_MARKER_PREFIX.length).trim();
  return parentId || null;
}

function stripParentMarker(description?: string | null): string {
  if (!description) return "";
  const lines = description.split("\n");
  if (!lines[0]?.trim().startsWith(TASK_CHILD_MARKER_PREFIX)) return description;
  return lines.slice(1).join("\n").trim();
}

function buildDescriptionWithParent(parentTaskId: string, content?: string): string {
  const clean = (content || "").trim();
  return clean ? `${TASK_CHILD_MARKER_PREFIX}${parentTaskId}\n${clean}` : `${TASK_CHILD_MARKER_PREFIX}${parentTaskId}`;
}

function normalizeProjectTaskRecord(record: ApiProjectTaskRecord): ChildTask | null {
  const source = record.task || record;
  const id = source.id || record.taskId || record.id;
  if (!id) return null;
  return {
    id,
    title: source.title || "Untitled task",
    status: source.status,
    description: source.description,
  };
}

function is404Error(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const maybeError = error as {
    status?: number;
    message?: string;
    response?: { status?: number };
  };
  return (
    maybeError.status === 404 ||
    maybeError.response?.status === 404 ||
    (typeof maybeError.message === "string" && maybeError.message.includes("404"))
  );
}

export default function TaskDetail() {
  const { teamId, taskId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const tab = searchParams.get("tab");
    if (tab && ["story", "resources", "estimate", "children", "comments", "history"].includes(tab)) {
      return tab as TabId;
    }
    return "story";
  });
  const [newComment, setNewComment] = useState("");
  const [task, setTask] = useState<ApiTaskDetail | null>(null);
  const [projectName, setProjectName] = useState("Project");
  const [comments, setComments] = useState<ApiTaskComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMemberOption[]>([]);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [quickPanel, setQuickPanel] = useState<null | "status" | "assign" | "delete">(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isEditingStory, setIsEditingStory] = useState(false);
  const [storyDraft, setStoryDraft] = useState("");
  const [attachments, setAttachments] = useState<ApiTaskAttachment[]>([]);
  const [teamDriveFiles, setTeamDriveFiles] = useState<TeamDriveFile[]>([]);
  const [resourceLinks, setResourceLinks] = useState<ResourceLink[]>([]);
  const [showAddResourcePanel, setShowAddResourcePanel] = useState(false);
  const [newResourceLinkTitle, setNewResourceLinkTitle] = useState("");
  const [newResourceLinkUrl, setNewResourceLinkUrl] = useState("");
  const [childTasks, setChildTasks] = useState<ChildTask[]>([]);
  const [newChildTaskTitle, setNewChildTaskTitle] = useState("");
  const [editingChildTaskId, setEditingChildTaskId] = useState<string | null>(null);
  const [editingChildTaskTitle, setEditingChildTaskTitle] = useState("");
  const [activityEvents, setActivityEvents] = useState<ApiActivityEvent[]>([]);
  const [workLogs, setWorkLogs] = useState<ApiWorkLog[]>([]);

  // Estimation state
  const [estimations, setEstimations] = useState<EstimationPeriod[]>([]);
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([]);
  const [newEstimation, setNewEstimation] = useState("");
  const [newProgress, setNewProgress] = useState("");

  const loadTaskDetails = useCallback(async () => {
    if (!teamId || !taskId) return;
    setIsLoading(true);
    try {
      const [taskResponse, commentResponse, workLogResponse, activityResponse] = await Promise.all([
        api.get<ApiTaskDetail>(`/teams/${teamId}/tasks/${taskId}`),
        api.get<ApiTaskComment[]>(`/teams/${teamId}/tasks/${taskId}/comments`).catch(() => []),
        api.get<{ items?: ApiWorkLog[] }>(`/teams/${teamId}/tasks/${taskId}/work-logs`).catch(() => ({ items: [] })),
        api
          .get<{ items?: ApiActivityEvent[] } | ApiActivityEvent[]>(`/teams/${teamId}/activity/entity/TASK/${taskId}?limit=100`)
          .catch(() => ({ items: [] })),
      ]);

      setTask(taskResponse);
      const allComments = Array.isArray(commentResponse) ? commentResponse : [];
      const parsedLinks: ResourceLink[] = [];
      const plainComments = allComments.filter((comment) => {
        const content = comment.content || "";
        if (!content.startsWith(TASK_RESOURCE_LINK_PREFIX)) {
          return true;
        }

        try {
          const payload = JSON.parse(content.slice(TASK_RESOURCE_LINK_PREFIX.length)) as { title?: string; url?: string };
          if (payload?.url) {
            parsedLinks.push({
              id: comment.id,
              title: payload.title || payload.url,
              url: payload.url,
              createdAt: comment.createdAt,
            });
          }
        } catch {
          // Keep malformed marker comments hidden from normal comments UI.
        }
        return false;
      });
      setComments(plainComments);
      setResourceLinks(parsedLinks);
      setActivityEvents(
        Array.isArray(activityResponse)
          ? activityResponse
          : Array.isArray(activityResponse?.items)
            ? activityResponse.items
            : [],
      );

      const estimated = Number(taskResponse?.estimatedHours || 0);
      setEstimations(
        estimated > 0
          ? [{ id: "e-estimated", input: `${estimated}h`, minutes: estimated * 60 }]
          : [],
      );

      const logs = Array.isArray(workLogResponse?.items) ? workLogResponse.items : [];
      setWorkLogs(logs);
      setProgressLogs(
        logs.map((log) => {
          const hours = Number(log.hours || 0);
          const minutes = Math.max(0, Math.round(hours * 60));
          return {
            id: log.id,
            input: `${hours}h`,
            minutes,
            date: log.loggedAt
              ? new Date(log.loggedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              : "-",
          };
        }),
      );

      const attachmentsResponse = await api
        .get<ApiTaskAttachment[]>(`/teams/${teamId}/tasks/${taskId}/attachments`)
        .catch(() => []);
      setAttachments(Array.isArray(attachmentsResponse) ? attachmentsResponse : []);

      if (taskResponse?.projectId) {
        const projectTasksResponse = await api
          .get<ApiProjectTaskRecord[]>(`/projects/${taskResponse.projectId}/tasks`)
          .catch(() => []);
        const projectTasks = (Array.isArray(projectTasksResponse) ? projectTasksResponse : [])
          .map((record) => normalizeProjectTaskRecord(record))
          .filter((record): record is ChildTask => Boolean(record));
        const children = projectTasks.filter(
          (projectTask) =>
            projectTask.id !== taskResponse.id &&
            extractParentTaskId(projectTask.description) === taskResponse.id,
        );
        setChildTasks(children);
      } else {
        setChildTasks([]);
      }

      if (taskResponse?.projectId) {
        try {
          const project = await api.get<{ name?: string; title?: string }>(`/projects/${taskResponse.projectId}`);
          setProjectName(project?.name || project?.title || "Project");
        } catch {
          setProjectName("Project");
        }
      } else {
        setProjectName("Project");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to load task details";
      toast.error(message);
      setTask(null);
    } finally {
      setIsLoading(false);
    }
  }, [teamId, taskId]);

  useEffect(() => {
    void loadTaskDetails();
  }, [loadTaskDetails]);

  useEffect(() => {
    setStoryDraft(stripParentMarker(task?.description || ""));
  }, [task?.description]);

  useEffect(() => {
    if (!teamId) return;
    const loadMembers = async () => {
      try {
        const response = await api.get<Array<{ userId?: string; userName?: string }>>(`/teams/${teamId}/members`);
        const members = Array.isArray(response)
          ? response
              .map((member) => ({
                userId: member.userId || "",
                userName: member.userName || "Unknown",
              }))
              .filter((member) => Boolean(member.userId))
          : [];
        setTeamMembers(members);
      } catch {
        setTeamMembers([]);
      }
    };
    void loadMembers();
  }, [teamId]);

  useEffect(() => {
    if (!teamId) return;
    const loadTeamFiles = async () => {
      try {
        const files = await api.get<Array<{ id?: string; name?: string }>>(`/teams/${teamId}/files`);
        const normalized = Array.isArray(files)
          ? files
              .map((file) => ({ id: file.id || "", name: file.name || "Unnamed file" }))
              .filter((file) => Boolean(file.id))
          : [];
        setTeamDriveFiles(normalized);
      } catch {
        setTeamDriveFiles([]);
      }
    };
    void loadTeamFiles();
  }, [teamId]);

  const totalEstimatedMinutes = estimations.reduce((sum, e) => sum + e.minutes, 0);
  const totalProgressMinutes = progressLogs.reduce((sum, p) => sum + p.minutes, 0);
  const progressPercent = totalEstimatedMinutes > 0 ? Math.min((totalProgressMinutes / totalEstimatedMinutes) * 100, 100) : 0;
  const overflowPercent = totalEstimatedMinutes > 0 && totalProgressMinutes > totalEstimatedMinutes
    ? ((totalProgressMinutes - totalEstimatedMinutes) / totalEstimatedMinutes) * 100
    : 0;

  const addEstimation = () => {
    if (!newEstimation.trim()) return;
    const minutes = parseToMinutes(newEstimation);
    if (minutes <= 0) return;
    setEstimations([...estimations, { id: `e${Date.now()}`, input: newEstimation, minutes }]);
    setNewEstimation("");
  };

  const removeEstimation = (id: string) => {
    setEstimations(estimations.filter(e => e.id !== id));
  };

  const addProgress = () => {
    if (!newProgress.trim()) return;
    const minutes = parseToMinutes(newProgress);
    if (minutes <= 0) return;
    setProgressLogs([...progressLogs, { 
      id: `p${Date.now()}`, 
      input: newProgress, 
      minutes, 
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }]);
    setNewProgress("");
  };

  const addComment = async () => {
    if (!teamId || !taskId || !newComment.trim()) return;
    try {
      const created = await api.post<ApiTaskComment>(`/teams/${teamId}/tasks/${taskId}/comments`, {
        content: newComment.trim(),
      });
      setComments((prev) => [created, ...prev]);
      setNewComment("");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to add comment";
      toast.error(message);
    }
  };

  const attachDriveFile = async (fileId: string) => {
    if (!teamId || !taskId || !fileId) return;
    try {
      setIsActionLoading(true);
      await api.post(`/teams/${teamId}/tasks/${taskId}/attachments`, { fileId });
      toast.success("File attached");
      await loadTaskDetails();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to attach file";
      toast.error(message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const removeAttachment = async (attachmentId: string) => {
    if (!teamId || !taskId) return;
    try {
      setIsActionLoading(true);
      await api.delete(`/teams/${teamId}/tasks/${taskId}/attachments/${attachmentId}`);
      toast.success("Resource removed");
      await loadTaskDetails();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to remove resource";
      toast.error(message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const addResourceLink = async () => {
    if (!teamId || !taskId) return;
    const url = newResourceLinkUrl.trim();
    if (!url) {
      toast.error("Link URL is required");
      return;
    }

    const title = newResourceLinkTitle.trim() || url;
    const marker = `${TASK_RESOURCE_LINK_PREFIX}${JSON.stringify({ title, url })}`;

    try {
      setIsActionLoading(true);
      await api.post(`/teams/${teamId}/tasks/${taskId}/comments`, { content: marker });
      setNewResourceLinkTitle("");
      setNewResourceLinkUrl("");
      toast.success("Link added");
      await loadTaskDetails();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to add link";
      toast.error(message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const removeResourceLink = async (commentId: string) => {
    if (!teamId || !taskId) return;
    try {
      setIsActionLoading(true);
      await api.delete(`/teams/${teamId}/tasks/${taskId}/comments/${commentId}`);
      toast.success("Link removed");
      await loadTaskDetails();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to remove link";
      toast.error(message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const addChildTask = async () => {
    if (!teamId || !taskId || !task?.projectId || !newChildTaskTitle.trim()) return;
    try {
      setIsActionLoading(true);
      const createdTask = await api.post<{ id: string }>(`/teams/${teamId}/tasks`, {
        title: newChildTaskTitle.trim(),
        description: buildDescriptionWithParent(taskId),
        priority: "MEDIUM",
      });
      if (createdTask?.id) {
        await api.post(`/projects/${task.projectId}/tasks/${createdTask.id}`);
      }
      setNewChildTaskTitle("");
      toast.success("Child task added");
      await loadTaskDetails();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to add child task";
      toast.error(message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const toggleChildTask = async (itemId: string, currentStatus?: string) => {
    if (!teamId || !taskId) return;
    try {
      setIsActionLoading(true);
      const nextStatus = (currentStatus || "").toUpperCase() === "DONE" ? "TODO" : "DONE";
      await api.patch(`/teams/${teamId}/tasks/${itemId}`, { status: nextStatus });
      await loadTaskDetails();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update child task";
      toast.error(message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const startEditChildTask = (item: ChildTask) => {
    setEditingChildTaskId(item.id);
    setEditingChildTaskTitle(item.title);
  };

  const saveChildTaskTitle = async () => {
    if (!teamId || !taskId || !editingChildTaskId || !editingChildTaskTitle.trim()) return;
    try {
      setIsActionLoading(true);
      try {
        await api.patch(`/teams/${teamId}/tasks/${editingChildTaskId}`, {
          title: editingChildTaskTitle.trim(),
        });
      } catch (patchError) {
        if (!is404Error(patchError)) {
          throw patchError;
        }
        await api.put(`/teams/${teamId}/tasks/${editingChildTaskId}`, {
          title: editingChildTaskTitle.trim(),
        });
      }
      setEditingChildTaskId(null);
      setEditingChildTaskTitle("");
      toast.success("Child task updated");
      await loadTaskDetails();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update child task";
      toast.error(message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const deleteChildTask = async (itemId: string) => {
    if (!teamId || !taskId) return;
    try {
      setIsActionLoading(true);
      await api.delete(`/teams/${teamId}/tasks/${itemId}`);
      toast.success("Child task removed");
      await loadTaskDetails();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to remove child task";
      toast.error(message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const saveUserStory = async () => {
    if (!teamId || !taskId) return;
    try {
      setIsActionLoading(true);
      await api.patch(`/teams/${teamId}/tasks/${taskId}`, {
        description: extractParentTaskId(task?.description)
          ? buildDescriptionWithParent(extractParentTaskId(task?.description) as string, storyDraft)
          : storyDraft.trim(),
      });
      toast.success("User Story updated");
      setIsEditingStory(false);
      await loadTaskDetails();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update User Story";
      toast.error(message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEditTask = async () => {
    setShowEditTaskModal(true);
  };

  const handleChangeStatus = async () => {
    setQuickPanel("status");
  };

  const handleReassign = async () => {
    setQuickPanel("assign");
  };

  const handleDeleteTask = async () => {
    setQuickPanel("delete");
  };

  const applyStatusChange = async (nextStatus: string) => {
    if (!teamId || !taskId) return;
    try {
      setIsActionLoading(true);
      await api.patch(`/teams/${teamId}/tasks/${taskId}`, { status: nextStatus });
      toast.success("Task status updated");
      setQuickPanel(null);
      await loadTaskDetails();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update task status";
      toast.error(message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const applyReassign = async (selectedUserId: string) => {
    if (!teamId || !taskId) return;
    const currentAssigneeId = task?.assignments?.[0]?.user?.id || "";

    if (!selectedUserId || selectedUserId === currentAssigneeId) {
      setQuickPanel(null);
      return;
    }

    try {
      setIsActionLoading(true);
      if (currentAssigneeId) {
        await api.delete(`/teams/${teamId}/tasks/${taskId}/assign/${currentAssigneeId}`).catch(() => undefined);
      }
      await api.post(`/teams/${teamId}/tasks/${taskId}/assign`, { userId: selectedUserId });
      toast.success("Task reassigned");
      setQuickPanel(null);
      await loadTaskDetails();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to reassign task";
      toast.error(message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const confirmDeleteTask = async () => {
    if (!teamId || !taskId) return;

    try {
      setIsActionLoading(true);
      await api.delete(`/teams/${teamId}/tasks/${taskId}`);
      toast.success("Task archived");
      navigate(`/${teamId}/projects`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to archive task";
      toast.error(message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const statusKey = ((task?.status || "TODO").toLowerCase() as keyof typeof statusConfig);
  const safeStatusKey = statusKey in statusConfig ? statusKey : "todo";
  const StatusIcon = statusConfig[safeStatusKey].icon;
  const priorityKey = ((task?.priority || "MEDIUM").toLowerCase() as keyof typeof priorityColors);
  const safePriorityKey = priorityKey in priorityColors ? priorityKey : "medium";
  const ownerName = task?.assignments?.[0]?.user?.name || "Unassigned";
  const ownerInitials = ownerName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
  const dueDateLabel = task?.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "-";
  const createdAtLabel = task?.createdAt
    ? formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })
    : "-";
  const createdByLabel = task?.createdBy?.name || task?.createdById || "-";
  const title = task?.title || "Task";
  const description = stripParentMarker(task?.description) || "No description";
  const isCurrentTaskChild = Boolean(extractParentTaskId(task?.description));
  const visibleTabs = isCurrentTaskChild ? tabs.filter((tab) => tab.id !== "children") : tabs;
  const historyEntries = useMemo<HistoryEntry[]>(() => {
    const fromActivity: HistoryEntry[] = activityEvents
      .filter((event) => Boolean(event.occurredAt))
      .map((event) => ({
        id: `activity-${event.id}`,
        at: event.occurredAt as string,
        action: event.type || "activity",
        details: event.message || event.type || "Activity updated",
        actor: event.actor?.name,
        source: "activity",
      }));

    const fromComments: HistoryEntry[] = comments
      .filter((comment) => Boolean(comment.createdAt))
      .map((comment) => ({
        id: `comment-${comment.id}`,
        at: comment.createdAt as string,
        action: "task.commented",
        details: comment.content || "Comment added",
        actor: comment.author?.name,
        source: "comment",
      }));

    const fromWorkLogs: HistoryEntry[] = workLogs
      .filter((log) => Boolean(log.loggedAt))
      .map((log) => {
        const hours = Number(log.hours || 0);
        const minutes = Math.max(0, Math.round(hours * 60));
        return {
          id: `worklog-${log.id}`,
          at: log.loggedAt as string,
          action: "task.work_logged",
          details: `Logged ${formatMinutes(minutes)}`,
          source: "worklog" as const,
        };
      });

    const fromAttachments: HistoryEntry[] = attachments
      .filter((attachment) => Boolean(attachment.addedAt))
      .map((attachment) => ({
        id: `attachment-${attachment.id}`,
        at: attachment.addedAt as string,
        action: "task.attachment_added",
        details: `Attached file: ${attachment.file?.name || "File"}`,
        source: "attachment",
      }));

    const fromResourceLinks: HistoryEntry[] = resourceLinks
      .filter((resource) => Boolean(resource.createdAt))
      .map((resource) => ({
        id: `resource-${resource.id}`,
        at: resource.createdAt as string,
        action: "task.resource_linked",
        details: `Linked resource: ${resource.title}`,
        source: "resource",
      }));

    const fromTaskMeta: HistoryEntry[] = [
      task?.createdAt
        ? {
            id: "task-created",
            at: task.createdAt,
            action: "task.created",
            details: "Task created",
            actor: task.createdBy?.name || task.createdById || undefined,
            source: "task" as const,
          }
        : null,
      task?.updatedAt
        ? {
            id: "task-updated",
            at: task.updatedAt,
            action: "task.updated",
            details: "Task updated",
            source: "task" as const,
          }
        : null,
    ].filter((entry): entry is HistoryEntry => Boolean(entry));

    return [...fromActivity, ...fromComments, ...fromWorkLogs, ...fromAttachments, ...fromResourceLinks, ...fromTaskMeta]
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  }, [
    activityEvents,
    attachments,
    comments,
    resourceLinks,
    task?.createdAt,
    task?.createdBy?.name,
    task?.createdById,
    task?.updatedAt,
    workLogs,
  ]);

  useEffect(() => {
    if (isCurrentTaskChild && activeTab === "children") {
      setActiveTab("story");
    }
  }, [isCurrentTaskChild, activeTab]);

  if (isLoading && !task) {
    return (
      <MainLayout>
        <div className="p-6 text-sm text-muted-foreground">Loading task...</div>
      </MainLayout>
    );
  }

  if (!task) {
    return (
      <MainLayout>
        <div className="p-6 text-sm text-muted-foreground">Task not found.</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-120px)] overflow-hidden">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-border bg-card text-sm">
          
          <button
            onClick={() => navigate(`/${teamId}/projects`)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className=" bg-sidebar-accent text-sidebar-foreground rounded px-2 py-1">{projectName}</span><span className="text-sm ms-3"> Projects </span>
          </button>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground font-medium">{title}</span>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 lg:p-8 max-w-5xl mx-auto">
            {/* Task Card */}
            <div className="mb-6 rounded-2xl border border-border/70 bg-gradient-to-b from-card via-card to-muted/20 shadow-sm backdrop-blur-sm p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", statusConfig[safeStatusKey].bg)}>
                    <StatusIcon className={cn("w-5 h-5", statusConfig[safeStatusKey].color)} />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold">{title}</h1>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusConfig[safeStatusKey].bg, statusConfig[safeStatusKey].color)}>
                        {statusConfig[safeStatusKey].label}
                      </span>
                      <span>•</span>
                      <span className={cn("px-2 py-0.5 rounded text-xs font-medium uppercase", priorityColors[safePriorityKey])}>
                        {safePriorityKey}
                      </span>
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleEditTask}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit Task
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleChangeStatus}>
                      <ArrowLeftRight className="w-4 h-4 mr-2" />
                      Change Status
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleReassign}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Re-assign
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={handleDeleteTask}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Task
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-6">{description}</p>

              {quickPanel === "status" && (
                <div className="mb-4 rounded-lg border border-border bg-muted/20 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium">Change Status</p>
                    <Button variant="ghost" size="sm" onClick={() => setQuickPanel(null)}>Close</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["TODO", "IN_PROGRESS", "REVIEW", "DONE", "CANCELLED"].map((status) => (
                      <Button
                        key={status}
                        variant="outline"
                        size="sm"
                        disabled={isActionLoading}
                        onClick={() => applyStatusChange(status)}
                      >
                        {status.replace("_", " ")}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {quickPanel === "assign" && (
                <div className="mb-4 rounded-lg border border-border bg-muted/20 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium">Re-assign Task</p>
                    <Button variant="ghost" size="sm" onClick={() => setQuickPanel(null)}>Close</Button>
                  </div>
                  {teamMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No team members available.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {teamMembers.map((member) => (
                        <Button
                          key={member.userId}
                          variant="outline"
                          size="sm"
                          disabled={isActionLoading}
                          onClick={() => applyReassign(member.userId)}
                        >
                          {member.userName}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {quickPanel === "delete" && (
                <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                  <p className="text-sm font-medium text-destructive mb-2">Archive This Task?</p>
                  <p className="text-xs text-muted-foreground mb-3">This action archives the task and removes it from active lists.</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setQuickPanel(null)} disabled={isActionLoading}>
                      Cancel
                    </Button>
                    <Button size="sm" variant="destructive" onClick={confirmDeleteTask} disabled={isActionLoading}>
                      {isActionLoading ? "Archiving..." : "Confirm Archive"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Meta Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl border border-border/60 bg-background/70">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Owner</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                      {ownerInitials}
                    </div>
                    <span className="text-sm font-medium">{ownerName}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                  <p className="text-sm font-medium">{dueDateLabel}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Created</p>
                  <p className="text-sm font-medium">{createdAtLabel}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Created By</p>
                  <p className="text-sm font-medium">{createdByLabel}</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-6 border-t border-border pt-4">
                <div className="flex items-center gap-1 overflow-x-auto pb-2">
                  {visibleTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                        activeTab === tab.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                      {tab.id === "comments" && (
                        <span className="px-1.5 py-0.5 rounded-full bg-primary-foreground/20 text-[10px]">
                          {comments.length}
                        </span>
                      )}
                      {tab.id === "children" && (
                        <span className="px-1.5 py-0.5 rounded-full bg-primary-foreground/20 text-[10px]">
                          {isCurrentTaskChild ? 0 : childTasks.length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="widget-card">
              {activeTab === "story" && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      User Story
                    </h3>
                    {!isEditingStory ? (
                      <Button variant="outline" size="sm" onClick={() => setIsEditingStory(true)}>
                        <Pencil className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setStoryDraft(task?.description || "");
                            setIsEditingStory(false);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button size="sm" onClick={saveUserStory} disabled={isActionLoading}>
                          {isActionLoading ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    )}
                  </div>
                  {isEditingStory ? (
                    <textarea
                      value={storyDraft}
                      onChange={(e) => setStoryDraft(e.target.value)}
                      placeholder="Write user story..."
                      className="w-full min-h-[140px] rounded-lg border border-input bg-background p-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  ) : (
                    <p className="text-muted-foreground bg-muted/30 p-4 rounded-lg italic whitespace-pre-line">
                      {description || "No user story yet."}
                    </p>
                  )}
                </div>
              )}

              {activeTab === "resources" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Link className="w-4 h-4 text-primary" />
                      Resources
                    </h3>
                    <Button variant="outline" size="sm" onClick={() => setShowAddResourcePanel((prev) => !prev)}>
                      <Plus className="w-4 h-4 mr-1" />
                      {showAddResourcePanel ? "Close" : "Add Resource"}
                    </Button>
                  </div>

                  {showAddResourcePanel && (
                    <div className="mb-4 rounded-lg border border-border bg-muted/20 p-4 space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Attach From Team Drive</p>
                        {teamDriveFiles.length === 0 ? (
                          <p className="text-xs text-muted-foreground">No team files found.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {teamDriveFiles.slice(0, 15).map((file) => (
                              <Button
                                key={file.id}
                                size="sm"
                                variant="outline"
                                disabled={isActionLoading}
                                onClick={() => attachDriveFile(file.id)}
                              >
                                {file.name}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="border-t border-border pt-4">
                        <p className="text-sm font-medium mb-2">Add Link Resource</p>
                        <div className="grid gap-2">
                          <Input
                            value={newResourceLinkTitle}
                            onChange={(e) => setNewResourceLinkTitle(e.target.value)}
                            placeholder="Link title (optional)"
                          />
                          <Input
                            value={newResourceLinkUrl}
                            onChange={(e) => setNewResourceLinkUrl(e.target.value)}
                            placeholder="https://..."
                          />
                          <div>
                            <Button size="sm" onClick={addResourceLink} disabled={isActionLoading}>
                              {isActionLoading ? "Saving..." : "Add Link"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{attachment.file?.name || "Attachment"}</p>
                          <p className="text-xs text-muted-foreground">
                            {attachment.addedAt ? new Date(attachment.addedAt).toLocaleString() : ""}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          disabled={isActionLoading}
                          onClick={() => removeAttachment(attachment.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}

                    {resourceLinks.map((linkItem) => (
                      <div key={linkItem.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div className="min-w-0">
                          <a href={linkItem.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary hover:underline truncate block">
                            {linkItem.title}
                          </a>
                          <p className="text-xs text-muted-foreground truncate">{linkItem.url}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          disabled={isActionLoading}
                          onClick={() => removeResourceLink(linkItem.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}

                    {attachments.length === 0 && resourceLinks.length === 0 && (
                      <p className="text-sm text-muted-foreground">No linked resources yet.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "estimate" && (
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Time Estimation
                  </h3>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {formatMinutes(totalProgressMinutes)} / {formatMinutes(totalEstimatedMinutes)}
                      </span>
                    </div>
                    <div className="h-4 bg-muted rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${Math.min(progressPercent, 100)}%` }}
                      />
                      {overflowPercent > 0 && (
                        <div
                          className="h-full bg-destructive absolute top-0 transition-all"
                          style={{ left: "100%", width: `${Math.min(overflowPercent, 50)}%`, marginLeft: "-1px" }}
                        />
                      )}
                    </div>
                    {overflowPercent > 0 && (
                      <p className="text-xs text-destructive mt-1">
                        Exceeded by {formatMinutes(totalProgressMinutes - totalEstimatedMinutes)}
                      </p>
                    )}
                  </div>

                  {/* Estimation Periods */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium">Estimation Periods</h4>
                    </div>
                    <div className="space-y-2 mb-3">
                      {estimations.map((est) => (
                        <div key={est.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div>
                            <span className="text-sm font-medium">{formatMinutes(est.minutes)}</span>
                            <span className="text-xs text-muted-foreground ml-2">(entered: {est.input})</span>
                          </div>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeEstimation(est.id)}>
                            <Trash2 className="w-3 h-3 text-muted-foreground" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newEstimation}
                        onChange={(e) => setNewEstimation(e.target.value)}
                        placeholder="e.g., 2d 4h 30m"
                        className="flex-1"
                        onKeyDown={(e) => e.key === "Enter" && addEstimation()}
                      />
                      <Button variant="outline" onClick={addEstimation}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Format: Xd Xh Xm (1 day = 8 hours)</p>
                  </div>

                  {/* Progress Logs */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium">Progress Logs</h4>
                    </div>
                    <div className="space-y-2 mb-3">
                      {progressLogs.map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20">
                          <div className="flex items-center gap-3">
                            <Play className="w-4 h-4 text-success" />
                            <div>
                              <span className="text-sm font-medium">{formatMinutes(log.minutes)}</span>
                              <span className="text-xs text-muted-foreground ml-2">{log.date}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newProgress}
                        onChange={(e) => setNewProgress(e.target.value)}
                        placeholder="Log time: e.g., 4h 30m"
                        className="flex-1"
                        onKeyDown={(e) => e.key === "Enter" && addProgress()}
                      />
                      <Button onClick={addProgress}>
                        <Plus className="w-4 h-4 mr-1" />
                        Log
                      </Button>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
                    <div className="p-4 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-1">Total Estimated</p>
                      <p className="text-2xl font-bold text-primary">{formatMinutes(totalEstimatedMinutes)}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                      <p className="text-2xl font-bold">{dueDateLabel}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "children" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <ListTodo className="w-4 h-4 text-primary" />
                      Child Tasks
                    </h3>
                  </div>

                  {isCurrentTaskChild ? (
                    <p className="text-sm text-muted-foreground">This is already a child task. Nested child tasks are not allowed.</p>
                  ) : (
                    <div className="flex gap-2 mb-4">
                      <Input
                        value={newChildTaskTitle}
                        onChange={(e) => setNewChildTaskTitle(e.target.value)}
                        placeholder="Add child task title..."
                        onKeyDown={(e) => e.key === "Enter" && addChildTask()}
                      />
                      <Button onClick={addChildTask} disabled={isActionLoading || !newChildTaskTitle.trim()}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  )}

                  {!isCurrentTaskChild && (
                    childTasks.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No child tasks yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {childTasks.map((item) => (
                          <div key={item.id} className="rounded-lg border border-border p-3 bg-muted/20">
                            <div className="flex items-center gap-2">
                              <Button
                                variant={(item.status || "").toUpperCase() === "DONE" ? "default" : "outline"}
                                size="sm"
                                disabled={isActionLoading}
                                onClick={() => toggleChildTask(item.id, item.status)}
                              >
                                {(item.status || "").toUpperCase() === "DONE" ? "Done" : "Todo"}
                              </Button>

                              {editingChildTaskId === item.id ? (
                                <>
                                  <Input
                                    value={editingChildTaskTitle}
                                    onChange={(e) => setEditingChildTaskTitle(e.target.value)}
                                    className="flex-1"
                                    onKeyDown={(e) => e.key === "Enter" && saveChildTaskTitle()}
                                  />
                                  <Button size="sm" onClick={saveChildTaskTitle} disabled={isActionLoading || !editingChildTaskTitle.trim()}>
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingChildTaskId(null);
                                      setEditingChildTaskTitle("");
                                    }}
                                    disabled={isActionLoading}
                                  >
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    className={cn(
                                      "flex-1 text-left text-sm hover:underline",
                                      (item.status || "").toUpperCase() === "DONE" && "line-through text-muted-foreground",
                                    )}
                                    onClick={() => navigate(`/${teamId}/tasks/${item.id}`)}
                                  >
                                    {item.title}
                                  </button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => navigate(`/${teamId}/tasks/${item.id}`)}
                                    disabled={isActionLoading}
                                  >
                                    Open
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => startEditChildTask(item)} disabled={isActionLoading}>
                                    Edit
                                  </Button>
                                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteChildTask(item.id)} disabled={isActionLoading}>
                                    Delete
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              )}

              {activeTab === "comments" && (
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    Comments
                  </h3>
                  <div className="space-y-4 mb-6">
                    {comments.map((comment) => {
                      const commentName = comment.author?.name || "Unknown";
                      const commentInitials = commentName
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part) => part[0]?.toUpperCase())
                        .join("") || "U";
                      return (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary flex-shrink-0">
                          {commentInitials}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{commentName}</span>
                            <span className="text-xs text-muted-foreground">
                              {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : "-"}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{comment.content || ""}</p>
                        </div>
                      </div>
                    )})}
                    {comments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet.</p>}
                  </div>

                  {/* Add comment */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary flex-shrink-0">
                      JD
                    </div>
                    <div className="flex-1 flex gap-2">
                      <Input
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1"
                        onKeyDown={(e) => e.key === "Enter" && addComment()}
                      />
                      <Button disabled={!newComment.trim()} onClick={addComment}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "history" && (
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <History className="w-4 h-4 text-primary" />
                    Activity History
                  </h3>
                  {historyEntries.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No activity history available.</p>
                  ) : (
                    <div className="space-y-3">
                      {historyEntries.map((entry) => (
                        <div key={entry.id} className="rounded-lg border border-border bg-muted/20 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium">{entry.details}</p>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(entry.at).toLocaleString()}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="uppercase">{entry.source}</span>
                            <span>•</span>
                            <span>{entry.action}</span>
                            {entry.actor ? (
                              <>
                                <span>•</span>
                                <span>{entry.actor}</span>
                              </>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
      <AddTaskModal
        open={showEditTaskModal}
        onOpenChange={setShowEditTaskModal}
        teamId={teamId || ""}
        projectId={task?.projectId || undefined}
        onUpdated={loadTaskDetails}
        taskToEdit={
          task
            ? {
                id: task.id,
                title: task.title,
                description: task.description,
                priority: task.priority,
                dueDate: task.dueDate,
                estimatedHours: task.estimatedHours,
                currentAssigneeId: task.assignments?.[0]?.user?.id,
              }
            : undefined
        }
      />
    </MainLayout>
  );
}
