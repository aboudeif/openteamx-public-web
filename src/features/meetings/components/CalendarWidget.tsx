import { WidgetCard } from "@/components/shared/WidgetCard";
import { Calendar, Clock, MapPin, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const events = [
  {
    id: 1,
    title: "Sprint Planning",
    time: "Today, 2:00 PM - 3:30 PM",
    location: "Google Meet",
    isNow: true,
    color: "bg-primary",
  },
  {
    id: 2,
    title: "Design Review",
    time: "Today, 4:00 PM - 4:30 PM",
    location: "Zoom",
    isNow: false,
    color: "bg-info",
  },
  {
    id: 3,
    title: "Client Presentation",
    time: "Tomorrow, 10:00 AM - 11:00 AM",
    location: "Office - Room A",
    isNow: false,
    color: "bg-warning",
  },
];

export function CalendarWidget() {
  const navigate = useNavigate();
  const team = {id: 'team-1'};
  
  return (
    <WidgetCard 
    title="Upcoming Events" 
    icon={Calendar} 
    action="Open calendar"
    onAction={() => navigate(`/${team.id}/calendar`)}
    >
      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50",
              event.isNow && "border-primary bg-primary/5"
            )}
          >
            <div className={cn("w-1 h-full min-h-[3rem] rounded-full", event.color)} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-medium text-foreground truncate">{event.title}</h4>
                {event.isNow && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary text-primary-foreground">
                    NOW
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {event.time}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                {event.location.includes("Meet") || event.location.includes("Zoom") ? (
                  <Video className="w-3 h-3" />
                ) : (
                  <MapPin className="w-3 h-3" />
                )}
                {event.location}
              </div>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}
