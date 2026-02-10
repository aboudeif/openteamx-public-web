import { api } from "@/lib/api";

export class ApiIntegrationService {
  async getIntegrations(): Promise<any[]> {
    return api.get<any[]>("/integrations");
  }

  async connectIntegration(integrationId: string, data: any): Promise<void> {
    return api.post(`/integrations/${integrationId}/connect`, data);
  }

  async disconnectIntegration(integrationId: string): Promise<void> {
    return api.delete(`/integrations/${integrationId}/disconnect`);
  }

  async getIntegrationStatus(integrationId: string): Promise<any> {
    return api.get<any>(`/integrations/${integrationId}/status`);
  }
}
