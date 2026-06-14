# Workbook Data Flow

The demo is intentionally workbook-first: the polished admin routes read cleaned Google Sheets tabs before falling back to
local preview data.

## Source Order

1. **Apps Script JSON** (`GOOGLE_APPS_SCRIPT_URL`) - preferred; returns `timestamp` plus workbook sections.
2. **Private Google Sheets API** (service account) - full tab access with real pull timestamps.
3. **Published Google Sheets CSV** (`GOOGLE_SHEET_ID` only) - fallback when credentials are not configured.
4. **Local preview data** - offline UI review only.

## Required Environment Variables

```powershell
GOOGLE_SHEET_ID=1WAJWr2omEayubh_Ty6Gv_XIuWQCcBLYA5scLr4Nlv2g
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
```

For private API access, also configure one of:

```powershell
GOOGLE_APPLICATION_CREDENTIALS=./google-service-account.json
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

## Workbook-Backed Routes

- `/dashboard` reads `Dashboard`.
- `/dashboard/enterprise` reads `Solar3K Bids`.
- `/dashboard/retail` reads `Retail Ops`.
- `/dashboard/vendor-ops` reads `Contractors & Vendors`.
- `/dashboard/calendar` reads `Calendar`.
- `/dashboard/settings` reads `Website & Systems` and `Access Control`.

The app also exposes normalized private-API JSON at:

```powershell
curl http://localhost:3000/api/sheets/project-tracker
```

Valid slugs:

- `dashboard`
- `lead-tracker`
- `project-tracker`
- `solar3k-bids`
- `solar3k-contracts`
- `contractors-vendors`
- `financial-summary`
- `website-systems`
- `retail-ops`
- `calendar`
- `access-control`

