import { ITeamService } from "@/services/interfaces/ITeamService";
import { Team } from "@/shared/types";
import { api } from "@/lib/api";

export class ApiTeamService implements ITeamService {
  async getTeams(offset: number, limit: number): Promise<Team[]> {
    return api.get<Team[]>(`/teams?offset=${offset}&limit=${limit}`);
  }

  async getTeamById(id: string): Promise<Team | null> {
    return api.get<Team>(`/teams/${id}`);
  }

  async searchTeams(query: string): Promise<Team[]> {
    return api.get<Team[]>(`/teams/search?q=${encodeURIComponent(query)}`);
  }
}
