import { mockTeams } from "@/data/teams";
import { Team } from "@/features/discovery/components/TeamCard";

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const teamService = {
  /**
   * Fetches a paginated list of teams.
   * @param offset - The starting index
   * @param limit - The number of items to fetch
   * @param delayMs - Optional delay in ms (default: 800)
   * @returns A promise that resolves to an array of teams
   */
  getTeams: async (offset: number, limit: number, delayMs: number = 800): Promise<Team[]> => {
    await delay(delayMs);
    return mockTeams.slice(offset, offset + limit);
  },

  /**
   * Simulate searching teams (since search logic was previously in the component)
   * Note: In a real app, this would likely be a server-side query parameter.
   * For this refactor, we are primarily moving the data, but if we wanted to
   * move the filter logic to the service, we could do that too.
   * Currently keeping the filter logic in the component as per typical "frontend search" 
   * unless the refactor request implies moving business logic to service entirely.
   * Given "use a service layer and extracted data file", I'll keep it simple first: data fetching.
   */
};
