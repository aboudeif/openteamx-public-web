import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Calendar } from "lucide-react";
import { toast } from "sonner";

interface AddProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddProjectModal({ open, onOpenChange }: AddProjectModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  if (!open) return null;

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error("Please enter a project title");
      return;
    }
    toast.success("Project created successfully");
    onOpenChange(false);
    setTitle("");
    setDescription("");
    setDueDate("");
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-lg">Create Project</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Project Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter project title"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the project..."
              className="w-full h-24 px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Due Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleCreate}>
            Create Project
          </Button>
        </div>
      </div>
    </div>
  );
}
