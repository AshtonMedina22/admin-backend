"use client";

import { AlertTriangle, FileCheck, ShieldAlert } from "lucide-react";

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
    brand: "Solar 3SK",
    authority: "City of McKinney / Oncor",
    stage: "Permitting Review",
    daysStale: 42,
    permit: "PERMIT-MK-99412",
    status: "critical",
  },
  {
    asset: "Wylie Retail Array",
    brand: "Solar 2SK",
    authority: "City of Wylie",
    stage: "Interconnection Request",
    daysStale: 19,
    permit: "WYL-2026-0881",
    status: "warning",
  },
  {
    asset: "Rockwall Commercial Center",
    brand: "Yellow Star Power",
    authority: "City of Rockwall / Oncor",
    stage: "PTO Final Sign-off",
    daysStale: 31,
    permit: "RKW-ELEC-7712",
    status: "critical",
  },
];

function brandBadgeClass(brand: string) {
  if (brand === "Solar 2SK") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  if (brand === "Solar 3SK") return "border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300";
  return "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300";
}

function rowAccentClass(brand: string) {
  if (brand === "Solar 2SK") return "border-l-4 border-emerald-500";
  if (brand === "Solar 3SK") return "border-l-4 border-indigo-500";
  return "border-l-4 border-amber-500";
}

function statusBadge(status: PermitStatus) {
  if (status === "critical") {
    return (
      <Badge variant="outline" className="border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300">
        <ShieldAlert className="size-3" />
        Critical
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300">
      <AlertTriangle className="size-3" />
      Warning
    </Badge>
  );
}

export function PermittingQueue() {
  const criticalCount = PERMITTING_QUEUE.filter((row) => row.status === "critical").length;

  return (
    <div className={dashPageClass}>
      <div className={dashPageHeaderClass}>
        <h1 className="font-semibold text-2xl tracking-tight">Permitting & AHJ Queue</h1>
        <p className="max-w-3xl text-muted-foreground text-sm">
          North Texas municipal permitting and utility interconnection bottleneck matrix with AI-assisted escalation
          drafts for stalled cash-flow workstreams.
        </p>
      </div>

      <div className={dashKpiGrid3Class}>
        <Card size="sm" className={cn("border-red-500 border-l-4", dashCardClass)}>
          <CardHeader className={dashCardHeaderClass}>
            <CardDescription className="text-xs">Critical AHJ Holds</CardDescription>
            <CardTitle className="font-mono text-2xl tabular-nums">{criticalCount}</CardTitle>
          </CardHeader>
          <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
            Projects exceeding 30-day municipal or utility review thresholds.
          </CardContent>
        </Card>
        <Card size="sm" className={cn("border-amber-500 border-l-4", dashCardClass)}>
          <CardHeader className={dashCardHeaderClass}>
            <CardDescription className="text-xs">Queue Depth</CardDescription>
            <CardTitle className="font-mono text-2xl tabular-nums">{PERMITTING_QUEUE.length}</CardTitle>
          </CardHeader>
          <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
            Active permitting, interconnection, and PTO sign-off lanes under review.
          </CardContent>
        </Card>
        <Card size="sm" className={cn("border-indigo-500 border-l-4", dashCardClass)}>
          <CardHeader className={dashCardHeaderClass}>
            <CardDescription className="text-xs">AI Drafts Ready</CardDescription>
            <CardTitle className="font-mono text-2xl tabular-nums">{PERMITTING_QUEUE.length}</CardTitle>
          </CardHeader>
          <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
            One-click escalation templates mapped to authority, permit ID, and stale-day count.
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
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="h-9">
                  <TableHead>Asset</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Authority</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead className="text-right">Days Stale</TableHead>
                  <TableHead>Permit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
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
                    <TableCell className="py-2 text-muted-foreground text-xs">{row.stage}</TableCell>
                    <TableCell className="py-2 text-right font-mono tabular-nums">{row.daysStale}</TableCell>
                    <TableCell className="py-2 font-mono text-[11px]">{row.permit}</TableCell>
                    <TableCell className="py-2">{statusBadge(row.status)}</TableCell>
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
