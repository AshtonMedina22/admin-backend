"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const BASELINE_GENERATION_KW = 2482.0;
const BASELINE_CONSUMPTION_KW = 412.0;
const TICK_MS = 2000;
const GENERATION_MIN_KW = 2450.0;
const GENERATION_MAX_KW = 2525.0;
const GENERATION_VARIANCE_KW = 7.5;
const CONSUMPTION_VARIANCE_KW = 3.2;

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
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Switch
          id="solaredge-sim"
          checked={isSimulating}
          onCheckedChange={onSimulatingChange}
          className="data-[state=checked]:bg-emerald-500 data-[state=checked]:shadow-[0_0_18px_rgba(16,185,129,0.35)]"
        />
        <div>
          <Label htmlFor="solaredge-sim" className="font-medium text-sm">
            Simulate SolarEdge / SCADA Polling Loop
          </Label>
          <p className="text-muted-foreground text-xs">
            Live grid telemetry:{" "}
            <span
              className={cn(
                "font-mono font-semibold tabular-nums",
                isSimulating ? "text-emerald-400" : "text-zinc-100",
              )}
            >
              {liveYield.toFixed(1)} kW
            </span>{" "}
            · browser demo of a 2-second normalized inverter/SCADA payload
          </p>
        </div>
      </div>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded border px-2 py-1 font-mono text-xs uppercase tracking-wider",
          isSimulating
            ? "border-emerald-500/30 bg-emerald-950/40 text-emerald-400"
            : "border-zinc-800 bg-zinc-950 text-zinc-500",
        )}
      >
        <span className={cn("size-1.5 rounded-full", isSimulating ? "animate-pulse bg-emerald-400" : "bg-zinc-600")} />
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
    setConsumptionKw((prev) => drift(prev, CONSUMPTION_VARIANCE_KW, 395.0, 430.0));
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
