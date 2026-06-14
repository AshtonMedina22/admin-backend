import { google } from "googleapis";

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export const SHEET_SLUGS = [
  "dashboard",
  "lead-tracker",
  "project-tracker",
  "solar3k-bids",
  "solar3k-contracts",
  "contractors-vendors",
  "financial-summary",
  "website-systems",
  "retail-ops",
  "calendar",
  "access-control",
] as const;

export type SheetSlug = (typeof SHEET_SLUGS)[number];

const SLUG_SHEET_NAMES: Record<SheetSlug, string> = {
  dashboard: "Dashboard",
  "lead-tracker": "Lead Tracker",
  "project-tracker": "Project Tracker",
  "solar3k-bids": "Solar3K Bids",
  "solar3k-contracts": "Solar3K Contracts",
  "contractors-vendors": "Contractors & Vendors",
  "financial-summary": "Financial Summary",
  "website-systems": "Website & Systems",
  "retail-ops": "Retail Ops",
  calendar: "Calendar",
  "access-control": "Access Control",
};

type ServiceAccountCredentials = {
  client_email: string;
  private_key: string;
};

export type SheetRecord = Record<string, string>;

export type SheetResult = {
  ok: true;
  slug: SheetSlug;
  sheetName: string;
  records: SheetRecord[];
  rowCount: number;
  syncedAt: string;
};

export type DashboardSummary = {
  metrics: {
    activeProjects: string;
    leadsInPipeline: string;
    installsThisMonth: string;
    activeRevenue: string;
    solar3kBidValue: string;
    urgentAlerts: string;
  };
  revenueByCompany: {
    company: string;
    jan: number;
    feb: number;
    mar: number;
    apr: number;
    may: number;
    junYtd: number;
  }[];
  projects: {
    id: string;
    customerName: string;
    company: string;
    projectType: string;
    contractor: string;
    contractValue: string;
    stage: string;
    permitStatus: string;
    gridStatus: string;
    contractDate: string;
    estimatedCompletion: string;
    systemKw: string;
    notes: string;
  }[];
  alerts: {
    alert: string;
    detail: string;
    priority: string;
    action: string;
  }[];
  syncedAt: string;
};

export function isSheetSlug(value: string): value is SheetSlug {
  return (SHEET_SLUGS as readonly string[]).includes(value);
}

function requireSheetId() {
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!sheetId) {
    throw new Error("Missing environment variable: GOOGLE_SHEET_ID");
  }

  return sheetId;
}

async function getCredentials(): Promise<ServiceAccountCredentials> {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON) as ServiceAccountCredentials;
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const filePath = resolve(/* turbopackIgnore: true */ process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS);
    return JSON.parse(await readFile(filePath, "utf8")) as ServiceAccountCredentials;
  }

  throw new Error("Missing Google credentials. Set GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS.");
}

async function getSheetsClient() {
  const credentials = await getCredentials();
  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  return google.sheets({ version: "v4", auth });
}

function cleanCell(value: unknown): string {
  return String(value ?? "")
    .replace(/[\u{1f300}-\u{1faff}\u{2600}-\u{27bf}]/gu, "")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function toKey(value: string) {
  return cleanCell(value)
    .replace(/#/, "number")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

function isEmptyRow(row: string[]) {
  return row.every((cell) => cleanCell(cell) === "");
}

function findHeaderRows(rows: string[][]) {
  return rows
    .map((row, index) => ({ index, row: row.map(cleanCell) }))
    .filter(({ row }) => row.filter(Boolean).length >= 3);
}

function parseFirstTable(rows: string[][]): SheetRecord[] {
  const header = findHeaderRows(rows)[0];

  if (!header) return [];

  const headerOffset = header.row.findIndex(Boolean);
  const keys = header.row.slice(headerOffset).map(toKey);

  const tableRows = [];

  for (const row of rows.slice(header.index + 1)) {
    if (isEmptyRow(row.map(cleanCell))) break;
    tableRows.push(row);
  }

  return tableRows
    .map((row) => row.slice(headerOffset).map(cleanCell))
    .filter((row) => !isEmptyRow(row))
    .filter((row) => row.filter(Boolean).length > 1)
    .filter((row) => !["total", "totals", "win_rate"].includes(toKey(row[0] ?? "")))
    .filter((row) => !toKey(row[0] ?? "").includes("summary"))
    .map((row) => Object.fromEntries(keys.map((key, index) => [key || `column_${index + 1}`, row[index] ?? ""])));
}

function parseSectionedTables(rows: string[][]): SheetRecord[] {
  const records: SheetRecord[] = [];
  let section = "";

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index].map(cleanCell);
    const cells = row.filter(Boolean);

    if (cells.length === 1 && !cells[0].includes("|")) {
      section = toKey(cells[0]);
      continue;
    }

    if (cells.length < 3) continue;

    const nextRows = rows.slice(index + 1);
    const keys = row.map(toKey);
    const firstKeyIndex = keys.findIndex(Boolean);

    if (firstKeyIndex === -1) continue;

    for (const candidate of nextRows) {
      const values = candidate.map(cleanCell);
      const usefulValues = values.slice(firstKeyIndex).filter(Boolean);

      if (usefulValues.length < 2) break;

      const record = Object.fromEntries(
        keys
          .slice(firstKeyIndex)
          .map((key, cellIndex) => [key || `column_${cellIndex + 1}`, values[firstKeyIndex + cellIndex] ?? ""]),
      );
      records.push({ section, ...record });
    }
  }

  return records;
}

function normalizeRows(slug: SheetSlug, rows: string[][]): SheetRecord[] {
  if (
    slug === "dashboard" ||
    slug === "contractors-vendors" ||
    slug === "financial-summary" ||
    slug === "website-systems" ||
    slug === "retail-ops"
  ) {
    return parseSectionedTables(rows);
  }

  return parseFirstTable(rows);
}

export async function fetchSheet(slug: SheetSlug): Promise<SheetResult> {
  const sheetName = SLUG_SHEET_NAMES[slug];
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: requireSheetId(),
    range: `'${sheetName}'!A1:Z200`,
    valueRenderOption: "FORMATTED_VALUE",
  });
  const rows = (response.data.values ?? []) as string[][];
  const records = normalizeRows(slug, rows);

  return {
    ok: true,
    slug,
    sheetName,
    records,
    rowCount: records.length,
    syncedAt: new Date().toISOString(),
  };
}

function moneyToNumber(value: string) {
  return Number(cleanCell(value).replace(/[$,]/g, "")) || 0;
}

function findDashboardMetric(records: SheetRecord[], metric: string, key = "total") {
  const record = records.find((row) => toKey(row.metric ?? row.stage ?? row.alert ?? "") === toKey(metric));
  return record?.[key] || record?.value || "";
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const [dashboard, projects, financial] = await Promise.all([
    fetchSheet("dashboard"),
    fetchSheet("project-tracker"),
    fetchSheet("financial-summary"),
  ]);

  const alerts = dashboard.records
    .filter((row) => row.alert)
    .map((row) => ({
      alert: row.alert,
      detail: row.detail,
      priority: row.priority
        .replace(/critical/i, "Critical")
        .replace(/warning/i, "Warning")
        .replace(/info/i, "Info"),
      action: row.action,
    }));

  const revenueByCompany = financial.records
    .filter((row) => row.company && row.company.toLowerCase() !== "total")
    .map((row) => ({
      company: row.company,
      jan: moneyToNumber(row.jan),
      feb: moneyToNumber(row.feb),
      mar: moneyToNumber(row.mar),
      apr: moneyToNumber(row.apr),
      may: moneyToNumber(row.may),
      junYtd: moneyToNumber(row.jun_ytd),
    }));

  const normalizedProjects = projects.records.map((row, index) => ({
    id: `PROJ-${String(index + 1).padStart(3, "0")}`,
    customerName: row.customer_name,
    company: row.company,
    projectType: row.project_type,
    contractor: row.contractor,
    contractValue: row.contract_value,
    stage: row.stage,
    permitStatus: row.permit_status,
    gridStatus: row.grid_status,
    contractDate: row.contract_date,
    estimatedCompletion: row.est_completion,
    systemKw: row.system_kw,
    notes: row.notes,
  }));

  return {
    metrics: {
      activeProjects: findDashboardMetric(dashboard.records, "Active Projects"),
      leadsInPipeline: findDashboardMetric(dashboard.records, "Leads In Pipeline"),
      installsThisMonth: findDashboardMetric(dashboard.records, "Installs This Month"),
      activeRevenue: findDashboardMetric(dashboard.records, "Total Revenue Active"),
      solar3kBidValue: findDashboardMetric(dashboard.records, "Total Bid Value"),
      urgentAlerts: String(alerts.length),
    },
    revenueByCompany,
    projects: normalizedProjects,
    alerts,
    syncedAt: new Date().toISOString(),
  };
}
