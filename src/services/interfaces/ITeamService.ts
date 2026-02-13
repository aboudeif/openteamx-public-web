import { Team, TeamDetail, TeamsResponse } from "@/shared/types/index";

export interface ITeamService {
  getTeams(offset: number, limit: number): Promise<TeamsResponse>;
  getDiscoverableTeams(page: number, limit: number, search?: string): Promise<unknown>;
  getMyActiveTeams(): Promise<Team[]>;
  requestToJoinTeam(teamId: string, message: string, role: string): Promise<void>;
  getTeamById(id: string): Promise<TeamDetail | null>;
  searchTeams(query: string): Promise<Team[]>;
}
