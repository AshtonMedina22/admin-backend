# Google Sheets API Setup (15 minutes)

Your admin site talks to Google Sheets through a **service account** (a robot Google user). You never put your personal Google password in the app.

**Your workbook:** https://docs.google.com/spreadsheets/d/1WAJWr2omEayubh_Ty6Gv_XIuWQCcBLYA5scLr4Nlv2g/edit

---

## Part 1 — Google Cloud Console

### 1. Create a project

1. Open https://console.cloud.google.com/
2. Top bar: click the project dropdown → **New Project**
3. Name: `solar-ops-demo` → **Create**
4. Make sure that project is selected in the top bar

### 2. Enable Google Sheets API

1. Left menu: **APIs & Services** → **Library**
2. Search: `Google Sheets API`
3. Click it → **Enable**

(Optional later: enable **Google Drive API** if you need file access — not required for reading/writing cells.)

### 3. Create a service account

1. **APIs & Services** → **Credentials**
2. **+ Create Credentials** → **Service account**
3. Name: `sheets-api` → **Create and Continue**
4. Role: skip (optional) → **Continue** → **Done**

### 4. Download the JSON key

1. On Credentials page, under **Service Accounts**, click the email you just created
2. Tab **Keys** → **Add Key** → **Create new key** → **JSON** → **Create**
3. A `.json` file downloads — **keep this secret**

### 5. Copy the robot email

Open the JSON file in Notepad. Find:

```json
"client_email": "sheets-api@your-project-id.iam.gserviceaccount.com"
```

Copy that email. You need it for the next part.

---

## Part 2 — Share your Google Sheet with the robot

This step is **required**. Without it you get `403 Permission denied` forever.

1. Open your workbook: https://docs.google.com/spreadsheets/d/1WAJWr2omEayubh_Ty6Gv_XIuWQCcBLYA5scLr4Nlv2g/edit
2. Click **Share** (top right)
3. Paste the `client_email` from the JSON
4. Role: **Editor**
5. Uncheck “Notify people” if you want → **Share**

The robot now has the same access as if you invited a coworker.

---

## Part 3 — Local env (for development)

### Option A — JSON file (recommended on Windows)

1. Rename/move the downloaded key to:
   ```
   gold-star-ops-dashboard/google-service-account.json
   ```
2. Copy `.env.example` → `.env.local`:
   ```powershell
   cd gold-star-ops-dashboard
   copy .env.example .env.local
   ```
3. `.env.local` should contain:
   ```
   GOOGLE_SHEET_ID=1WAJWr2omEayubh_Ty6Gv_XIuWQCcBLYA5scLr4Nlv2g
   GOOGLE_APPLICATION_CREDENTIALS=./google-service-account.json
   ```

`google-service-account.json` is gitignored — never commit it.

### Option B — JSON string in env (used on Vercel)

Minify the JSON to one line and set:

```
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

---

## Part 4 — Vercel (when you deploy)

1. Vercel project → **Settings** → **Environment Variables**
2. Add:
   - `GOOGLE_SHEET_ID` = `1WAJWr2omEayubh_Ty6Gv_XIuWQCcBLYA5scLr4Nlv2g`
   - `GOOGLE_SERVICE_ACCOUNT_JSON` = entire JSON file pasted as one line
3. Redeploy after saving

---

## Part 5 — Verify it works

After API routes are built (Phase 3):

```powershell
npm run dev
```

In another terminal:

```powershell
curl http://localhost:3000/api/sheets/project-tracker
```

You should get JSON rows from your sheet. If you see `403`, the sheet is not shared with the service account email.

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `403 Permission denied` | Share sheet with `client_email` as Editor |
| `404 Unable to parse range` | Tab name in code must match sheet tab exactly |
| `API has not been used` | Enable Google Sheets API in Cloud Console |
| `Invalid credentials` | Wrong JSON file or env var truncated |
| Env var empty locally | Use `.env.local`, not `.env` — restart `npm run dev` |

---

## What this does NOT do

- Does **not** use your personal Google login in the app
- Does **not** require OAuth consent screen for a service account reading your own sheet
- Does **not** give Cursor your password — only works after `.env.local` + API routes exist
