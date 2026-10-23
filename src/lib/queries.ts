import { useQuery, type QueryKey } from "@tanstack/react-query";
import { ApiError } from "./api";
import { useAuth } from "./auth";

/** useQuery that only fires in the browser once a JWT is present. */
export function useApiQuery<T>(
  key: QueryKey,
  fn: () => Promise<T>,
  opts: { enabled?: boolean } = {},
) {
  const { ready, token } = useAuth();
  return useQuery<T, ApiError>({
    queryKey: key,
    queryFn: fn,
    enabled: ready && !!token && (opts.enabled ?? true),
    retry: (count, err) =>
      (err instanceof ApiError ? err.status >= 500 || err.status === 0 : true) && count < 1,
    refetchOnWindowFocus: false,
  });
}

/** Keys shared across pages so mutations can invalidate everything that depends on them. */
export const qk = {
  profile: ["profile"] as const,
  resume: ["resume"] as const,
  career: ["career"] as const,
  skillGap: ["skill-gap"] as const,
  roadmap: ["roadmap"] as const,
  dashboard: ["dashboard"] as const,
  analytics: ["analytics"] as const,
  report: ["report-status"] as const,
  admin: ["admin-overview"] as const,
};

/** Everything downstream of a workflow step changes when that step is re-run. */
export const ALL_USER_KEYS = [
  qk.profile,
  qk.resume,
  qk.career,
  qk.skillGap,
  qk.roadmap,
  qk.dashboard,
  qk.analytics,
  qk.report,
];
