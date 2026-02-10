import { WidgetCard } from "@/components/shared/WidgetCard";
import { CheckSquare, Clock, AlertCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const tasks = [
  {
    id: 1,
    title: "Complete API integration",
    project: "Project Alpha",
    dueDate: "Today",
    assignee: "SC",
    priority: "high",
  },
  {
    id: 2,
    title: "Review pull requests",
    project: "Core Platform",
    dueDate: "Today",
    assignee: "MJ",
    priority: "medium",
  },
  {
    id: 3,
    title: "Update documentation",
    project: "Project Alpha",
    dueDate: "Tomorrow",
    assignee: "AK",
    priority: "low",
  },
  {
    id: 4,
    title: "Fix login bug",
    project: "Mobile App",
    dueDate: "Jan 31",
    assignee: "ED",
    priority: "high",
  },
];

const priorityColors = {
  high: "text-destructive",
  medium: "text-warning",
  low: "text-muted-foreground",
};

export function TasksWidget() {
  const navigate = useNavigate();
  const team = {id: 'team-1'};

  return (
    <WidgetCard 
    title="Due Tasks" 
    icon={CheckSquare} 
    action="View all"
    onAction={() => navigate(`/${team.id}/projects`)}
    >
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <div className={cn("w-1 h-8 rounded-full", 
              task.priority === "high" ? "bg-destructive" : 
              task.priority === "medium" ? "bg-warning" : "bg-muted-foreground/30"
            )} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground line-clamp-1">{task.title}</p>
              <p className="text-xs text-muted-foreground">{task.project}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("text-xs flex items-center gap-1", 
                task.dueDate === "Today" && "text-destructive font-medium"
              )}>
                <Clock className="w-3 h-3" />
                {task.dueDate}
              </span>
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-medium text-primary">
                {task.assignee}
              </div>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}
