import { Team } from "@/shared/types";

export interface ITeamService {
  getTeams(offset: number, limit: number): Promise<Team[]>;
  getTeamById(id: string): Promise<Team | null>;
  searchTeams(query: string): Promise<Team[]>;
}
