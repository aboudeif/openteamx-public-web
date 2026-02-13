import { api } from "@/lib/api";

export class ApiIntegrationService {
  async getIntegrations(): Promise<any> {
    return api.get<any>("/integrations");
  }

  async getConnectedIntegrations(): Promise<any[]> {
    return api.get<any[]>("/integrations/connected");
  }

  getConnectUrl(provider: string, teamId?: string): string {
    const base = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001/api/v1";
    const normalizedBase = base.endsWith("/api/v1")
      ? base
      : base.endsWith("/api")
        ? `${base}/v1`
        : `${base}/api/v1`;

    const query = teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";
    return `${normalizedBase}/integrations/${encodeURIComponent(provider)}/connect${query}`;
  }

  async connectIntegration(provider: string, teamId?: string): Promise<void> {
    const query = teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";
    return api.post(`/integrations/${encodeURIComponent(provider)}/connect${query}`);
  }

  async disconnectIntegration(provider: string, teamId?: string): Promise<void> {
    const query = teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";
    return api.delete(`/integrations/${encodeURIComponent(provider)}${query}`);
  }

  async getIntegrationStatus(provider: string, teamId?: string): Promise<any> {
    const query = teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";
    return api.get<any>(`/integrations/${encodeURIComponent(provider)}/status${query}`);
  }
}
