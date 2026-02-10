import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, CheckCircle2, Circle, Timer, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statuses = [
  { value: "todo", label: "To Do", icon: Circle, color: "text-muted-foreground" },
  { value: "in_progress", label: "In Progress", icon: Timer, color: "text-info" },
  { value: "review", label: "In Review", icon: AlertCircle, color: "text-warning" },
  { value: "done", label: "Done", icon: CheckCircle2, color: "text-success" },
];

const priorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const teamMembers = [
  { id: "SC", name: "Sarah Chen" },
  { id: "MJ", name: "Mike Johnson" },
  { id: "AK", name: "Alex Kim" },
  { id: "ED", name: "Emily Davis" },
];

export function FilterModal({ open, onOpenChange }: FilterModalProps) {
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  if (!open) return null;

  const toggleStatus = (value: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  const togglePriority = (value: string) => {
    setSelectedPriorities((prev) =>
      prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value]
    );
  };

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const clearAll = () => {
    setSelectedStatuses([]);
    setSelectedPriorities([]);
    setSelectedMembers([]);
    setDateRange({ from: "", to: "" });
  };

  const applyFilters = () => {
    onOpenChange(false);
  };

  const hasFilters = selectedStatuses.length > 0 || selectedPriorities.length > 0 || selectedMembers.length > 0 || dateRange.from || dateRange.to;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-lg">Filter Tasks</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">Status</label>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => {
                const Icon = status.icon;
                return (
                  <button
                    key={status.value}
                    onClick={() => toggleStatus(status.value)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                      selectedStatuses.includes(status.value)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", !selectedStatuses.includes(status.value) && status.color)} />
                    {status.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">Priority</label>
            <div className="flex flex-wrap gap-2">
              {priorities.map((priority) => (
                <button
                  key={priority.value}
                  onClick={() => togglePriority(priority.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                    selectedPriorities.includes(priority.value)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">Assignee</label>
            <div className="flex flex-wrap gap-2">
              {teamMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => toggleMember(member.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                    selectedMembers.includes(member.id)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium",
                    selectedMembers.includes(member.id) ? "bg-primary-foreground/20" : "bg-primary/20 text-primary"
                  )}>
                    {member.id}
                  </div>
                  {member.name}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">Due Date Range</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">From</label>
                <Input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">To</label>
                <Input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border flex gap-2">
          <Button variant="outline" onClick={clearAll} disabled={!hasFilters}>
            Clear All
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={applyFilters}>
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
