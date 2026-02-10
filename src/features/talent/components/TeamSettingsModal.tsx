import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Star, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface TeamSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: {
    id: number;
    name: string;
    description: string;
  };
}

const teamMembers = [
  { id: 1, name: "John Doe", role: "Team Leader", stars: 5 },
  { id: 2, name: "Sarah Chen", role: "Developer", stars: 4 },
  { id: 3, name: "Mike Johnson", role: "Designer", stars: 3 },
  { id: 4, name: "Emily Davis", role: "Developer", stars: 4 },
];

export function TeamSettingsModal({ open, onOpenChange, team }: TeamSettingsModalProps) {
  const [saving, setSaving] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [formData, setFormData] = useState({
    name: team.name,
    description: team.description,
    isPublic: true,
    allowJoinRequests: true,
    showInDiscovery: true,
  });
  const [members, setMembers] = useState(teamMembers);

  useEffect(() => {
    setFormData({
      name: team.name,
      description: team.description,
      isPublic: true,
      allowJoinRequests: true,
      showInDiscovery: true,
    });
  }, [team]);

  const triggerAutoSave = () => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    const timer = setTimeout(() => {
      setSaving(true);
      setTimeout(() => {
        setSaving(false);
        toast.success("Changes saved automatically");
      }, 800);
    }, 1000);
    setAutoSaveTimer(timer);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    triggerAutoSave();
  };

  const updateMemberStars = (memberId: number, stars: number) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, stars } : m));
    triggerAutoSave();
  };

  const updateMemberRole = (memberId: number, role: string) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role } : m));
    triggerAutoSave();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Team Settings</DialogTitle>
            {saving && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </div>
            )}
          </div>
        </DialogHeader>

        <Tabs defaultValue="general" className="mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
            <TabsTrigger value="visibility" className="flex-1">Visibility</TabsTrigger>
            <TabsTrigger value="members" className="flex-1">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="settings-name">Team Name</Label>
              <Input
                id="settings-name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-desc">Description</Label>
              <Textarea
                id="settings-desc"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="visibility" className="mt-4 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <p className="font-medium">Public Team</p>
                <p className="text-sm text-muted-foreground">Anyone can view this team's profile</p>
              </div>
              <Switch
                checked={formData.isPublic}
                onCheckedChange={(checked) => handleInputChange("isPublic", checked)}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <p className="font-medium">Allow Join Requests</p>
                <p className="text-sm text-muted-foreground">Users can request to join this team</p>
              </div>
              <Switch
                checked={formData.allowJoinRequests}
                onCheckedChange={(checked) => handleInputChange("allowJoinRequests", checked)}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <p className="font-medium">Show in Discovery</p>
                <p className="text-sm text-muted-foreground">Team appears in team search results</p>
              </div>
              <Switch
                checked={formData.showInDiscovery}
                onCheckedChange={(checked) => handleInputChange("showInDiscovery", checked)}
              />
            </div>
          </TabsContent>

          <TabsContent value="members" className="mt-4">
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-medium">
                      {member.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <Input
                        value={member.role}
                        onChange={(e) => updateMemberRole(member.id, e.target.value)}
                        className="h-7 text-xs mt-1 w-32"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => updateMemberStars(member.id, i + 1)}
                        className="p-0.5 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            i < member.stars ? "text-warning fill-warning" : "text-muted hover:text-warning/50"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
