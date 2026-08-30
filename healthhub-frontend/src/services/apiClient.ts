/**
 * Thin fetch wrapper around the HealthHub API.
 *
 * Auth is cookie-based: every request is sent with `credentials: "include"` so
 * the browser attaches the httpOnly JWT cookies automatically — no tokens are
 * ever handled in JavaScript. On a `401` the client transparently tries the
 * refresh endpoint once and replays the original request.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

/**
 * Error thrown for any non-2xx API response, carrying the parsed body so
 * callers can surface field-level validation messages.
 */
export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown) {
    const detail =
      data && typeof data === "object" && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : "Something went wrong. Please try again.";
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }

  /**
   * Flatten a DRF validation error body (`{field: ["msg"]}`) into a simple
   * `{field: "msg"}` map for display next to form inputs.
   */
  fieldErrors(): Record<string, string> {
    const out: Record<string, string> = {};
    if (this.data && typeof this.data === "object") {
      for (const [key, value] of Object.entries(this.data)) {
        if (Array.isArray(value)) out[key] = String(value[0]);
        else if (typeof value === "string") out[key] = value;
      }
    }
    return out;
  }
}

/** Shared in-flight refresh promise so concurrent 401s trigger one refresh. */
let refreshInFlight: Promise<boolean> | null = null;

/**
 * Attempt a single token refresh, coalescing concurrent callers.
 *
 * @returns `true` if the refresh succeeded (new cookies were set).
 */
async function tryRefresh(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_BASE}/auth/refresh/`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

/**
 * Parse a response, returning its JSON body or throwing {@link ApiError}.
 */
async function parse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new ApiError(res.status, data);
  return data as T;
}

/**
 * Perform an API request with cookie credentials and one-shot 401 refresh.
 *
 * @param path - API path beginning with `/` (relative to the API base).
 * @param options - Standard `fetch` options; JSON content-type is added.
 * @param retry - Internal flag; `false` disables the refresh-and-replay retry.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (res.status === 401 && retry && path !== "/auth/refresh/") {
    const refreshed = await tryRefresh();
    if (refreshed) return apiFetch<T>(path, options, false);
  }

  return parse<T>(res);
}
