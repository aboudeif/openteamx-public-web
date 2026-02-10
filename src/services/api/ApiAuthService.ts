import { api } from "@/lib/api";

export class ApiAuthService {
  async login(credentials: any): Promise<any> {
    return api.post<any>("/auth/login", credentials);
  }

  async register(userInfo: any): Promise<any> {
    return api.post<any>("/auth/register", userInfo);
  }

  async logout(): Promise<void> {
    return api.post("/auth/logout");
  }

  async getCurrentUser(): Promise<any> {
    return api.get<any>("/auth/me");
  }

  async refreshToken(): Promise<any> {
    return api.post<any>("/auth/refresh");
  }
}
