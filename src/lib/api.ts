/**
 * Centralized API fetch wrapper with dev fallback support.
 * Every page uses this instead of raw fetch().
 *
 * Pattern: always hits the real API first.
 * If fetch fails AND a devFallback is provided, returns the fallback
 * so the app stays usable without a running DB.
 */

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ApiFetchOptions extends RequestInit {
  devFallback?: unknown;
}

export async function apiFetch<T>(
  url: string,
  options?: ApiFetchOptions
): Promise<T> {
  const { devFallback, ...fetchOpts } = options ?? {};

  try {
    const res = await fetch(url, {
      ...fetchOpts,
      credentials: "include",
    });

    if (res.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new ApiError("Non authentifié", 401);
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ApiError(
        body.error || body.message || `Erreur serveur (${res.status})`,
        res.status
      );
    }

    return (await res.json()) as T;
  } catch (error) {
    // If we have a dev fallback and the fetch genuinely failed (not a 4xx from API)
    if (devFallback !== undefined) {
      const isNetworkError =
        error instanceof TypeError || // fetch failed (no server)
        (error instanceof ApiError && error.status >= 500); // server error

      if (isNetworkError) {
        console.warn(`[DEV FALLBACK] ${url}`, error);
        return devFallback as T;
      }
    }
    throw error;
  }
}

/** POST JSON shorthand */
export function apiPost<T>(url: string, data: unknown, devFallback?: T) {
  return apiFetch<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    devFallback,
  });
}

/** PUT JSON shorthand */
export function apiPut<T>(url: string, data: unknown, devFallback?: T) {
  return apiFetch<T>(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    devFallback,
  });
}

/** DELETE shorthand */
export function apiDelete<T>(url: string, devFallback?: T) {
  return apiFetch<T>(url, { method: "DELETE", devFallback });
}
