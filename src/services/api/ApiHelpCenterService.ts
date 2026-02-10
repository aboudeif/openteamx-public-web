import { api } from "@/lib/api";

export class ApiHelpCenterService {
  async getCategories(): Promise<any[]> {
    return api.get<any[]>("/help/categories");
  }

  async searchArticles(query: string): Promise<any[]> {
    return api.get<any[]>(`/help/search?query=${query}`);
  }

  async submitTicket(ticket: any): Promise<void> {
    return api.post("/help/tickets", ticket);
  }
}
