import { useState, useEffect, useCallback, useMemo } from "react";
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
  Pencil,
  ArrowLeftRight,
  UserPlus,
  Trash2,
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
import { FilterModal, TaskFilters } from "@/features/projects/components/FilterModal";
import { projectService } from "@/services";
import { api } from "@/lib/api";
import { Project, Task } from "@/shared/types";
import { TaskStatus, TaskPriority, ProjectStatus } from "@/shared/enums";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

type TeamMemberOption = {
  userId: string;
  userName: string;
};

type EditTaskPayload = {
  id: string;
  title?: string;
  description?: string | null;
  priority?: string;
  dueDate?: string | null;
  estimatedHours?: number | null;
  currentAssigneeId?: string;
};

function TaskRow({
  task,
  level = 0,
  teamId,
  onClickDetail,
  onEditTask,
  onChangeTaskStatus,
  onReassignTask,
  onDeleteTask,
  teamMembers,
  autoExpand,
}: {
  task: Task;
  level?: number;
  teamId: string;
  onClickDetail: (taskId: string, tab?: string) => void;
  onEditTask: (taskId: string) => void;
  onChangeTaskStatus: (taskId: string, status: string) => void;
  onReassignTask: (taskId: string, userId: string) => void;
  onDeleteTask: (taskId: string) => void;
  teamMembers: TeamMemberOption[];
  autoExpand?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const StatusIcon = statusConfig[task.status].icon;
  const hasChildren = task.childTasks && task.childTasks.length > 0;

  useEffect(() => {
    if (autoExpand && hasChildren) {
      setExpanded(true);
    }
  }, [autoExpand, hasChildren]);

  return (
    <>
      <div
        className="task-row group bg-transparent hover:bg-muted/40 transition-colors"
        style={{ paddingLeft: `${16 + level * 24}px` }}
        onClick={() => onClickDetail(task.id)}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
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

        <div className="w-7 h-7 rounded-full bg-muted text-foreground/70 flex items-center justify-center text-[10px] font-medium">
          {task.assignee}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onSelect={() => onEditTask(task.id)}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit Task
            </DropdownMenuItem>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <ArrowLeftRight className="w-4 h-4 mr-2" />
                Change Status
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {["TODO", "IN_PROGRESS", "REVIEW", "DONE", "CANCELLED"].map((status) => (
                  <DropdownMenuItem key={status} onSelect={() => onChangeTaskStatus(task.id, status)}>
                    {status.replace("_", " ")}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <UserPlus className="w-4 h-4 mr-2" />
                Re-assign
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {teamMembers.length === 0 ? (
                  <DropdownMenuItem disabled>No team members</DropdownMenuItem>
                ) : (
                  teamMembers.map((member) => (
                    <DropdownMenuItem key={member.userId} onSelect={() => onReassignTask(task.id, member.userId)}>
                      {member.userName}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuItem className="text-destructive" onSelect={() => onDeleteTask(task.id)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Task
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onClickDetail(task.id)}>
              <ArrowLeftRight className="w-4 h-4 mr-2" />
              Open Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {expanded && hasChildren && (
        <div>
          {task.childTasks!.map((child) => (
            <TaskRow
              key={child.id}
              task={child}
              level={level + 1}
              teamId={teamId}
              onClickDetail={onClickDetail}
              onEditTask={onEditTask}
              onChangeTaskStatus={onChangeTaskStatus}
              onReassignTask={onReassignTask}
              onDeleteTask={onDeleteTask}
              teamMembers={teamMembers}
              autoExpand={autoExpand}
            />
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
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showEditTask, setShowEditTask] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMemberOption[]>([]);
  const [taskToEdit, setTaskToEdit] = useState<EditTaskPayload | undefined>(undefined);
  const [projectToEdit, setProjectToEdit] = useState<{ id: string; title?: string; description?: string; dueDate?: string } | undefined>(undefined);
  const [isTeamLeader, setIsTeamLeader] = useState(false);
  const [taskFilters, setTaskFilters] = useState<TaskFilters>({
    statuses: [],
    priorities: [],
    assignees: [],
    dueDateFrom: "",
    dueDateTo: "",
  });

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

  useEffect(() => {
    if (!teamId) return;
    const loadTeamMembers = async () => {
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
    void loadTeamMembers();
  }, [teamId]);

  useEffect(() => {
    if (!teamId) return;
    const loadTeamRole = async () => {
      try {
        const team = await api.get<{ currentUserRole?: string }>(`/teams/${teamId}`);
        setIsTeamLeader(team?.currentUserRole === "LEADER");
      } catch {
        setIsTeamLeader(false);
      }
    };
    void loadTeamRole();
  }, [teamId]);

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

  const hasActiveFilters = useMemo(
    () =>
      taskFilters.statuses.length > 0 ||
      taskFilters.priorities.length > 0 ||
      taskFilters.assignees.length > 0 ||
      Boolean(taskFilters.dueDateFrom) ||
      Boolean(taskFilters.dueDateTo) ||
      Boolean(searchQuery.trim()),
    [searchQuery, taskFilters],
  );

  const assigneeOptions = useMemo(() => {
    const set = new Set<string>();
    projectList.forEach((project) => {
      (project.tasks || []).forEach((task) => {
        const walk = (node: Task) => {
          (node.assignees || []).forEach((name) => {
            if (name) set.add(name);
          });
          (node.childTasks || []).forEach(walk);
        };
        walk(task);
      });
    });
    return Array.from(set).sort().map((assignee) => ({ id: assignee, name: assignee }));
  }, [projectList]);

  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    const walk = (node: Task) => {
      if (node.status) set.add(String(node.status).toLowerCase());
      (node.childTasks || []).forEach(walk);
    };
    projectList.forEach((project) => (project.tasks || []).forEach(walk));
    return Array.from(set).sort();
  }, [projectList]);

  const priorityOptions = useMemo(() => {
    const set = new Set<string>();
    const walk = (node: Task) => {
      if (node.priority) set.add(String(node.priority).toLowerCase());
      (node.childTasks || []).forEach(walk);
    };
    projectList.forEach((project) => (project.tasks || []).forEach(walk));
    return Array.from(set).sort();
  }, [projectList]);

  const parseDate = (value?: string) => {
    if (!value || value === "-") return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const taskMatchesFilters = useCallback(
    (task: Task) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || task.title.toLowerCase().includes(query);

      const taskStatus = String(task.status || "").toLowerCase();
      const taskPriority = String(task.priority || "").toLowerCase();
      const matchesStatus = taskFilters.statuses.length === 0 || taskFilters.statuses.includes(taskStatus);
      const matchesPriority = taskFilters.priorities.length === 0 || taskFilters.priorities.includes(taskPriority);
      const taskAssignees = task.assignees || [];
      const matchesAssignee =
        taskFilters.assignees.length === 0 ||
        taskFilters.assignees.some((selected) => taskAssignees.includes(selected));

      const due = parseDate(task.dueDate);
      const from = parseDate(taskFilters.dueDateFrom);
      const to = parseDate(taskFilters.dueDateTo);
      const matchesFrom = !from || (due ? due >= from : false);
      const matchesTo = !to || (due ? due <= to : false);

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && matchesFrom && matchesTo;
    },
    [searchQuery, taskFilters],
  );

  const filterTaskTree = useCallback(
    (tasks: Task[]): Task[] => {
      return tasks.reduce<Task[]>((acc, task) => {
        const filteredChildren = filterTaskTree(task.childTasks || []);
        if (taskMatchesFilters(task) || filteredChildren.length > 0) {
          acc.push({
            ...task,
            childTasks: filteredChildren,
          });
        }
        return acc;
      }, []);
    },
    [taskMatchesFilters],
  );

  const visibleProjects = useMemo(() => {
    const mapped = projectList.map((project) => ({
      ...project,
      tasks: filterTaskTree(project.tasks || []),
    }));
    return hasActiveFilters ? mapped.filter((project) => (project.tasks || []).length > 0) : mapped;
  }, [projectList, filterTaskTree, hasActiveFilters]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setTaskFilters({
      statuses: [],
      priorities: [],
      assignees: [],
      dueDateFrom: "",
      dueDateTo: "",
    });
  };

  const handleOpenCreateProject = () => {
    setProjectToEdit(undefined);
    setShowProjectModal(true);
  };

  const handleOpenEditProject = (project: Project) => {
    if (!isTeamLeader) return;
    setProjectToEdit({
      id: project.id,
      title: project.title,
      description: project.description,
      dueDate: project.dueDate,
    });
    setShowProjectModal(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!teamId || !isTeamLeader) return;
    try {
      await api.delete(`/projects/${projectId}`);
      toast.success("Project deleted");
      await fetchProjects();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete project";
      toast.error(message);
    }
  };

  const handleEditTask = async (taskId: string) => {
    if (!teamId) return;
    try {
      const response = await api.get<{
        id: string;
        title?: string;
        description?: string | null;
        priority?: string;
        dueDate?: string | null;
        estimatedHours?: number | null;
        projectId?: string | null;
        assignments?: Array<{ userId?: string }>;
      }>(`/teams/${teamId}/tasks/${taskId}`);
      setTaskToEdit({
        id: response.id,
        title: response.title,
        description: response.description,
        priority: response.priority,
        dueDate: response.dueDate,
        estimatedHours: response.estimatedHours,
        currentAssigneeId: response.assignments?.[0]?.userId,
      });
      setSelectedProjectId(response.projectId || null);
      setShowEditTask(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to load task";
      toast.error(message);
    }
  };

  const handleChangeTaskStatus = async (taskId: string, status: string) => {
    if (!teamId) return;
    try {
      await api.patch(`/teams/${teamId}/tasks/${taskId}`, { status });
      toast.success("Task status updated");
      await fetchProjects();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update task status";
      toast.error(message);
    }
  };

  const handleReassignTask = async (taskId: string, userId: string) => {
    if (!teamId) return;
    try {
      const taskDetails = await api.get<{ assignments?: Array<{ userId?: string }> }>(`/teams/${teamId}/tasks/${taskId}`);
      const currentAssigneeId = taskDetails?.assignments?.[0]?.userId;
      if (currentAssigneeId && currentAssigneeId !== userId) {
        await api.delete(`/teams/${teamId}/tasks/${taskId}/assign/${currentAssigneeId}`).catch(() => undefined);
      }
      await api.post(`/teams/${teamId}/tasks/${taskId}/assign`, { userId });
      toast.success("Task reassigned");
      await fetchProjects();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to reassign task";
      toast.error(message);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!teamId) return;
    try {
      await api.delete(`/teams/${teamId}/tasks/${taskId}`);
      toast.success("Task archived");
      await fetchProjects();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to archive task";
      toast.error(message);
    }
  };

  return (
    <MainLayout>
      <div className="h-[calc(100vh-120px)] overflow-auto p-6 lg:p-8 max-w-7xl mx-auto bg-background">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage tasks and track progress across all team projects
            </p>
          </div>
          <Button onClick={handleOpenCreateProject}>
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
              className="pl-9 bg-card border-border"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowFilter(true)}>
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              Clear
            </Button>
          )}
        </div>

        {/* Projects */}
        <div className="space-y-4">
          {visibleProjects.map((project) => {
            const isExpanded = expandedProjects.includes(project.id);
            const tasks = project.tasks || [];
            const completedTasks = tasks.filter((t) => t.status === TaskStatus.Done).length;
            const totalTasks = tasks.length;

            return (
              <Collapsible
                key={project.id}
                open={isExpanded}
                onOpenChange={() => toggleProject(project.id)}
                className="project-accordion overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all hover:shadow-md"
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center gap-3 p-4 hover:bg-muted/40 transition-colors">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}

                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-foreground">{project.title || "Untitled project"}</h3>
                        {project.status !== ProjectStatus.Active && (
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-medium uppercase",
                            project.status === ProjectStatus.Completed ? "bg-muted text-muted-foreground" : "bg-warning/10 text-warning",
                          )}>
                            {project.status.replace("_", " ")}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{project.description || "No description"}</p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-foreground/70">
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
                      {isTeamLeader && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem onSelect={() => handleOpenEditProject(project)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit Project
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onSelect={() => handleDeleteProject(project.id)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Project
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="border-t border-border bg-background">
                    {/* Task Header */}
                    <div className="flex items-center gap-3 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider">
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
                    <div className="divide-y divide-border/60">
                      {(project.tasks || []).map((task) => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          teamId={teamId}
                          onClickDetail={handleClickDetail}
                          onEditTask={handleEditTask}
                          onChangeTaskStatus={handleChangeTaskStatus}
                          onReassignTask={handleReassignTask}
                          onDeleteTask={handleDeleteTask}
                          teamMembers={teamMembers}
                          autoExpand={hasActiveFilters}
                        />
                      ))}
                    </div>

                    {/* Add Task */}
                    <button 
                      className="flex items-center gap-2 w-full px-4 py-3 text-sm text-muted-foreground border-t border-border hover:text-foreground hover:bg-muted/40 transition-colors"
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
          open={showProjectModal}
          onOpenChange={(open) => {
            setShowProjectModal(open);
            if (!open) setProjectToEdit(undefined);
          }}
          teamId={teamId}
          onCreated={fetchProjects}
          onUpdated={fetchProjects}
          projectToEdit={projectToEdit}
        />
        <AddTaskModal
          open={showAddTask}
          onOpenChange={setShowAddTask}
          teamId={teamId}
          projectId={selectedProjectId || undefined}
          onCreated={fetchProjects}
        />
        <AddTaskModal
          open={showEditTask}
          onOpenChange={(open) => {
            setShowEditTask(open);
            if (!open) setTaskToEdit(undefined);
          }}
          teamId={teamId}
          projectId={selectedProjectId || undefined}
          taskToEdit={taskToEdit}
          onUpdated={fetchProjects}
        />
        <FilterModal
          open={showFilter}
          onOpenChange={setShowFilter}
          initialFilters={taskFilters}
          onApply={setTaskFilters}
          assigneeOptions={assigneeOptions}
          statusOptions={statusOptions}
          priorityOptions={priorityOptions}
        />
      </div>
    </MainLayout>
  );
}
