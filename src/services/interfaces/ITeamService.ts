import { Team, TeamDetail, TeamsResponse } from "@/shared/types/index";

export interface ITeamService {
  getTeams(offset: number, limit: number): Promise<TeamsResponse>;
  getTeamById(id: string): Promise<TeamDetail | null>;
  searchTeams(query: string): Promise<Team[]>;
}
