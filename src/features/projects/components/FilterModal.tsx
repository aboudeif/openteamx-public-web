import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, CheckCircle2, Circle, Timer, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialFilters?: TaskFilters;
  onApply?: (filters: TaskFilters) => void;
  assigneeOptions?: Array<{ id: string; name: string }>;
  statusOptions?: string[];
  priorityOptions?: string[];
}

export interface TaskFilters {
  statuses: string[];
  priorities: string[];
  assignees: string[];
  dueDateFrom: string;
  dueDateTo: string;
}

export function FilterModal({
  open,
  onOpenChange,
  initialFilters,
  onApply,
  assigneeOptions = [],
  statusOptions = [],
  priorityOptions = [],
}: FilterModalProps) {
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(initialFilters?.statuses || []);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(initialFilters?.priorities || []);
  const [selectedMembers, setSelectedMembers] = useState<string[]>(initialFilters?.assignees || []);
  const [dateRange, setDateRange] = useState({
    from: initialFilters?.dueDateFrom || "",
    to: initialFilters?.dueDateTo || "",
  });

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
    onApply?.({
      statuses: [],
      priorities: [],
      assignees: [],
      dueDateFrom: "",
      dueDateTo: "",
    });
  };

  const applyFilters = () => {
    onApply?.({
      statuses: selectedStatuses,
      priorities: selectedPriorities,
      assignees: selectedMembers,
      dueDateFrom: dateRange.from,
      dueDateTo: dateRange.to,
    });
    onOpenChange(false);
  };

  const hasFilters = selectedStatuses.length > 0 || selectedPriorities.length > 0 || selectedMembers.length > 0 || dateRange.from || dateRange.to;
  const getStatusIcon = (value: string) => {
    const normalized = value.toLowerCase();
    if (normalized === "in_progress") return Timer;
    if (normalized === "review") return AlertCircle;
    if (normalized === "done") return CheckCircle2;
    return Circle;
  };
  const getStatusColor = (value: string) => {
    const normalized = value.toLowerCase();
    if (normalized === "in_progress") return "text-info";
    if (normalized === "review") return "text-warning";
    if (normalized === "done") return "text-success";
    return "text-muted-foreground";
  };
  const getStatusLabel = (value: string) =>
    value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  const getPriorityLabel = (value: string) =>
    value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

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
              {statusOptions.map((status) => {
                const Icon = getStatusIcon(status);
                return (
                  <button
                    key={status}
                    onClick={() => toggleStatus(status)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                      selectedStatuses.includes(status)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", !selectedStatuses.includes(status) && getStatusColor(status))} />
                    {getStatusLabel(status)}
                  </button>
                );
              })}
              {statusOptions.length === 0 && <p className="text-xs text-muted-foreground">No statuses available.</p>}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">Priority</label>
            <div className="flex flex-wrap gap-2">
              {priorityOptions.map((priority) => (
                <button
                  key={priority}
                  onClick={() => togglePriority(priority)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                    selectedPriorities.includes(priority)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {getPriorityLabel(priority)}
                </button>
              ))}
              {priorityOptions.length === 0 && <p className="text-xs text-muted-foreground">No priorities available.</p>}
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">Assignee</label>
            <div className="flex flex-wrap gap-2">
              {assigneeOptions.map((member) => (
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
              {assigneeOptions.length === 0 && (
                <p className="text-xs text-muted-foreground">No assignees available.</p>
              )}
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
