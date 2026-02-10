import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Hash, Users } from "lucide-react";
import { toast } from "sonner";

interface AddWorkspaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const teamMembers = [
  { id: "1", name: "Sarah Chen", initials: "SC" },
  { id: "2", name: "Mike Johnson", initials: "MJ" },
  { id: "3", name: "Alex Kim", initials: "AK" },
  { id: "4", name: "Emily Davis", initials: "ED" },
  { id: "5", name: "John Doe", initials: "JD" },
];

export function AddWorkspaceModal({ open, onOpenChange }: AddWorkspaceModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  if (!open) return null;

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Please enter a workspace name");
      return;
    }
    toast.success("Workspace created successfully");
    onOpenChange(false);
    setName("");
    setDescription("");
    setSelectedMembers([]);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-lg">Create Workspace</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Workspace Name</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., design-feedback"
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Description (optional)</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this workspace for?"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-3 block flex items-center gap-2">
              <Users className="w-4 h-4" />
              Add Members
            </label>
            <div className="flex flex-wrap gap-2">
              {teamMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => toggleMember(member.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedMembers.includes(member.id)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium ${
                    selectedMembers.includes(member.id) ? "bg-primary-foreground/20" : "bg-primary/20 text-primary"
                  }`}>
                    {member.initials}
                  </div>
                  {member.name}
                </button>
              ))}
            </div>
            {selectedMembers.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {selectedMembers.length} member{selectedMembers.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-border flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleCreate}>
            Create Workspace
          </Button>
        </div>
      </div>
    </div>
  );
}
