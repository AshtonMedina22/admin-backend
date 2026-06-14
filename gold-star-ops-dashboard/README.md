# Gold Star Ops Dashboard

Executive operations dashboard for Gold Star Power's affiliated solar businesses.

## Scope

- Command Center for executive visibility
- Enterprise Hub for CRM, engineering pipeline, and telemetry
- Consumer Retail Hub for Solar 2SK order and support workflows
- Vendor Ops for contractors and hardware logistics
- Calendar for permitting, assessments, and delivery milestones
- Systems for domain health, SaaS spend, and role-based access

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000/dashboard`.

## Validation

```bash
npm run check
npm run build
```

## Workbook Integration

The dashboard is workbook-first. The six executive routes read the cleaned Google Sheets tabs through a published
workbook CSV endpoint, then fall back to Apps Script, private Google Sheets API, or local preview data depending on the
route and available environment variables.

This is intentional for the demo: the site proves that an existing Google Sheets operating workbook can drive a polished
admin interface without requiring a database migration first.

For private production-style access, see `docs/GOOGLE_SHEETS_SETUP.md`.
