function normalizeApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL?.trim();

  // Default backend API for local development.
  if (!raw) {
    return "http://localhost:5001/api/v1";
  }

  const base = raw.replace(/\/+$/, "");

  if (base.endsWith("/api/v1")) {
    return base;
  }

  if (base.endsWith("/api")) {
    return `${base}/v1`;
  }

  // Support host-only URL like http://localhost:5001
  if (base.startsWith("http://") || base.startsWith("https://")) {
    return `${base}/api/v1`;
  }

  // Support Vite proxy style relative path.
  if (base === "/api") {
    return "/api/v1";
  }

  return base;
}

const BASE_URL = normalizeApiBaseUrl();

interface RequestOptions extends RequestInit {
  data?: unknown;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, statusText: string) {
    super(`API Error: ${status} ${statusText}`);
    this.name = "ApiError";
    this.status = status;
  }
}

export const api = {
  get: async <T>(url: string, options?: RequestOptions): Promise<T> => {
    return request<T>(url, { ...options, method: 'GET' });
  },
  post: async <T>(url: string, data?: unknown, options?: RequestOptions): Promise<T> => {
    return request<T>(url, { ...options, method: 'POST', data });
  },
  put: async <T>(url: string, data?: unknown, options?: RequestOptions): Promise<T> => {
    return request<T>(url, { ...options, method: 'PUT', data });
  },
  delete: async <T>(url: string, options?: RequestOptions): Promise<T> => {
    return request<T>(url, { ...options, method: 'DELETE' });
  },
  patch: async <T>(url: string, data?: unknown, options?: RequestOptions): Promise<T> => {
    return request<T>(url, { ...options, method: 'PATCH', data });
  },
};

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { data, headers, ...rest } = options;
  
  const config: RequestInit = {
    ...rest,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${BASE_URL}${url}`, config);

  if (!response.ok) {
    throw new ApiError(response.status, response.statusText);
  }

  // Handle empty responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
