import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { WorkspaceLayout } from "@/components/layout/WorkspaceLayout";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateTeamModal } from "@/features/talent/components/CreateTeamModal";
import { TeamSettingsModal } from "@/features/talent/components/TeamSettingsModal";
import { useNavigate } from "react-router-dom";
import { ApiTeamService } from "@/services/api/ApiTeamService";
import { talentService } from "@/services";
import { useLeaveTeam } from "@/hooks/useTeams";
import type { Team } from "@/shared/types";
import { formatSince } from "@/lib/utils";
import {
  Users,
  Plus,
  Crown,
  User,
  Settings,
  Calendar,
  Building2,
  Loader2,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";

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

type TeamHistoryItem = {
  id?: string;
  role?: string;
  joinedAt?: string;
  leftAt?: string;
  leftReason?: string;
  team?: {
    id?: string;
    name?: string;
    slug?: string;
    description?: string;
    avatarUrl?: string;
  };
};

type TeamMemberCandidate = {
  userId: string;
  userName: string;
  role: string;
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

function extractHistoryItems(payload: unknown): TeamHistoryItem[] {
  if (Array.isArray(payload)) {
    return payload as TeamHistoryItem[];
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    return (payload as { data: TeamHistoryItem[] }).data;
  }

  return [];
}

function mapHistoryToExTeams(payload: unknown, activeTeamIds: Set<string>): ExTeam[] {
  const historyItems = extractHistoryItems(payload);
  const latestLeftByTeam = new Map<string, ExTeam>();

  for (const item of historyItems) {
    if (!item?.leftAt || !item?.team?.id) {
      continue;
    }

    const existing = latestLeftByTeam.get(item.team.id);
    const currentLeftAt = new Date(item.leftAt).getTime();
    const existingLeftAt = existing?.leftAt ? new Date(existing.leftAt).getTime() : -1;

    if (!existing || currentLeftAt > existingLeftAt) {
      latestLeftByTeam.set(item.team.id, {
        id: item.team.id,
        name: item.team.name || "Team",
        slug: item.team.slug || item.team.id,
        description: item.team.description,
        avatarUrl: item.team.avatarUrl,
        role: item.role || "MEMBER",
        leftAt: item.leftAt,
        leftReason: item.leftReason,
      });
    }
  }

  const leftTeams = Array.from(latestLeftByTeam.values());
  if (leftTeams.length > 0) {
    return leftTeams;
  }

  // Compatibility fallback: if no explicit left records exist, use non-active history teams.
  const latestHistoryByTeam = new Map<string, ExTeam>();
  for (const item of historyItems) {
    const teamId = item?.team?.id;
    if (!teamId || activeTeamIds.has(teamId)) {
      continue;
    }

    const timestamp = item.leftAt || item.joinedAt;
    const existing = latestHistoryByTeam.get(teamId);
    const currentTime = timestamp ? new Date(timestamp).getTime() : -1;
    const existingTime = existing?.leftAt ? new Date(existing.leftAt).getTime() : -1;

    if (!existing || currentTime > existingTime) {
      latestHistoryByTeam.set(teamId, {
        id: teamId,
        name: item.team?.name || "Team",
        slug: item.team?.slug || teamId,
        description: item.team?.description,
        avatarUrl: item.team?.avatarUrl,
        role: item.role || "MEMBER",
        leftAt: timestamp,
        leftReason: item.leftReason,
      });
    }
  }

  return Array.from(latestHistoryByTeam.values());
}

function extractTeamMembers(payload: unknown): TeamMemberCandidate[] {
  if (Array.isArray(payload)) {
    return payload as TeamMemberCandidate[];
  }

  if (
    payload &&
    typeof payload === "object" &&
    "members" in payload &&
    Array.isArray((payload as { members?: unknown }).members)
  ) {
    return (payload as { members: TeamMemberCandidate[] }).members;
  }

  return [];
}

export default function MyTeams() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [isTransferingLeadership, setIsTransferingLeadership] = useState(false);
  const [transferCandidates, setTransferCandidates] = useState<TeamMemberCandidate[]>([]);
  const [selectedNewLeaderId, setSelectedNewLeaderId] = useState("");
  const [pendingLeaveTeam, setPendingLeaveTeam] = useState<{ id: string; name: string } | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<{
    id: string;
    name: string;
    description?: string;
  } | null>(null);
  const navigate = useNavigate();
  const { mutateAsync: leaveTeamAsync, isPending: leavingTeam } = useLeaveTeam();

  const {
    data: activeTeams = [],
    isLoading: activeTeamsLoading,
    isError: activeTeamsError,
  } = useQuery<Team[]>({
    queryKey: ["my-active-teams"],
    queryFn: () => teamService.getMyActiveTeams(),
  });

  const activeTeamIds = useMemo(
    () => new Set((Array.isArray(activeTeams) ? activeTeams : []).map((team) => team.id)),
    [activeTeams],
  );

  const {
    data: exTeams = [],
    isLoading: exTeamsLoading,
    isError: exTeamsError,
  } = useQuery<ExTeam[]>({
    queryKey: ["my-ex-teams"],
    queryFn: async () => {
      try {
        const response = (await teamService.getExTeams()) as ExTeam[];
        if (Array.isArray(response) && response.length > 0) {
          return response;
        }
      } catch {
        // Fallback to talent history endpoint below.
      }

      const historyResponse = await talentService.getTeamHistory();
      return mapHistoryToExTeams(historyResponse, activeTeamIds);
    },
  });

  const normalizedActiveTeams = Array.isArray(activeTeams) ? activeTeams : [];
  const normalizedExTeams = useMemo(
    () =>
      (Array.isArray(exTeams) ? exTeams : []).filter(
        (team) => team?.id && !activeTeamIds.has(team.id),
      ),
    [exTeams, activeTeamIds],
  );

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

  const handleLeaveTeam = async (
    e: React.MouseEvent,
    team: { id: string; name: string; currentUserRole?: string; memberCount?: number },
  ) => {
    e.stopPropagation();

    if (team.currentUserRole === "LEADER") {
      if ((team.memberCount ?? 0) <= 1) {
        if (!window.confirm(`Leave and archive team "${team.name}"?`)) {
          return;
        }

        try {
          await leaveTeamAsync(team.id);
          toast.success(`Team "${team.name}" has been archived and you left successfully.`);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to leave team";
          toast.error(message);
        }
        return;
      }

      try {
        const membersResponse = await teamService.getTeamMembers(team.id);
        const candidates = extractTeamMembers(membersResponse).filter(
          (member) => member.role !== "LEADER",
        );

        if (!candidates.length) {
          toast.error("No eligible member available to transfer leadership.");
          return;
        }

        setTransferCandidates(candidates);
        setSelectedNewLeaderId(candidates[0].userId);
        setPendingLeaveTeam({ id: team.id, name: team.name });
        setShowTransferModal(true);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load team members";
        toast.error(message);
      }
      return;
    }

    if (!window.confirm(`Leave team "${team.name}"?`)) {
      return;
    }

    try {
      await leaveTeamAsync(team.id);
      toast.success(`You left ${team.name}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to leave team";
      toast.error(message);
    }
  };

  const handleTransferLeadershipAndLeave = async () => {
    if (!pendingLeaveTeam || !selectedNewLeaderId) {
      toast.error("Select a new team leader first.");
      return;
    }

    setIsTransferingLeadership(true);
    try {
      await teamService.transferOwnership(pendingLeaveTeam.id, selectedNewLeaderId);
      await leaveTeamAsync(pendingLeaveTeam.id);
      toast.success(`Leadership transferred and you left ${pendingLeaveTeam.name}.`);
      setShowTransferModal(false);
      setPendingLeaveTeam(null);
      setTransferCandidates([]);
      setSelectedNewLeaderId("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to transfer leadership";
      toast.error(message);
    } finally {
      setIsTransferingLeadership(false);
    }
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
                    <button
                      onClick={(e) =>
                        handleLeaveTeam(e, {
                          id: team.id,
                          name: team.name,
                          currentUserRole: team.currentUserRole,
                          memberCount: team.memberCount,
                        })
                      }
                      className="absolute top-3 right-11 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
                      aria-label={`Leave ${team.name}`}
                      disabled={leavingTeam || isTransferingLeadership}
                      title="Leave team"
                    >
                      <LogOut className="w-4 h-4 text-destructive" />
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

            {exTeamsError ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 text-destructive px-4 py-3 text-sm">
                Failed to load previous teams from API.
              </div>
            ) : null}

            {!exTeamsLoading && !exTeamsError ? (
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
                          Left {formatSince(team.leftAt)}
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

      <Dialog
        open={showTransferModal}
        onOpenChange={(open) => {
          setShowTransferModal(open);
          if (!open) {
            setPendingLeaveTeam(null);
            setTransferCandidates([]);
            setSelectedNewLeaderId("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Leadership</DialogTitle>
            <DialogDescription>
              Select a new leader for {pendingLeaveTeam?.name}. You can leave only after ownership is transferred.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label htmlFor="new-leader" className="text-sm font-medium text-foreground">
              New team leader
            </label>
            <select
              id="new-leader"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={selectedNewLeaderId}
              onChange={(e) => setSelectedNewLeaderId(e.target.value)}
              disabled={isTransferingLeadership}
            >
              {transferCandidates.map((candidate) => (
                <option key={candidate.userId} value={candidate.userId}>
                  {candidate.userName}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTransferModal(false)}
              disabled={isTransferingLeadership}
            >
              Cancel
            </Button>
            <Button onClick={handleTransferLeadershipAndLeave} disabled={isTransferingLeadership}>
              {isTransferingLeadership ? "Transferring..." : "Transfer and Leave"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WorkspaceLayout>
  );
}
