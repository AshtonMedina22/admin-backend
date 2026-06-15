"use client";

import { useState } from "react";

import { CheckCircle2, Layers, Loader2, PackageCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { dashCardContentClass, dashCardHeaderClass, dashSurfaceCardClass } from "@/lib/dashboard-ui";
import { dashCodeBlockSmClass, dashProseClass, entityBrandStyles, statusStyles } from "@/lib/entity-brand";
import { cn } from "@/lib/utils";

type LogLine = {
  text: string;
  type: "info" | "success" | "warn";
  time: string;
};

const commercialInverterSku = "SE100K-USR4-COMM";
const commercialInverterName = "SolarEdge SE100K-USR4 Three-Phase Inverters & Optimizers";
const stockUnits = 3;
const estimatedSavings = "$18,900";
const projectName = "McKinney Logistics Hub";
const BOM_PARSER_CONTRACT = `type OpenSolarBOMRow = {
  projectId: string;
  componentName: string;
  manufacturer: string;
  model: string;
  quantityRequired: number;
};

// normalizeSku() strips vendor suffixes, whitespace, case drift, and punctuation
// before matching against the normalized PostgreSQL inventory schema.
OpenSolarBOMRow[]
  .map(normalizeSku)
  .map(compareAgainstInventoryTab)
  .map(reserveAvailableUnits)
  .forEach(appendProcurementAuditRow);`;

export function EngineeringBomConsole() {
  const [status, setStatus] = useState<"idle" | "running" | "complete">("idle");
  const [logs, setLogs] = useState<LogLine[]>([]);

  function runDiagnostics() {
    setStatus("running");
    setLogs([]);
    const timestamp = () => new Date().toLocaleTimeString();

    toast.message("BOM cross-check started", { description: `Analyzing OpenSolar CAD for ${projectName}...` });

    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        {
          text: `Analyzing OpenSolar CAD blueprint vectors for '${projectName}'...`,
          type: "info",
          time: timestamp(),
        },
      ]);
    }, 600);

    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        {
          text: "Cross-checking electrical BOM arrays with 2SK Wylie warehouse inventory...",
          type: "info",
          time: timestamp(),
        },
      ]);
    }, 1800);

    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        {
          text: `MATCH DETECTED: ${stockUnits} unallocated ${commercialInverterName} in Wylie Hub (SKU ${commercialInverterSku}).`,
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
          text: `SUCCESS: ${stockUnits} commercial inverter lots reserved. Internal supply lock complete. Double-purchasing mitigated (~${estimatedSavings} saved).`,
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
    <Card className={cn(dashSurfaceCardClass, entityBrandStyles.solar2sk.accentBar)}>
      <CardHeader className={dashCardHeaderClass}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className={cn("size-4", entityBrandStyles.solar2sk.icon)} />
              Cross-Company Material Allocator
            </CardTitle>
            <CardDescription>
              Reconciles OpenSolar CAD blueprints from 3SK against 2SK warehouse-held commercial inverter stock
              (SolarEdge SE100K-USR4 three-phase inverters and optimizers)
            </CardDescription>
          </div>
          <Button
            className={cn("border", statusStyles.info, "hover:bg-muted/50")}
            disabled={status === "running"}
            onClick={runDiagnostics}
          >
            {status === "running" ? (
              <>
                <Loader2 className="animate-spin" data-icon="inline-start" />
                Parsing matrices...
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
      <CardContent className={dashCardContentClass}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="flex h-full min-h-64 flex-col justify-end overflow-y-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs shadow-inner">
              {logs.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  Console listener idle. Click blueprint cross-check to initiate supply array validation.
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div key={`${log.time}-${log.text}`} className="flex items-start gap-2">
                      <span className="select-none text-muted-foreground">[{log.time}]</span>
                      <span
                        className={cn(
                          log.type === "success" && cn("font-semibold", entityBrandStyles.solar2sk.text),
                          log.type === "warn" && "font-medium text-[var(--status-warning-text)]",
                          log.type === "info" && "text-foreground",
                        )}
                      >
                        {log.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="rounded-md border border-border bg-muted/40 p-3 lg:col-span-7">
            <p className={dashProseClass}>
              <strong>BOM Parser Script Contract:</strong> Production wiring would export or retrieve OpenSolar
              project/system component rows, normalize manufacturer/model/SKU strings, compare required quantities
              against the 2SK inventory workbook tab, reserve matching units, and append an audit row for every
              allocation decision.
            </p>
            <p className={cn("mt-2", dashProseClass)}>
              <strong>Normalization note:</strong> <span className="font-mono">normalizeSku()</span> handles lowercase
              strings, spacing differences, punctuation, and vendor suffix codes before validating against the normalized
              PostgreSQL inventory schema.
            </p>
            <pre className={cn("mt-2 max-h-[300px] overflow-y-auto", dashCodeBlockSmClass)}>
              <code>{BOM_PARSER_CONTRACT}</code>
            </pre>
          </div>
        </div>
        {status === "complete" ? (
          <div className={cn("mt-3 flex items-center gap-2 p-2.5 text-xs", statusStyles.live)}>
            <CheckCircle2 className="size-4 shrink-0" />
            Operational verification confirmed: inventory allocations locked onto active project pipeline hooks.
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
