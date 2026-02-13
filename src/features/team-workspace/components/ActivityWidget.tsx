import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { WidgetCard } from "@/components/shared/WidgetCard";
import { Activity, MessageSquare, FileEdit, UserPlus, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

type ActivityFeedItem = {
  id: string;
  category?: string;
  type?: string;
  message?: string;
  actor?: {
    name?: string;
  };
  occurredAt?: string;
};

function extractActivities(payload: unknown): ActivityFeedItem[] {
  if (Array.isArray(payload)) {
    return payload as ActivityFeedItem[];
  }

  if (payload && typeof payload === "object") {
    const candidate = payload as { items?: unknown; data?: unknown };
    if (Array.isArray(candidate.items)) {
      return candidate.items as ActivityFeedItem[];
    }
    if (Array.isArray(candidate.data)) {
      return candidate.data as ActivityFeedItem[];
    }
  }

  return [];
}

function getIconForActivity(activity: ActivityFeedItem) {
  const key = `${activity.category ?? ""} ${activity.type ?? ""}`.toLowerCase();
  if (key.includes("task")) return CheckCircle2;
  if (key.includes("file") || key.includes("drive")) return FileEdit;
  if (key.includes("member") || key.includes("team")) return UserPlus;
  return MessageSquare;
}

export function ActivityWidget() {
  const navigate = useNavigate();
  const { teamId = "" } = useParams();
  const { data: activities = [], isLoading } = useQuery<ActivityFeedItem[]>({
    queryKey: ["team-activity-widget", teamId],
    queryFn: async () => {
      const response = await api.get<unknown>(`/teams/${teamId}/activity?limit=4&page=1`);
      return extractActivities(response);
    },
    enabled: Boolean(teamId),
  });

  return (
    <WidgetCard 
    title="Recent Activity" 
    icon={Activity} 
    action="View all"
    onAction={() => navigate(`/${teamId}/activities`)}
    >
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading activity...</p>
      ) : activities.length === 0 ? (
        <p className="text-sm text-muted-foreground">No recent activity.</p>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => {
            const Icon = getIconForActivity(activity);
            const actor = activity.actor?.name || "Team member";
            const message = activity.message || "Performed an action";
            const timestamp = activity.occurredAt
              ? new Date(activity.occurredAt).toLocaleString()
              : "";

            return (
              <div key={activity.id} className="flex items-start gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{actor}</span>{" "}
                    <span className="text-muted-foreground">{message}</span>
                  </p>
                  {timestamp ? (
                    <p className="text-xs text-muted-foreground">{timestamp}</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </WidgetCard>
  );
}
