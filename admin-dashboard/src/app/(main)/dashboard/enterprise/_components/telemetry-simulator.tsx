"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { dashInfoBannerClass } from "@/lib/dashboard-ui";
import { dashKpiValueClass, entityBrandStyles, statusStyles } from "@/lib/entity-brand";
import { cn } from "@/lib/utils";

const BASELINE_GENERATION_KW = 48.2;
const BASELINE_CONSUMPTION_KW = 12.4;
const TICK_MS = 2000;
const GENERATION_MIN_KW = 45.0;
const GENERATION_MAX_KW = 55.8;
const GENERATION_VARIANCE_KW = 0.9;
const CONSUMPTION_VARIANCE_KW = 0.3;

function clamp(value: number, min: number, max: number) {
  return parseFloat(Math.min(max, Math.max(min, value)).toFixed(1));
}

function drift(value: number, variance: number, min: number, max: number) {
  const delta = (Math.random() * 2 - 1) * variance;
  return clamp(value + delta, min, max);
}

type TelemetrySimulatorProps = {
  isSimulating: boolean;
  onSimulatingChange: (value: boolean) => void;
  liveYield: number;
};

export function TelemetrySimulatorControl({ isSimulating, onSimulatingChange, liveYield }: TelemetrySimulatorProps) {
  return (
    <div className="grid gap-3 rounded-lg border border-border bg-muted/40 p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Switch
            id="solaredge-sim"
            checked={isSimulating}
            onCheckedChange={onSimulatingChange}
            className="data-[state=checked]:bg-[var(--status-live)]"
          />
          <div>
            <Label htmlFor="solaredge-sim" className="font-medium text-foreground text-sm">
              Simulate SolarEdge / SCADA Polling Loop
            </Label>
            <p className="text-muted-foreground text-xs">
              Live grid telemetry:{" "}
              <span
                className={cn(
                  dashKpiValueClass,
                  "text-base",
                  isSimulating ? entityBrandStyles.solar2sk.text : "text-foreground",
                )}
              >
                {liveYield.toFixed(1)} kW
              </span>{" "}
              · 2-second normalized inverter/SCADA payload stream
            </p>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded border px-2 py-1 font-mono text-xs uppercase tracking-wider",
            isSimulating ? statusStyles.live : "border-border bg-muted/40 text-muted-foreground",
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              isSimulating ? "animate-pulse bg-[var(--status-live)]" : "bg-muted-foreground",
            )}
          />
          {isSimulating ? "Streaming loop active" : "Stream paused"}
        </span>
      </div>
      <div className={cn(dashInfoBannerClass, "font-mono text-[11px] leading-relaxed")}>
        <strong>Engineering Implementation Notes:</strong> Production wiring would run this as a scheduled server worker
        or API route that polls SolarEdge / SCADA endpoints on a controlled interval, queues requests to respect vendor
        rate limits, validates inverter register payloads, catches offline-device states (e.g., SolarEdge 18x86 PV
        isolation fault or 18x37/18x38 AC line voltage bounds), and routes normalized alerts into the systems log
        instead of letting hardware exceptions break the dashboard.
      </div>
    </div>
  );
}

export function useTelemetrySimulation() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [generationKw, setGenerationKw] = useState(BASELINE_GENERATION_KW);
  const [consumptionKw, setConsumptionKw] = useState(BASELINE_CONSUMPTION_KW);
  const [efficiency, setEfficiency] = useState(94.6);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runTelemetryTick = useCallback(() => {
    setGenerationKw((prev) => drift(prev, GENERATION_VARIANCE_KW, GENERATION_MIN_KW, GENERATION_MAX_KW));
    setConsumptionKw((prev) => drift(prev, CONSUMPTION_VARIANCE_KW, 11.8, 13.1));
    setEfficiency((prev) => {
      const next = prev + (Math.random() * 2 - 1) * 0.15;
      return parseFloat(Math.min(99.1, Math.max(92, next)).toFixed(2));
    });
  }, []);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isSimulating) return;

    runTelemetryTick();
    intervalRef.current = setInterval(runTelemetryTick, TICK_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isSimulating, runTelemetryTick]);

  const gridExportKw = clamp(generationKw - consumptionKw, 0, GENERATION_MAX_KW);

  return {
    isSimulating,
    setIsSimulating,
    generationKw,
    liveYield: generationKw,
    consumptionKw,
    netExport: gridExportKw,
    efficiency,
  };
}
