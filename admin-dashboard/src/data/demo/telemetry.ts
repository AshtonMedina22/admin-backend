import type { EnvironmentalImpact, SolarEdgeDevice } from "@/types/telemetry";

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

export const activeTelemetryAssets: SolarEdgeDevice[] = [
  {
    siteId: "site-ysp-hunt-60kw",
    inverterId: "se-inv-60kw-hunt-core-01",
    name: "Inverter Array Core 01",
    associatedAsset: "Hunt County 60kW Microgrid",
    entityCompany: "YSP",
    hardware: {
      model: "SolarEdge SE66.6K-USRW",
      serialNumber: "7E120934-21B",
      firmwareVersion: "v4.19.42",
    },
    currentPowerFlowKw: {
      pvGeneration: 48.2,
      storageChargeLevelPercentage: 92.5,
      consumptionLoad: 12.4,
      gridFeedIn: 35.8,
    },
    telemetryLogs: {
      lifetimeEnergyWh: 184_592_000,
      todayEnergyWh: 242_100,
      efficiencyRatingPercentage: 98.1,
      inverterTemperatureCelsius: 41.2,
    },
    systemStatus: "ACTIVE_GENERATING",
    lastTelemetryPing: "2026-06-14T17:04:36.000Z",
  },
  {
    siteId: "site-3sk-frisco-commercial-array",
    inverterId: "se-inv-frisco-commercial-a",
    name: "Primary Commercial Gateway",
    associatedAsset: "Frisco Commercial Array (Inverter A)",
    entityCompany: "3SK",
    hardware: {
      model: "SolarEdge Synergy three-phase inverter (120 kW class)",
      serialNumber: "7F003821-99C",
      firmwareVersion: "v4.21.05",
    },
    currentPowerFlowKw: {
      pvGeneration: 0,
      storageChargeLevelPercentage: 0,
      consumptionLoad: 45.1,
      gridFeedIn: -45.1,
    },
    telemetryLogs: {
      lifetimeEnergyWh: 12_409_000,
      todayEnergyWh: 0,
      efficiencyRatingPercentage: 0,
      inverterTemperatureCelsius: 22.8,
    },
    systemStatus: "SYSTEM_FAULT",
    lastTelemetryPing: "2026-06-14T16:46:36.000Z",
  },
];

export const aggregateEnvironmentalImpact: EnvironmentalImpact = {
  co2SavedLbs: 142_095.4,
  equivalentTreesPlanted: 1_842,
  lightBulbDaysPowered: 549_200,
};
