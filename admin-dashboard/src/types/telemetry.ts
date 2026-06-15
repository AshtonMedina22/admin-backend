export type TelemetryEntityCompany = "3SK" | "YSP";

export type SolarEdgeSystemStatus = "ACTIVE_GENERATING" | "BATTERY_ONLY" | "SYSTEM_FAULT" | "OFFLINE";

export interface SolarEdgeHardwareIdentity {
  model: string;
  serialNumber: string;
  firmwareVersion?: string;
}

export interface SolarEdgePowerFlowKw {
  pvGeneration: number;
  consumptionLoad: number;
  gridFeedIn: number;
  storageChargeLevelPercentage?: number;
}

export interface SolarEdgeTelemetryLog {
  lifetimeEnergyWh: number;
  todayEnergyWh: number;
  efficiencyRatingPercentage?: number;
  inverterTemperatureCelsius?: number;
}

export interface SolarEdgeDeviceTelemetry {
  siteId: string;
  inverterId: string;
  name: string;
  associatedAsset: string;
  entityCompany: TelemetryEntityCompany;
  hardware: SolarEdgeHardwareIdentity;
  currentPowerFlowKw: SolarEdgePowerFlowKw;
  telemetryLogs: SolarEdgeTelemetryLog;
  systemStatus: SolarEdgeSystemStatus;
  lastTelemetryPing: string;
}

export type SolarEdgeDevice = SolarEdgeDeviceTelemetry;

export interface SolarEdgeEnvironmentalImpact {
  co2SavedLbs: number;
  equivalentTreesPlanted: number;
  lightBulbDaysPowered: number;
}

export type EnvironmentalImpact = SolarEdgeEnvironmentalImpact;

export interface SolarEdgeIntegrationConfig {
  baseUrl: "https://monitoringapi.solaredge.com";
  siteId: string;
  apiKeyEnv: "SOLAREDGE_API_KEY";
  pollingIntervalMs: number;
  revalidateSeconds: number;
}
