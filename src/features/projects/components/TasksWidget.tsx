import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { WidgetCard } from "@/components/shared/WidgetCard";
import { CheckSquare, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";

type TaskItem = {
  id: string;
  title: string;
  dueDate?: string;
  priority?: string;
  status?: string;
  projectId?: string;
  assignments?: Array<{
    user?: {
      name?: string;
    };
  }>;
};

function extractTasks(payload: unknown): TaskItem[] {
  if (Array.isArray(payload)) {
    return payload as TaskItem[];
  }

  if (payload && typeof payload === "object") {
    const candidate = payload as { items?: unknown; data?: unknown };
    if (Array.isArray(candidate.items)) {
      return candidate.items as TaskItem[];
    }
    if (Array.isArray(candidate.data)) {
      return candidate.data as TaskItem[];
    }
  }

  return [];
}

const priorityColors = {
  high: "text-destructive",
  medium: "text-warning",
  low: "text-muted-foreground",
};

export function TasksWidget() {
  const navigate = useNavigate();
  const { teamId = "" } = useParams();
  const { data: rawTasks = [], isLoading } = useQuery<TaskItem[]>({
    queryKey: ["team-tasks-widget", teamId],
    queryFn: async () => {
      const response = await api.get<unknown>(`/teams/${teamId}/tasks?limit=20&page=1`);
      return extractTasks(response);
    },
    enabled: Boolean(teamId),
  });

  const tasks = useMemo(
    () =>
      rawTasks
        .filter((task) => {
          const status = (task.status || "").toUpperCase();
          return status !== "DONE" && status !== "CANCELLED";
        })
        .sort((a, b) => {
          const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
          const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
          return aDue - bDue;
        })
        .slice(0, 4),
    [rawTasks]
  );

  return (
    <WidgetCard 
    title="Due Tasks" 
    icon={CheckSquare} 
    action="View all"
    onAction={() => navigate(`/${teamId}/projects`)}
    >
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No due tasks.</p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const priority = (task.priority || "LOW").toLowerCase();
            const dueDate = task.dueDate ? new Date(task.dueDate) : null;
            const assigneeName = task.assignments?.[0]?.user?.name || "";
            const assignee = assigneeName
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase() ?? "")
              .join("") || "U";

            return (
              <div
                key={task.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className={cn("w-1 h-8 rounded-full", 
                  priority === "high" || priority === "urgent" ? "bg-destructive" : 
                  priority === "medium" ? "bg-warning" : "bg-muted-foreground/30"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground line-clamp-1">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.projectId || "General"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-xs flex items-center gap-1", priorityColors[priority as keyof typeof priorityColors])}>
                    <Clock className="w-3 h-3" />
                    {dueDate ? dueDate.toLocaleDateString() : "No due date"}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-medium text-primary">
                    {assignee}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </WidgetCard>
  );
}
