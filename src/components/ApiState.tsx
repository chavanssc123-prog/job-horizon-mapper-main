import { Link } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, Loader2, Lock } from "lucide-react";
import { ApiError, STEP_ROUTES } from "@/lib/api";

/** Loading placeholder that reuses the app's card styling. */
export function LoadingCard({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="max-w-7xl rounded-2xl border border-border bg-card p-10 shadow-soft flex items-center justify-center gap-3 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin text-primary" /> {label}
    </div>
  );
}

/**
 * Error card. A 409 with `missing_step` means an earlier workflow step
 * (profile -> resume -> career -> skill gap -> roadmap) isn't done yet — the
 * same guard app.py shows with st.error(); we link straight to that step.
 */
export function ErrorCard({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const e = error instanceof ApiError ? error : null;
  const step = e?.missingStep ? STEP_ROUTES[e.missingStep] : null;

  if (step) {
    return (
      <div className="max-w-3xl rounded-2xl border border-border bg-card p-8 shadow-soft">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-warning/10 text-warning">
          <Lock className="h-5 w-5" />
        </div>
        <h3 className="mt-4 font-display text-xl font-bold">One step first</h3>
        <p className="mt-1 text-sm text-muted-foreground">{e?.message}</p>
        <Link
          to={step.to}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-95"
        >
          {step.label} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl rounded-2xl border border-destructive/30 bg-destructive/5 p-6 shadow-soft">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div className="min-w-0">
          <div className="font-semibold">Something went wrong</div>
          <p className="text-sm text-muted-foreground mt-1 break-words">
            {e?.message ?? (error instanceof Error ? error.message : "Unexpected error")}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 text-sm font-semibold text-primary hover:underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Inline form error list (validation messages from the API). */
export function FormErrors({ error }: { error: unknown }) {
  if (!error) return null;
  const list =
    error instanceof ApiError
      ? error.errors
      : [error instanceof Error ? error.message : String(error)];
  return (
    <ul className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive space-y-1">
      {list.map((m) => (
        <li key={m}>{m}</li>
      ))}
    </ul>
  );
}
