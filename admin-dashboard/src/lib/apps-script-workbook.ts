import { type CommandCenterData, demoCommandCenterData } from "@/data/demo/command-center";
import {
  mapCommandCenterMetrics,
  mapOperationsStreamToEvents,
  mapRevenueSplitRows,
  type OperationsStreamRow,
} from "@/lib/workbook-dashboard";

type ScriptMetric = {
  metric_key: string;
  current_value: number;
  formula_reference?: number;
};

export type ScriptBid = {
  bid_id: string;
  account: string;
  brand: string;
  scope: string;
  status: string;
  value: number;
};

export type ScriptRetailOrder = {
  order_id: string;
  customer: string;
  product: string;
  status: string;
  value: number;
  date: string;
};

export type ScriptDomainMonitor = {
  domain: string;
  detail: string;
  ssl_status: string;
  renewal_date: string;
  admin_handle: string;
  is_critical: boolean;
};

export type ScriptSaasSubscription = {
  tool: string;
  cadence: string;
  cost: number;
  purpose: string;
  admin: string;
};

export type WorkbookScriptPayload = {
  timestamp: string;
  source: "workbook";
  summaryMetrics?: ScriptMetric[];
  commandCenterMetrics?: Array<{ metric: string; value: string }>;
  globalOperationsStream?: OperationsStreamRow[];
  revenueSplit?: Array<{
    period: string;
    solar_2sk_direct_hardware_margins?: string | number;
    solar_3sk_commercial_consulting_and_design_fees?: string | number;
    yellow_star_power_macro_grid_yield_dividends?: string | number;
  }>;
  b2bBids?: ScriptBid[];
  retailOrders?: ScriptRetailOrder[];
  domainMonitors?: ScriptDomainMonitor[];
  saasSubscriptions?: ScriptSaasSubscription[];
};

function requireAppsScriptUrl() {
  const url = process.env.GOOGLE_APPS_SCRIPT_URL;

  if (!url) {
    throw new Error("Missing environment variable: GOOGLE_APPS_SCRIPT_URL");
  }

  return url;
}

export async function fetchWorkbookScriptPayload(): Promise<WorkbookScriptPayload> {
  const response = await fetch(requireAppsScriptUrl(), {
    cache: "no-store",
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`Apps Script workbook request failed: ${response.status}`);
  }

  return (await response.json()) as WorkbookScriptPayload;
}

export async function fetchWorkbookScriptPayloadOrNull() {
  try {
    return await fetchWorkbookScriptPayload();
  } catch {
    return null;
  }
}

function metricValue(payload: WorkbookScriptPayload, key: string, fallback: number) {
  return payload.summaryMetrics?.find((metric) => metric.metric_key === key)?.current_value ?? fallback;
}

function metricRowsFromLegacySummary(payload: WorkbookScriptPayload) {
  if (payload.commandCenterMetrics?.length) return payload.commandCenterMetrics;

  return [
    {
      metric: "Active B2B Pipeline",
      value: String(metricValue(payload, "active_b2b_pipeline", demoCommandCenterData.metrics.b2bPipeline)),
    },
    {
      metric: "Live Fleet Yield",
      value: `${metricValue(payload, "fleet_yield_mw", demoCommandCenterData.metrics.fleetYield)} MW`,
    },
    {
      metric: "Combined Portfolio Capacity",
      value: `${metricValue(payload, "portfolio_capacity_mw", demoCommandCenterData.metrics.portfolioCapacity)} MW`,
    },
    {
      metric: "DIY Retail Vol (Mo)",
      value: String(metricValue(payload, "diy_retail_volume", demoCommandCenterData.metrics.retailVolume)),
    },
  ];
}

export function mapScriptPayloadToCommandCenter(payload: WorkbookScriptPayload): CommandCenterData {
  const syncedAt = payload.timestamp || new Date().toISOString();
  const metricRows = metricRowsFromLegacySummary(payload);
  const { metrics } = mapCommandCenterMetrics(metricRows, syncedAt);

  return {
    ...demoCommandCenterData,
    source: "workbook",
    updatedAt: syncedAt,
    metrics,
    revenueSplit: payload.revenueSplit?.length
      ? mapRevenueSplitRows(
          payload.revenueSplit.map((row) => ({
            period: row.period,
            solar_2sk_direct_hardware_margins: String(row.solar_2sk_direct_hardware_margins ?? ""),
            solar_3sk_commercial_consulting_and_design_fees: String(
              row.solar_3sk_commercial_consulting_and_design_fees ?? "",
            ),
            yellow_star_power_macro_grid_yield_dividends: String(
              row.yellow_star_power_macro_grid_yield_dividends ?? "",
            ),
          })),
        )
      : demoCommandCenterData.revenueSplit,
    events: payload.globalOperationsStream?.length
      ? mapOperationsStreamToEvents(payload.globalOperationsStream, syncedAt)
      : demoCommandCenterData.events,
  };
}
