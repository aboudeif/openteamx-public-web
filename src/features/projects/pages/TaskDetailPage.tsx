import { useState, useEffect, useCallback } from "react";
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

type TeamMemberOption = {
  userId: string;
  userName: string;
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

  // Estimation state
  const [estimations, setEstimations] = useState<EstimationPeriod[]>([]);
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([]);
  const [newEstimation, setNewEstimation] = useState("");
  const [newProgress, setNewProgress] = useState("");

  const loadTaskDetails = useCallback(async () => {
    if (!teamId || !taskId) return;
    setIsLoading(true);
    try {
      const [taskResponse, commentResponse, workLogResponse] = await Promise.all([
        api.get<ApiTaskDetail>(`/teams/${teamId}/tasks/${taskId}`),
        api.get<ApiTaskComment[]>(`/teams/${teamId}/tasks/${taskId}/comments`).catch(() => []),
        api.get<{ items?: ApiWorkLog[] }>(`/teams/${teamId}/tasks/${taskId}/work-logs`).catch(() => ({ items: [] })),
      ]);

      setTask(taskResponse);
      setComments(Array.isArray(commentResponse) ? commentResponse : []);

      const estimated = Number(taskResponse?.estimatedHours || 0);
      setEstimations(
        estimated > 0
          ? [{ id: "e-estimated", input: `${estimated}h`, minutes: estimated * 60 }]
          : [],
      );

      const logs = Array.isArray(workLogResponse?.items) ? workLogResponse.items : [];
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
  const description = task?.description || "No description";

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
                  {tabs.map((tab) => (
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
                          {0}
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
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    User Story
                  </h3>
                  <p className="text-muted-foreground bg-muted/30 p-4 rounded-lg italic">{description}</p>
                </div>
              )}

              {activeTab === "resources" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Link className="w-4 h-4 text-primary" />
                      Resources
                    </h3>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Resource
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">No linked resources yet.</p>
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
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Child Task
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">No child tasks yet.</p>
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
                  <p className="text-sm text-muted-foreground">No activity history available.</p>
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
