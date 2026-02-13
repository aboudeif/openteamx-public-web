import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { ActivityWidget } from "@/features/team-workspace/components/ActivityWidget";
import { CalendarWidget } from "@/features/meetings/components/CalendarWidget";
import { MeetingsWidget } from "@/features/meetings/components/MeetingsWidget";
import { MeetingNotesWidget } from "@/features/meetings/components/MeetingNotesWidget";
import { MailWidget } from "@/features/mail/components/MailWidget";
import { ChatWidget } from "@/features/chat/components/ChatWidget";
import { TasksWidget } from "@/features/projects/components/TasksWidget";
import { DriveWidget } from "@/features/drive/components/DriveWidget";
import { JoinRequestsWidget } from "@/features/team-workspace/components/JoinRequestsWidget";
import { TeamSettingsModal } from "@/features/team-workspace/components/TeamSettingsModal";
import { Button } from "@/components/ui/button";
import { Settings, Users, Calendar, Tag, MapPin } from "lucide-react";
import { useTeamDetails } from "@/hooks/useTeams";
import { ApiTeamService } from "@/services/api/ApiTeamService";
import type { Team } from "@/shared/types";
import { toast } from "sonner";
import { formatSince } from "@/lib/utils";

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const teamService = new ApiTeamService();

export default function TeamHome() {
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();
  const redirectedRef = useRef(false);
  const { teamId = "" } = useParams<{ teamId: string }>();
  const { data: myTeams = [], isLoading: myTeamsLoading } = useQuery<Team[]>({
    queryKey: ["home-my-teams"],
    queryFn: () => teamService.getMyActiveTeams(),
    enabled: Boolean(teamId),
  });

  const resolvedTeamId = useMemo(() => {
    if (!teamId) {
      return "";
    }

    const teamMatch = Array.isArray(myTeams)
      ? myTeams.find((item) => item.id === teamId || item.slug === teamId)
      : undefined;

    return teamMatch?.id ?? teamId;
  }, [teamId, myTeams]);

  const { data: team, isLoading, isError, error } = useTeamDetails(resolvedTeamId);

  useEffect(() => {
    if (!teamId && !redirectedRef.current) {
      redirectedRef.current = true;
      toast.error("Team not found");
      navigate("/myteams", { replace: true });
      return;
    }

    if (isError && !redirectedRef.current && !myTeamsLoading) {
      redirectedRef.current = true;
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Team not found or you don't have access.";
      toast.error(message);
      navigate("/myteams", { replace: true });
    }
  }, [teamId, isError, error, myTeamsLoading, navigate]);

  useEffect(() => {
    if (team?.id && teamId && teamId !== team.id) {
      navigate(`/${team.id}/team`, { replace: true });
    }
  }, [team?.id, teamId, navigate]);

  const isTeamLeader = team?.currentUserRole === "LEADER";
  const teamName = team?.name || "Team";
  const teamInitials = getInitials(teamName);
  const subjects = useMemo(() => (Array.isArray(team?.subjects) ? team.subjects : []), [team?.subjects]);

  const createdAt = formatSince(team?.createdAt as string | Date | undefined);

  if (!teamId || isError) {
    return null;
  }

  return (
    <MainLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {isLoading || myTeamsLoading ? (
          <div className="mb-6 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            Loading team data...
          </div>
        ) : null}

        {/* Team Header */}
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
              {teamInitials || "T"}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-semibold text-foreground">{teamName}</h1>
                <span className="status-badge status-hiring">
                  <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                  {team?.status || "ACTIVE"}
                </span>
              </div>
              <p className="text-muted-foreground mb-3">
                {team?.description || "No description provided."}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {team?.memberCount ?? 0} members
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Created {createdAt}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  Team workspace
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {subjects.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-sm font-medium text-secondary-foreground"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
            {!subjects.length ? (
              <span className="text-sm text-muted-foreground">No subjects assigned.</span>
            ) : null}
          </div>
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <ActivityWidget />
          <CalendarWidget />
          <MeetingsWidget />
          <MailWidget />
          <ChatWidget />
          <TasksWidget />
          <MeetingNotesWidget />
          <DriveWidget />
          {isTeamLeader ? <JoinRequestsWidget /> : null}
        </div>
      </div>

      <TeamSettingsModal
        open={showSettings}
        onOpenChange={setShowSettings}
        team={{
          name: team?.name,
          description: team?.description,
          isPublic: team?.isPublic,
          isDiscoverable: team?.isDiscoverable,
          subjects: Array.isArray(team?.subjects) ? team.subjects : [],
        }}
      />
    </MainLayout>
  );
}
