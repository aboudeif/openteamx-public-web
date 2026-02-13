import { api } from "@/lib/api";

export class ApiCalendarService {
  async getEvents(teamId: string, startDate: string, endDate: string): Promise<any[]> {
    return api.get<any[]>(`/teams/${teamId}/calendar?from=${startDate}&to=${endDate}`);
  }

  async createEvent(teamId: string, event: any): Promise<any> {
    return api.post<any>(`/teams/${teamId}/calendar`, event);
  }

  async updateEvent(teamId: string, eventId: string, event: any): Promise<any> {
    return api.patch<any>(`/teams/${teamId}/calendar/${eventId}`, event);
  }

  async deleteEvent(teamId: string, eventId: string): Promise<void> {
    return api.delete(`/teams/${teamId}/calendar/${eventId}`);
  }
}
