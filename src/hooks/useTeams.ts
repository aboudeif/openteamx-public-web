import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Team, TeamDetail, TeamMember, TeamsResponse, TeamMembersResponse, CreateTeamDto } from '../shared/types/index'
import { ApiTeamService } from '../services/api/ApiTeamService';

const teamService = new ApiTeamService();

const TEAMS_QUERY_KEY = 'teams';
const TEAM_DETAILS_KEY = 'team-details';
const TEAM_MEMBERS_KEY = 'team-members';

export const useFetchTeams = (page: number, limit: number) => {
  return useQuery<TeamsResponse>({
    queryKey: [TEAMS_QUERY_KEY, page, limit],
    queryFn: () => teamService.getTeams(page, limit),
    enabled: !!page,
  });
};

export const useTeams = () => {
  return useQuery<TeamsResponse>({
    queryKey: [TEAMS_QUERY_KEY],
    queryFn: () => teamService.getTeams(1, 10),
  });
};

export const useTeamDetails = (teamId: string) => {
  return useQuery<TeamDetail>({
    queryKey: [TEAM_DETAILS_KEY, teamId],
    queryFn: () => teamService.getTeamById(teamId),
    enabled: !!teamId,
  });
};

export const useTeamMembers = (teamId: string) => {
  return useQuery<TeamMembersResponse>({
    queryKey: [TEAM_MEMBERS_KEY, teamId],
    queryFn: () => teamService.getTeamMembers(teamId),
    enabled: !!teamId,
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation<Team, Error, CreateTeamDto>({
    mutationFn: (newTeam) => teamService.createTeam(newTeam),
    onSuccess: (newTeam: Team) => {
      queryClient.setQueryData<Team[]>([TEAMS_QUERY_KEY], (oldTeams) =>
        Array.isArray(oldTeams) ? [...oldTeams, newTeam] : [newTeam]
      );
      queryClient.invalidateQueries({ queryKey: ['my-active-teams'] });
      queryClient.invalidateQueries({ queryKey: ['my-ex-teams'] });
    },
  });
};

export const useJoinTeam = (teamId: string) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { message: string; role: string }>({
    mutationFn: (payload) => teamService.requestToJoinTeam(teamId, payload.message, payload.role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAMS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [TEAM_DETAILS_KEY, teamId] });
      queryClient.invalidateQueries({ queryKey: ['my-active-teams'] });
      queryClient.invalidateQueries({ queryKey: ['my-ex-teams'] });
    },
  });
};

export const useLeaveTeam = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (teamId: string) => teamService.leaveTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAMS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['my-active-teams'] });
      queryClient.invalidateQueries({ queryKey: ['my-ex-teams'] });
    },
  });
};

export const useRemoveMember = (teamId: string) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (userId: string) => teamService.removeTeamMember(teamId, userId),
    onSuccess: (_: void, userId: string) => {
      queryClient.setQueryData<TeamMember[]>([TEAM_MEMBERS_KEY, teamId], (oldMembers) =>
        Array.isArray(oldMembers) ? oldMembers.filter((member) => member.userId !== userId) : oldMembers
      );
    },
  });
};
