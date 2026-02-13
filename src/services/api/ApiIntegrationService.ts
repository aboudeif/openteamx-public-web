import { api } from "@/lib/api";

export class ApiIntegrationService {
  async getIntegrations(): Promise<any> {
    return api.get<any>("/integrations");
  }

  async getConnectedIntegrations(): Promise<any[]> {
    return api.get<any[]>("/integrations/connected");
  }

  getConnectUrl(provider: string): string {
    const base = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001/api/v1";
    const normalizedBase = base.endsWith("/api/v1")
      ? base
      : base.endsWith("/api")
        ? `${base}/v1`
        : `${base}/api/v1`;

    return `${normalizedBase}/integrations/${encodeURIComponent(provider)}/connect`;
  }

  async connectIntegration(provider: string): Promise<void> {
    return api.post(`/integrations/${encodeURIComponent(provider)}/connect`);
  }

  async disconnectIntegration(provider: string): Promise<void> {
    return api.delete(`/integrations/${encodeURIComponent(provider)}`);
  }

  async getIntegrationStatus(provider: string): Promise<any> {
    return api.get<any>(`/integrations/${encodeURIComponent(provider)}/status`);
  }
}
