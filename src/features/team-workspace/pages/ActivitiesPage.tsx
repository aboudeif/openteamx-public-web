import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  Activity,
  MessageSquare,
  FileEdit,
  UserPlus,
  CheckCircle2,
  GitBranch,
  Video,
  Calendar,
  Mail,
  FolderPlus,
  Trash2,
  Edit,
} from "lucide-react";
import { cn } from "@/lib/utils";

const activityTypes = [
  { id: "all", name: "All Activities", icon: Activity },
  { id: "message", name: "Messages", icon: MessageSquare },
  { id: "file", name: "Files", icon: FileEdit },
  { id: "member", name: "Members", icon: UserPlus },
  { id: "task", name: "Tasks", icon: CheckCircle2 },
  { id: "commit", name: "Commits", icon: GitBranch },
  { id: "meeting", name: "Meetings", icon: Video },
];

const activities = [
  {
    id: 1,
    type: "message",
    icon: MessageSquare,
    iconColor: "text-blue-500",
    bgColor: "bg-blue-500/10",
    user: "Sarah Chen",
    userAvatar: "SC",
    action: "sent a message in",
    target: "#design-review",
    time: "2 minutes ago",
  },
  {
    id: 2,
    type: "commit",
    icon: GitBranch,
    iconColor: "text-green-500",
    bgColor: "bg-green-500/10",
    user: "Mike Johnson",
    userAvatar: "MJ",
    action: "pushed 3 commits to",
    target: "frontend-app",
    time: "15 minutes ago",
  },
  {
    id: 3,
    type: "file",
    icon: FileEdit,
    iconColor: "text-orange-500",
    bgColor: "bg-orange-500/10",
    user: "Alex Kim",
    userAvatar: "AK",
    action: "updated",
    target: "Q4 Report.docx",
    time: "32 minutes ago",
  },
  {
    id: 4,
    type: "task",
    icon: CheckCircle2,
    iconColor: "text-primary",
    bgColor: "bg-primary/10",
    user: "Emily Davis",
    userAvatar: "ED",
    action: "completed task",
    target: "API Integration",
    time: "1 hour ago",
  },
  {
    id: 5,
    type: "member",
    icon: UserPlus,
    iconColor: "text-purple-500",
    bgColor: "bg-purple-500/10",
    user: "John Smith",
    userAvatar: "JS",
    action: "joined the team",
    target: "",
    time: "2 hours ago",
  },
  {
    id: 6,
    type: "meeting",
    icon: Video,
    iconColor: "text-red-500",
    bgColor: "bg-red-500/10",
    user: "Sarah Chen",
    userAvatar: "SC",
    action: "scheduled a meeting",
    target: "Sprint Planning",
    time: "3 hours ago",
  },
  {
    id: 7,
    type: "file",
    icon: FolderPlus,
    iconColor: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    user: "Mike Johnson",
    userAvatar: "MJ",
    action: "created folder",
    target: "Design Assets",
    time: "4 hours ago",
  },
  {
    id: 8,
    type: "task",
    icon: Edit,
    iconColor: "text-primary",
    bgColor: "bg-primary/10",
    user: "Alex Kim",
    userAvatar: "AK",
    action: "updated task",
    target: "Database Migration",
    time: "5 hours ago",
  },
  {
    id: 9,
    type: "message",
    icon: Mail,
    iconColor: "text-blue-500",
    bgColor: "bg-blue-500/10",
    user: "Emily Davis",
    userAvatar: "ED",
    action: "sent an email to",
    target: "Client Team",
    time: "6 hours ago",
  },
  {
    id: 10,
    type: "commit",
    icon: GitBranch,
    iconColor: "text-green-500",
    bgColor: "bg-green-500/10",
    user: "Sarah Chen",
    userAvatar: "SC",
    action: "merged branch",
    target: "feature/auth → main",
    time: "Yesterday at 5:30 PM",
  },
  {
    id: 11,
    type: "file",
    icon: Trash2,
    iconColor: "text-destructive",
    bgColor: "bg-destructive/10",
    user: "Mike Johnson",
    userAvatar: "MJ",
    action: "deleted file",
    target: "old-draft.docx",
    time: "Yesterday at 3:15 PM",
  },
  {
    id: 12,
    type: "meeting",
    icon: Calendar,
    iconColor: "text-red-500",
    bgColor: "bg-red-500/10",
    user: "Alex Kim",
    userAvatar: "AK",
    action: "completed meeting",
    target: "Design Review",
    time: "Yesterday at 2:00 PM",
  },
];

export default function TeamActivities() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.target.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === "all" || activity.type === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-120px)]">
        {/* Header - Fixed */}
        <header className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Activities</h1>
              <p className="text-sm text-muted-foreground mt-1">
                All team activities and updates
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search activities..."
                className="pl-9"
                aria-label="Search activities"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48" aria-label="Filter by type">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center gap-2">
                      <type.icon className="w-4 h-4" />
                      {type.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>

        {/* Activities List */}
        <ScrollArea className="flex-1 px-6">
          <div className="py-4 space-y-1">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No activities found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "Try a different search term" : "Team activities will appear here"}
                </p>
              </div>
            ) : (
              filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* Activity Icon */}
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", activity.bgColor)}>
                    <activity.icon className={cn("w-5 h-5", activity.iconColor)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                        {activity.userAvatar}
                      </div>
                      <p className="text-sm text-foreground">
                        <span className="font-semibold">{activity.user}</span>{" "}
                        <span className="text-muted-foreground">{activity.action}</span>{" "}
                        {activity.target && (
                          <span className="font-medium text-primary">{activity.target}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Time */}
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </MainLayout>
  );
}
