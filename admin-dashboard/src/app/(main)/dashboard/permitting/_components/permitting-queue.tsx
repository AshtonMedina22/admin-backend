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
  if (brand === "2SK") return "border-lime-500/30 bg-lime-500/10 text-lime-700 dark:text-lime-300";
  if (brand === "3SK") return "border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300";
  return "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300";
}

function rowAccentClass(brand: string) {
  if (brand === "2SK") return "border-l-4 border-lime-500";
  if (brand === "3SK") return "border-l-4 border-cyan-500";
  return "border-l-4 border-amber-500";
}

function riskTextClass(status: PermitStatus) {
  return status === "critical"
    ? "border border-rose-500/20 bg-rose-950/30 text-rose-400"
    : "border border-amber-500/20 bg-amber-950/30 text-amber-400";
}

const PERMIT_ALERT_SCRIPT = `function onPermitStatusEdit(e) {
  const sheet = e.range.getSheet();
  if (sheet.getName() !== 'Permitting Queue') return;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const col = (name) => headers.indexOf(name) + 1;
  const statusCol = col('Permit Status');
  if (e.range.getRow() === 1 || e.range.getColumn() !== statusCol) return;

  const nextStatus = String(e.value || '').toLowerCase();
  if (!/(blocked|stale|rejected|correction|overdue)/.test(nextStatus)) return;

  const row = e.range.getRow();
  const asset = sheet.getRange(row, col('Asset')).getDisplayValue();
  const ahj = sheet.getRange(row, col('Authority')).getDisplayValue();
  const permitId = sheet.getRange(row, col('Permit ID')).getDisplayValue();

  MailApp.sendEmail({
    to: 'ops-alerts@demo-ops.local',
    subject: 'Permit alert: ' + asset + ' / ' + permitId,
    htmlBody: '<b>' + asset + '</b> changed to ' + e.value + '<br>AHJ: ' + ahj + '<br>Permit: ' + permitId,
  });
}`;

function AppsScriptPermitAlertCard() {
  return (
    <Card size="sm" className={cn("border-cyan-500 border-l-4", dashCardClass)}>
      <CardHeader className={dashSectionCardHeaderClass}>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="size-5 text-cyan-400" />
          Google Apps Script Permit Alert Trigger
        </CardTitle>
        <CardDescription>
          Production wiring example: install this as an Apps Script spreadsheet{" "}
          <span className="font-mono">On edit</span>
          trigger so permit status changes in the workbook immediately create an email alert.
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("space-y-3", dashSectionCardContentClass)}>
        <div className="grid gap-2 rounded-lg border border-zinc-900 bg-zinc-950 p-3 font-mono text-xs text-zinc-400 leading-relaxed">
          <p>
            <strong className="text-zinc-200">Configuration:</strong> Apps Script trigger → Event source:{" "}
            <span className="text-cyan-300">From spreadsheet</span> → Event type:{" "}
            <span className="text-cyan-300">On edit</span> → Handler:{" "}
            <span className="text-cyan-300">onPermitStatusEdit</span>.
          </p>
          <p>
            The handler checks the edited column, detects blocked/stale/rejected permit states, pulls the
            asset/AHJ/permit fields from the same row, and sends a targeted operations alert via{" "}
            <span className="text-cyan-300">MailApp</span>.
          </p>
        </div>
        <pre className="max-h-80 overflow-x-auto rounded-lg border border-zinc-900 bg-black/80 p-4 font-mono text-[11px] text-cyan-200 leading-relaxed">
          <code>{PERMIT_ALERT_SCRIPT}</code>
        </pre>
      </CardContent>
    </Card>
  );
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
            <CardTitle className="font-mono text-xl tabular-nums md:text-2xl">3</CardTitle>
          </CardHeader>
          <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
            Projects exceeding municipal or utility review thresholds.
          </CardContent>
        </Card>
        <Card size="sm" className={cn("border-amber-500 border-l-4", dashCardClass)}>
          <CardHeader className={dashCardHeaderClass}>
            <CardDescription className="text-xs">Average AHJ Cycle Time</CardDescription>
            <CardTitle className="font-mono text-xl tabular-nums md:text-2xl">28.4 Days</CardTitle>
          </CardHeader>
          <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
            Rolling permit, interconnection, and PTO review duration.
          </CardContent>
        </Card>
        <Card size="sm" className={cn("border-indigo-500 border-l-4", dashCardClass)}>
          <CardHeader className={dashCardHeaderClass}>
            <CardDescription className="text-xs">Escalation Drafts Dispatched</CardDescription>
            <CardTitle className="font-mono text-xl tabular-nums md:text-2xl">14</CardTitle>
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
          <div className="mb-3 rounded-lg border border-zinc-900 bg-zinc-950 p-3 font-mono text-xs text-zinc-400 leading-relaxed">
            <strong className="text-zinc-200">AI Automation Layer:</strong> Production wiring would pass AHJ name,
            permit number, days delayed, missing requirements, and brand context into a controlled prompt/template
            service, generate a professional escalation draft, and keep a human approval step before sending through
            email or CRM automation.
          </div>
          <div className="scrollbar-none block w-full overflow-x-auto rounded-md border border-zinc-900">
            <Table className="min-w-[720px]">
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
                    <TableCell className="max-w-[12rem] whitespace-normal py-2 font-medium">{row.asset}</TableCell>
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

      <AppsScriptPermitAlertCard />
    </div>
  );
}
