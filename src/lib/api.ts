const BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface RequestOptions extends RequestInit {
  data?: unknown;
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
};

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { data, headers, ...rest } = options;
  
  const config: RequestInit = {
    ...rest,
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
    // Handle specific error status codes here (401, 403, etc.)
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  // Handle empty responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
