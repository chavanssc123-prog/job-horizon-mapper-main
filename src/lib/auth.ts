import { useSyncExternalStore } from "react";
import { auth, type User } from "./api";

function snapshot(): string {
  if (typeof window === "undefined") return "";
  try {
    return `${window.localStorage.getItem("careerforge.token") ?? ""}|${window.localStorage.getItem("careerforge.user") ?? ""}`;
  } catch {
    return "";
  }
}

/**
 * Current auth state. `ready` is false during SSR / first hydration pass so
 * protected pages don't redirect before localStorage has been read.
 */
export function useAuth(): {
  ready: boolean;
  token: string | null;
  user: User | null;
  isAdmin: boolean;
} {
  const snap = useSyncExternalStore(
    (cb) => auth.subscribe(cb),
    snapshot,
    () => "__server__",
  );
  if (snap === "__server__") return { ready: false, token: null, user: null, isAdmin: false };
  const token = auth.getToken();
  const user = token ? auth.getUser() : null;
  return { ready: true, token, user, isAdmin: user?.role === "admin" };
}
