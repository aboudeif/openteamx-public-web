import { api } from "@/lib/api";

export class ApiMailService {
  async getInbox(): Promise<any[]> {
    return api.get<any[]>("/teams/{teamId}/mail/inbox");
  }

  async getSent(): Promise<any[]> {
    return api.get<any[]>("/teams/{teamId}/mail/sent");
  }

  async getDrafts(): Promise<any[]> {
    return api.get<any[]>("/teams/{teamId}/mail/drafts");
  }

  async getStarred(): Promise<any[]> {
    return api.get<any[]>("/teams/{teamId}/mail/starred");
  }

  async getEmail(emailId: string): Promise<any> {
    return api.get<any>(`/teams/{teamId}/mail/${emailId}`);
  }

  async sendEmail(email: any): Promise<any> {
    return api.post<any>("/teams/{teamId}/mail/send", email);
  }

  async replyToEmail(emailId: string, reply: any): Promise<any> {
    return api.post<any>(`/teams/{teamId}/mail/${emailId}/reply`, reply);
  }

  async forwardEmail(emailId: string, forward: any): Promise<any> {
    return api.post<any>(`/teams/{teamId}/mail/${emailId}/forward`, forward);
  }

  async saveDraft(draft: any): Promise<any> {
    return api.post<any>("/teams/{teamId}/mail/drafts", draft);
  }

  async deleteEmail(emailId: string): Promise<void> {
    return api.delete(`/teams/{teamId}/mail/${emailId}`);
  }

  async starEmail(emailId: string): Promise<void> {
    return api.patch(`/teams/{teamId}/mail/${emailId}/star`);
  }

  async markAsRead(emailId: string, read: boolean): Promise<void> {
    return api.patch(`/teams/{teamId}/mail/${emailId}/read`, { read });
  }
}
