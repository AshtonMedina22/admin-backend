"use client";

import { useEffect, useState } from "react";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const BASELINE_KW = 48.2;
const CONSUMPTION_KW = 12.4;

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
  const [liveYield, setLiveYield] = useState(BASELINE_KW);
  const [efficiency, setEfficiency] = useState(94.6);

  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setLiveYield((prev) => {
        const variance = (Math.random() - 0.5) * 0.8;
        return parseFloat(Math.max(40, Math.min(65, prev + variance)).toFixed(1));
      });
      setEfficiency((prev) => {
        const variance = (Math.random() - 0.5) * 0.3;
        return parseFloat(Math.max(92, Math.min(99.1, prev + variance)).toFixed(2));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  const netExport = parseFloat(Math.max(0, liveYield - CONSUMPTION_KW).toFixed(1));

  return { isSimulating, setIsSimulating, liveYield, efficiency, netExport, consumptionKw: CONSUMPTION_KW };
}
