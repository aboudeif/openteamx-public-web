import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Users, Calendar, Tag, MapPin } from "lucide-react";

export interface Team {
  id: string;
  name: string;
  description: string;
  status: "active" | "hiring" | "inactive";
  tags: string[];
  size: number;
  createdAt: string;
  type: string;
  location: string;
}

interface TeamCardProps {
  team: Team;
  onViewTeam: (id: string) => void;
}

export function TeamCard({ team, onViewTeam }: TeamCardProps) {
  return (
    <div className="team-card animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <StatusBadge status={team.status} />
        <div className="bg-orange-400/95 rounded-[4px] text-white text-xs px-1.5 py-0.5">Open Team</div>
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-1">
        {team.name}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {team.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {team.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-xs font-medium text-secondary-foreground"
          >
            <Tag className="w-3 h-3" />
            {tag}
          </span>
        ))}
        {team.tags.length > 3 && (
          <span className="text-xs text-muted-foreground">
            +{team.tags.length - 3} more
          </span>
        )}
      </div>

      {/* Meta Info */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
        <span className="inline-flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {team.size} members
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {team.location}
        </span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          {team.createdAt}
        </span>
        <Button 
          size="sm" 
          onClick={() => onViewTeam(team.id)}
          className="h-8"
        >
          {team.status === "hiring" ? "Request to Join" : "View Team"}
        </Button>
      </div>
    </div>
  );
}
