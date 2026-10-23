import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  User,
  FileText,
  Sparkles,
  Target,
  Map,
  BarChart3,
  FileDown,
  Shield,
  LogOut,
  Home,
  Bell,
  Search,
  GraduationCap,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { api, initials } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { LoadingCard } from "@/components/ApiState";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/resume", label: "Resume Center", icon: FileText },
  { to: "/career", label: "Career Analysis", icon: Sparkles },
  { to: "/skills", label: "Skill Gap", icon: Target },
  { to: "/roadmap", label: "Roadmap", icon: Map },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/report", label: "Career Report", icon: FileDown },
  { to: "/admin", label: "Admin", icon: Shield },
] as const;

export function AppShell({
  children,
  title,
  subtitle,
  adminOnly = false,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  adminOnly?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { ready, token, user, isAdmin } = useAuth();

  // Protected pages: no token -> go to /login and come back afterwards.
  useEffect(() => {
    // Guard against re-firing while the router is already on /login.
    if (ready && !token && !pathname.startsWith("/login")) {
      navigate({ to: "/login", search: { redirect: pathname } as never, replace: true });
    }
  }, [ready, token, pathname, navigate]);

  const logout = () => {
    // Navigate first so the guard above doesn't record this page as a redirect target.
    navigate({ to: "/login", replace: true }).then(() => {
      api.logout();
      queryClient.clear();
    });
  };

  const nav = NAV.filter((item) => item.to !== "/admin" || isAdmin);
  let content: ReactNode = children;
  if (!ready || !token) {
    content = <LoadingCard label="Checking your session…" />;
  } else if (adminOnly && !isAdmin) {
    content = (
      <div className="max-w-3xl rounded-2xl border border-border bg-card p-8 shadow-soft">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-warning/10 text-warning">
          <Shield className="h-5 w-5" />
        </div>
        <h3 className="mt-4 font-display text-xl font-bold">Admin access required</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Please log in with an administrator account.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-card">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight">CareerForge</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              AI Platform
            </span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {nav.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${active ? "" : "text-muted-foreground group-hover:text-foreground"}`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-md">
          <div className="flex items-center gap-4 px-6 py-3.5">
            <div className="flex-1 min-w-0">
              {title && <h1 className="truncate text-lg font-bold tracking-tight">{title}</h1>}
              {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
            </div>
            <div className="hidden md:flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-muted-foreground w-72">
              <Search className="h-4 w-4" />
              <input
                placeholder="Search careers, skills…"
                className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button className="relative grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface hover:bg-muted transition">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-secondary" />
            </button>
            <div className="flex items-center gap-2.5 pl-2 border-l border-border">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-accent text-sm font-semibold text-primary-foreground">
                {initials(user?.name)}
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-sm font-semibold">{user?.name ?? ""}</span>
                <span className="text-[11px] text-muted-foreground">
                  {user ? (isAdmin ? "Admin" : user.email) : ""}
                </span>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="lg:hidden grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface hover:bg-muted transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 px-6 py-6">{content}</main>
      </div>
    </div>
  );
}
