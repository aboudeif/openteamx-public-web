import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Check, Loader2, Star, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TeamSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team?: {
    name?: string;
    description?: string;
    isPublic?: boolean;
    isDiscoverable?: boolean;
    subjects?: string[];
  };
}

interface TeamMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  stars: number;
}

const tabs = [
  { id: "general", label: "General" },
  { id: "members", label: "Members" },
  { id: "languages", label: "Languages" },
  { id: "visibility", label: "Visibility" },
];

const mockMembers: TeamMember[] = [
  { id: "1", name: "John Doe", initials: "JD", role: "Team Leader", stars: 5 },
  { id: "2", name: "Sarah Chen", initials: "SC", role: "Senior Developer", stars: 4 },
  { id: "3", name: "Mike Johnson", initials: "MJ", role: "Developer", stars: 3 },
  { id: "4", name: "Alex Kim", initials: "AK", role: "Junior Developer", stars: 2 },
  { id: "5", name: "Emily Davis", initials: "ED", role: "Designer", stars: 4 },
];

const availableLanguages = [
  { code: "en", name: "English" },
  { code: "ar", name: "Arabic" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
];

export function TeamSettingsModal({ open, onOpenChange, team }: TeamSettingsModalProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // General settings
  const [teamName, setTeamName] = useState(team?.name ?? "");
  const [description, setDescription] = useState(team?.description ?? "");
  const [website, setWebsite] = useState("");

  // Members
  const [members, setMembers] = useState(mockMembers);

  // Languages
  const [teamLanguages, setTeamLanguages] = useState<string[]>(
    Array.isArray(team?.subjects) && team?.subjects.length > 0 ? team.subjects : ["en", "ar"]
  );

  // Visibility
  const [isPublic, setIsPublic] = useState(Boolean(team?.isPublic ?? true));
  const [allowJoinRequests, setAllowJoinRequests] = useState(Boolean(team?.isDiscoverable ?? true));

  useEffect(() => {
    setTeamName(team?.name ?? "");
    setDescription(team?.description ?? "");
    setIsPublic(Boolean(team?.isPublic ?? true));
    setAllowJoinRequests(Boolean(team?.isDiscoverable ?? true));
    setTeamLanguages(Array.isArray(team?.subjects) && team?.subjects.length > 0 ? team.subjects : ["en", "ar"]);
  }, [team]);

  // Auto-save effect
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      setSaving(true);
      setTimeout(() => {
        setSaving(false);
        setLastSaved(new Date());
        toast.success("Settings saved");
      }, 500);
    }, 1000);

    return () => clearTimeout(timer);
  }, [teamName, description, website, members, teamLanguages, isPublic, allowJoinRequests, open]);

  const updateMemberRole = (id: string, role: string) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role } : m));
  };

  const updateMemberStars = (id: string, stars: number) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, stars } : m));
  };

  const toggleLanguage = (code: string) => {
    setTeamLanguages(prev => 
      prev.includes(code) ? prev.filter(l => l !== code) : [...prev, code]
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-lg">Team Settings</h3>
            {saving && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving...
              </span>
            )}
            {!saving && lastSaved && (
              <span className="flex items-center gap-1 text-xs text-success">
                <Check className="w-3 h-3" />
                Saved
              </span>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pt-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {activeTab === "general" && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Team Name</label>
                <Input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your team..."
                  className="w-full h-24 px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Website</label>
                <Input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Update team member roles and rankings
              </p>
              {members.map((member) => (
                <div key={member.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                    {member.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{member.name}</p>
                    <Input
                      value={member.role}
                      onChange={(e) => updateMemberRole(member.id, e.target.value)}
                      className="mt-1 h-8 text-sm"
                      placeholder="Role title"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => updateMemberStars(member.id, star)}
                        className="p-0.5"
                      >
                        <Star
                          className={cn(
                            "w-5 h-5 transition-colors",
                            star <= member.stars
                              ? "fill-warning text-warning"
                              : "text-muted-foreground hover:text-warning"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "languages" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Select the languages used by your team
              </p>
              <div className="grid grid-cols-2 gap-3">
                {availableLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => toggleLanguage(lang.code)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-lg border transition-colors text-left",
                      teamLanguages.includes(lang.code)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Globe className={cn(
                      "w-5 h-5",
                      teamLanguages.includes(lang.code) ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className="font-medium">{lang.name}</span>
                    {teamLanguages.includes(lang.code) && (
                      <Check className="w-4 h-4 text-primary ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "visibility" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium text-foreground">Public Team</p>
                  <p className="text-sm text-muted-foreground">Team is visible in Discover Teams</p>
                </div>
                <button
                  onClick={() => setIsPublic(!isPublic)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    isPublic ? "bg-primary" : "bg-muted"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                    isPublic ? "translate-x-7" : "translate-x-1"
                  )} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium text-foreground">Allow Join Requests</p>
                  <p className="text-sm text-muted-foreground">Users can request to join this team</p>
                </div>
                <button
                  onClick={() => setAllowJoinRequests(!allowJoinRequests)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    allowJoinRequests ? "bg-primary" : "bg-muted"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                    allowJoinRequests ? "translate-x-7" : "translate-x-1"
                  )} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
