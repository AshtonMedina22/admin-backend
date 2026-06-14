"use client";

import { useState } from "react";

import { CheckCircle2, Layers, Loader2, PackageCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { inventoryData } from "@/data/demo/inventory";

type LogLine = {
  text: string;
  type: "info" | "success" | "warn";
  time: string;
};

const anenjiSku = inventoryData.find((item) => item.sku === "INV-3KW-ANENJI");
const stockUnits = anenjiSku?.stockLevel ?? 42;
const projectName = "McKinney Logistics Hub";

export function EngineeringBomConsole() {
  const [status, setStatus] = useState<"idle" | "running" | "complete">("idle");
  const [logs, setLogs] = useState<LogLine[]>([]);

  function runDiagnostics() {
    setStatus("running");
    setLogs([]);
    const timestamp = () => new Date().toLocaleTimeString();

    toast.message("BOM cross-check started", { description: `Analyzing OpenSolar CAD for ${projectName}…` });

    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        {
          text: `Analyzing OpenSolar CAD blueprint vectors for '${projectName}'…`,
          type: "info",
          time: timestamp(),
        },
      ]);
    }, 600);

    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        {
          text: "Cross-checking electrical BOM arrays with Nova Retail Co. Wylie warehouse inventory…",
          type: "info",
          time: timestamp(),
        },
      ]);
    }, 1800);

    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        {
          text: `MATCH DETECTED: ${stockUnits} unallocated Anenji 3KW inverters in Wylie Hub (Bin B-12).`,
          type: "warn",
          time: timestamp(),
        },
      ]);
      toast.warning("Inventory match found", { description: `${stockUnits} units available in Wylie warehouse.` });
    }, 3200);

    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        {
          text: `SUCCESS: ${stockUnits} physical units reserved. Internal supply lock complete. Double-purchasing mitigated (~$14,280 saved).`,
          type: "success",
          time: timestamp(),
        },
      ]);
      setStatus("complete");
      toast.success("BOM cross-check complete", {
        description: "0 units needed from external suppliers.",
      });
    }, 4500);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="size-4 text-emerald-600" />
              Cross-Company Material Allocator
            </CardTitle>
            <CardDescription>
              Reconciles OpenSolar CAD blueprints against Nova Retail Co. retail warehouse stock ({anenjiSku?.componentName})
            </CardDescription>
          </div>
          <Button disabled={status === "running"} onClick={runDiagnostics}>
            {status === "running" ? (
              <>
                <Loader2 className="animate-spin" data-icon="inline-start" />
                Parsing matrices…
              </>
            ) : (
              <>
                <PackageCheck data-icon="inline-start" />
                Run Automated BOM Cross-Check
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex h-48 flex-col justify-end overflow-y-auto rounded-lg bg-zinc-950 p-4 font-mono text-xs shadow-inner">
          {logs.length === 0 ? (
            <div className="py-10 text-center text-zinc-600">
              Console listener idle. Click blueprint cross-check to initiate supply array validation.
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log, index) => (
                <div key={`${log.time}-${index}`} className="flex items-start gap-2">
                  <span className="text-zinc-500 select-none">[{log.time}]</span>
                  <span
                    className={
                      log.type === "success"
                        ? "font-semibold text-emerald-400"
                        : log.type === "warn"
                          ? "font-medium text-amber-400"
                          : "text-zinc-300"
                    }
                  >
                    {log.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        {status === "complete" ? (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-emerald-700 text-xs dark:text-emerald-300">
            <CheckCircle2 className="size-4 shrink-0" />
            Operational verification confirmed: inventory allocations locked onto active project pipeline hooks.
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
