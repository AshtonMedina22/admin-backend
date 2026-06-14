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

In the Vercel project go to **Settings → General → Build & Development Settings** and set:

| Setting | Value |
|---------|-------|
| **Root Directory** | `admin-dashboard` |
| **Framework Preset** | Next.js |
| **Build Command** | `npm run build` (default) |
| **Install Command** | `npm install` (default) |
| **Output Directory** | **leave blank** (do not use `public` or `.next`) |

If you see `No Output Directory named "public" found`, the project is misconfigured as a static site. Clear **Output Directory** and set **Framework Preset** to **Next.js**.

The repo-root `vercel.json` is only for legacy setups that keep Root Directory blank. Prefer Root Directory = `admin-dashboard` instead.

Optional env vars for live Google Sheets (demo mode works without them): copy `.env.example` to `.env.local` locally, or add the same keys in Vercel Project Settings.
