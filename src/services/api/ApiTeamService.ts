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

  async getPublicTeamDetails(teamId: string): Promise<Team> {
    return api.get<Team>(`/teams/${teamId}/public`);
  }

  async requestToJoinTeam(teamId: string, message: string, role: string): Promise<void> {
    return api.post(`/teams/${teamId}/join-request`, { message, role });
  }

  async getMyActiveTeams(): Promise<Team[]> {
    return api.get<Team[]>(`/teams/my-teams`);
  }

  async getExTeams(): Promise<Team[]> {
    return api.get<Team[]>(`/teams/ex-teams`);
  }

  async createTeam(team: any): Promise<Team> {
    return api.post<Team>(`/teams`, team);
  }

  async leaveTeam(teamId: string): Promise<void> {
    return api.post(`/teams/${teamId}/leave`);
  }

  async getTeamDashboard(teamId: string): Promise<any> {
    return api.get<any>(`/teams/${teamId}/dashboard`);
  }

  async updateTeamSettings(teamId: string, settings: any): Promise<void> {
    return api.put(`/teams/${teamId}/settings`, settings);
  }

  async deleteTeam(teamId: string): Promise<void> {
    return api.delete(`/teams/${teamId}`);
  }

  async removeTeamMember(teamId: string, memberId: string): Promise<void> {
    return api.delete(`/teams/${teamId}/members/${memberId}`);
  }

  async updateMemberRole(teamId: string, memberId: string, role: string): Promise<void> {
    return api.patch(`/teams/${teamId}/members/${memberId}/role`, { role });
  }

  async getJoinRequests(teamId: string): Promise<any[]> {
    return api.get<any[]>(`/teams/${teamId}/join-requests`);
  }

  async acceptJoinRequest(teamId: string, requestId: string): Promise<void> {
    return api.post(`/teams/${teamId}/join-requests/${requestId}/accept`);
  }

  async rejectJoinRequest(teamId: string, requestId: string): Promise<void> {
    return api.post(`/teams/${teamId}/join-requests/${requestId}/reject`);
  }

  async sendInterviewInvitation(teamId: string, requestId: string, invitation: any): Promise<void> {
    return api.post(`/teams/${teamId}/join-requests/${requestId}/invite-interview`, invitation);
  }

  async updateInterviewSettings(teamId: string, settings: any): Promise<void> {
    return api.put(`/teams/${teamId}/interview-settings`, settings);
  }

  async getActivities(teamId: string): Promise<any[]> {
    return api.get<any[]>(`/teams/${teamId}/activities`);
  }
}
