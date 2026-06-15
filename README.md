# Admin Dashboard

Workbook-backed executive operations dashboard for the Gold Star / Yellow Star Power solar portfolio demo.

The app lives in `admin-dashboard`.

```bash
cd admin-dashboard
npm install
npm run dev
```

Open `http://localhost:3000/dashboard`.

## Deploy on Vercel

The Next.js app lives in `admin-dashboard/`. Vercel **must** use that folder as the project root.

In the Vercel project go to **Settings → General → Build & Development Settings** and set:

| Setting | Value |
|---------|-------|
| **Root Directory** | `admin-dashboard` |
| **Framework Preset** | Next.js |
| **Build Command** | `npm run build` (default — clear any override) |
| **Install Command** | `npm install` (default — clear any override) |
| **Output Directory** | **leave blank** (do not use `public` or `.next`) |

**If you see** `No Next.js version detected` **or** `Could not identify Next.js version`:

1. Set **Root Directory** to `admin-dashboard` (not the repo root).
2. Clear **Install Command** and **Build Command** overrides — remove `cd admin-dashboard && …` if present.
3. Set **Framework Preset** to **Next.js**.
4. Redeploy.

If you see `No Output Directory named "public" found`, the project is misconfigured as a static site. Clear **Output Directory** and set **Framework Preset** to **Next.js**.

Config file: `admin-dashboard/vercel.json` (defaults only). There is no repo-root `vercel.json`.

Optional env vars for live Google Sheets (demo mode works without them): copy `.env.example` to `.env.local` locally, or add the same keys in Vercel Project Settings.
