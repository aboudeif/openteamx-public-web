import { api } from "@/lib/api";

export class ApiTalentService {
  async getTalentProfile(): Promise<any> {
    return api.get<any>("/talent/profile");
  }

  async updateTalentProfile(profile: any): Promise<any> {
    return api.put<any>("/talent/profile", profile);
  }

  async getCv(): Promise<any> {
    return api.get<any>("/talent/cv");
  }

  async updateCv(cv: any): Promise<any> {
    return api.put<any>("/talent/cv", cv);
  }

  async getTeamHistory(): Promise<any[]> {
    return api.get<any[]>("/talent/team-history");
  }

  async getActivityAnalytics(period: string): Promise<any> {
    return api.get<any>(`/talent/analytics?period=${period}`);
  }

  async getDashboardWidgets(): Promise<any> {
    return api.get<any>("/talent/dashboard");
  }
}
