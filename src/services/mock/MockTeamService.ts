import { ITeamService } from "@/services/interfaces/ITeamService";
import { Team } from "@/shared/types";
import { mockTeams } from "@/data/teams";

export class MockTeamService implements ITeamService {
  async getTeams(offset: number, limit: number): Promise<Team[]> {
    // Cast mockTeams to shared Team type since they are compatible
    const teams = mockTeams as unknown as Team[];
    return new Promise(resolve => setTimeout(() => resolve(teams.slice(offset, offset + limit)), 800));
  }

  async getTeamById(id: string): Promise<Team | null> {
    const teams = mockTeams as unknown as Team[];
    const team = teams.find(t => t.id === id);
    return Promise.resolve(team || null);
  }

  async searchTeams(query: string): Promise<Team[]> {
     const teams = mockTeams as unknown as Team[];
     const q = query.toLowerCase();
     const results = teams.filter(team => 
        team.name.toLowerCase().includes(q) ||
        team.description.toLowerCase().includes(q) ||
        team.tags.some(tag => tag.toLowerCase().includes(q))
     );
     return Promise.resolve(results);
  }
}

export const teamService = new MockTeamService();
