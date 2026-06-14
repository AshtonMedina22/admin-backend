import type { CommandCenterData } from "@/data/demo/command-center";
import {
  computeCommandCenterMetrics,
  defaultCommandCenterTrends,
  demoCommandCenterData,
} from "@/data/demo/command-center";
import type { GlobalEvent } from "@/data/demo/global-events";
import type { PipelineProject } from "@/data/demo/pipeline";
import { crmPipelineData } from "@/data/demo/pipeline";
import type { RevenueSplitMonth } from "@/data/demo/revenue-split";
import type { SoftwareSubscription, WebsiteHealth } from "@/data/demo/systems";
import { softwareSubscriptionData, websiteHealthData } from "@/data/demo/systems";
import type { EntityBrand } from "@/data/demo/types";
import { brandToDisplayCompany } from "@/data/demo/types";
import { inferEntityBrand } from "@/lib/entity-brand";
import { DEMO_ORG } from "@/config/demo-identity";
import { staggerEventTimestamp } from "@/lib/sync-time";
import type { VendorRecord } from "@/data/demo/vendors";
import { vendorCategoryLabel, vendorsData } from "@/data/demo/vendors";
import type { DashboardSummary, SheetRecord } from "@/lib/google-sheets";
import { fetchSheet } from "@/lib/google-sheets";

function parseSheetMoney(value: string): number {
  const raw = String(value).trim();
  if (!raw) return 0;
  const normalized = raw.replace(/[$,]/g, "");
  if (/k$/i.test(normalized)) {
    return Number(normalized.replace(/k$/i, "")) * 1000;
  }
  return Number(normalized) || 0;
}

function parseSheetCount(value: string): number {
  return Number(String(value).replace(/[^\d.]/g, "")) || 0;
}


function alertToEventStatus(priority: string): GlobalEvent["status"] {
  if (/critical/i.test(priority)) return "critical";
  if (/warning/i.test(priority)) return "warning";
  return "info";
}

function mapWorkbookMetrics(summary: DashboardSummary): CommandCenterData["metrics"] {
  const computed = computeCommandCenterMetrics();
  const b2bFromSheet = parseSheetMoney(summary.metrics.solar3kBidValue);
  const retailFromSheet = parseSheetCount(summary.metrics.installsThisMonth);

  return {
    b2bPipeline: b2bFromSheet || computed.b2bPipeline,
    fleetYield: computed.fleetYield,
    portfolioCapacity: computed.portfolioCapacity,
    retailVolume: retailFromSheet || computed.retailVolume,
  };
}

function mapWorkbookRevenueSplit(rows: DashboardSummary["revenueByCompany"]): RevenueSplitMonth[] {
  if (rows.length === 0) return demoCommandCenterData.revenueSplit;

  const findCompany = (needle: string) => rows.find((r) => r.company.toLowerCase().includes(needle));

  const solar2sk = findCompany("2sk") ?? findCompany("solar2");
  const solar3k = findCompany("3sk") ?? findCompany("3k");
  const yellowStar = findCompany("yellow");

  const quarterSum = (row: (typeof rows)[number] | undefined, months: Array<keyof (typeof rows)[number]>) =>
    months.reduce((sum, month) => sum + (Number(row?.[month]) || 0), 0);

  return [
    {
      month: "Q1-26",
      solar2sk: quarterSum(solar2sk, ["jan", "feb", "mar"]),
      solar3k: quarterSum(solar3k, ["jan", "feb", "mar"]),
      yellowStar: quarterSum(yellowStar, ["jan", "feb", "mar"]),
      status: "finalized",
      statusNote: "Workbook locked after QuickBooks close",
    },
    {
      month: "Q2-26",
      solar2sk: quarterSum(solar2sk, ["apr", "may"]),
      solar3k: quarterSum(solar3k, ["apr", "may"]),
      yellowStar: quarterSum(yellowStar, ["apr", "may"]),
      status: "finalized",
      statusNote: "Cross-entity journal entries posted",
    },
    {
      month: "Current Month",
      solar2sk: solar2sk?.junYtd ?? 0,
      solar3k: solar3k?.junYtd ?? 0,
      yellowStar: yellowStar?.junYtd ?? 0,
      status: "pending_reconciliation",
      statusNote: "Jun YTD rows pulled from financial-summary - accruals pending review",
    },
  ];
}

function mapWorkbookEvents(summary: DashboardSummary): GlobalEvent[] {
  if (summary.alerts.length === 0) return demoCommandCenterData.events;

  const syncAnchorMs = Date.parse(summary.syncedAt) || Date.now();

  return summary.alerts.map((alert, index) => ({
    id: `wb-evt-${index + 1}`,
    entityBrand: inferEntityBrand(`${alert.alert} ${alert.detail}`),
    message: `${alert.alert} - ${alert.detail} (Action: ${alert.action})`,
    status: alertToEventStatus(alert.priority),
    timestamp: staggerEventTimestamp(index, syncAnchorMs),
  }));
}

export function mapWorkbookToCommandCenter(summary: DashboardSummary): CommandCenterData {
  return {
    ...demoCommandCenterData,
    source: "workbook",
    updatedAt: summary.syncedAt,
    metrics: mapWorkbookMetrics(summary),
    trends: defaultCommandCenterTrends,
    revenueSplit: mapWorkbookRevenueSplit(summary.revenueByCompany),
    events: mapWorkbookEvents(summary),
    kpis: demoCommandCenterData.kpis,
    alerts:
      summary.alerts.length > 0
        ? summary.alerts.map((alert, index) => ({
            id: `workbook-alert-${index + 1}`,
            title: alert.alert,
            detail: alert.detail,
            company: alert.detail.toLowerCase().includes("solar2sk") ? DEMO_ORG.retail : "Shared",
            owner: "Alex Morgan",
            due: "Open",
            priority: alert.priority as "Critical" | "Warning" | "Info",
            action: alert.action,
          }))
        : demoCommandCenterData.alerts,
    projects:
      summary.projects.length > 0
        ? summary.projects.slice(0, 6).map((project) => ({
            id: project.id || "project-pending",
            customer: project.customerName || "Pending Allocation",
            company: brandToDisplayCompany(
              project.company?.includes("Yellow")
                ? "Yellow Star"
                : project.company?.includes("3")
                  ? "Solar3K"
                  : "Solar2SK",
            ),
            stage: project.stage || "Not started",
            value: project.contractValue || "$0",
            owner: project.contractor || "Unassigned",
            nextStep: project.notes || "Review next action",
            due: project.estimatedCompletion || "TBD",
          }))
        : demoCommandCenterData.projects,
  };
}

function mapEntityBrand(value: string): PipelineProject["entityBrand"] {
  const v = value.toLowerCase();
  if (v.includes("yellow")) return "Yellow Star";
  if (v.includes("3")) return "Solar3K";
  return "Solar2SK";
}

export function mapRecordsToPipeline(records: SheetRecord[]): PipelineProject[] {
  const mapped = records
    .filter((row) => row.customer_name || row.client_name || row.client)
    .map((row, index) => ({
      id: row.id || `pipe-wb-${index + 1}`,
      clientName: row.customer_name || row.client_name || row.client || "Unknown",
      entityBrand: mapEntityBrand(row.company || row.entity || ""),
      systemSizeKw: Number(row.system_kw || row.system_size_kw || 0) || 0,
      projectType: (row.project_type || "Commercial Rooftop") as PipelineProject["projectType"],
      pipelineStage: (row.stage || row.pipeline_stage || "New Lead") as PipelineProject["pipelineStage"],
      pipelinePhase: row.phase || row.pipeline_phase || "Engineering Design",
      projectValue: Number(String(row.contract_value || row.project_value || row.expected_value || 0).replace(/[$,]/g, "")) || 0,
      nextCriticalPath: row.next_critical_path || row.critical_path || "Pending milestone review",
    }));

  return mapped.length > 0 ? mapped : crmPipelineData;
}

export function mapRecordsToWebsiteSystems(records: SheetRecord[]): {
  websites: WebsiteHealth[];
  subscriptions: SoftwareSubscription[];
} {
  const websites = records
    .filter((row) => row.section?.includes("website") || row.site_domain || row.site)
    .map((row, index) => ({
      id: row.id || `web-wb-${index + 1}`,
      siteDomain: row.site_domain || row.site || "",
      company: mapEntityBrand(row.company || ""),
      status: (row.status?.toUpperCase().includes("URGENT") ? "URGENT" : "HEALTHY") as WebsiteHealth["status"],
      platform: row.platform || "WordPress",
      hosting: row.hosting || "DreamHost",
      sslValid: row.ssl?.toLowerCase() !== "invalid" && !row.ssl?.toLowerCase().includes("critical"),
      sslStatus: row.ssl || (row.ssl?.toLowerCase().includes("invalid") ? "CRITICAL" : "OPERATIONAL"),
      lastChecked: row.last_checked || new Date().toISOString().slice(0, 10),
    }));

  const subscriptions = records
    .filter((row) => row.section?.includes("software") || row.tool_name || row.tool)
    .map((row, index) => ({
      id: row.id || `sub-wb-${index + 1}`,
      toolName: row.tool_name || row.tool || "",
      monthlyCost: Number(String(row.monthly_cost || row.cost || 0).replace(/[$,]/g, "")) || 0,
      accountOwner: (row.account_owner?.includes("Jordan") ? "Jordan Lee" : "Alex Morgan") as SoftwareSubscription["accountOwner"],
      category: row.category || "General",
      serves: row.serves || "",
      renewal: row.renewal || "",
    }));

  return {
    websites: websites.length > 0 ? websites : websiteHealthData,
    subscriptions: subscriptions.length > 0 ? subscriptions : softwareSubscriptionData,
  };
}

export function mapRecordsToVendors(records: SheetRecord[]): VendorRecord[] {
  const mapped = records
    .filter((row) => row.name || row.vendor_name)
    .map((row, index) => ({
      id: row.id || `ven-wb-${index + 1}`,
      name: row.name || row.vendor_name || "",
      category: (row.category?.includes("equipment")
        ? "equipment"
        : row.category?.includes("service")
          ? "service"
          : "install") as VendorRecord["category"],
      region: row.region || "",
      specialty: row.specialty || row.type || "",
      activeAssignments: Number(row.active_assignments || 0) || 0,
      contact: row.contact || "",
      lastCoordination: row.last_coordination || "",
      status: (row.status || "Active") as VendorRecord["status"],
      complianceStatus: (row.compliance_status || row.insurance_status || "Verified Active") as VendorRecord["complianceStatus"],
      specialtyType: row.specialty_type || row.type || vendorCategoryLabel[(row.category?.includes("equipment")
        ? "equipment"
        : row.category?.includes("service")
          ? "service"
          : "install") as VendorRecord["category"]],
    }));

  return mapped.length > 0 ? mapped : vendorsData;
}

export async function fetchPipelineProjects(): Promise<PipelineProject[]> {
  try {
    const [leads, bids, contracts] = await Promise.all([
      fetchSheet("lead-tracker"),
      fetchSheet("solar3k-bids"),
      fetchSheet("solar3k-contracts"),
    ]);
    const merged = mapRecordsToPipeline([...leads.records, ...bids.records, ...contracts.records]);
    return merged;
  } catch {
    return crmPipelineData;
  }
}

export async function fetchWebsiteSystems() {
  try {
    const sheet = await fetchSheet("website-systems");
    return mapRecordsToWebsiteSystems(sheet.records);
  } catch {
    return { websites: websiteHealthData, subscriptions: softwareSubscriptionData };
  }
}

export async function fetchContractorsVendors(): Promise<VendorRecord[]> {
  try {
    const sheet = await fetchSheet("contractors-vendors");
    return mapRecordsToVendors(sheet.records);
  } catch {
    return vendorsData;
  }
}
