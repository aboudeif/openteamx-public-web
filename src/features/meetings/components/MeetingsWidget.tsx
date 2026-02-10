import { WidgetCard } from "@/components/shared/WidgetCard";
import { Video, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const meetings = [
  {
    id: 1,
    title: "Weekly Standup",
    time: "In 30 minutes",
    attendees: ["SC", "MJ", "AK"],
    hasNotes: true,
  },
  {
    id: 2,
    title: "Product Demo",
    time: "Tomorrow, 11:00 AM",
    attendees: ["ED", "SC", "MJ", "AK", "JD"],
    hasNotes: false,
  },
];

export function MeetingsWidget() {
  const navigate = useNavigate();
  const team = {id: 'team-1'};

  return (
    <WidgetCard 
    title="Upcoming Meetings" 
    icon={Video} 
    action="See all"
    onAction={() => navigate(`/${team.id}/meetings`)}
    >
      <div className="space-y-3">
        {meetings.map((meeting) => (
          <div
            key={meeting.id}
            className="p-3 rounded-lg border border-border hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm font-medium text-foreground">{meeting.title}</h4>
              {meeting.hasNotes && (
                <button className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                  <FileText className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
              <Clock className="w-3 h-3" />
              {meeting.time}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                {meeting.attendees.slice(0, 4).map((initials, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center text-[10px] font-medium text-primary"
                  >
                    {initials}
                  </div>
                ))}
                {meeting.attendees.length > 4 && (
                  <div className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                    +{meeting.attendees.length - 4}
                  </div>
                )}
              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs">
                Join
              </Button>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}
