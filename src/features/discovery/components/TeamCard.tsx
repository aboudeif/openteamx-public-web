import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Users, Calendar, Tag, MapPin } from "lucide-react";
import { formatSince } from "@/lib/utils";

export interface Team {
  id: string;
  name: string;
  description?: string;
  status?: string;
  tags?: string[];
  subjects?: string[];
  size?: number;
  memberCount?: number;
  createdAt?: string | Date;
  type?: string;
  location?: string;
}

interface TeamCardProps {
  team: Team;
  isMember?: boolean;
  isRequested?: boolean;
  isLoadingRequest?: boolean;
  onViewTeam: (id: string) => void;
  onRequestJoin?: (id: string) => void;
}

export function TeamCard({
  team,
  isMember = false,
  isRequested = false,
  isLoadingRequest = false,
  onViewTeam,
  onRequestJoin,
}: TeamCardProps) {
  const normalizedTags = Array.isArray(team.tags)
    ? team.tags
    : Array.isArray(team.subjects)
      ? team.subjects
      : [];

  const normalizedStatus =
    typeof team.status === "string" && team.status.toLowerCase() === "active"
      ? "active"
      : typeof team.status === "string" && team.status.toLowerCase() === "hiring"
        ? "hiring"
        : "inactive";

  const normalizedDescription = typeof team.description === "string" ? team.description : "No description available.";
  const normalizedMemberCount = typeof team.size === "number" ? team.size : (team.memberCount ?? 0);
  const normalizedCreatedAt = formatSince(team.createdAt);
  const normalizedLocation = team.location || "N/A";
  const canRequest = !isMember && !isRequested;
  const actionLabel = isMember ? "View Team" : isRequested ? "Request Sent" : "Request to Join";
  const handleAction = () => {
    if (isMember) {
      onViewTeam(team.id);
      return;
    }

    onRequestJoin?.(team.id);
  };

  return (
    <div className="team-card animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <StatusBadge status={normalizedStatus} />
        <div className="bg-orange-400/95 rounded-[4px] text-white text-xs px-1.5 py-0.5">Open Team</div>
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-1">
        {team.name}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {normalizedDescription}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {normalizedTags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-xs font-medium text-secondary-foreground"
          >
            <Tag className="w-3 h-3" />
            {tag}
          </span>
        ))}
        {normalizedTags.length > 3 && (
          <span className="text-xs text-muted-foreground">
            +{normalizedTags.length - 3} more
          </span>
        )}
      </div>

      {/* Meta Info */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
        <span className="inline-flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {normalizedMemberCount} members
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {normalizedLocation}
        </span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          {normalizedCreatedAt}
        </span>
        <Button 
          size="sm" 
          onClick={handleAction}
          disabled={!isMember && (!canRequest || isLoadingRequest)}
          className="h-8"
        >
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}
