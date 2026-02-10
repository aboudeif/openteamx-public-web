import { api } from "@/lib/api";

export class ApiMeetingService {
  async getMeetings(teamId: string): Promise<any[]> {
    return api.get<any[]>(`/teams/${teamId}/meetings`);
  }

  async createMeeting(teamId: string, meeting: any): Promise<any> {
    return api.post<any>(`/teams/${teamId}/meetings`, meeting);
  }

  async getMeetingDetails(teamId: string, meetingId: string): Promise<any> {
    return api.get<any>(`/teams/${teamId}/meetings/${meetingId}`);
  }

  async updateMeeting(teamId: string, meetingId: string, meeting: any): Promise<any> {
    return api.put<any>(`/teams/${teamId}/meetings/${meetingId}`, meeting);
  }

  async deleteMeeting(teamId: string, meetingId: string): Promise<void> {
    return api.delete(`/teams/${teamId}/meetings/${meetingId}`);
  }

  async joinMeeting(teamId: string, meetingId: string): Promise<void> {
    return api.post(`/teams/${teamId}/meetings/${meetingId}/join`);
  }
}
