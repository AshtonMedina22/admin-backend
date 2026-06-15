"use client";

import { AlertTriangle, Cpu } from "lucide-react";

import { EntityBrandBadge } from "@/components/dashboard/entity-brand-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { activeTelemetryAssets, aggregateEnvironmentalImpact } from "@/data/demo/telemetry";
import { dashCardClass, dashCardContentClass, dashCardHeaderClass } from "@/lib/dashboard-ui";
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
    fetch(\`\${baseUrl}/site/\${siteId}/envBenefits?api_key=\${apiKey}\`, { next: { revalidate: 3600 } }),
  ]);

  if (!powerFlow.ok || !overview.ok || !inventory.ok) {
    throw new Error("SolarEdge telemetry provider unavailable");
  }

  return normalizeSolarEdgePayload({
    powerFlow: await powerFlow.json(),
    overview: await overview.json(),
    inventory: await inventory.json(),
    envBenefits: envBenefits.ok ? await envBenefits.json() : null,
  });
}`;

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-[#22314a] bg-[#0b1626]/80 px-3 py-2">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className="font-medium text-slate-100 text-sm tabular-nums">{value}</span>
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
        <Card className={dashCardClass}>
          <CardHeader className={dashCardHeaderClass}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="grid gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle>Hunt County Microgrid Array Core</CardTitle>
                  <EntityBrandBadge brand="YSP" />
                </div>
                <CardDescription>YSP Operations</CardDescription>
              </div>
              <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-300">
                <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
                ACTIVE GENERATING
              </Badge>
            </div>
          </CardHeader>
          <CardContent className={cn("grid gap-3", dashCardContentClass)}>
            <MetricRow label="Current Array Generation" value={`${liveYield.toFixed(1)} kW`} />
            <MetricRow label="Local Consumption Load" value={`${consumptionKw.toFixed(1)} kW`} />
            <MetricRow label="Net Grid Export Feed-In" value={`${netExport.toFixed(1)} kW (Surplus to Oncor Grid)`} />
            <MetricRow label="Inverter Efficiency" value={`${efficiency}%`} />
            <MetricRow label="Battery Storage Capacity" value="92.5% (LiFePO4 Core Bank)" />

            <div className="mt-2 rounded-md border border-[#22314a] bg-[#122039]/70 p-3 text-sm">
              <div className="mb-2 flex items-center gap-2 font-medium">
                <Cpu className="size-4" />
                Hardware Data
              </div>
              <p className="text-slate-400">Array Matrix: 4x SolarEdge SE100K Units</p>
            </div>
          </CardContent>
        </Card>

        <Card className={dashCardClass}>
          <CardHeader className={dashCardHeaderClass}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="grid gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle>Frisco Commercial Array (Inverter A)</CardTitle>
                  <EntityBrandBadge brand="3SK" />
                </div>
                <CardDescription>3SK Client Operations</CardDescription>
              </div>
              <Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/15 dark:text-amber-300">
                <AlertTriangle className="size-3 animate-pulse" />
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

            <div className="mt-2 rounded-md border border-[#22314a] bg-[#122039]/70 p-3 text-sm">
              <div className="mb-2 flex items-center gap-2 font-medium">
                <Cpu className="size-4" />
                Hardware Data & Telemetry Error Output
              </div>
              <p className="text-slate-400">
                SolarEdge SE100K-USR4 | SN: 7F003821-99C | Core Temp: 22.8°C | Last Ping: 18 minutes ago (Stale).
              </p>
            </div>

            <pre className="overflow-x-auto rounded-md border border-amber-500/20 bg-amber-950/20 p-3 font-mono text-amber-200 text-xs">
              {`[ERR-CODE: 18x2] - Utility Isolation Timeout Fault. Check Oncor Interconnection Circuit Line Balance Status.`}
            </pre>
          </CardContent>
        </Card>
      </div>

      <Card className={cn("border-cyan-500 border-l-4", dashCardClass)}>
        <CardHeader className={dashCardHeaderClass}>
          <CardTitle>SolarEdge Telemetry API Wiring Spec</CardTitle>
          <CardDescription>
            Verified demo contract for how the Enterprise telemetry surface would connect to SolarEdge Monitoring API
            data from a secure backend worker.
          </CardDescription>
        </CardHeader>
        <CardContent className={cn("grid gap-3", dashCardContentClass)}>
          <div className="grid gap-2 rounded-lg border border-zinc-900 bg-zinc-950 p-3 font-mono text-cyan-400/90 text-xs leading-relaxed">
            <p>
              <strong className="text-zinc-200">Accuracy check:</strong> SolarEdge exposes site overview/current power,
              power-flow, inventory, inverter technical data, meter/sensor data, and environmental-benefits endpoints.
              API keys belong on a server route or scheduled worker, not in browser JavaScript.
            </p>
            <p>
              <strong className="text-zinc-200">Production path:</strong> poll{" "}
              <span className="text-cyan-300">/site/&lt;siteId&gt;/currentPowerFlow</span>,{" "}
              <span className="text-cyan-300">/overview</span>, <span className="text-cyan-300">/inventory</span>,
              inverter technical-data endpoints, and <span className="text-cyan-300">/envBenefits</span>; normalize
              units into one typed dashboard payload; cache/revalidate server-side; then render only sanitized telemetry
              records in this tab.
            </p>
          </div>
          <pre className="max-h-96 overflow-x-auto rounded-lg border border-zinc-900 bg-black/80 p-4 font-mono text-[11px] text-cyan-200 leading-relaxed">
            <code>{SOLAREDGE_TELEMETRY_CODE}</code>
          </pre>
          <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-3 font-mono text-xs text-zinc-400 leading-relaxed">
            <strong className="text-zinc-200">Server fetch contract:</strong> SolarEdge Monitoring API examples use an
            API key in the query string, so the key must live in a backend route, server action, or scheduled worker.
            The dashboard should only receive the normalized payload after endpoint responses are validated and cached.
          </div>
          <pre className="max-h-80 overflow-x-auto rounded-lg border border-zinc-900 bg-black/80 p-4 font-mono text-[11px] text-cyan-200 leading-relaxed">
            <code>{SOLAREDGE_FETCH_CODE}</code>
          </pre>
        </CardContent>
      </Card>

      <Card className={cn("border-emerald-500 border-l-4", dashCardClass)}>
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
              <div key={asset.inverterId} className="rounded-lg border border-zinc-900 bg-zinc-950 p-3">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm">{asset.associatedAsset}</p>
                    <p className="font-mono text-slate-400 text-xs">
                      {asset.hardware.model} · SN {asset.hardware.serialNumber}
                    </p>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">
                    {asset.entityCompany}
                  </Badge>
                </div>
                <div className="grid gap-2 font-mono text-xs">
                  <MetricRow label="PV generation" value={`${asset.currentPowerFlowKw.pvGeneration.toFixed(1)} kW`} />
                  <MetricRow
                    label="Facility load"
                    value={`${asset.currentPowerFlowKw.consumptionLoad.toFixed(1)} kW`}
                  />
                  <MetricRow label="Grid feed / draw" value={`${asset.currentPowerFlowKw.gridFeedIn.toFixed(1)} kW`} />
                  <MetricRow label="Lifetime energy" value={formatEnergy(asset.telemetryLogs.lifetimeEnergyWh)} />
                  <MetricRow label="Status" value={asset.systemStatus.replaceAll("_", " ")} />
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-3 font-mono text-xs text-zinc-400 leading-relaxed">
            <strong className="text-zinc-200">Environmental rollup:</strong>{" "}
            {aggregateEnvironmentalImpact.co2SavedLbs.toLocaleString()} lbs CO₂ avoided ·{" "}
            {aggregateEnvironmentalImpact.equivalentTreesPlanted.toLocaleString()} tree-equivalent offset ·{" "}
            {aggregateEnvironmentalImpact.lightBulbDaysPowered.toLocaleString()} light-bulb days powered.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
