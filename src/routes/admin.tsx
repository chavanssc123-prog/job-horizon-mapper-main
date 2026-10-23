import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ErrorCard, FormErrors, LoadingCard } from "@/components/ApiState";
import {
  Users,
  FileText,
  Sparkles,
  Map,
  Activity,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Search,
  Download,
  Loader2,
} from "lucide-react";
import { api, saveBlob, timeAgo, type AdminOverview } from "@/lib/api";
import { qk, useApiQuery } from "@/lib/queries";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — CareerForge AI" }] }),
  component: Admin,
});

function Admin() {
  const { isAdmin } = useAuth();
  const q = useApiQuery(qk.admin, api.adminOverview, { enabled: isAdmin });
  return (
    <AppShell title="Admin Dashboard" subtitle="Platform health & operations" adminOnly>
      {q.isPending ? (
        <LoadingCard />
      ) : q.isError ? (
        <ErrorCard error={q.error} onRetry={() => q.refetch()} />
      ) : (
        <AdminBody o={q.data} />
      )}
    </AppShell>
  );
}

type Filters = { name: string; email: string; career_role: string };

function AdminBody({ o }: { o: AdminOverview }) {
  const [draft, setDraft] = useState<Filters>({ name: "", email: "", career_role: "" });
  const [filters, setFilters] = useState<Filters>({ name: "", email: "", career_role: "" });
  const users = useApiQuery(["admin-users", filters], () => api.adminUsers(filters));
  const csv = useMutation({
    mutationFn: () => api.adminUsersCsv(filters),
    onSuccess: (blob) => saveBlob(blob, "admin_user_search.csv"),
  });

  const ov = o.overview;
  const sel = o.career_selection_counts;
  const kpis = [
    {
      i: Users,
      l: "Total users",
      v: ov.total_users,
      d: `${o.latest_users.length ? `Latest: ${o.latest_users[0].name}` : "No users yet"}`,
    },
    {
      i: FileText,
      l: "Total profiles",
      v: ov.total_profiles,
      d: ov.total_users
        ? `${((ov.total_profiles / ov.total_users) * 100).toFixed(1)}% of users`
        : "—",
    },
    {
      i: FileText,
      l: "Total resumes",
      v: ov.total_resumes,
      d: `Avg ATS ${o.resume_analytics.average_ats_score.toFixed(1)}%`,
    },
    {
      i: Sparkles,
      l: "Recommendations",
      v: ov.total_career_predictions,
      d: `${sel.total_ai_recommendations} AI · ${sel.total_user_overrides} overrides`,
    },
    {
      i: Map,
      l: "Total roadmaps",
      v: ov.total_roadmaps,
      d: `Avg ${o.roadmap_analytics.average_roadmap_duration.toFixed(1)} months`,
    },
    {
      i: Activity,
      l: "Skill gap analyses",
      v: ov.total_skill_gap_analyses,
      d: `Avg match ${o.skill_summary.average_skill_match_score.toFixed(1)}%`,
    },
    {
      i: TrendingUp,
      l: "Avg readiness",
      v: o.skill_summary.average_readiness_score.toFixed(1),
      d: "From skill gap analyses",
    },
    {
      i: CheckCircle2,
      l: "Top selected career",
      v: o.top_selected_career ?? "—",
      d: `${o.top_selected_count} selections`,
    },
  ];
  const health = o.database_health;
  const input =
    "rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-primary w-full";

  return (
    <div className="max-w-7xl space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => {
          const Icon = k.i;
          return (
            <div key={k.l} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <Icon className="h-5 w-5 text-primary" />
              <div className="mt-4 font-display text-3xl font-bold truncate">{k.v}</div>
              <div className="text-sm font-medium mt-1">{k.l}</div>
              <div className="text-xs text-muted-foreground truncate">{k.d}</div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
        {/* Users table + search */}
        <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-bold">Users</h3>
              <p className="text-xs text-muted-foreground">
                {users.data
                  ? `${users.data.count} matching user record(s)`
                  : "Search by name, email or career"}
              </p>
            </div>
            <button
              onClick={() => csv.mutate()}
              disabled={csv.isPending || !users.data?.count}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline disabled:opacity-50"
            >
              {csv.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}{" "}
              Download CSV
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setFilters(draft);
            }}
            className="px-6 py-3 border-b border-border grid sm:grid-cols-[1fr_1fr_1fr_auto] gap-2 bg-surface"
          >
            <input
              className={input}
              placeholder="Name"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
            <input
              className={input}
              placeholder="Email"
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
            />
            <input
              className={input}
              placeholder="Career role"
              value={draft.career_role}
              onChange={(e) => setDraft({ ...draft, career_role: e.target.value })}
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
            >
              <Search className="h-3.5 w-3.5" /> Search
            </button>
          </form>
          {users.isError && (
            <div className="p-4">
              <FormErrors error={users.error} />
            </div>
          )}
          <FormErrors error={csv.error} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-6 py-3">User</th>
                  <th className="text-left px-6 py-3">Interest</th>
                  <th className="text-left px-6 py-3">Career</th>
                  <th className="text-right px-6 py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.isPending && (
                  <tr>
                    <td colSpan={4} className="px-6 py-6 text-center text-muted-foreground">
                      <Loader2 className="inline h-4 w-4 animate-spin" />
                    </td>
                  </tr>
                )}
                {users.data?.results.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-6 text-center text-muted-foreground">
                      No users matched the search criteria.
                    </td>
                  </tr>
                )}
                {users.data?.results.map((r) => (
                  <tr key={r.id} className="border-t border-border hover:bg-surface transition">
                    <td className="px-6 py-3">
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.email}</div>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{r.interest_domain || "—"}</td>
                    <td className="px-6 py-3">
                      {r.recommended_role ? (
                        <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-semibold">
                          {r.recommended_role}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right text-muted-foreground">
                      {timeAgo(r.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          {/* Database health */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="font-display font-bold">System health</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {health.connected ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-warning" />
                  )}
                  <span>Database {health.database ? `(${health.database})` : ""}</span>
                </div>
                <span
                  className={`text-xs font-semibold ${health.connected ? "text-success" : "text-warning"}`}
                >
                  {health.connected ? "Connected" : "Down"}
                </span>
              </li>
              {Object.entries(health.total_records).map(([table, n]) => (
                <li key={table} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {health.tables_found.includes(table) ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-warning" />
                    )}
                    <span>{table}</span>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">{n} rows</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Career trends */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="font-display font-bold">Career trends</h3>
            <p className="text-xs text-muted-foreground">Most recommended careers</p>
            <ul className="mt-4 space-y-3 text-sm">
              {o.career_summary.length === 0 && (
                <li className="text-muted-foreground">No career recommendations available yet.</li>
              )}
              {o.career_summary.slice(0, 6).map((c) => (
                <li key={c.recommended_role} className="flex items-center justify-between">
                  <span>{c.recommended_role}</span>
                  <span className="text-xs font-semibold text-success">{c.count}</span>
                </li>
              ))}
            </ul>
            {o.override_stats.length > 0 && (
              <>
                <p className="text-xs text-muted-foreground mt-5">
                  Most overridden (user-selected) careers
                </p>
                <ul className="mt-2 space-y-2 text-sm">
                  {o.override_stats.slice(0, 4).map((c) => (
                    <li key={c.career_role} className="flex items-center justify-between">
                      <span>{c.career_role}</span>
                      <span className="text-xs font-semibold text-destructive">
                        {c.override_count}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Skill analytics */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="font-display font-bold">Skill analytics</h3>
            <p className="text-xs text-muted-foreground">Most missing skills across users</p>
            <ul className="mt-4 space-y-3 text-sm">
              {o.skill_summary.most_missing_skills.length === 0 && (
                <li className="text-muted-foreground">No skill gap analyses yet.</li>
              )}
              {o.skill_summary.most_missing_skills.map((sk) => (
                <li key={sk.skill} className="flex items-center justify-between">
                  <span className="capitalize">{sk.skill}</span>
                  <span className="text-xs font-semibold text-warning">{sk.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
