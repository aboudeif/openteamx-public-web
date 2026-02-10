import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

interface CreateTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTeamModal({ open, onOpenChange }: CreateTeamModalProps) {
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = () => {
    if (!teamName.trim()) {
      toast.error("Please enter a team name");
      return;
    }
    toast.success(`Team "${teamName}" created successfully!`);
    setTeamName("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription>
            Set up your team workspace. You can invite members after creation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="team-name">Team Name</Label>
            <Input
              id="team-name"
              placeholder="Enter team name..."
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What does your team do?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create Team</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
