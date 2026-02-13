import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { WidgetCard } from "@/components/shared/WidgetCard";
import { Mail, Circle } from "lucide-react";
import { api } from "@/lib/api";

type MailThread = {
  id: string;
  subject?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  createdBy?: {
    name?: string;
  };
};

function extractThreads(payload: unknown): MailThread[] {
  if (Array.isArray(payload)) {
    return payload as MailThread[];
  }

  if (payload && typeof payload === "object") {
    const candidate = payload as { items?: unknown; data?: unknown };
    if (Array.isArray(candidate.items)) {
      return candidate.items as MailThread[];
    }
    if (Array.isArray(candidate.data)) {
      return candidate.data as MailThread[];
    }
  }

  return [];
}

export function MailWidget() {
  const navigate = useNavigate();
  const { teamId = "" } = useParams();
  const { data: threads = [], isLoading } = useQuery<MailThread[]>({
    queryKey: ["team-mail-widget", teamId],
    queryFn: async () => {
      const response = await api.get<unknown>(`/teams/${teamId}/mail?limit=3&page=1`);
      return extractThreads(response);
    },
    enabled: Boolean(teamId),
  });

  const unreadCount = threads.reduce(
    (total, thread) => total + (thread.unreadCount && thread.unreadCount > 0 ? 1 : 0),
    0
  );
  
  return (
    <WidgetCard 
      title="Unread Mail" 
      icon={Mail} 
      action={`${unreadCount} unread`}
      onAction={() => navigate(`/${teamId}/mail`)}
    >
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading mail...</p>
      ) : threads.length === 0 ? (
        <p className="text-sm text-muted-foreground">No mail threads found.</p>
      ) : (
        <div className="space-y-1">
          {threads.map((thread) => {
            const unread = Boolean(thread.unreadCount && thread.unreadCount > 0);
            const timestamp = thread.lastMessageAt
              ? new Date(thread.lastMessageAt).toLocaleString()
              : "";

            return (
              <div
                key={thread.id}
                className={`p-3 rounded-lg transition-colors cursor-pointer hover:bg-muted/50 ${
                  unread ? "bg-primary/5" : ""
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {unread ? <Circle className="w-2 h-2 fill-primary text-primary" /> : null}
                  <span className={`text-sm ${unread ? "font-semibold" : "font-medium"} text-foreground`}>
                    {thread.createdBy?.name || "Team member"}
                  </span>
                  {timestamp ? <span className="text-xs text-muted-foreground ml-auto">{timestamp}</span> : null}
                </div>
                <p className={`text-sm ${unread ? "font-medium" : ""} text-foreground line-clamp-1`}>
                  {thread.subject || "No subject"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </WidgetCard>
  );
}
