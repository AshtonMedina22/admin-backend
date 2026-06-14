import { DEMO_ORG } from "@/config/demo-identity";

import type { GlobalEvent } from "./global-events";
import { globalEventsData } from "./global-events";
import { activeCiPipelineMw } from "./milestones";
import { ordersData, pendingOrderCount } from "./orders";
import { crmPipelineData } from "./pipeline";
import type { RevenueSplitMonth } from "./revenue-split";
import { revenueSplitData } from "./revenue-split";
import { totalMonthlySpend, urgentAlertsCount, websiteHealthData } from "./systems";
import { gridEfficiencyIndex, liveSitesCount, telemetrySitesData } from "./telemetry";
import type { DisplayCompany } from "./types";
import { brandToDisplayCompany } from "./types";

export type { DisplayCompany } from "./types";

/** Executive KPI numbers - derived from demo modules or overwritten by workbook sync. */
export type CommandCenterMetrics = {
  /** Solar 3SK commercial contract + proposal pipeline ($). */
  b2bPipeline: number;
  /** Yellow Star Power live array output (kW). */
  fleetYield: number;
  /** Combined installed capacity across managed sites (kW). */
  portfolioCapacity: number;
  /** Solar 2SK MTD WooCommerce unit volume. */
  retailVolume: number;
};

export type CommandCenterTrends = {
  b2bPipeline: string;
  fleetYield: string;
  portfolioCapacity: string;
  retailVolume: string;
};

export type CommandCenterKpi = {
  label: string;
  value: string;
  detail: string;
  company: Exclude<DisplayCompany, "All Companies"> | "Shared";
  status: "healthy" | "watch" | "critical";
};

export type CommandCenterAlert = {
  id: string;
  title: string;
  detail: string;
  company: Exclude<DisplayCompany, "All Companies"> | "Shared";
  owner: string;
  due: string;
  priority: "Critical" | "Warning" | "Info";
  action: string;
};

export type CommandCenterProject = {
  id: string;
  customer: string;
  company: Exclude<DisplayCompany, "All Companies">;
  stage: string;
  value: string;
  owner: string;
  nextStep: string;
  due: string;
};

export type CommandCenterFollowUp = {
  id: string;
  contact: string;
  company: Exclude<DisplayCompany, "All Companies">;
  type: string;
  owner: string;
  daysOverdue: number;
  nextAction: string;
};

export type CommandCenterDeadline = {
  id: string;
  title: string;
  company: Exclude<DisplayCompany, "All Companies"> | "Shared";
  date: string;
  owner: string;
  impact: string;
};

export type CommandCenterData = {
  source: "demo" | "workbook";
  updatedAt: string;
  metrics: CommandCenterMetrics;
  trends: CommandCenterTrends;
  revenueSplit: RevenueSplitMonth[];
  events: GlobalEvent[];
  companies: DisplayCompany[];
  kpis: CommandCenterKpi[];
  alerts: CommandCenterAlert[];
  projects: CommandCenterProject[];
  followUps: CommandCenterFollowUp[];
  deadlines: CommandCenterDeadline[];
};

/**
 * Derives executive metrics from shared demo modules so UI numbers stay aligned
 * with CRM, telemetry, and retail order sources.
 */
export function computeCommandCenterMetrics(): CommandCenterMetrics {
  const b2bPipeline = crmPipelineData
    .filter((p) => p.entityBrand === "Solar3K")
    .reduce((sum, p) => sum + p.projectValue, 0);

  const fleetYield =
    Math.round(
      telemetrySitesData
        .filter((s) => s.entityBrand === "Yellow Star" && s.inverterStatus === "Online")
        .reduce((sum, s) => sum + s.productionKw, 0) * 10,
    ) / 10;

  const portfolioCapacity = Math.round(telemetrySitesData.reduce((sum, s) => sum + s.systemSizeKw, 0) * 10) / 10;

  const retailVolume = ordersData
    .filter((o) => o.entityBrand === "Solar2SK" && o.status !== "Cancelled")
    .reduce((sum, o) => sum + Math.max(1, Math.round(o.systemSizeKw || 1)), 0);

  return { b2bPipeline, fleetYield, portfolioCapacity, retailVolume };
}

export const defaultCommandCenterTrends: CommandCenterTrends = {
  b2bPipeline: "+18.4%",
  fleetYield: "+3.1%",
  portfolioCapacity: "+120 kW",
  retailVolume: "+9 units",
};

const openPipelineValue = crmPipelineData.reduce((sum, p) => sum + p.projectValue, 0);
const metrics = computeCommandCenterMetrics();

export const demoCommandCenterData: CommandCenterData = {
  source: "demo",
  updatedAt: "2026-06-13T18:00:00.000-05:00",
  metrics,
  trends: defaultCommandCenterTrends,
  revenueSplit: revenueSplitData,
  events: globalEventsData,
  companies: ["All Companies", DEMO_ORG.portfolio, DEMO_ORG.retail, DEMO_ORG.commercial],
  kpis: [
    {
      label: "Total Combined Revenue",
      value: "$680k",
      detail: "YTD combined revenue ledger across retail, commercial consulting, and portfolio assets",
      company: "Shared",
      status: "healthy",
    },
    {
      label: "Active C&I Pipeline",
      value: `${activeCiPipelineMw.toFixed(2)} MW`,
      detail: "In structural design or awaiting interconnection",
      company: "Shared",
      status: "watch",
    },
    {
      label: "Active DIY Order Volume",
      value: String(pendingOrderCount),
      detail: "Pending Solar 2SK backup kit orders",
      company: DEMO_ORG.retail,
      status: "watch",
    },
    {
      label: "Grid Efficiency Index",
      value: `${gridEfficiencyIndex}%`,
      detail: `${liveSitesCount} live sites monitored via SolarEdge`,
      company: "Shared",
      status: gridEfficiencyIndex >= 90 ? "healthy" : "watch",
    },
  ],
  alerts: [
    {
      id: "alert-001",
      title: "SSL renewal required",
      detail: `${websiteHealthData.filter((w) => w.status === "URGENT").length} domains flagged URGENT - solar2sk.com certificate expires soon`,
      company: DEMO_ORG.retail,
      owner: "Alex Morgan",
      due: "Jun 20",
      priority: "Critical",
      action: "Renew certificate in DreamHost",
    },
    {
      id: "alert-002",
      title: "Software overhead review",
      detail: `$${totalMonthlySpend}/mo across ${urgentAlertsCount + 4} SaaS subscriptions`,
      company: "Shared",
      owner: "Alex Morgan",
      due: "Jul 1",
      priority: "Warning",
      action: "Review renewal dates in Systems",
    },
    {
      id: "alert-003",
      title: "Low inventory - LiFePO4 batteries",
      detail: "BAT-LIFEPO4-5K at 8 units (reorder point: 12)",
      company: DEMO_ORG.retail,
      owner: "Jordan Lee",
      due: "Today",
      priority: "Critical",
      action: "Trigger automated PO to Battery Supply Co",
    },
    {
      id: "alert-004",
      title: "Collin County bid follow-up",
      detail: `$185k commercial bid awaiting client signature`,
      company: DEMO_ORG.commercial,
      owner: "Alex Morgan",
      due: "Jun 18",
      priority: "Warning",
      action: "DocuSign reminder via Zapier",
    },
  ],
  projects: crmPipelineData.slice(0, 6).map((p) => ({
    id: p.id,
    customer: p.clientName,
    company: brandToDisplayCompany(p.entityBrand),
    stage: p.pipelineStage,
    value: `$${p.projectValue.toLocaleString()}`,
    owner: "Alex Morgan",
    nextStep: p.pipelineStage === "New Lead" ? "Initial contact" : "Advance pipeline stage",
    due: "Jul 15",
  })),
  followUps: [
    {
      id: "follow-001",
      contact: "Marcus Vance",
      company: DEMO_ORG.retail,
      type: "DIY kit order",
      owner: "Alex Morgan",
      daysOverdue: 1,
      nextAction: "Confirm inverter wiring support ticket",
    },
    {
      id: "follow-002",
      contact: "Collin County Utility",
      company: DEMO_ORG.commercial,
      type: "Commercial bid",
      owner: "Alex Morgan",
      daysOverdue: 2,
      nextAction: "DocuSign signature chase",
    },
    {
      id: "follow-003",
      contact: "Garrett Miller",
      company: DEMO_ORG.retail,
      type: "Pending order",
      owner: "Jordan Lee",
      daysOverdue: 0,
      nextAction: "Anenji inverter allocation update",
    },
  ],
  deadlines: [
    {
      id: "deadline-001",
      title: "Collin County permit hearing",
      company: DEMO_ORG.commercial,
      date: "Jun 16",
      owner: "TX Permit Solutions",
      impact: `$${openPipelineValue.toLocaleString()} pipeline`,
    },
    {
      id: "deadline-002",
      title: "DreamHost renewal check",
      company: "Shared",
      date: "Jul 13",
      owner: "Alex Morgan",
      impact: "Hosting and domains",
    },
    {
      id: "deadline-003",
      title: "Hunt County commissioning walkthrough",
      company: DEMO_ORG.portfolio,
      date: "Jun 23",
      owner: "Alex Morgan",
      impact: "60kW microgrid go-live",
    },
  ],
};

/** Alias for container/route imports. */
export const commandCenterData = demoCommandCenterData;
