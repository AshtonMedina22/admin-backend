"use client";

import { FileCheck } from "lucide-react";

import { AIEscalationButton } from "@/components/ai-escalation-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  dashCardClass,
  dashCardContentClass,
  dashCardHeaderClass,
  dashKpiGrid3Class,
  dashPageClass,
  dashPageHeaderClass,
  dashSectionCardContentClass,
  dashSectionCardHeaderClass,
} from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

type PermitStatus = "critical" | "warning";

type PermittingRow = {
  asset: string;
  brand: string;
  authority: string;
  stage: string;
  daysStale: number;
  permit: string;
  status: PermitStatus;
};

const PERMITTING_QUEUE: PermittingRow[] = [
  {
    asset: "McKinney Logistics Hub",
    brand: "3SK",
    authority: "City of McKinney / Oncor",
    stage: "Permitting Review",
    daysStale: 42,
    permit: "PERMIT-MK-99412",
    status: "critical",
  },
  {
    asset: "Wylie Retail Array",
    brand: "2SK",
    authority: "City of Wylie",
    stage: "Interconnection Request",
    daysStale: 19,
    permit: "WYL-2026-0881",
    status: "warning",
  },
  {
    asset: "Rockwall Commercial Center",
    brand: "YSP",
    authority: "City of Rockwall / Oncor",
    stage: "PTO Final Sign-off",
    daysStale: 31,
    permit: "RKW-ELEC-7712",
    status: "critical",
  },
];

function brandBadgeClass(brand: string) {
  if (brand === "2SK") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  if (brand === "3SK") return "border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300";
  return "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300";
}

function rowAccentClass(brand: string) {
  if (brand === "2SK") return "border-l-4 border-emerald-500";
  if (brand === "3SK") return "border-l-4 border-indigo-500";
  return "border-l-4 border-amber-500";
}

function riskTextClass(status: PermitStatus) {
  return status === "critical"
    ? "border border-rose-500/20 bg-rose-950/30 text-rose-400"
    : "border border-amber-500/20 bg-amber-950/30 text-amber-400";
}

export function PermittingQueue() {
  return (
    <div className={cn(dashPageClass, "p-3 md:p-6")}>
      <div className={dashPageHeaderClass}>
        <h1 className="font-semibold text-2xl tracking-tight">Permitting & AHJ Queue</h1>
        <p className="max-w-3xl text-muted-foreground text-sm">
          Real-time tracking of municipal review cycles and utility interconnection bottlenecks.
        </p>
      </div>

      <div className={cn(dashKpiGrid3Class, "grid-cols-1 md:grid-cols-3")}>
        <Card size="sm" className={cn("border-red-500 border-l-4", dashCardClass)}>
          <CardHeader className={dashCardHeaderClass}>
            <CardDescription className="text-xs">Stale Permit Applications</CardDescription>
            <CardTitle className="font-mono text-2xl tabular-nums">3</CardTitle>
          </CardHeader>
          <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
            Projects exceeding municipal or utility review thresholds.
          </CardContent>
        </Card>
        <Card size="sm" className={cn("border-amber-500 border-l-4", dashCardClass)}>
          <CardHeader className={dashCardHeaderClass}>
            <CardDescription className="text-xs">Average AHJ Cycle Time</CardDescription>
            <CardTitle className="font-mono text-2xl tabular-nums">28.4 Days</CardTitle>
          </CardHeader>
          <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
            Rolling permit, interconnection, and PTO review duration.
          </CardContent>
        </Card>
        <Card size="sm" className={cn("border-indigo-500 border-l-4", dashCardClass)}>
          <CardHeader className={dashCardHeaderClass}>
            <CardDescription className="text-xs">Escalation Drafts Dispatched</CardDescription>
            <CardTitle className="font-mono text-2xl tabular-nums">14</CardTitle>
          </CardHeader>
          <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
            Authority follow-up drafts generated from stalled permit metadata.
          </CardContent>
        </Card>
      </div>

      <Card size="sm" className={cn("border-indigo-500 border-l-4", dashCardClass)}>
        <CardHeader className={dashSectionCardHeaderClass}>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="size-5" />
            Permitting Bottleneck Matrix
          </CardTitle>
          <CardDescription>
            Dense AHJ and utility interconnection queue — stalled reviews blocking installation schedules and project
            cash flow.
          </CardDescription>
        </CardHeader>
        <CardContent className={dashSectionCardContentClass}>
          <div className="scrollbar-none block w-full overflow-x-auto rounded-md border border-zinc-900">
            <Table className="min-w-[980px]">
              <TableHeader>
                <TableRow className="h-9">
                  <TableHead>Asset</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Authority (AHJ)</TableHead>
                  <TableHead>Permit ID</TableHead>
                  <TableHead className="text-right">Days Stale</TableHead>
                  <TableHead className="text-right">Automated Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PERMITTING_QUEUE.map((row) => (
                  <TableRow key={row.permit} className={cn("h-11", rowAccentClass(row.brand))}>
                    <TableCell className="py-2 font-medium">{row.asset}</TableCell>
                    <TableCell className="py-2">
                      <Badge variant="outline" className={cn("h-6", brandBadgeClass(row.brand))}>
                        {row.brand}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs py-2 text-xs">{row.authority}</TableCell>
                    <TableCell className="py-2 font-mono text-[11px]">{row.permit}</TableCell>
                    <TableCell className="py-2 text-right">
                      <span
                        className={cn(
                          "rounded px-2 py-0.5 font-mono font-semibold text-xs tabular-nums",
                          riskTextClass(row.status),
                        )}
                      >
                        {row.daysStale}d
                      </span>
                    </TableCell>
                    <TableCell className="py-2 text-right">
                      <AIEscalationButton
                        projectName={row.asset}
                        brandEntity={row.brand}
                        utilityAuthority={row.authority}
                        permitNumber={row.permit}
                        daysStale={row.daysStale}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
