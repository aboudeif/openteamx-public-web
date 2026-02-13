import { api } from "@/lib/api";

type ListThreadsQuery = {
  filter?: "all" | "inbox" | "unread" | "starred" | "archived";
  search?: string;
  page?: number;
  limit?: number;
};

const buildQueryString = (query?: ListThreadsQuery) => {
  if (!query) {
    return "";
  }

  const params = new URLSearchParams();
  if (query.filter) params.set("filter", query.filter);
  if (query.search) params.set("search", query.search);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
};

export class ApiMailService {
  async listThreads(teamId: string, query?: ListThreadsQuery): Promise<any> {
    return api.get<any>(`/teams/${teamId}/mail${buildQueryString(query)}`);
  }

  async getThread(teamId: string, threadId: string): Promise<any> {
    return api.get<any>(`/teams/${teamId}/mail/${threadId}`);
  }

  async getMessages(teamId: string, threadId: string, page = 1, limit = 20): Promise<any> {
    return api.get<any>(`/teams/${teamId}/mail/${threadId}/messages?page=${page}&limit=${limit}`);
  }

  async createThread(teamId: string, payload: { subject: string; body: string; participantIds: string[]; attachmentIds?: string[] }): Promise<any> {
    return api.post<any>(`/teams/${teamId}/mail`, payload);
  }

  async sendMessage(teamId: string, threadId: string, payload: { body: string; replyToId?: string; attachmentIds?: string[] }): Promise<any> {
    return api.post<any>(`/teams/${teamId}/mail/${threadId}/messages`, payload);
  }

  async addParticipant(teamId: string, threadId: string, userId: string): Promise<any> {
    return api.post<any>(`/teams/${teamId}/mail/${threadId}/participants`, { userId });
  }

  async leaveThread(teamId: string, threadId: string): Promise<any> {
    return api.delete<any>(`/teams/${teamId}/mail/${threadId}/leave`);
  }

  async markAsRead(teamId: string, threadId: string): Promise<any> {
    return api.post<any>(`/teams/${teamId}/mail/${threadId}/read`);
  }

  async archiveThread(teamId: string, threadId: string): Promise<any> {
    return api.post<any>(`/teams/${teamId}/mail/${threadId}/archive`);
  }
}
