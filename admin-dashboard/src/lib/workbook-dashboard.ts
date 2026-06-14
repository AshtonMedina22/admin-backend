import type { CommandCenterData } from "@/data/demo/command-center";
import { demoCommandCenterData } from "@/data/demo/command-center";
import type { GlobalEvent, GlobalEventStatus } from "@/data/demo/global-events";
import type { RevenueSplitMonth } from "@/data/demo/revenue-split";
import { inferEntityBrand } from "@/lib/entity-brand";
import { parseWorkbookTimestamp } from "@/lib/sync-time";

export type OperationsStreamRow = {
  brand?: string;
  event?: string;
  status?: string;
  logged_at?: string;
};

export type CommandCenterMetricRow = {
  metric?: string;
  value?: string;
};

export type RevenueSplitRow = {
  period?: string;
  solar_2sk_direct_hardware_margins?: string;
  solar_3sk_commercial_consulting_and_design_fees?: string;
  yellow_star_power_macro_grid_yield_dividends?: string;
  solar_2sk?: string;
  solar_3sk?: string;
  yellow_star?: string;
};

function moneyToNumber(value: string | undefined) {
  return Number(String(value ?? "").replace(/[$,]/g, "")) || 0;
}

function countToNumber(value: string | undefined) {
  return Number(String(value ?? "").replace(/[^\d.]/g, "")) || 0;
}

function streamStatusToEventStatus(status: string | undefined): GlobalEventStatus {
  const normalized = String(status ?? "").toLowerCase();
  if (normalized.includes("critical")) return "critical";
  if (normalized.includes("warning")) return "warning";
  if (normalized.includes("success")) return "success";
  return "info";
}

export function mapOperationsStreamToEvents(rows: OperationsStreamRow[], syncedAt: string): GlobalEvent[] {
  const mapped = rows
    .filter((row) => row.event?.trim())
    .map((row, index) => ({
      id: `wb-evt-${index + 1}`,
      entityBrand: inferEntityBrand(`${row.brand ?? ""} ${row.event ?? ""}`),
      message: row.event ?? "",
      status: streamStatusToEventStatus(row.status),
      timestamp: parseWorkbookTimestamp(row.logged_at) ?? syncedAt,
    }));

  return mapped.length > 0 ? mapped : demoCommandCenterData.events;
}

export function mapCommandCenterMetrics(
  rows: CommandCenterMetricRow[],
  syncedAt: string,
): Pick<CommandCenterData, "metrics" | "updatedAt"> {
  const findMetric = (name: string) => rows.find((row) => row.metric?.trim() === name)?.value ?? "";

  return {
    updatedAt: syncedAt,
    metrics: {
      b2bPipeline:
        moneyToNumber(findMetric("Active B2B Pipeline")) || demoCommandCenterData.metrics.b2bPipeline,
      fleetYield: countToNumber(findMetric("Live Fleet Yield")) || demoCommandCenterData.metrics.fleetYield,
      portfolioCapacity:
        countToNumber(findMetric("Combined Portfolio Capacity")) || demoCommandCenterData.metrics.portfolioCapacity,
      retailVolume:
        countToNumber(findMetric("DIY Retail Vol (Mo)")) || demoCommandCenterData.metrics.retailVolume,
    },
  };
}

export function mapRevenueSplitRows(rows: RevenueSplitRow[]): RevenueSplitMonth[] {
  if (rows.length === 0) return demoCommandCenterData.revenueSplit;

  return rows.map((row) => ({
    month: row.period ?? "Unknown",
    solar2sk: moneyToNumber(row.solar_2sk_direct_hardware_margins ?? row.solar_2sk),
    solar3k: moneyToNumber(row.solar_3sk_commercial_consulting_and_design_fees ?? row.solar_3sk),
    yellowStar: moneyToNumber(row.yellow_star_power_macro_grid_yield_dividends ?? row.yellow_star),
    status: row.period === "Current Month" ? "pending_reconciliation" : "finalized",
    statusNote:
      row.period === "Current Month"
        ? "Workbook current-month rows pending close"
        : "Workbook period locked",
  }));
}
