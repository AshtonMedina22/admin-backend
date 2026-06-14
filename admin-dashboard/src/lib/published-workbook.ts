import { type CommandCenterData, demoCommandCenterData } from "@/data/demo/command-center";

export type WorkbookRow = Record<string, string>;

function requireSheetId() {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error("Missing environment variable: GOOGLE_SHEET_ID");
  return sheetId;
}

function parseCsv(csv: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < csv.length; index++) {
    const char = csv[index];
    const next = csv[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index++;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell.trim());
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index++;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  if (cell || row.length) {
    row.push(cell.trim());
    if (row.some(Boolean)) rows.push(row);
  }

  return rows;
}

function toKey(value: string) {
  return value
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

function isBlankRow(row: string[]) {
  return row.every((cell) => !cell);
}

function rowsToRecords(header: string[], rows: string[][]): WorkbookRow[] {
  const keys = header.map(toKey);
  return rows
    .filter((row) => !isBlankRow(row))
    .map((row) => Object.fromEntries(keys.map((key, index) => [key || `column_${index + 1}`, row[index] || ""])));
}

export async function fetchPublishedSheetRows(sheetName: string) {
  const url = new URL(`https://docs.google.com/spreadsheets/d/${requireSheetId()}/gviz/tq`);
  url.searchParams.set("tqx", "out:csv");
  url.searchParams.set("sheet", sheetName);

  const response = await fetch(url, { cache: "no-store", next: { revalidate: 0 } });
  if (!response.ok) throw new Error(`Published workbook request failed: ${response.status}`);

  return parseCsv(await response.text());
}

export async function fetchPublishedFirstTable(sheetName: string) {
  const rows = await fetchPublishedSheetRows(sheetName);
  const headerIndex = rows.findIndex((row) => row.filter(Boolean).length >= 3);
  if (headerIndex === -1) return [];

  const bodyRows = [];
  for (const row of rows.slice(headerIndex + 1)) {
    if (isBlankRow(row)) break;
    bodyRows.push(row);
  }

  return rowsToRecords(rows[headerIndex], bodyRows);
}

export async function fetchPublishedSectionTable(sheetName: string, sectionTitle: string) {
  const rows = await fetchPublishedSheetRows(sheetName);
  const normalizedSection = sectionTitle.toLowerCase();
  const sectionIndex = rows.findIndex((row) => row[0]?.toLowerCase().startsWith(normalizedSection));
  if (sectionIndex === -1) return [];

  const sectionRow = rows[sectionIndex] ?? [];
  const mergedHeaderCell = sectionRow[0]?.slice(sectionTitle.length).trim();
  const header = mergedHeaderCell ? [mergedHeaderCell, ...sectionRow.slice(1)] : (rows[sectionIndex + 1] ?? []);
  const bodyStartIndex = mergedHeaderCell ? sectionIndex + 1 : sectionIndex + 2;
  const bodyRows = [];
  for (const row of rows.slice(bodyStartIndex)) {
    if (isBlankRow(row)) break;
    bodyRows.push(row);
  }

  return rowsToRecords(header, bodyRows);
}

function moneyToNumber(value: string) {
  return Number(value.replace(/[$,]/g, "")) || 0;
}

function countToNumber(value: string) {
  return Number(value.replace(/[^\d.]/g, "")) || 0;
}

export async function fetchPublishedCommandCenter(): Promise<CommandCenterData> {
  const [metrics, revenue, events] = await Promise.all([
    fetchPublishedSectionTable("Dashboard", "Command Center Metrics"),
    fetchPublishedSectionTable("Dashboard", "Combined Revenue Split Matrix"),
    fetchPublishedSectionTable("Dashboard", "Global Operations Stream"),
  ]);

  const findMetric = (name: string) => metrics.find((metric) => metric.metric === name)?.value || "";

  return {
    ...demoCommandCenterData,
    source: "workbook",
    updatedAt: new Date().toISOString(),
    metrics: {
      b2bPipeline: moneyToNumber(findMetric("Active B2B Pipeline")) || demoCommandCenterData.metrics.b2bPipeline,
      fleetYield: countToNumber(findMetric("Live Fleet Yield")) || demoCommandCenterData.metrics.fleetYield,
      portfolioCapacity:
        countToNumber(findMetric("Combined Portfolio Capacity")) || demoCommandCenterData.metrics.portfolioCapacity,
      retailVolume: countToNumber(findMetric("DIY Retail Vol (Mo)")) || demoCommandCenterData.metrics.retailVolume,
    },
    revenueSplit: revenue.length
      ? revenue.map((row) => ({
          month: row.period,
          solar2sk: moneyToNumber(row.solar_2sk_direct_hardware_margins),
          solar3k: moneyToNumber(row.solar_3sk_commercial_consulting_and_design_fees),
          yellowStar: moneyToNumber(row.yellow_star_power_macro_grid_yield_dividends),
          status: row.period === "Current Month" ? "pending_reconciliation" : "finalized",
          statusNote:
            row.period === "Current Month" ? "Workbook current-month rows pending close" : "Workbook period locked",
        }))
      : demoCommandCenterData.revenueSplit,
    events: events.length
      ? events.map((row, index) => ({
          entityBrand: row.brand.includes("Yellow")
            ? "Yellow Star"
            : row.brand.includes("3SK")
              ? "Solar3K"
              : row.brand.includes("System")
                ? "Systems Alert"
                : "Solar2SK",
          id: `published-event-${index + 1}`,
          message: row.event,
          status: row.brand.includes("System") ? "critical" : "info",
          timestamp: new Date().toISOString(),
        }))
      : demoCommandCenterData.events,
  };
}
