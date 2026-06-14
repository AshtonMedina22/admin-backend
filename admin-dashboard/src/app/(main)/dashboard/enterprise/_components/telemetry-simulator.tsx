"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const BASELINE_GENERATION_KW = 48.2;
const BASELINE_CONSUMPTION_KW = 12.4;
const TICK_MS = 2000;
const GENERATION_MIN_KW = 46.0;
const GENERATION_MAX_KW = 51.0;
const GENERATION_VARIANCE_KW = 0.4;
const CONSUMPTION_VARIANCE_KW = 0.1;

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
    <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Switch id="solaredge-sim" checked={isSimulating} onCheckedChange={onSimulatingChange} />
        <div>
          <Label htmlFor="solaredge-sim" className="font-medium text-sm">
            Simulate Active SolarEdge API Polling Loop
          </Label>
          <p className="text-muted-foreground text-xs">
            Live grid telemetry:{" "}
            <span className={cn("font-semibold tabular-nums", isSimulating ? "text-emerald-600" : "text-foreground")}>
              {liveYield.toFixed(1)} kW
            </span>{" "}
            · Hunt County SE66.6K hardware
          </p>
        </div>
      </div>
      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
        {isSimulating ? "Streaming loop active" : "Stream paused"}
      </span>
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
    setConsumptionKw((prev) => drift(prev, CONSUMPTION_VARIANCE_KW, 11.8, 13.2));
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
