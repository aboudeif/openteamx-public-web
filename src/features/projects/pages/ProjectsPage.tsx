import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  MessageSquare,
  Link,
  Calendar,
  Clock,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  AlertCircle,
  Timer,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AddProjectModal } from "@/features/projects/components/AddProjectModal";
import { AddTaskModal } from "@/features/projects/components/AddTaskModal";
import { FilterModal } from "@/features/projects/components/FilterModal";
import { projectService } from "@/services";
import { Project, Task } from "@/shared/types";
import { TaskStatus, TaskPriority, ProjectStatus } from "@/shared/enums";
import { toast } from "sonner";

const statusConfig = {
  [TaskStatus.ToDo]: { label: "To Do", icon: Circle, color: "text-muted-foreground" },
  [TaskStatus.InProgress]: { label: "In Progress", icon: Timer, color: "text-info" },
  [TaskStatus.Review]: { label: "In Review", icon: AlertCircle, color: "text-warning" },
  [TaskStatus.Done]: { label: "Done", icon: CheckCircle2, color: "text-success" },
};

const priorityColors: Record<string, string> = {
  [TaskPriority.Low]: "bg-muted",
  [TaskPriority.Medium]: "bg-warning/20 text-warning",
  [TaskPriority.High]: "bg-destructive/20 text-destructive",
};

function TaskRow({ task, level = 0, teamId, onClickDetail }: { task: Task; level?: number; teamId: string; onClickDetail: (taskId: string, tab?: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const StatusIcon = statusConfig[task.status].icon;
  const hasChildren = task.childTasks && task.childTasks.length > 0;

  return (
    <>
      <div
        className="task-row group"
        style={{ paddingLeft: `${16 + level * 24}px` }}
        onClick={() => onClickDetail(task.id)}
      >
        {hasChildren && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-0.5 rounded hover:bg-muted"
          >
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-5" />}

        <StatusIcon className={cn("w-4 h-4 flex-shrink-0", statusConfig[task.status].color)} />

        <span className={cn(
          "flex-1 text-sm truncate",
          task.status === TaskStatus.Done && "line-through text-muted-foreground"
        )}>
          {task.title}
        </span>

        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
          {task.comments > 0 && (
            <button 
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
              onClick={(e) => { e.stopPropagation(); onClickDetail(task.id, "comments"); }}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {task.comments}
            </button>
          )}
          {task.resources.length > 0 && (
            <button 
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
              onClick={(e) => { e.stopPropagation(); onClickDetail(task.id, "resources"); }}
            >
              <Link className="w-3.5 h-3.5" />
              {task.resources.length}
            </button>
          )}
        </div>

        <span className={cn(
          "px-2 py-0.5 rounded text-[10px] font-medium uppercase",
          priorityColors[task.priority]
        )}>
          {task.priority}
        </span>

        <span className="text-xs text-muted-foreground flex items-center gap-1 w-20">
          <Clock className="w-3 h-3" />
          {task.estimation}
        </span>

        <span className="text-xs text-muted-foreground flex items-center gap-1 w-20">
          <Calendar className="w-3 h-3" />
          {task.dueDate}
        </span>

        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-medium text-primary">
          {task.assignee}
        </div>

        <button className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {expanded && hasChildren && (
        <div>
          {task.childTasks!.map((child) => (
            <TaskRow key={child.id} task={child} level={level + 1} teamId={teamId} onClickDetail={onClickDetail} />
          ))}
        </div>
      )}
    </>
  );
}

export default function TeamProjects() {
  const { teamId = "" } = useParams();
  const navigate = useNavigate();
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [expandedProjects, setExpandedProjects] = useState<string[]>(["1"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!teamId) {
      return;
    }

    try {
      const data = await projectService.getProjects(teamId);
      setProjectList(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to load projects";
      toast.error(message);
    }
  }, [teamId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const toggleProject = (id: string) => {
    setExpandedProjects((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleClickDetail = (taskId: string, tab?: string) => {
    navigate(`/${teamId}/tasks/${taskId}${tab ? `?tab=${tab}` : ""}`);
  };

  const handleAddTask = (projectId: string) => {
    setSelectedProjectId(projectId);
    setShowAddTask(true);
  };

  return (
    <MainLayout>
      <div className="h-[calc(100vh-120px)] overflow-auto p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage tasks and track progress across all team projects
            </p>
          </div>
          <Button onClick={() => setShowAddProject(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="pl-9 bg-card"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowFilter(true)}>
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Projects */}
        <div className="space-y-4">
          {projectList.map((project) => {
            const isExpanded = expandedProjects.includes(project.id);
            const tasks = project.tasks || [];
            const completedTasks = tasks.filter((t) => t.status === TaskStatus.Done).length;
            const totalTasks = tasks.length;

            return (
              <Collapsible
                key={project.id}
                open={isExpanded}
                onOpenChange={() => toggleProject(project.id)}
                className="project-accordion bg-card"
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}

                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-foreground">{project.title || "Untitled project"}</h3>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-medium uppercase",
                          project.status === ProjectStatus.Active ? "bg-success/10 text-success" :
                          project.status === ProjectStatus.Completed ? "bg-muted text-muted-foreground" :
                          "bg-warning/10 text-warning"
                        )}>
                          {project.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{project.description || "No description"}</p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        {completedTasks}/{totalTasks}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {project.dueDate || "-"}
                      </span>
                      <div className="flex -space-x-2">
                        {(project.members || []).map((member, i) => (
                          <div
                            key={i}
                            className="w-7 h-7 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center text-[10px] font-medium text-primary"
                          >
                            {member}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="border-t border-border">
                    {/* Task Header */}
                    <div className="flex items-center gap-3 px-4 py-2 bg-muted/30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <div className="w-5" />
                      <div className="w-4" />
                      <span className="flex-1">Task</span>
                      <span className="w-16">Priority</span>
                      <span className="w-20">Estimate</span>
                      <span className="w-20">Due</span>
                      <span className="w-7">Owner</span>
                      <div className="w-8" />
                    </div>

                    {/* Tasks */}
                    <div className="divide-y divide-border">
                      {(project.tasks || []).map((task) => (
                        <TaskRow key={task.id} task={task} teamId={teamId} onClickDetail={handleClickDetail} />
                      ))}
                    </div>

                    {/* Add Task */}
                    <button 
                      className="flex items-center gap-2 w-full px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                      onClick={() => handleAddTask(project.id)}
                    >
                      <Plus className="w-4 h-4" />
                      Add task
                    </button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>

        <AddProjectModal
          open={showAddProject}
          onOpenChange={setShowAddProject}
          teamId={teamId}
          onCreated={fetchProjects}
        />
        <AddTaskModal
          open={showAddTask}
          onOpenChange={setShowAddTask}
          teamId={teamId}
          projectId={selectedProjectId || undefined}
          onCreated={fetchProjects}
        />
        <FilterModal open={showFilter} onOpenChange={setShowFilter} />
      </div>
    </MainLayout>
  );
}
