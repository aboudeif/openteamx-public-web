import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Link2, 
  Trash2, 
  Check,
  Lock,
  Eye,
  Edit,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { ApiTeamService } from "@/services/api/ApiTeamService";
import { driveService } from "@/services";

interface ManageAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId?: string;
  itemName: string;
  itemType: "file" | "folder";
  teamId?: string;
}

type TeamRecipient = {
  id: string;
  name: string;
  avatar: string;
  access: "view" | "edit";
};

const teamService = new ApiTeamService();

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export function ManageAccessModal({ open, onOpenChange, itemId, itemName, itemType, teamId }: ManageAccessModalProps) {
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [pendingAccess, setPendingAccess] = useState<"view" | "edit">("edit");
  const [linkCopied, setLinkCopied] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamRecipient[]>([]);
  const [sharedWith, setSharedWith] = useState<TeamRecipient[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open || !teamId) {
      return;
    }

    const loadMembers = async () => {
      setIsLoadingMembers(true);
      try {
        const response = await teamService.getTeamMembers(teamId);
        const members = Array.isArray(response.members) ? response.members : [];
        const normalized = members
          .map((member) => {
            const id = member.userId || member.user?.id || member.id;
            const name = member.user?.name || "Unknown member";
            return {
              id,
              name,
              avatar: getInitials(name),
              access: "view" as const,
            };
          })
          .filter((member) => member.id);

        setTeamMembers(normalized);

        const driveWithAccess = driveService as typeof driveService & {
          getFileAccess?: (
            teamId: string,
            fileId: string,
          ) => Promise<Array<{ userId: string; level: "view" | "edit" }>>;
        };

        if (itemId && driveWithAccess.getFileAccess) {
          const accessEntries = await driveWithAccess.getFileAccess(teamId, itemId);
          const accessMap = new Map(accessEntries.map((entry) => [entry.userId, entry.level]));
          const shared = normalized
            .filter((member) => accessMap.has(member.id))
            .map((member) => ({ ...member, access: accessMap.get(member.id) || "view" }));
          setSharedWith(shared);
        } else {
          setSharedWith([]);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load team members";
        toast.error(message);
      } finally {
        setIsLoadingMembers(false);
      }
    };

    void loadMembers();
  }, [open, teamId, itemId]);

  const availableMembers = useMemo(
    () => teamMembers.filter((member) => !sharedWith.some((sharedMember) => sharedMember.id === member.id)),
    [teamMembers, sharedWith],
  );

  const copyLink = () => {
    navigator.clipboard.writeText(`https://talenthub.app/team/${teamId ?? "team"}/drive/${itemType}/share-link`);
    setLinkCopied(true);
    toast.success("Internal team link copied");
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const inviteUser = () => {
    if (!selectedMemberId) {
      toast.error("Please choose a team member");
      return;
    }

    const member = teamMembers.find((teamMember) => teamMember.id === selectedMemberId);
    if (!member) {
      toast.error("Selected member not found");
      return;
    }

    setSharedWith((prev) => [...prev, { ...member, access: pendingAccess }]);
    toast.success(`Access updated for ${member.name}`);
    setSelectedMemberId("");
  };

  const removeAccess = (id: string, name: string) => {
    setSharedWith((prev) => prev.filter((member) => member.id !== id));
    toast.success(`Removed ${name}'s access`);
  };

  const saveAccessChanges = async () => {
    if (!teamId || !itemId) {
      onOpenChange(false);
      return;
    }

    const driveWithAccess = driveService as typeof driveService & {
      manageFileAccess?: (
        teamId: string,
        fileId: string,
        userAccesses: Array<{ userId: string; level: "view" | "edit" }>,
      ) => Promise<void>;
    };

    if (!driveWithAccess.manageFileAccess) {
      onOpenChange(false);
      return;
    }

    setIsSaving(true);
    try {
      await driveWithAccess.manageFileAccess(
        teamId,
        itemId,
        sharedWith.map((member) => ({ userId: member.id, level: member.access })),
      );
      toast.success("Sharing updated");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update sharing");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share "{itemName}"</DialogTitle>
          <DialogDescription>
            Manage who can view or edit this {itemType}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Add People */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Add people</label>
            <div className="flex items-center gap-2">
              <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                <SelectTrigger className="flex-1">
                  <SelectValue
                    placeholder={isLoadingMembers ? "Loading team members..." : "Choose team member"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={pendingAccess} onValueChange={(value: "view" | "edit") => setPendingAccess(value)}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Viewer
                    </div>
                  </SelectItem>
                  <SelectItem value="edit">
                    <div className="flex items-center gap-2">
                      <Edit className="w-4 h-4" />
                      Editor
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={inviteUser} disabled={!selectedMemberId}>
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Only members of this team can be shared with.</p>
          </div>

          {/* People with access */}
          <div className="space-y-3">
            <label className="text-sm font-medium">People with access</label>
            <div className="space-y-2">
              {/* Owner */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-medium text-sm">
                    JD
                  </div>
                  <div>
                    <p className="text-sm font-medium">John Doe (you)</p>
                    <p className="text-xs text-muted-foreground">john@company.com</p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">Owner</span>
              </div>

              {/* Shared users */}
              {sharedWith.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-medium text-sm">
                      {user.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">Team member</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={user.access}
                      onValueChange={(value: "view" | "edit") =>
                        setSharedWith((prev) =>
                          prev.map((member) =>
                            member.id === user.id ? { ...member, access: value } : member,
                          ),
                        )
                      }
                    >
                      <SelectTrigger className="w-24 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="view">Viewer</SelectItem>
                        <SelectItem value="edit">Editor</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeAccess(user.id, user.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* General access */}
          <div className="space-y-3">
            <label className="text-sm font-medium">General access</label>
            <div className="p-3 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Restricted to team members</p>
                    <p className="text-xs text-muted-foreground">
                      Only people added from this team can open
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Copy link */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <Button variant="outline" onClick={copyLink}>
              {linkCopied ? (
                <Check className="w-4 h-4 mr-2 text-success" />
              ) : (
                <Link2 className="w-4 h-4 mr-2" />
              )}
              Copy link
            </Button>
            <Button onClick={() => void saveAccessChanges()} disabled={isSaving}>
              {isSaving ? "Saving..." : "Done"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
