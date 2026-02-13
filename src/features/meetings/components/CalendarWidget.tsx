import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { WidgetCard } from "@/components/shared/WidgetCard";
import { Calendar, Clock, MapPin, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";

type CalendarEventItem = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location?: string;
  videoUrl?: string;
};

function extractCalendarEvents(payload: unknown): CalendarEventItem[] {
  if (Array.isArray(payload)) {
    return payload as CalendarEventItem[];
  }

  if (payload && typeof payload === "object") {
    const candidate = payload as { items?: unknown; data?: unknown };
    if (Array.isArray(candidate.items)) {
      return candidate.items as CalendarEventItem[];
    }
    if (Array.isArray(candidate.data)) {
      return candidate.data as CalendarEventItem[];
    }
  }

  return [];
}

export function CalendarWidget() {
  const navigate = useNavigate();
  const { teamId = "" } = useParams();
  const now = new Date();
  const rangeStart = now.toISOString();
  const rangeEnd = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 14).toISOString();

  const { data: rawEvents = [], isLoading } = useQuery<CalendarEventItem[]>({
    queryKey: ["team-calendar-widget", teamId, rangeStart, rangeEnd],
    queryFn: async () => {
      const response = await api.get<unknown>(
        `/teams/${teamId}/calendar?from=${encodeURIComponent(rangeStart)}&to=${encodeURIComponent(rangeEnd)}`
      );
      return extractCalendarEvents(response);
    },
    enabled: Boolean(teamId),
  });

  const events = useMemo(
    () =>
      rawEvents
        .filter((event) => !Number.isNaN(new Date(event.startTime).getTime()))
        .sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        )
        .slice(0, 3),
    [rawEvents]
  );

  return (
    <WidgetCard 
    title="Upcoming Events" 
    icon={Calendar} 
    action="Open calendar"
    onAction={() => navigate(`/${teamId}/calendar`)}
    >
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading events...</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-muted-foreground">No upcoming events.</p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const start = new Date(event.startTime);
            const end = new Date(event.endTime);
            const isNow = start <= now && now <= end;

            return (
              <div
                key={event.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50",
                  isNow && "border-primary bg-primary/5"
                )}
              >
                <div className={cn("w-1 h-full min-h-[3rem] rounded-full", isNow ? "bg-primary" : "bg-info")} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-foreground truncate">{event.title}</h4>
                    {isNow ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary text-primary-foreground">
                        NOW
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {start.toLocaleString()} - {end.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    {event.videoUrl ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                    {event.videoUrl || event.location || "No location"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </WidgetCard>
  );
}
