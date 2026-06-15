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
import {
  dashCodeBlockClass,
  dashCodeBlockSmClass,
  dashKpiValueClass,
  dashProseClass,
  entityAccentBarForLabel,
  entityBadgeClassForLabel,
  entityBrandStyles,
  statusStyles,
} from "@/lib/entity-brand";
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

const PERMIT_STATUS_FORMULA = `=IFS(
  DaysStale > 30, "ESCALATE",
  DaysStale > 14, "FOLLOW_UP",
  TRUE, "MONITOR"
)`;

const CONDITIONAL_FORMATTING_RULES = [
  "ESCALATE → red fill + owner-visible AI escalation draft required.",
  "FOLLOW_UP → amber fill + scheduled AHJ/vendor reminder.",
  "MONITOR → neutral fill + continue normal review cadence.",
];

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

function PermitStatusFormulaCard() {
  return (
    <Card size="sm" className={cn(entityBrandStyles.yellowStar.accentBar, dashCardClass)}>
      <CardHeader className={dashSectionCardHeaderClass}>
        <CardTitle>Permit Status Formula / Conditional Formatting Rule</CardTitle>
        <CardDescription>
          Google Sheets application example for classifying AHJ review age before Apps Script or AI escalation runs.
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("grid gap-4 md:grid-cols-[1fr_1.15fr]", dashSectionCardContentClass)}>
        <div className="space-y-3">
          <div className={cn(dashCodeBlockSmClass, "text-xs leading-relaxed")}>
            <p>
              <strong className="text-slate-100">Workbook setup:</strong> calculate{" "}
              <span className={entityBrandStyles.solar3k.text}>DaysStale</span> from
              <span className={entityBrandStyles.solar3k.text}> TODAY() - SubmittedDate</span>, then use the status output as the source
              column for conditional formatting, filters, and Apps Script escalation checks.
            </p>
          </div>
          <ul className="space-y-2 text-muted-foreground text-xs leading-relaxed">
            {CONDITIONAL_FORMATTING_RULES.map((rule) => (
              <li key={rule} className="rounded-lg border border-border bg-muted/40 px-3 py-2">
                {rule}
              </li>
            ))}
          </ul>
        </div>
        <pre className={cn(dashCodeBlockClass, "text-[11px]")}>
          <code>{PERMIT_STATUS_FORMULA}</code>
        </pre>
      </CardContent>
    </Card>
  );
}

function AppsScriptPermitAlertCard() {
  return (
    <Card size="sm" className={cn(entityBrandStyles.solar3k.accentBar, dashCardClass)}>
      <CardHeader className={dashSectionCardHeaderClass}>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className={cn("size-5", entityBrandStyles.solar3k.icon)} />
          Google Apps Script Permit Alert Trigger
        </CardTitle>
        <CardDescription>
          Production wiring example: install this as an Apps Script spreadsheet{" "}
          <span className="font-mono">On edit</span>
          trigger so permit status changes in the workbook immediately create an email alert.
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("space-y-3", dashSectionCardContentClass)}>
        <div className={cn(dashCodeBlockSmClass, "grid gap-2 text-xs leading-relaxed")}>
          <p>
            <strong className="text-slate-100">Configuration:</strong> Apps Script trigger → Event source:{" "}
            <span className={entityBrandStyles.solar3k.text}>From spreadsheet</span> → Event type:{" "}
            <span className={entityBrandStyles.solar3k.text}>On edit</span> → Handler:{" "}
            <span className={entityBrandStyles.solar3k.text}>onPermitStatusEdit</span>.
          </p>
          <p>
            The handler checks the edited column, detects blocked/stale/rejected permit states, pulls the
            asset/AHJ/permit fields from the same row, and sends a targeted operations alert via{" "}
            <span className={entityBrandStyles.solar3k.text}>MailApp</span>.
          </p>
        </div>
        <pre className={cn(dashCodeBlockClass, "max-h-80 text-[11px]")}>
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
        <Card size="sm" className={cn(entityBrandStyles.systems.accentBar, dashCardClass)}>
          <CardHeader className={dashCardHeaderClass}>
            <CardDescription className="text-xs">Stale Permit Applications</CardDescription>
            <CardTitle className={dashKpiValueClass}>3</CardTitle>
          </CardHeader>
          <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
            Projects exceeding municipal or utility review thresholds.
          </CardContent>
        </Card>
        <Card size="sm" className={cn(entityBrandStyles.yellowStar.accentBar, dashCardClass)}>
          <CardHeader className={dashCardHeaderClass}>
            <CardDescription className="text-xs">Average AHJ Cycle Time</CardDescription>
            <CardTitle className={dashKpiValueClass}>28.4 Days</CardTitle>
          </CardHeader>
          <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
            Rolling permit, interconnection, and PTO review duration.
          </CardContent>
        </Card>
        <Card size="sm" className={cn(entityBrandStyles.solar3k.accentBar, dashCardClass)}>
          <CardHeader className={dashCardHeaderClass}>
            <CardDescription className="text-xs">Escalation Drafts Dispatched</CardDescription>
            <CardTitle className={dashKpiValueClass}>14</CardTitle>
          </CardHeader>
          <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
            Authority follow-up drafts generated from stalled permit metadata.
          </CardContent>
        </Card>
      </div>

      <Card size="sm" className={cn(entityBrandStyles.solar3k.accentBar, dashCardClass)}>
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
          <div className={cn(dashCodeBlockSmClass, "mb-3 text-xs leading-relaxed")}>
            <strong className="text-slate-100">AI Automation Layer:</strong> Production wiring would pass AHJ name,
            permit number, days delayed, missing requirements, and brand context into a controlled prompt/template
            service, generate a professional escalation draft, and keep a human approval step before sending through
            email or CRM automation.
          </div>
          <div className="scrollbar-none block w-full overflow-x-auto rounded-md border border-border">
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
                  <TableRow key={row.permit} className={cn("h-11 hover:bg-muted/30", entityAccentBarForLabel(row.brand))}>
                    <TableCell className="max-w-[12rem] whitespace-normal py-2 font-medium">{row.asset}</TableCell>
                    <TableCell className="py-2">
                      <Badge variant="outline" className={cn("h-6", entityBadgeClassForLabel(row.brand))}>
                        {row.brand}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs py-2 text-xs">{row.authority}</TableCell>
                    <TableCell className="py-2 font-mono text-[11px]">{row.permit}</TableCell>
                    <TableCell className="py-2 text-right">
                      <span
                        className={cn(
                          "rounded px-2 py-0.5 font-mono font-semibold text-xs tabular-nums",
                          row.status === "critical" ? statusStyles.critical : statusStyles.warning,
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

      <PermitStatusFormulaCard />

      <AppsScriptPermitAlertCard />
    </div>
  );
}
