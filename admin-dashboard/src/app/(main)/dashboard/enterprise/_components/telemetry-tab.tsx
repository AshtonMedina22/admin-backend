"use client";

import { AlertTriangle, Cpu } from "lucide-react";

import { EntityBrandBadge } from "@/components/dashboard/entity-brand-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { activeTelemetryAssets, aggregateEnvironmentalImpact } from "@/data/demo/telemetry";
import { dashCardContentClass, dashCardHeaderClass, dashPlatformCardClass, dashSurfaceCardClass } from "@/lib/dashboard-ui";
import {
  dashCodeBlockClass,
  dashKpiValueClass,
  dashProseClass,
  entityBadgeClassForLabel,
  entityBrandStyles,
  statusStyles,
} from "@/lib/entity-brand";
import { cn } from "@/lib/utils";

import { TelemetrySimulatorControl, useTelemetrySimulation } from "./telemetry-simulator";

const SOLAREDGE_TELEMETRY_CODE = `// src/types/telemetry.ts
export interface SolarEdgeIntegrationConfig {
  baseUrl: "https://monitoringapi.solaredge.com";
  siteId: string;
  apiKeyEnv: "SOLAREDGE_API_KEY";
  pollingIntervalMs: number;
  revalidateSeconds: number;
}

export interface SolarEdgeDeviceTelemetry {
  siteId: string;
  inverterId: string;
  name: string;
  associatedAsset: string;
  entityCompany: "3SK" | "YSP";
  hardware: {
    model: string;
    serialNumber: string;
    firmwareVersion?: string;
  };
  currentPowerFlowKw: {
    pvGeneration: number;
    consumptionLoad: number;
    gridFeedIn: number;
    storageChargeLevelPercentage?: number;
  };
  telemetryLogs: {
    lifetimeEnergyWh: number;
    todayEnergyWh: number;
    efficiencyRatingPercentage?: number;
    inverterTemperatureCelsius?: number;
  };
  systemStatus: "ACTIVE_GENERATING" | "BATTERY_ONLY" | "SYSTEM_FAULT" | "OFFLINE";
  lastTelemetryPing: string;
}

export interface SolarEdgeEnvironmentalImpact {
  co2SavedLbs: number;
  equivalentTreesPlanted: number;
  lightBulbDaysPowered: number;
}`;

const SOLAREDGE_FETCH_CODE = `// Server-only worker or Route Handler. Never expose SOLAREDGE_API_KEY to the browser.
export async function fetchSolarEdgeTelemetry(siteId: string) {
  const baseUrl = "https://monitoringapi.solaredge.com";
  const apiKey = process.env.SOLAREDGE_API_KEY;
  if (!apiKey) throw new Error("Missing SOLAREDGE_API_KEY");

  const [powerFlow, overview, inventory, envBenefits] = await Promise.all([
    fetch(\`\${baseUrl}/site/\${siteId}/currentPowerFlow?api_key=\${apiKey}\`, { next: { revalidate: 60 } }),
    fetch(\`\${baseUrl}/site/\${siteId}/overview?api_key=\${apiKey}\`, { next: { revalidate: 60 } }),
    fetch(\`\${baseUrl}/site/\${siteId}/inventory?api_key=\${apiKey}\`, { next: { revalidate: 300 } }),
    fetch(\`\${baseUrl}/site/\${siteId}/envBenefits?api_key=\${apiKey}\`, { next: { revalidate: 3600 } })
      .then((response) => (response.ok ? response.json() : null))
      .catch(() => null),
  ]);

  if (!powerFlow.ok || !overview.ok || !inventory.ok) {
    throw new Error("Core SolarEdge telemetry provider unavailable");
  }

  return normalizeSolarEdgePayload({
    powerFlow: await powerFlow.json(),
    overview: await overview.json(),
    inventory: await inventory.json(),
    envBenefits,
  });
}`;

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/40 px-3 py-2">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className={cn(dashKpiValueClass, "text-sm")}>{value}</span>
    </div>
  );
}

function formatEnergy(valueWh: number) {
  if (valueWh >= 1_000_000) return `${(valueWh / 1_000_000).toFixed(1)} MWh`;
  return `${(valueWh / 1_000).toFixed(1)} kWh`;
}

export function TelemetryTab() {
  const { isSimulating, setIsSimulating, liveYield, efficiency, netExport, consumptionKw } = useTelemetrySimulation();

  return (
    <div className="flex flex-col gap-4">
      <TelemetrySimulatorControl
        isSimulating={isSimulating}
        onSimulatingChange={setIsSimulating}
        liveYield={liveYield}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className={cn(dashSurfaceCardClass, entityBrandStyles.yellowStar.accentBar)}>
          <CardHeader className={dashCardHeaderClass}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="grid gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle>Hunt County Microgrid Array Core</CardTitle>
                  <EntityBrandBadge brand="YSP" />
                </div>
                <CardDescription>YSP Operations</CardDescription>
              </div>
              <Badge variant="outline" className={statusStyles.live}>
                <span className="size-2 animate-pulse rounded-full bg-[var(--status-live)]" />
                ACTIVE GENERATING
              </Badge>
            </div>
          </CardHeader>
          <CardContent className={cn("grid gap-3", dashCardContentClass)}>
            <MetricRow
              label="Current Array Generation"
              value={`${liveYield.toFixed(1)} kW`}
            />
            <MetricRow label="Local Consumption Load" value={`${consumptionKw.toFixed(1)} kW`} />
            <MetricRow
              label="Isolated Microgrid Output"
              value={`${netExport.toFixed(1)} kW (local load and battery bank during commissioning)`}
            />
            <MetricRow label="Inverter Efficiency" value={`${efficiency}%`} />
            <MetricRow label="Battery Storage Capacity" value="92.5% (LiFePO4 Core Bank)" />

            <div className="mt-1 rounded-md border border-border bg-muted/40 p-3 text-xs">
              <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                <Cpu className={cn("size-4", entityBrandStyles.yellowStar.icon)} />
                Hardware Data
              </div>
              <p className="text-muted-foreground">Array Core: SolarEdge SE66.6K-USRW paired to 60 kW microgrid bus</p>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(dashSurfaceCardClass, entityBrandStyles.solar3k.accentBar)}>
          <CardHeader className={dashCardHeaderClass}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="grid gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle>Frisco Commercial Array (Inverter A)</CardTitle>
                  <EntityBrandBadge brand="3SK" />
                </div>
                <CardDescription>3SK Client Operations</CardDescription>
              </div>
              <Badge variant="outline" className={statusStyles.warning}>
                <AlertTriangle className="size-3" />
                SYSTEM FAULT
              </Badge>
            </div>
          </CardHeader>
          <CardContent className={cn("grid gap-3", dashCardContentClass)}>
            <MetricRow label="Current Array Generation" value="0.0 kW" />
            <MetricRow label="Local Consumption Load" value="45.1 kW" />
            <MetricRow
              label="Net Utility Grid Draw"
              value="-45.1 kW (System drawing from grid to cover business facility load)"
            />

            <div className="mt-1 rounded-md border border-border bg-muted/40 p-3 text-xs">
              <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                <Cpu className={cn("size-4", entityBrandStyles.solar3k.icon)} />
                Hardware Data & Telemetry Error Output
              </div>
              <p className="text-muted-foreground">
                SolarEdge Synergy three-phase inverter, 120 kW class | SN: 7F003821-99C | Core Temp: 22.8°C | Last
                Ping: 18 minutes ago (Stale).
              </p>
            </div>

            <pre className={cn(statusStyles.critical, "rounded-md border p-3 font-mono text-xs leading-relaxed")}>
              {`[ERR-CODE: 18x86] - PV isolation fault. Dispatch certified PV installer; verify isolation before reconnecting affected string.`}
            </pre>
          </CardContent>
        </Card>
      </div>

      <Card className={dashPlatformCardClass}>
        <CardHeader className={dashCardHeaderClass}>
          <CardTitle>SolarEdge Telemetry API Wiring Spec</CardTitle>
          <CardDescription>
            Verified demo contract for how the Enterprise telemetry surface would connect to SolarEdge Monitoring API
            data from a secure backend worker.
          </CardDescription>
        </CardHeader>
        <CardContent className={cn("grid gap-3", dashCardContentClass)}>
          <div className={cn("grid gap-2 text-[11px] leading-relaxed", dashCodeBlockClass)}>
            <p>
              <strong className="text-foreground">Accuracy check:</strong> SolarEdge exposes site overview/current
              power, power-flow, inventory, inverter technical data, meter/sensor data, and environmental-benefits
              endpoints. API keys belong on a server route or scheduled worker, not in browser JavaScript.
            </p>
            <p>
              <strong className="text-foreground">Production path:</strong> poll{" "}
              <span className="font-mono text-foreground">/site/&lt;siteId&gt;/currentPowerFlow</span>,{" "}
              <span className="font-mono text-foreground">/overview</span>,{" "}
              <span className="font-mono text-foreground">/inventory</span>, inverter technical-data endpoints, and{" "}
              <span className="font-mono text-foreground">/envBenefits</span>; normalize units into one typed
              dashboard payload; cache/revalidate server-side; then render only sanitized telemetry records in this tab.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className={cn("max-h-[360px] overflow-y-auto rounded-lg border border-border bg-muted/40 p-3", dashCodeBlockClass)}>
              <div className="mb-2 font-semibold text-[10px] text-muted-foreground uppercase tracking-wide">
                src/types/telemetry.ts
              </div>
              <pre className="whitespace-pre-wrap text-[11px]">
                <code>{SOLAREDGE_TELEMETRY_CODE}</code>
              </pre>
            </div>
            <div className={cn("max-h-[360px] overflow-y-auto rounded-lg border border-border bg-muted/40 p-3", dashCodeBlockClass)}>
              <div className="mb-2 font-semibold text-[10px] text-muted-foreground uppercase tracking-wide">
                Server API Route Fetch Handler
              </div>
              <p className={cn("mb-3", dashProseClass)}>
                <strong>Server fetch contract:</strong> SolarEdge API keys stay in a backend route, server action, or
                scheduled worker. The dashboard only receives normalized telemetry after validation and caching.
              </p>
              <pre className="whitespace-pre-wrap text-[11px]">
                <code>{SOLAREDGE_FETCH_CODE}</code>
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={dashSurfaceCardClass}>
        <CardHeader className={dashCardHeaderClass}>
          <CardTitle>Normalized Live Data Mock Payload</CardTitle>
          <CardDescription>
            Deterministic demo rows using the same typed SolarEdge payload shape the backend worker would emit after
            polling and normalization.
          </CardDescription>
        </CardHeader>
        <CardContent className={cn("grid gap-3", dashCardContentClass)}>
          <div className="grid gap-3 lg:grid-cols-2">
            {activeTelemetryAssets.map((asset) => (
              <div key={asset.inverterId} className="rounded-lg border border-border bg-muted/40 p-3">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{asset.associatedAsset}</p>
                    <p className="font-mono text-muted-foreground text-xs">
                      {asset.hardware.model} · SN {asset.hardware.serialNumber}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn("font-mono text-xs", entityBadgeClassForLabel(asset.entityCompany))}
                  >
                    {asset.entityCompany}
                  </Badge>
                </div>
                <div className="grid gap-2 font-mono text-xs">
                  {[
                    ["PV generation", `${asset.currentPowerFlowKw.pvGeneration.toFixed(1)} kW`],
                    ["Facility load", `${asset.currentPowerFlowKw.consumptionLoad.toFixed(1)} kW`],
                    ["Grid feed / draw", `${asset.currentPowerFlowKw.gridFeedIn.toFixed(1)} kW`],
                    ["Lifetime energy", formatEnergy(asset.telemetryLogs.lifetimeEnergyWh)],
                    ["Status", asset.systemStatus.replaceAll("_", " ")],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-4 rounded-md border border-border bg-card px-3 py-2"
                    >
                      <span className="text-muted-foreground">{label}</span>
                      <span className={cn(dashKpiValueClass, "text-sm")}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-md border border-border bg-muted/40 p-3">
            <p className={dashProseClass}>
              <strong>Environmental rollup:</strong> {aggregateEnvironmentalImpact.co2SavedLbs.toLocaleString()} lbs CO₂
              avoided · {aggregateEnvironmentalImpact.equivalentTreesPlanted.toLocaleString()} tree-equivalent offset ·{" "}
              {aggregateEnvironmentalImpact.lightBulbDaysPowered.toLocaleString()} light-bulb days powered.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
