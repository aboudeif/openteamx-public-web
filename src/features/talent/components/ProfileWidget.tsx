import { useState } from "react";
import { WidgetCard } from "@/components/shared/WidgetCard";
import { User, MapPin, Calendar, Star, Copy, Share2, Languages, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { EditProfileModal } from "./EditProfileModal";
import { ScrollArea } from "@/components/ui/scroll-area";

const talentData = {
  firstName: "John",
  lastName: "Doe",
  jobTitles: ["Senior Frontend Developer", "UI/UX Designer"],
  joinDate: "March 2024",
  specializations: [
    { name: "React Development", rank: 4 },
    { name: "TypeScript", rank: 5 },
    { name: "UI Design", rank: 3 },
  ],
  languages: ["English (Native)", "Spanish (Fluent)"],
  country: "United States",
  talentId: "TLT-2024-00847",
};

export function ProfileWidget() {
  const [showEditModal, setShowEditModal] = useState(false);
  const initials = `${talentData.firstName[0]}${talentData.lastName[0]}`;

  const copyTalentId = () => {
    navigator.clipboard.writeText(talentData.talentId);
    toast.success("Talent ID copied to clipboard");
  };

  return (
    <>
      <WidgetCard 
        title="Profile" 
        icon={User} 
        action="Edit Profile"
        onAction={() => setShowEditModal(true)}
      >
        <ScrollArea className="h-[280px]">
          <div className="space-y-4 pr-2">
            {/* Avatar & Name */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
                {initials}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{talentData.firstName} {talentData.lastName}</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {talentData.jobTitles.map((title, idx) => (
                    <span key={idx} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                      {title}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Joined {talentData.joinDate}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{talentData.country}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                <Languages className="w-4 h-4" />
                <span>{talentData.languages.join(", ")}</span>
              </div>
            </div>

            {/* Specializations */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Specializations
              </p>
              <div className="space-y-2">
                {talentData.specializations.map((spec, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{spec.name}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < spec.rank ? "text-warning fill-warning" : "text-muted"}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Talent ID */}
            <div className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Talent ID</p>
                <p className="text-sm font-mono font-medium">{talentData.talentId}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyTalentId}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </WidgetCard>

      <EditProfileModal open={showEditModal} onOpenChange={setShowEditModal} />
    </>
  );
}
