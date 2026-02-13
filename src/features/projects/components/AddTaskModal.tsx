import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface AddTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  projectId?: string;
  onCreated?: () => Promise<void> | void;
  onUpdated?: () => Promise<void> | void;
  taskToEdit?: {
    id: string;
    title?: string;
    description?: string | null;
    priority?: string;
    dueDate?: string | null;
    estimatedHours?: number | null;
    currentAssigneeId?: string;
  };
}

const priorities = [
  { value: "low", label: "Low", color: "bg-muted text-muted-foreground" },
  { value: "medium", label: "Medium", color: "bg-warning/10 text-warning" },
  { value: "high", label: "High", color: "bg-destructive/10 text-destructive" },
];

type TeamMember = {
  id: string;
  name: string;
  initials: string;
};

type RawTeamMember = {
  id?: string;
  userId?: string;
  userName?: string;
  user?: {
    id?: string;
    name?: string;
  };
};

const TASK_CHILD_MARKER_PREFIX = "__PARENT_TASK__:";

function extractChildParentId(description?: string | null): string | null {
  if (!description) return null;
  const firstLine = description.split("\n")[0]?.trim() || "";
  if (!firstLine.startsWith(TASK_CHILD_MARKER_PREFIX)) return null;
  const parentId = firstLine.slice(TASK_CHILD_MARKER_PREFIX.length).trim();
  return parentId || null;
}

function stripChildMarker(description?: string | null): string {
  if (!description) return "";
  const lines = description.split("\n");
  if (!lines[0]?.trim().startsWith(TASK_CHILD_MARKER_PREFIX)) return description;
  return lines.slice(1).join("\n").trim();
}

function buildChildDescription(parentId: string, content: string): string {
  const clean = content.trim();
  return clean ? `${TASK_CHILD_MARKER_PREFIX}${parentId}\n${clean}` : `${TASK_CHILD_MARKER_PREFIX}${parentId}`;
}

export function AddTaskModal({
  open,
  onOpenChange,
  teamId,
  projectId,
  onCreated,
  onUpdated,
  taskToEdit,
}: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [estimation, setEstimation] = useState("");
  const [userStory, setUserStory] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const isEditMode = Boolean(taskToEdit?.id);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setAssignee("");
    setDueDate("");
    setEstimation("");
    setUserStory("");
  };

  useEffect(() => {
    if (!open || !teamId) {
      return;
    }

    const loadMembers = async () => {
      setIsLoadingMembers(true);
      try {
        const response = await api.get<unknown>(`/teams/${teamId}/members`);
        const source = Array.isArray(response)
          ? response
          : response && typeof response === "object" && "members" in response
            ? ((response as { members?: unknown }).members as unknown)
            : [];

        const members = Array.isArray(source)
          ? (source as RawTeamMember[])
              .map((member) => {
                const id = member?.userId || member?.user?.id || member?.id;
                const name = member?.userName || member?.user?.name || "Unknown member";
                if (!id) {
                  return null;
                }
                const initials = String(name)
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0]?.toUpperCase())
                  .join("") || "?";
                return { id, name, initials };
              })
              .filter((member): member is TeamMember => Boolean(member))
          : [];

        setTeamMembers(members);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to load team members";
        toast.error(message);
        setTeamMembers([]);
      } finally {
        setIsLoadingMembers(false);
      }
    };

    void loadMembers();
  }, [open, teamId]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!taskToEdit) {
      resetForm();
      return;
    }

    setTitle(taskToEdit.title || "");
    setDescription(stripChildMarker(taskToEdit.description || ""));
    setPriority((taskToEdit.priority || "MEDIUM").toLowerCase());
    setAssignee(taskToEdit.currentAssigneeId || "");
    setDueDate(
      taskToEdit.dueDate
        ? new Date(taskToEdit.dueDate).toISOString().slice(0, 10)
        : "",
    );
    setEstimation("");
    setUserStory("");
  }, [open, taskToEdit]);

  if (!open) return null;

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    if (!teamId) {
      toast.error("Team context is missing. Please reload and try again.");
      return;
    }

    const estimatedHours = Number.parseFloat(estimation);

    try {
      setIsCreating(true);
      if (isEditMode && taskToEdit) {
        const parentId = extractChildParentId(taskToEdit.description);
        await api.patch(`/teams/${teamId}/tasks/${taskToEdit.id}`, {
          title: title.trim(),
          description: parentId ? buildChildDescription(parentId, description) : description.trim(),
          priority: priority.toUpperCase(),
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        });

        await onUpdated?.();
        toast.success("Task updated successfully");
      } else {
        const createdTask = await api.post<{ id: string }>(`/teams/${teamId}/tasks`, {
          title: title.trim(),
          description: [description.trim(), userStory.trim()].filter(Boolean).join("\n\n"),
          priority: priority.toUpperCase(),
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          estimatedHours: Number.isFinite(estimatedHours) ? estimatedHours : undefined,
          assigneeIds: assignee ? [assignee] : undefined,
        });

        if (projectId && createdTask?.id) {
          await api.post(`/projects/${projectId}/tasks/${createdTask.id}`);
        }

        await onCreated?.();
        toast.success("Task created successfully");
      }
      onOpenChange(false);
      resetForm();
    } catch (error: unknown) {
      const message = error instanceof Error
        ? error.message
        : isEditMode
          ? "Failed to update task"
          : "Failed to create task";
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-lg">{isEditMode ? "Edit Task" : "Add Task"}</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1 scrollbar-thin">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Task Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task..."
              className="w-full h-20 px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Priority</label>
            <div className="flex gap-2">
              {priorities.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPriority(p.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                    priority === p.value
                      ? `${p.color} ring-2 ring-primary ring-offset-2`
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {!isEditMode && (
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Assign To</label>
              <div className="flex flex-wrap gap-2">
                {isLoadingMembers && <p className="text-xs text-muted-foreground">Loading members...</p>}
                {!isLoadingMembers && teamMembers.length === 0 && (
                  <p className="text-xs text-muted-foreground">No team members found.</p>
                )}
                {teamMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => setAssignee(member.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all",
                      assignee === member.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-medium">
                      {member.initials}
                    </div>
                    {member.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Due Date</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            {!isEditMode && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Estimation</label>
                <Input
                  value={estimation}
                  onChange={(e) => setEstimation(e.target.value)}
                  placeholder="e.g., 2 days"
                />
              </div>
            )}
          </div>

          {!isEditMode && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">User Story</label>
              <textarea
                value={userStory}
                onChange={(e) => setUserStory(e.target.value)}
                placeholder="As a [user], I want [goal] so that [benefit]..."
                className="w-full h-16 px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleCreate} disabled={isCreating}>
            {isCreating ? (isEditMode ? "Saving..." : "Creating...") : (isEditMode ? "Save Changes" : "Add Task")}
          </Button>
        </div>
      </div>
    </div>
  );
}
