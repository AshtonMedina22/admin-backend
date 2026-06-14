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

**Recommended:** In the Vercel project, set **Root Directory** to `admin-dashboard`, then use default Next.js build settings (`npm run build`). You can delete the repo-root `vercel.json` or leave it unused.

**Alternative (repo root as project root):** Keep Root Directory blank and use the repo-root `vercel.json`, which runs install/build inside `admin-dashboard`. Do **not** set a custom Output Directory - Vercel handles `.next` for Next.js automatically.

Optional env vars for live Google Sheets (demo mode works without them): copy `.env.example` to `.env.local` locally, or add the same keys in Vercel Project Settings.
