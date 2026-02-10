import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  Link2, 
  Copy, 
  Trash2, 
  Check,
  Globe,
  Lock,
  Eye,
  Edit,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";

interface ManageAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  itemType: "file" | "folder";
}

const sharedWith = [
  { id: 1, name: "Sarah Chen", email: "sarah@company.com", access: "edit", avatar: "SC" },
  { id: 2, name: "Mike Johnson", email: "mike@company.com", access: "view", avatar: "MJ" },
  { id: 3, name: "Emily Davis", email: "emily@company.com", access: "edit", avatar: "ED" },
];

export function ManageAccessModal({ open, onOpenChange, itemName, itemType }: ManageAccessModalProps) {
  const [email, setEmail] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [generalAccess, setGeneralAccess] = useState<"restricted" | "anyone">("restricted");

  const copyLink = () => {
    navigator.clipboard.writeText(`https://talenthub.app/drive/${itemType}/share-link`);
    setLinkCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const inviteUser = () => {
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    toast.success(`Invitation sent to ${email}`);
    setEmail("");
  };

  const removeAccess = (id: number, name: string) => {
    toast.success(`Removed ${name}'s access`);
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
              <Input
                placeholder="Enter email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Select defaultValue="edit">
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
              <Button onClick={inviteUser}>
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
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
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select defaultValue={user.access}>
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
                  {generalAccess === "restricted" ? (
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-success/10 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-success" />
                    </div>
                  )}
                  <div>
                    <Select value={generalAccess} onValueChange={(v: "restricted" | "anyone") => setGeneralAccess(v)}>
                      <SelectTrigger className="border-0 p-0 h-auto font-medium focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="restricted">Restricted</SelectItem>
                        <SelectItem value="anyone">Anyone with link</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {generalAccess === "restricted"
                        ? "Only people with access can open"
                        : "Anyone with the link can view"}
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
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
