import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Calendar, User } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
}

const priorities = [
  { value: "low", label: "Low", color: "bg-muted text-muted-foreground" },
  { value: "medium", label: "Medium", color: "bg-warning/10 text-warning" },
  { value: "high", label: "High", color: "bg-destructive/10 text-destructive" },
];

const teamMembers = [
  { id: "1", name: "Sarah Chen", initials: "SC" },
  { id: "2", name: "Mike Johnson", initials: "MJ" },
  { id: "3", name: "Alex Kim", initials: "AK" },
  { id: "4", name: "Emily Davis", initials: "ED" },
];

export function AddTaskModal({ open, onOpenChange, projectId }: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [estimation, setEstimation] = useState("");
  const [userStory, setUserStory] = useState("");

  if (!open) return null;

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error("Please enter a task title");
      return;
    }
    toast.success("Task created successfully");
    onOpenChange(false);
    setTitle("");
    setDescription("");
    setPriority("medium");
    setAssignee("");
    setDueDate("");
    setEstimation("");
    setUserStory("");
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-lg">Add Task</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1 scrollbar-thin">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Task Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task..."
              className="w-full h-20 px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Priority</label>
            <div className="flex gap-2">
              {priorities.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPriority(p.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                    priority === p.value
                      ? `${p.color} ring-2 ring-primary ring-offset-2`
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Assign To</label>
            <div className="flex flex-wrap gap-2">
              {teamMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setAssignee(member.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all",
                    assignee === member.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-medium">
                    {member.initials}
                  </div>
                  {member.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Due Date</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Estimation</label>
              <Input
                value={estimation}
                onChange={(e) => setEstimation(e.target.value)}
                placeholder="e.g., 2 days"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">User Story</label>
            <textarea
              value={userStory}
              onChange={(e) => setUserStory(e.target.value)}
              placeholder="As a [user], I want [goal] so that [benefit]..."
              className="w-full h-16 px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="p-4 border-t border-border flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleCreate}>
            Add Task
          </Button>
        </div>
      </div>
    </div>
  );
}
