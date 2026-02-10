import { Button } from "@/components/ui/button";
import { X, UserPlus, UserMinus, Filter } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ViewHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const fullHistory = [
  { id: 1, type: "joined", team: "TechVentures Studio", date: "Jan 15, 2026", role: "Team Lead" },
  { id: 2, type: "joined", team: "DesignCo Agency", date: "Nov 3, 2025", role: "Member" },
  { id: 3, type: "left", team: "StartupX Labs", date: "Oct 28, 2025", reason: "Project completed" },
  { id: 4, type: "joined", team: "StartupX Labs", date: "Mar 12, 2024", role: "Member" },
  { id: 5, type: "joined", team: "CodeCraft Studio", date: "Jan 5, 2024", role: "Member" },
  { id: 6, type: "left", team: "WebAgency Co.", date: "Dec 20, 2023", reason: "Career change" },
  { id: 7, type: "joined", team: "WebAgency Co.", date: "Jun 15, 2022", role: "Junior Developer" },
  { id: 8, type: "left", team: "FreelanceHub", date: "Jun 1, 2022", reason: "Found full-time position" },
  { id: 9, type: "joined", team: "FreelanceHub", date: "Jan 10, 2021", role: "Freelancer" },
  { id: 10, type: "joined", team: "StudentDev Community", date: "Sep 1, 2019", role: "Member" },
];

export function ViewHistoryModal({ open, onOpenChange }: ViewHistoryModalProps) {
  const [filter, setFilter] = useState<"all" | "joined" | "left">("all");

  if (!open) return null;

  const filteredHistory = filter === "all" 
    ? fullHistory 
    : fullHistory.filter(h => h.type === filter);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-lg">Team History</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Filters */}
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground mr-2">Filter:</span>
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium transition-colors",
              filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilter("joined")}
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium transition-colors",
              filter === "joined" ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            Joined
          </button>
          <button
            onClick={() => setFilter("left")}
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium transition-colors",
              filter === "left" ? "bg-muted text-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            Left
          </button>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-4 bottom-4 w-px bg-border" />

            <div className="space-y-6">
              {filteredHistory.map((event, idx) => (
                <div 
                  key={event.id} 
                  className="flex items-start gap-4 relative animate-fade-in" 
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Timeline dot */}
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10",
                    event.type === "joined" 
                      ? "bg-success/10 text-success" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {event.type === "joined" ? (
                      <UserPlus className="w-4 h-4" />
                    ) : (
                      <UserMinus className="w-4 h-4" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 p-4 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        event.type === "joined" 
                          ? "bg-success/10 text-success" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        {event.type === "joined" ? "Joined" : "Left"}
                      </span>
                      <span className="text-sm font-semibold text-primary">{event.team}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">{event.date}</span>
                      {event.type === "joined" && event.role && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{event.role}</span>
                        </>
                      )}
                      {event.type === "left" && event.reason && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground italic">{event.reason}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {filteredHistory.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No history entries found for this filter</p>
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
