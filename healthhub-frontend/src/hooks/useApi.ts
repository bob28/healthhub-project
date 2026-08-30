/**
 * Small data-fetching hook built on the native `fetch` client.
 *
 * It runs an async fetcher on mount, tracks loading and error state, and
 * exposes a `refetch` so pages can reload after a mutation (e.g. booking or
 * cancelling).
 */

import { useCallback, useEffect, useState } from "react";

import { ApiError } from "@/src/services/apiClient";

/** The state returned by {@link useApi} for a single fetched resource. */
export interface UseApiResult<T> {
  /** The fetched data, or `null` until the first successful load. */
  data: T | null;
  /** `true` while a request is in flight (including refetches). */
  loading: boolean;
  /** A human-readable error message from the last failed request. */
  error: string | null;
  /** Re-run the fetcher, e.g. after a mutation changes the data. */
  refetch: () => Promise<void>;
}

/**
 * Fetch a resource on mount and whenever `deps` change.
 *
 * @param fetcher - Async function that resolves to the resource. Must be stable
 *   or reconstructed only when `deps` change, so the effect does not re-run on
 *   every render.
 * @param deps - Dependency list controlling when the fetch re-runs.
 * @returns The current {@link UseApiResult} for the resource.
 */
export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList = [],
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetcher());
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Unable to reach the server. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { data, loading, error, refetch: run };
}