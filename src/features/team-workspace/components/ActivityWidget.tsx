import { useNavigate } from "react-router-dom";
import { WidgetCard } from "@/components/shared/WidgetCard";
import { Activity, MessageSquare, FileEdit, UserPlus, CheckCircle2 } from "lucide-react";

const activities = [
  {
    id: 1,
    type: "message",
    icon: MessageSquare,
    user: "Sarah Chen",
    action: "sent a message in",
    target: "#design-review",
    time: "2 min ago",
  },
  {
    id: 2,
    type: "file",
    icon: FileEdit,
    user: "Mike Johnson",
    action: "updated",
    target: "Q4 Report.docx",
    time: "15 min ago",
  },
  {
    id: 3,
    type: "member",
    icon: UserPlus,
    user: "Alex Kim",
    action: "joined the team",
    target: "",
    time: "1 hour ago",
  },
  {
    id: 4,
    type: "task",
    icon: CheckCircle2,
    user: "Emily Davis",
    action: "completed",
    target: "API Integration",
    time: "2 hours ago",
  },
];

export function ActivityWidget() {
  const navigate = useNavigate();
  const team = {id: 'team-1'};
  
  return (
    <WidgetCard 
    title="Recent Activity" 
    icon={Activity} 
    action="View all"
    onAction={() => navigate(`/${team.id}/activities`)}
    >
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <activity.icon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">
                <span className="font-medium">{activity.user}</span>{" "}
                <span className="text-muted-foreground">{activity.action}</span>{" "}
                {activity.target && <span className="font-medium">{activity.target}</span>}
              </p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}
