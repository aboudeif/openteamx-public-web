import { ITeamService } from "@/services/interfaces/ITeamService";
import { Team, TeamsResponse } from "@/shared/types";
import { mockTeams } from "@/data/teams";

type TeamWithTags = Team & { tags?: string[] };

export class MockTeamService implements ITeamService {
  async getTeams(offset: number, limit: number): Promise<TeamsResponse> {
    // Cast mockTeams to shared Team type since they are compatible
    const teams = mockTeams as unknown as Team[];
    const items = teams.slice(offset, offset + limit);
    const page = Math.floor(offset / Math.max(limit, 1)) + 1;
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            data: items,
            total: teams.length,
            page,
            pageSize: limit,
          }),
        800,
      ),
    );
  }

  async getDiscoverableTeams(page: number, limit: number, search?: string): Promise<unknown> {
    const teams = mockTeams as unknown as Team[];
    const q = search?.trim().toLowerCase();

    const filtered = q
      ? teams.filter((team) => {
          const normalized = team as TeamWithTags;
          const searchableTags = Array.isArray(normalized.tags)
            ? normalized.tags
            : normalized.subjects || [];
          return (
            normalized.name?.toLowerCase().includes(q) ||
            normalized.description?.toLowerCase().includes(q) ||
            searchableTags.some((tag: string) =>
            tag.toLowerCase().includes(q),
            )
          );
        })
      : teams;

    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit);

    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            items,
            meta: {
              page,
              limit,
              total: filtered.length,
              totalPages: Math.ceil(filtered.length / limit),
              hasNext: start + limit < filtered.length,
              hasPrev: page > 1,
            },
          }),
        800,
      ),
    );
  }

  async getMyActiveTeams(): Promise<Team[]> {
    const teams = mockTeams as unknown as Team[];
    return Promise.resolve(teams.slice(0, 2));
  }

  async requestToJoinTeam(_teamId: string, _message: string, _role: string): Promise<void> {
    return Promise.resolve();
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
