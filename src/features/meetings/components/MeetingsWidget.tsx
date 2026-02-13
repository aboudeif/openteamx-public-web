import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { WidgetCard } from "@/components/shared/WidgetCard";
import { Video, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { ApiMeetingService } from "@/services/api/ApiMeetingService";

type MeetingItem = {
  id: string;
  title: string;
  startTime: string;
  duration?: number;
  meetingLink?: string;
  participants?: string[];
  status?: string;
};

const meetingService = new ApiMeetingService();

function extractMeetings(payload: unknown): MeetingItem[] {
  if (Array.isArray(payload)) {
    return payload as MeetingItem[];
  }

  if (payload && typeof payload === "object") {
    const candidate = payload as { items?: unknown; data?: unknown };
    if (Array.isArray(candidate.items)) {
      return candidate.items as MeetingItem[];
    }
    if (Array.isArray(candidate.data)) {
      return candidate.data as MeetingItem[];
    }
  }

  return [];
}

const toInitials = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export function MeetingsWidget() {
  const navigate = useNavigate();
  const { teamId = "" } = useParams();
  const { data: rawMeetings = [], isLoading } = useQuery<MeetingItem[]>({
    queryKey: ["team-meetings-widget", teamId],
    queryFn: async () => {
      const response = await meetingService.getMeetings(teamId);
      return extractMeetings(response);
    },
    enabled: Boolean(teamId),
  });

  const meetings = useMemo(
    () =>
      rawMeetings
        .filter((meeting) => {
          const timestamp = new Date(meeting.startTime).getTime();
          return !Number.isNaN(timestamp);
        })
        .sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        )
        .slice(0, 3),
    [rawMeetings]
  );

  return (
    <WidgetCard 
    title="Upcoming Meetings" 
    icon={Video} 
    action="See all"
    onAction={() => navigate(`/${teamId}/meetings`)}
    >
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading meetings...</p>
      ) : meetings.length === 0 ? (
        <p className="text-sm text-muted-foreground">No upcoming meetings.</p>
      ) : (
        <div className="space-y-3">
          {meetings.map((meeting) => {
            const startTime = new Date(meeting.startTime);
            const attendees = Array.isArray(meeting.participants) ? meeting.participants : [];

            return (
              <div
                key={meeting.id}
                className="p-3 rounded-lg border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-foreground">{meeting.title}</h4>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                  <Clock className="w-3 h-3" />
                  {startTime.toLocaleString()}
                </div>
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span>{attendees.length} attendees</span>
                    <div className="flex -space-x-2">
                      {attendees.slice(0, 3).map((participant) => (
                        <div
                          key={participant}
                          className="w-7 h-7 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center text-[10px] font-medium text-primary"
                        >
                          {toInitials(participant) || "U"}
                        </div>
                      ))}
                    </div>
                  </div>
                  {meeting.meetingLink ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => window.open(meeting.meetingLink, "_blank", "noopener,noreferrer")}
                    >
                      Join
                    </Button>
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
