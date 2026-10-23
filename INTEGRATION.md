# Backend integration (FastAPI)

This frontend now reads/writes real data from the Career Readiness FastAPI backend
(`api/` in the Career_Readiness_Project folder). Design, layout and CSS are unchanged.

## Run

```bash
cp .env.example .env          # VITE_API_URL=http://localhost:8000
npm install
npm run dev                   # http://localhost:8080
```
Backend: `uvicorn api.main:app --reload --port 8000` (see README_API.md in the backend).

## What was added / changed

| File | Change |
|---|---|
| `src/lib/api.ts` | **new** – typed API client, JWT storage (localStorage), all endpoint calls |
| `src/lib/auth.ts` | **new** – `useAuth()` hook (SSR-safe) |
| `src/lib/queries.ts` | **new** – `useApiQuery()` (only runs with a token) + shared query keys |
| `src/components/ApiState.tsx` | **new** – loading / error / "complete previous step" cards |
| `src/routes/login.tsx` | **new** – Sign in / Create account page (the Lovable project had none) |
| `src/components/AppShell.tsx` | route guard (redirect to /login), real user in header, working Logout, Admin link only for admins |
| `src/routes/*.tsx` | mock arrays replaced with API data; same markup/classes |
| `src/routes/index.tsx` | "Sign in" / "Get started" now go to /login |
| `src/routes/__root.tsx` | type-only fix for a pre-existing TS error in the error boundary |

## Production
Commit a `.env.production` with `VITE_API_URL=https://<your-backend>` before building/publishing,
and add the frontend's domain to the backend's `CORS_ORIGINS`.
