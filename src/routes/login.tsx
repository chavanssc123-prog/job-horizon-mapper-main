import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, GraduationCap, Loader2, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { FormErrors } from "@/components/ApiState";

type Search = { redirect?: string; mode?: "login" | "register" };

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    redirect:
      typeof s.redirect === "string" &&
      s.redirect.startsWith("/") &&
      !s.redirect.startsWith("/login")
        ? s.redirect
        : undefined,
    mode: s.mode === "register" ? "register" : undefined,
  }),
  head: () => ({ meta: [{ title: "Sign in — CareerForge AI" }] }),
  component: Login,
});

function Login() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { ready, token } = useAuth();
  const [mode, setMode] = useState<"login" | "register">(search.mode ?? "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const goNext = () => navigate({ to: search.redirect ?? "/dashboard", replace: true });

  // Streamlit: "You are already logged in." -> dashboard
  useEffect(() => {
    if (ready && token) goNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, token]);

  const login = useMutation({
    mutationFn: () => api.login({ email, password }),
    onSuccess: goNext,
  });
  const register = useMutation({
    mutationFn: () => api.register({ name, email, password, confirm_password: confirm }),
    onSuccess: () => navigate({ to: "/profile", replace: true }),
  });
  const m = mode === "login" ? login : register;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    m.mutate();
  };

  const input =
    "mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium outline-none focus:border-primary transition";

  return (
    <div className="min-h-screen bg-surface grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-hero text-primary-foreground p-10">
        <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
        <Link to="/" className="relative flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-card/15 border border-card/20">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-bold tracking-tight">CareerForge AI</span>
        </Link>
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-card/15 backdrop-blur-sm border border-card/20 px-3 py-1 text-xs">
            <Sparkles className="h-3.5 w-3.5" /> Profile → Resume → Career → Skill gap → Roadmap
          </div>
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight">
            Build your career roadmap with AI
          </h1>
          <ul className="mt-6 space-y-2 text-sm opacity-90">
            {[
              "AI resume parsing",
              "Career recommendation you can override",
              "Readiness score & PDF report",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative text-xs opacity-70">CareerForge AI</div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-elevated">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setMode(t);
                  login.reset();
                  register.reset();
                }}
                className={`rounded-lg py-2 text-sm font-semibold transition ${mode === t ? "bg-card shadow-soft text-foreground" : "text-muted-foreground"}`}
              >
                {t === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <h2 className="mt-6 font-display text-2xl font-bold">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login"
              ? "Access your career readiness dashboard by signing in."
              : "Create an account to start tracking your career readiness."}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "register" && (
              <label className="block text-xs uppercase tracking-wider text-muted-foreground">
                Full name
                <input
                  className={input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </label>
            )}
            <label className="block text-xs uppercase tracking-wider text-muted-foreground">
              Email
              <input
                className={input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </label>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground">
              Password
              <input
                className={input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </label>
            {mode === "register" && (
              <label className="block text-xs uppercase tracking-wider text-muted-foreground">
                Confirm password
                <input
                  className={input}
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                />
              </label>
            )}

            <FormErrors error={m.error} />

            <button
              type="submit"
              disabled={m.isPending}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-95 disabled:opacity-60"
            >
              {m.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {mode === "login" ? "Sign in" : "Create account"} <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
