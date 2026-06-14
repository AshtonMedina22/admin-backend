import { type CommandCenterData, demoCommandCenterData } from "@/data/demo/command-center";

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

export function mapScriptPayloadToCommandCenter(payload: WorkbookScriptPayload): CommandCenterData {
  return {
    ...demoCommandCenterData,
    source: "workbook",
    updatedAt: payload.timestamp,
    metrics: {
      b2bPipeline: metricValue(payload, "active_b2b_pipeline", demoCommandCenterData.metrics.b2bPipeline),
      fleetYield: metricValue(payload, "fleet_yield_kw", demoCommandCenterData.metrics.fleetYield),
      portfolioCapacity: metricValue(payload, "portfolio_capacity_kw", demoCommandCenterData.metrics.portfolioCapacity),
      retailVolume: metricValue(payload, "diy_retail_volume", demoCommandCenterData.metrics.retailVolume),
    },
  };
}
