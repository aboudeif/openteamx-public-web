import { useNavigate } from "react-router-dom";
import { WidgetCard } from "@/components/shared/WidgetCard";
import { MessageSquare, Hash, Circle } from "lucide-react";

const messages = [
  {
    id: 1,
    channel: "General",
    sender: "Mike Johnson",
    message: "Has anyone tested the new API endpoints?",
    time: "Just now",
    unread: true,
  },
  {
    id: 2,
    channel: "Design",
    sender: "Sarah Chen",
    message: "Uploaded the new mockups to Figma 🎨",
    time: "5 min ago",
    unread: true,
  },
  {
    id: 3,
    channel: "Project Alpha",
    sender: "Alex Kim",
    message: "Sprint tasks are ready for review",
    time: "1 hour ago",
    unread: false,
  },
];

export function ChatWidget() {
  const unreadCount = messages.filter((m) => m.unread).length;
  const navigate = useNavigate();
  const team = {id: 'team-1'};

  return (
    <WidgetCard 
      title="Unread Messages" 
      icon={MessageSquare} 
      action={`${unreadCount} unread`}
      onAction={() => navigate(`/${team.id}/chat`)}
    >
      <div className="space-y-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded-lg transition-colors cursor-pointer hover:bg-muted/50 ${
              msg.unread ? "bg-primary/5" : ""
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              {msg.unread && <Circle className="w-2 h-2 fill-primary text-primary flex-shrink-0" />}
              <Hash className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">{msg.channel}</span>
              <span className="text-xs text-muted-foreground ml-auto">{msg.time}</span>
            </div>
            <p className="text-sm text-foreground">
              <span className="font-medium">{msg.sender}:</span>{" "}
              <span className={msg.unread ? "" : "text-muted-foreground"}>{msg.message}</span>
            </p>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}
