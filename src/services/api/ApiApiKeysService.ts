import { api } from "@/lib/api";

export interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  provider?: string;
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
}

export interface CreateApiKeyPayload {
  name: string;
  provider: string;
  scopes?: string[];
  expiresAt?: string;
}

export interface ApiKeyWithSecret extends ApiKeyItem {
  secret: string;
}

export class ApiApiKeysService {
  async list(): Promise<ApiKeyItem[]> {
    return api.get<ApiKeyItem[]>("/api-keys");
  }

  async create(payload: CreateApiKeyPayload): Promise<ApiKeyWithSecret> {
    return api.post<ApiKeyWithSecret>("/api-keys", {
      name: payload.name,
      provider: payload.provider,
      scopes: payload.scopes || ["read:basic"],
      expiresAt: payload.expiresAt,
    });
  }

  async rotate(keyId: string): Promise<ApiKeyWithSecret> {
    return api.post<ApiKeyWithSecret>(`/api-keys/${encodeURIComponent(keyId)}/rotate`);
  }

  async revoke(keyId: string): Promise<void> {
    return api.delete(`/api-keys/${encodeURIComponent(keyId)}`);
  }
}

