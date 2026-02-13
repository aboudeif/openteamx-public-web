import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { WorkspaceLayout } from "@/components/layout/WorkspaceLayout";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CreateTeamModal } from "@/features/talent/components/CreateTeamModal";
import { TeamSettingsModal } from "@/features/talent/components/TeamSettingsModal";
import { useNavigate } from "react-router-dom";
import { ApiTeamService } from "@/services/api/ApiTeamService";
import type { Team } from "@/shared/types";
import {
  Users,
  Plus,
  Crown,
  User,
  Settings,
  Calendar,
  Building2,
  Loader2,
} from "lucide-react";

type ExTeam = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  avatarUrl?: string;
  role: string;
  leftAt?: string;
  leftReason?: string;
};

const teamService = new ApiTeamService();
const TEAM_COLORS = [
  "from-primary to-primary/70",
  "from-success to-success/70",
  "from-warning to-warning/70",
  "from-sky-500 to-cyan-400",
  "from-pink-500 to-rose-400",
];

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const mapRole = (role?: string) => (role === "LEADER" ? "Team Leader" : "Team Member");

export default function MyTeams() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<{
    id: string;
    name: string;
    description?: string;
  } | null>(null);
  const navigate = useNavigate();

  const {
    data: activeTeams = [],
    isLoading: activeTeamsLoading,
    isError: activeTeamsError,
  } = useQuery<Team[]>({
    queryKey: ["my-active-teams"],
    queryFn: () => teamService.getMyActiveTeams(),
  });

  const { data: exTeams = [], isLoading: exTeamsLoading } = useQuery<ExTeam[]>({
    queryKey: ["my-ex-teams"],
    queryFn: () => teamService.getExTeams() as Promise<ExTeam[]>,
  });

  const normalizedActiveTeams = Array.isArray(activeTeams) ? activeTeams : [];
  const normalizedExTeams = Array.isArray(exTeams) ? exTeams : [];

  const decoratedTeams = useMemo(
    () =>
      normalizedActiveTeams.map((team, index) => ({
        ...team,
        logo: getInitials(team.name),
        color: TEAM_COLORS[index % TEAM_COLORS.length],
      })),
    [normalizedActiveTeams],
  );

  const handleTeamClick = (teamId: string) => {
    navigate(`/${teamId}/team`);
  };

  const handleSettingsClick = (
    e: React.MouseEvent,
    team: { id: string; name: string; description?: string },
  ) => {
    e.stopPropagation();
    setSelectedTeam(team);
    setShowSettingsModal(true);
  };

  return (
    <WorkspaceLayout>
      <ScrollArea className="h-[calc(100vh-120px)]">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="widget-card bg-sidebar-border/5 p-6 rounded-xl mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-primary">My Teams</h2>
                <span className="text-sm text-muted-foreground">({decoratedTeams.length})</span>
              </div>
              <Button onClick={() => setShowCreateModal(true)} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Create Team
              </Button>
            </div>

            {activeTeamsLoading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading teams...</span>
              </div>
            ) : null}

            {activeTeamsError ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 text-destructive px-4 py-3 text-sm">
                Failed to load your teams from API.
              </div>
            ) : null}

            {!activeTeamsLoading && !activeTeamsError ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {decoratedTeams.map((team) => (
                  <div
                    key={team.id}
                    onClick={() => handleTeamClick(team.id)}
                    className="group relative p-4 rounded-xl border border-border bg-card hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
                    tabIndex={0}
                    role="button"
                    aria-label={`Open ${team.name}`}
                    onKeyDown={(e) => e.key === "Enter" && handleTeamClick(team.id)}
                  >
                    <button
                      onClick={(e) =>
                        handleSettingsClick(e, {
                          id: team.id,
                          name: team.name,
                          description: team.description,
                        })
                      }
                      className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
                      aria-label={`${team.name} settings`}
                    >
                      <Settings className="w-4 h-4 text-muted-foreground" />
                    </button>

                    <div className="flex items-start gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${team.color} flex items-center justify-center text-lg font-bold text-white`}
                      >
                        {team.logo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{team.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {team.description || "No description"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                      <div className="flex items-center gap-1.5 text-sm">
                        {team.currentUserRole === "LEADER" ? (
                          <Crown className="w-4 h-4 text-warning" />
                        ) : (
                          <User className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span
                          className={
                            team.currentUserRole === "LEADER"
                              ? "text-warning font-medium"
                              : "text-muted-foreground"
                          }
                        >
                          {mapRole(team.currentUserRole)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{team.memberCount ?? 0}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {!decoratedTeams.length ? (
                  <div className="col-span-full rounded-lg border border-dashed border-border px-4 py-8 text-center text-muted-foreground">
                    You are not a member of any team yet.
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="widget-card bg-muted/30 p-6 rounded-xl">
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-muted-foreground">Previous Teams</h2>
              <span className="text-sm text-muted-foreground">({normalizedExTeams.length})</span>
            </div>

            {exTeamsLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading previous teams...</span>
              </div>
            ) : null}

            {!exTeamsLoading ? (
              <div className="space-y-3">
                {normalizedExTeams.map((team, index) => (
                  <div
                    key={team.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card/50"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
                        TEAM_COLORS[index % TEAM_COLORS.length]
                      } flex items-center justify-center text-sm font-bold text-white opacity-60`}
                    >
                      {getInitials(team.name)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground">{team.name}</h3>
                      <p className="text-sm text-muted-foreground">{mapRole(team.role)}</p>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Left:{" "}
                          {team.leftAt ? new Date(team.leftAt).toLocaleDateString() : "Unknown"}
                        </span>
                      </div>
                      {team.leftReason ? (
                        <Badge variant="outline" className="text-xs">
                          {team.leftReason}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                ))}

                {!normalizedExTeams.length ? (
                  <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-muted-foreground">
                    No previous teams found.
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </ScrollArea>

      <CreateTeamModal open={showCreateModal} onClose={() => setShowCreateModal(false)} />
      {selectedTeam ? (
        <TeamSettingsModal
          open={showSettingsModal}
          onOpenChange={setShowSettingsModal}
          team={selectedTeam}
        />
      ) : null}
    </WorkspaceLayout>
  );
}
