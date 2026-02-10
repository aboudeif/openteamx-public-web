import { useNavigate } from "react-router-dom";
import { WidgetCard } from "@/components/shared/WidgetCard";
import { Mail, Circle } from "lucide-react";

const emails = [
  {
    id: 1,
    from: "Marketing Team",
    subject: "Q1 Campaign Assets Review",
    preview: "Please review the attached assets for the upcoming...",
    time: "10:30 AM",
    unread: true,
  },
  {
    id: 2,
    from: "HR Department",
    subject: "Team Building Event - Save the Date",
    preview: "We're excited to announce our annual team building...",
    time: "Yesterday",
    unread: true,
  },
  {
    id: 3,
    from: "Alex Kim",
    subject: "RE: Project Timeline Update",
    preview: "Thanks for the update. I've reviewed the new timeline...",
    time: "Yesterday",
    unread: false,
  },
];

export function MailWidget() {
  const unreadCount = emails.filter((e) => e.unread).length;
  const navigate = useNavigate();
  const team = {id: 'team-1'};
  
  return (
    <WidgetCard 
      title="Unread Mail" 
      icon={Mail} 
      action={`${unreadCount} unread`}
      onAction={() => navigate(`/${team.id}/mail`)}
    >
      <div className="space-y-1">
        {emails.map((email) => (
          <div
            key={email.id}
            className={`p-3 rounded-lg transition-colors cursor-pointer hover:bg-muted/50 ${
              email.unread ? "bg-primary/5" : ""
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              {email.unread && <Circle className="w-2 h-2 fill-primary text-primary" />}
              <span className={`text-sm ${email.unread ? "font-semibold" : "font-medium"} text-foreground`}>
                {email.from}
              </span>
              <span className="text-xs text-muted-foreground ml-auto">{email.time}</span>
            </div>
            <p className={`text-sm ${email.unread ? "font-medium" : ""} text-foreground line-clamp-1`}>
              {email.subject}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-1">{email.preview}</p>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}
