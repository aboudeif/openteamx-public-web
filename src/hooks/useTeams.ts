import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Team, TeamDetail, TeamMember, TeamsResponse, TeamMembersResponse } from '../shared/types/index'
import { ApiTeamService } from '../services/api/ApiTeamService'

const TEAMS_QUERY_KEY = 'teams';
const TEAM_DETAILS_KEY = 'team-details';
const TEAM_MEMBERS_KEY = 'team-members';

export const useTeams = () => {
  return useQuery<TeamsResponse>({
    queryKey: [TEAMS_QUERY_KEY],
    queryFn: ApiTeamService.getTeams,
  });
};

export const useTeamDetails = (teamId: string) => {
  return useQuery<TeamDetail>({
    queryKey: [TEAM_DETAILS_KEY, teamId],
    queryFn: () => ApiTeamService.getTeamById(teamId),
    enabled: !!teamId,
  });
};

export const useTeamMembers = (teamId: string) => {
  return useQuery<TeamMembersResponse>({
    queryKey: [TEAM_MEMBERS_KEY, teamId],
    queryFn: () => ApiTeamService.getTeamMembers(teamId),
    enabled: !!teamId,
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation<Team, Error, any>({
    mutationFn: ApiTeamService.createTeam,
    onSuccess: (newTeam: Team) => {
      queryClient.setQueryData<Team[]>([TEAMS_QUERY_KEY], (oldTeams) =>
        Array.isArray(oldTeams) ? [...oldTeams, newTeam] : [newTeam]
      );
    },
  });
};

export const useJoinTeam = (teamId: string) => {
  // Invalidates membership, no cache update optimization needed for now
  const queryClient = useQueryClient();

  return useMutation<void, Error, any>({
    mutationFn: (payload) => ApiTeamService.joinTeam(teamId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAMS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [TEAM_DETAILS_KEY, teamId] });
      queryClient.invalidateQueries({ queryKey: [TEAM_MEMBERS_KEY, teamId] });
    },
  });
};

export const useRemoveMember = (teamId: string) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (userId: string) => ApiTeamService.removeMember(teamId, userId),
    onSuccess: (_: void, userId: string) => {
      queryClient.setQueryData<TeamMember[]>([TEAM_MEMBERS_KEY, teamId], (oldMembers) =>
        Array.isArray(oldMembers) ? oldMembers.filter((member) => member.userId !== userId) : oldMembers
      );
    },
  });
};
