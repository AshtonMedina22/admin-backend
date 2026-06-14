"use client";

import { AlertTriangle, Cpu } from "lucide-react";

import { EntityBrandBadge } from "@/components/dashboard/entity-brand-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TelemetrySimulatorControl, useTelemetrySimulation } from "./telemetry-simulator";

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border bg-background px-3 py-2">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="font-medium text-sm tabular-nums">{value}</span>
    </div>
  );
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
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="grid gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle>Hunt County Microgrid Array Core</CardTitle>
                  <EntityBrandBadge brand="Cedar Grid Assets" />
                </div>
                <CardDescription>Cedar Grid Assets Operations</CardDescription>
              </div>
              <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-300">
                <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
                ACTIVE GENERATING
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3">
            <MetricRow label="Current Array Generation" value={`${liveYield.toFixed(1)} kW`} />
            <MetricRow label="Local Consumption Load" value={`${consumptionKw} kW`} />
            <MetricRow label="Net Grid Export Feed-In" value={`${netExport} kW (Surplus to Oncor Grid)`} />
            <MetricRow label="Inverter Efficiency" value={`${efficiency}%`} />
            <MetricRow label="Battery Storage Capacity" value="92.5% (LiFePO4 Core Bank)" />

            <div className="mt-2 rounded-md border bg-muted/35 p-3 text-sm">
              <div className="mb-2 flex items-center gap-2 font-medium">
                <Cpu className="size-4" />
                Hardware Data
              </div>
              <p className="text-muted-foreground">
                SolarEdge SE66.6K-USRW | SN: 7E120934-21B | Core Temp: 41.2°C | Lifetime Yield: 184.5 MWh
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="grid gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle>Frisco Commercial Array (Inverter A)</CardTitle>
                  <EntityBrandBadge brand="Summit C&I Group" />
                </div>
                <CardDescription>Summit C&I Group Client Operations</CardDescription>
              </div>
              <Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/15 dark:text-amber-300">
                <AlertTriangle className="size-3 animate-pulse" />
                SYSTEM FAULT
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3">
            <MetricRow label="Current Array Generation" value="0.0 kW" />
            <MetricRow label="Local Consumption Load" value="45.1 kW" />
            <MetricRow
              label="Net Utility Grid Draw"
              value="-45.1 kW (System drawing from grid to cover business facility load)"
            />

            <div className="mt-2 rounded-md border bg-muted/35 p-3 text-sm">
              <div className="mb-2 flex items-center gap-2 font-medium">
                <Cpu className="size-4" />
                Hardware Data & Telemetry Error Output
              </div>
              <p className="text-muted-foreground">
                SolarEdge SE100K-USR4 | SN: 7F003821-99C | Core Temp: 22.8°C | Last Ping: 18 minutes ago (Stale).
              </p>
            </div>

            <pre className="overflow-x-auto rounded-md border bg-background p-3 font-mono text-amber-700 text-xs dark:text-amber-300">
              {`[ERR-CODE: 18x2] - Utility Isolation Timeout Fault. Check Oncor Interconnection Circuit Line Balance Status.`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
