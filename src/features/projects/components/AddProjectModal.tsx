import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Calendar } from "lucide-react";
import { toast } from "sonner";
import { projectService } from "@/services";
import { api } from "@/lib/api";

interface AddProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  onCreated?: () => Promise<void> | void;
  onUpdated?: () => Promise<void> | void;
  projectToEdit?: {
    id: string;
    title?: string;
    description?: string;
    dueDate?: string;
  };
}

export function AddProjectModal({
  open,
  onOpenChange,
  teamId,
  onCreated,
  onUpdated,
  projectToEdit,
}: AddProjectModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const isEditMode = Boolean(projectToEdit?.id);

  useEffect(() => {
    if (!open) {
      return;
    }
    if (!projectToEdit) {
      setTitle("");
      setDescription("");
      setDueDate("");
      return;
    }
    setTitle(projectToEdit.title || "");
    setDescription(projectToEdit.description || "");
    setDueDate(projectToEdit.dueDate ? new Date(projectToEdit.dueDate).toISOString().slice(0, 10) : "");
  }, [open, projectToEdit]);

  if (!open) return null;

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Please enter a project title");
      return;
    }

    if (!teamId) {
      toast.error("Team context is missing. Please reload and try again.");
      return;
    }

    try {
      setIsCreating(true);
      if (isEditMode && projectToEdit) {
        const payload = {
          name: title.trim(),
          description: description.trim(),
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        };
        try {
          await api.patch(`/projects/${projectToEdit.id}`, payload);
        } catch (patchError: unknown) {
          const isNotFound = patchError instanceof Error && patchError.message.includes("404");
          if (!isNotFound) throw patchError;
          await api.put(`/projects/${projectToEdit.id}`, payload);
        }
        await onUpdated?.();
        toast.success("Project updated successfully");
      } else {
        await projectService.createProject(teamId, {
          title: title.trim(),
          description: description.trim(),
          dueDate,
        });
        await onCreated?.();
        toast.success("Project created successfully");
      }
      onOpenChange(false);
      resetForm();
    } catch (error: unknown) {
      const message = error instanceof Error
        ? error.message
        : isEditMode
          ? "Failed to update project"
          : "Failed to create project";
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-lg">{isEditMode ? "Edit Project" : "Create Project"}</h3>
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
          <Button className="flex-1" onClick={handleSubmit} disabled={isCreating}>
            {isCreating ? (isEditMode ? "Saving..." : "Creating...") : (isEditMode ? "Save Changes" : "Create Project")}
          </Button>
        </div>
      </div>
    </div>
  );
}
