const rawBase = (((import.meta as any)?.env?.VITE_API_BASE_URL as string) || '/api').trim();
const cleanBase = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;
const API_BASE = cleanBase.startsWith('http') && !cleanBase.endsWith('/api')
  ? `${cleanBase}/api`
  : cleanBase;

const resolveEndpoint = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE}${cleanEndpoint}`;
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('cartseven_token');
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('cartseven_token', token);
  } else {
    localStorage.removeItem('cartseven_token');
  }
};

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(resolveEndpoint(endpoint), {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`) as any;
    error.status = response.status;
    error.data = data;
    error.redirectUrl = data.redirectUrl;
    throw error;
  }

  return data as T;
}
