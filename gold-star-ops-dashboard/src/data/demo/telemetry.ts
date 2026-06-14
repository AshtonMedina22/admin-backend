import type { EntityBrand } from "./types";

export interface TelemetrySite {
  id: string;
  siteName: string;
  entityBrand: EntityBrand;
  systemSizeKw: number;
  productionKw: number;
  forecastKw: number;
  efficiencyPct: number;
  inverterStatus: "Online" | "Fault" | "Offline";
  lastPing: string;
  faultCode?: string;
}

export const telemetrySitesData: TelemetrySite[] = [
  {
    id: "tel-001",
    siteName: "Hunt County Microgrid",
    entityBrand: "Yellow Star",
    systemSizeKw: 60,
    productionKw: 52.4,
    forecastKw: 55.8,
    efficiencyPct: 94,
    inverterStatus: "Online",
    lastPing: "2 min ago",
  },
  {
    id: "tel-002",
    siteName: "DFW Retail Plaza Phase II",
    entityBrand: "Solar3K",
    systemSizeKw: 120,
    productionKw: 0,
    forecastKw: 0,
    efficiencyPct: 0,
    inverterStatus: "Offline",
    lastPing: "Pre-commissioning",
  },
  {
    id: "tel-003",
    siteName: "Collin County Utility",
    entityBrand: "Solar3K",
    systemSizeKw: 150,
    productionKw: 0,
    forecastKw: 0,
    efficiencyPct: 0,
    inverterStatus: "Offline",
    lastPing: "Design phase",
  },
  {
    id: "tel-004",
    siteName: "Wylie Industrial Microgrid",
    entityBrand: "Yellow Star",
    systemSizeKw: 300,
    productionKw: 245.2,
    forecastKw: 268.0,
    efficiencyPct: 91.5,
    inverterStatus: "Online",
    lastPing: "1 min ago",
  },
  {
    id: "tel-005",
    siteName: "TechPlex Roof Array",
    entityBrand: "Solar3K",
    systemSizeKw: 45,
    productionKw: 38.1,
    forecastKw: 40.5,
    efficiencyPct: 94.1,
    inverterStatus: "Online",
    lastPing: "3 min ago",
  },
];

export const gridEfficiencyIndex = Math.round(
  telemetrySitesData.filter((s) => s.inverterStatus === "Online").reduce((sum, s) => sum + s.efficiencyPct, 0) /
    telemetrySitesData.filter((s) => s.inverterStatus === "Online").length,
);

export const liveSitesCount = telemetrySitesData.filter((s) => s.inverterStatus === "Online").length;
