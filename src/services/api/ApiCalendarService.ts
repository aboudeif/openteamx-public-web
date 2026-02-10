import { api } from "@/lib/api";

export class ApiCalendarService {
  async getEvents(teamId: string, startDate: string, endDate: string): Promise<any[]> {
    return api.get<any[]>(`/teams/${teamId}/calendar/events?startDate=${startDate}&endDate=${endDate}`);
  }

  async createEvent(teamId: string, event: any): Promise<any> {
    return api.post<any>(`/teams/${teamId}/calendar/events`, event);
  }

  async updateEvent(teamId: string, eventId: string, event: any): Promise<any> {
    return api.put<any>(`/teams/${teamId}/calendar/events/${eventId}`, event);
  }

  async deleteEvent(teamId: string, eventId: string): Promise<void> {
    return api.delete(`/teams/${teamId}/calendar/events/${eventId}`);
  }
}
