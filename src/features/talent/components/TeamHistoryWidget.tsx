import { useState } from "react";
import { WidgetCard } from "@/components/shared/WidgetCard";
import { History, UserPlus, UserMinus } from "lucide-react";
import { ViewHistoryModal } from "./ViewHistoryModal";
import { ScrollArea } from "@/components/ui/scroll-area";

const historyEvents = [
  { id: 1, type: "joined", team: "TechVentures Studio", date: "Jan 15, 2026", role: "Team Lead" },
  { id: 2, type: "joined", team: "DesignCo Agency", date: "Nov 3, 2025", role: "Member" },
  { id: 3, type: "left", team: "StartupX Labs", date: "Oct 28, 2025", role: "Member" },
  { id: 4, type: "joined", team: "StartupX Labs", date: "Mar 12, 2024", role: "Member" },
  { id: 5, type: "joined", team: "CodeCraft Studio", date: "Jan 5, 2024", role: "Member" },
];

export function TeamHistoryWidget() {
  const [showViewModal, setShowViewModal] = useState(false);

  return (
    <>
      <WidgetCard 
        title="Team History" 
        icon={History} 
        action="View Full History"
        onAction={() => setShowViewModal(true)}
      >
        <ScrollArea className="h-[280px]">
          <div className="relative pr-2">
            {/* Timeline line */}
            <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />

            <div className="space-y-4">
              {historyEvents.map((event, idx) => (
                <div key={event.id} className="flex items-start gap-3 relative animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                  {/* Timeline dot */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                    event.type === "joined" 
                      ? "bg-success/10 text-success" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {event.type === "joined" ? (
                      <UserPlus className="w-4 h-4" />
                    ) : (
                      <UserMinus className="w-4 h-4" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">
                        {event.type === "joined" ? "Joined" : "Left"}
                      </span>
                      <span className="text-sm font-semibold text-primary">{event.team}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{event.date}</span>
                      {event.type === "joined" && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{event.role}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </WidgetCard>

      <ViewHistoryModal open={showViewModal} onOpenChange={setShowViewModal} />
    </>
  );
}
