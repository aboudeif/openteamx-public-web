import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
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
  User,
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
  Pause,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
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

// Mock task data
const taskData = {
  id: "t2",
  title: "Implement user dashboard",
  description: "Build a comprehensive user dashboard that displays key metrics, recent activity, and quick actions. The dashboard should be responsive and follow our design system guidelines.",
  status: "in_progress" as const,
  priority: "high" as const,
  owner: { name: "Mike Johnson", initials: "MJ" },
  createdAt: "2 days ago",
  createdBy: "Sarah Chen",
  project: { id: "1", name: "Project Alpha" },
  team: { id: "team-1", name: "TechVentures" },
  userStory: "As a user, I want to see my activity overview so that I can quickly understand my progress and upcoming tasks.",
  resources: [
    { id: "r1", title: "Figma Design", url: "https://figma.com/..." },
    { id: "r2", title: "API Documentation", url: "https://docs.api.com/..." },
    { id: "r3", title: "Component Library", url: "https://storybook.com/..." },
  ],
  dueDate: "Feb 5, 2026",
  childTasks: [
    { id: "t2-1", title: "Build stats widgets", status: "done", owner: "MJ" },
    { id: "t2-2", title: "Add activity timeline", status: "in_progress", owner: "MJ" },
    { id: "t2-3", title: "Create quick actions panel", status: "todo", owner: "AK" },
  ],
  comments: [
    { id: "c1", user: "Sarah Chen", initials: "SC", text: "Great progress so far! Let me know if you need any design clarification.", time: "Yesterday at 3:42 PM" },
    { id: "c2", user: "Alex Kim", initials: "AK", text: "I can help with the quick actions panel once you're done with the timeline.", time: "Today at 10:15 AM" },
  ],
  history: [
    { id: "h1", action: "Created task", user: "Sarah Chen", time: "2 days ago" },
    { id: "h2", action: "Changed status to In Progress", user: "Mike Johnson", time: "1 day ago" },
    { id: "h3", action: "Added resource: Figma Design", user: "Sarah Chen", time: "1 day ago" },
    { id: "h4", action: "Completed child task: Build stats widgets", user: "Mike Johnson", time: "5 hours ago" },
  ],
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

  // Estimation state
  const [estimations, setEstimations] = useState<EstimationPeriod[]>([
    { id: "e1", input: "3d 4h", minutes: parseToMinutes("3d 4h") },
  ]);
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([
    { id: "p1", input: "1d 2h", minutes: parseToMinutes("1d 2h"), date: "Jan 28" },
    { id: "p2", input: "4h 30m", minutes: parseToMinutes("4h 30m"), date: "Jan 29" },
  ]);
  const [newEstimation, setNewEstimation] = useState("");
  const [newProgress, setNewProgress] = useState("");

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

  const StatusIcon = statusConfig[taskData.status].icon;

  return (
    <MainLayout>
      <div className="flex flex-col h-screen">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-border bg-card text-sm">
          
          <button
            onClick={() => navigate(`/${teamId ?? taskData.team.id}/projects`)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className=" bg-sidebar-accent text-sidebar-foreground rounded px-2 py-1">{taskData.project.name}</span><span className="text-sm ms-3"> Projects </span>
          </button>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground font-medium">{taskData.title}</span>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 lg:p-8 max-w-5xl mx-auto">
            {/* Task Card */}
            <div className="widget-card mb-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", statusConfig[taskData.status].bg)}>
                    <StatusIcon className={cn("w-5 h-5", statusConfig[taskData.status].color)} />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold">{taskData.title}</h1>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusConfig[taskData.status].bg, statusConfig[taskData.status].color)}>
                        {statusConfig[taskData.status].label}
                      </span>
                      <span>•</span>
                      <span className={cn("px-2 py-0.5 rounded text-xs font-medium uppercase", priorityColors[taskData.priority])}>
                        {taskData.priority}
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
                    <DropdownMenuItem>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit Task
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ArrowLeftRight className="w-4 h-4 mr-2" />
                      Change Status
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Re-assign
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Task
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-6">{taskData.description}</p>

              {/* Meta Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-muted/30">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Owner</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                      {taskData.owner.initials}
                    </div>
                    <span className="text-sm font-medium">{taskData.owner.name}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                  <p className="text-sm font-medium">{taskData.dueDate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Created</p>
                  <p className="text-sm font-medium">{taskData.createdAt}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Created By</p>
                  <p className="text-sm font-medium">{taskData.createdBy}</p>
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
                          {taskData.comments.length}
                        </span>
                      )}
                      {tab.id === "children" && (
                        <span className="px-1.5 py-0.5 rounded-full bg-primary-foreground/20 text-[10px]">
                          {taskData.childTasks.length}
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
                  <p className="text-muted-foreground bg-muted/30 p-4 rounded-lg italic">
                    "{taskData.userStory}"
                  </p>
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
                  <div className="space-y-2">
                    {taskData.resources.map((resource) => (
                      <a
                        key={resource.id}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <Link className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">{resource.title}</span>
                      </a>
                    ))}
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
                      <p className="text-2xl font-bold">{taskData.dueDate}</p>
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
                  <div className="space-y-2">
                    {taskData.childTasks.map((child) => {
                      const ChildStatusIcon = statusConfig[child.status as keyof typeof statusConfig].icon;
                      return (
                        <div
                          key={child.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                          <ChildStatusIcon className={cn("w-4 h-4", statusConfig[child.status as keyof typeof statusConfig].color)} />
                          <span className={cn("flex-1 text-sm", child.status === "done" && "line-through text-muted-foreground")}>
                            {child.title}
                          </span>
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-medium text-primary">
                            {child.owner}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === "comments" && (
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    Comments
                  </h3>
                  <div className="space-y-4 mb-6">
                    {taskData.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary flex-shrink-0">
                          {comment.initials}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{comment.user}</span>
                            <span className="text-xs text-muted-foreground">{comment.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{comment.text}</p>
                        </div>
                      </div>
                    ))}
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
                      />
                      <Button disabled={!newComment.trim()}>
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
                  <div className="relative">
                    <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />
                    <div className="space-y-4">
                      {taskData.history.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 relative">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center z-10">
                            <History className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="pt-1">
                            <p className="text-sm">
                              <span className="font-medium">{item.user}</span>{" "}
                              <span className="text-muted-foreground">{item.action}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">{item.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
    </MainLayout>
  );
}
