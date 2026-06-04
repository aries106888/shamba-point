// ── API base URL ─────────────────────────────────────────────
// In dev: Vite proxies /api → PHP backend on localhost
// In prod: /api is served from same origin (Docker apache)
const BASE = (import.meta.env.VITE_API_BASE_URL as string) ?? "/api";

function getToken(): string | null {
  return localStorage.getItem("shamba_token");
}

interface ApiOptions extends RequestInit {
  auth?: boolean;
}

async function request<T = unknown>(
  endpoint: string,
  opts: ApiOptions = {}
): Promise<T> {
  const { auth = true, headers: extraHeaders, ...rest } = opts;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(extraHeaders as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${BASE}/${endpoint.replace(/^\//, "")}`;
  const res = await fetch(url, { ...rest, headers });

  if (res.status === 401) {
    localStorage.removeItem("shamba_token");
    localStorage.removeItem("shamba_user");
    window.location.hash = "#/auth";
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error ?? `HTTP ${res.status}`);
  }

  return data as T;
}

// Convenience methods
export const api = {
  get: <T = unknown>(ep: string, params?: Record<string, string>, opts?: ApiOptions) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<T>(ep + qs, { method: "GET", ...opts });
  },
  post: <T = unknown>(ep: string, body: unknown, opts?: ApiOptions) =>
    request<T>(ep, { method: "POST", body: JSON.stringify(body), ...opts }),
  put: <T = unknown>(ep: string, body: unknown, opts?: ApiOptions) =>
    request<T>(ep, { method: "PUT", body: JSON.stringify(body), ...opts }),
  del: <T = unknown>(ep: string, opts?: ApiOptions) =>
    request<T>(ep, { method: "DELETE", ...opts }),
};

export default api;
