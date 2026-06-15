"use client";

import { FileCheck } from "lucide-react";

import { AIEscalationButton } from "@/components/ai-escalation-button";
import { DashImplementationLabel } from "@/components/dashboard/implementation-label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  dashCardContentClass,
  dashCardHeaderClass,
  dashKpiGrid3Class,
  dashPageClass,
  dashPageHeaderClass,
  dashInfoBannerClass,
  dashSectionCardContentClass,
  dashSectionCardHeaderClass,
  dashPlatformCardClass,
  dashSurfaceCardClass,
} from "@/lib/dashboard-ui";
import {
  dashCodeBlockClass,
  dashCodeBlockSmClass,
  dashKpiValueClass,
  entityAccentBarForLabel,
  entityBadgeClassForLabel,
  entityBrandStyles,
  statusStyles,
} from "@/lib/entity-brand";
import { implementationLabels } from "@/lib/implementation-labels";
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

const PERMIT_ALERT_SCRIPT = `// Bind this to the spreadsheet as an explicit INSTALLABLE edit trigger.
// Simple triggers cannot call authorized services such as UrlFetchApp/MailApp.
function handlePermitStatusEscalation(e) {
  try {
    const sheet = e.range.getSheet();
    if (sheet.getName() !== 'Permitting Queue') return;

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
    const col = (name) => headers.indexOf(name) + 1;
    const required = ['Asset', 'Brand', 'Authority', 'Permit ID', 'Days Stale', 'Permit Status'];
    if (required.some((name) => col(name) === 0)) throw new Error('Missing required permitting headers');

    const statusCol = col('Permit Status');
    if (e.range.getRow() === 1 || e.range.getColumn() !== statusCol) return;

    const currentStatus = String(e.value || '').toUpperCase();
    if (currentStatus !== 'ESCALATE') return;

    const row = e.range.getRow();
    const payload = {
      assetName: sheet.getRange(row, col('Asset')).getDisplayValue(),
      brand: sheet.getRange(row, col('Brand')).getDisplayValue(),
      authority: sheet.getRange(row, col('Authority')).getDisplayValue(),
      permitId: sheet.getRange(row, col('Permit ID')).getDisplayValue(),
      daysStale: Number(sheet.getRange(row, col('Days Stale')).getDisplayValue() || 0),
    };

    const scriptProperties = PropertiesService.getScriptProperties();
    const backendUrl = scriptProperties.getProperty('PERMIT_ESCALATION_ENDPOINT');
    const token = scriptProperties.getProperty('PERMIT_ESCALATION_TOKEN');
    if (!backendUrl || !token) throw new Error('Missing permit escalation backend configuration');

    const response = UrlFetchApp.fetch(backendUrl, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      headers: { 'x-escalation-token': token },
      muteHttpExceptions: true,
    });

    console.log('Permit escalation backend status: ' + response.getResponseCode());
  } catch (error) {
    console.error('Permit Automation Hook Failed: ' + error.toString());
  }
}`;

const NEXT_ESCALATION_ROUTE = `// src/app/api/escalate-permit/route.ts
export const runtime = "edge";

export async function POST(request: Request) {
  const token = request.headers.get("x-escalation-token");
  if (token !== process.env.PERMIT_ESCALATION_TOKEN) {
    return Response.json({ error: "Unauthorized escalation hook" }, { status: 401 });
  }

  const body = await request.json();
  const { assetName, brand, authority, permitId, daysStale } = body;

  const generatedPrompt =
    \`Draft an executive operational escalation letter for \${brand} regarding \${assetName} (Permit: \${permitId}). It has been stalled at \${authority} for \${daysStale} days.\`;

  // Completion provider call and persistence happen server-side only.
  return Response.json({
    ok: true,
    status: "QUEUED_FOR_REVIEW",
    promptPreview: generatedPrompt,
  });
}`;

function PermitStatusFormulaCard() {
  return (
    <Card size="sm" className={cn("h-full", dashSurfaceCardClass)}>
      <CardHeader className={cn("border-border border-b", dashSectionCardHeaderClass)}>
        <CardTitle>Permit Status Formula / Conditional Formatting Rule</CardTitle>
        <CardDescription>
          Google Sheets application example for classifying AHJ review age before Apps Script or AI escalation runs.
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("grid gap-3", dashSectionCardContentClass)}>
        <div className="space-y-2.5">
          <div className={cn(dashCodeBlockSmClass, "text-[11px] leading-snug")}>
            <p>
              <strong className="text-foreground">Workbook setup:</strong> calculate{" "}
              <span className="font-mono text-foreground">DaysStale</span> from
              <span className="font-mono text-foreground"> TODAY() - SubmittedDate</span>, then use the status output as the source
              column for conditional formatting, filters, and Apps Script escalation checks.
            </p>
          </div>
          <ul className="space-y-1.5 text-muted-foreground text-[11px] leading-snug">
            {CONDITIONAL_FORMATTING_RULES.map((rule) => (
              <li key={rule} className="rounded-lg border border-border bg-muted/40 px-2.5 py-1.5">
                {rule}
              </li>
            ))}
          </ul>
        </div>
        <pre className={cn(dashCodeBlockClass, "max-h-40 text-[11px]")}>
          <code>{PERMIT_STATUS_FORMULA}</code>
        </pre>
      </CardContent>
    </Card>
  );
}

function AppsScriptPermitAlertCard() {
  return (
    <Card size="sm" className={cn("h-full", dashPlatformCardClass)}>
      <CardHeader className={cn("border-border border-b", dashSectionCardHeaderClass)}>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className={cn("size-5", entityBrandStyles.solar3k.icon)} />
          {implementationLabels.permitEscalation.title}
        </CardTitle>
        <CardDescription>
          Production wiring example: install this as an explicit Apps Script spreadsheet{" "}
          <span className="font-mono">On edit</span> trigger so permit status changes can post structured metadata to a
          secure Next.js route for AI draft compilation.
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("space-y-3", dashSectionCardContentClass)}>
        <div className={cn(dashCodeBlockSmClass, "grid gap-2 text-[11px] leading-snug")}>
          <p>
            <strong className="text-foreground">Configuration:</strong> Apps Script trigger -&gt; Event source:{" "}
            <span className="font-mono text-foreground">From spreadsheet</span> -&gt; Event type:{" "}
            <span className="font-mono text-foreground">On edit</span> -&gt; Handler:{" "}
            <span className="font-mono text-foreground">handlePermitStatusEscalation</span>.
          </p>
          <p>
            This must be an installable trigger, not a simple <span className="font-mono text-foreground">onEdit</span>
            trigger, because the handler calls authorized services. It validates headers, detects{" "}
            <span className="font-mono text-foreground">ESCALATE</span> status changes, and forwards only structured
            metadata to the backend.
          </p>
        </div>
        <pre className={cn(dashCodeBlockClass, "max-h-[260px] text-[10px]")}>
          <code>{PERMIT_ALERT_SCRIPT}</code>
        </pre>
        <div className={cn(dashInfoBannerClass, "px-3 py-2 text-xs leading-snug")}>
          <strong className="text-foreground">Next.js secure route:</strong> The browser never receives AI provider keys.
          The Apps Script hook signs the request with a shared server token, and the route compiles prompt context before
          queuing a human-reviewed escalation draft.
        </div>
        <pre className={cn(dashCodeBlockClass, "max-h-44 text-[10px]")}>
          <code>{NEXT_ESCALATION_ROUTE}</code>
        </pre>
      </CardContent>
    </Card>
  );
}

function PermittingAutomationGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <PermitStatusFormulaCard />
      </div>
      <div className="lg:col-span-7">
        <AppsScriptPermitAlertCard />
      </div>
    </div>
  );
}

export function PermittingQueue() {
  return (
    <div className={dashPageClass}>
      <div className={dashPageHeaderClass}>
        <h1 className="font-semibold text-2xl tracking-tight">Permitting & AHJ Queue</h1>
        <p className="max-w-3xl text-muted-foreground text-sm">
          Real-time tracking of municipal review cycles and utility interconnection bottlenecks.
        </p>
      </div>

      <div className={cn(dashKpiGrid3Class, "grid-cols-1 md:grid-cols-3")}>
        <Card size="sm" className={dashSurfaceCardClass}>
          <CardHeader className={dashCardHeaderClass}>
            <CardDescription className="text-xs">Stale Permit Applications</CardDescription>
            <CardTitle className={dashKpiValueClass}>3</CardTitle>
          </CardHeader>
          <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
            Projects exceeding municipal or utility review thresholds.
          </CardContent>
        </Card>
        <Card size="sm" className={dashSurfaceCardClass}>
          <CardHeader className={dashCardHeaderClass}>
            <CardDescription className="text-xs">Average AHJ Cycle Time</CardDescription>
            <CardTitle className={dashKpiValueClass}>28.4 Days</CardTitle>
          </CardHeader>
          <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
            Rolling permit, interconnection, and PTO review duration.
          </CardContent>
        </Card>
        <Card size="sm" className={dashSurfaceCardClass}>
          <CardHeader className={dashCardHeaderClass}>
            <CardDescription className="text-xs">Escalation Drafts Dispatched</CardDescription>
            <CardTitle className={dashKpiValueClass}>14</CardTitle>
          </CardHeader>
          <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
            Authority follow-up drafts generated from stalled permit metadata.
          </CardContent>
        </Card>
      </div>

      <Card size="sm" className={dashPlatformCardClass}>
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
          <div className={cn(dashInfoBannerClass, "mb-3 px-3 py-2 text-xs leading-snug")}>
            <strong className="text-foreground">AI Automation Layer:</strong> Production wiring would pass AHJ name,
            permit number, days delayed, missing requirements, and brand context into a controlled prompt/template
            service, generate a professional escalation draft, and keep a human approval step before sending through
            email or CRM automation.
          </div>
          <div className="scrollbar-none block w-full overflow-x-auto rounded-md border border-border">
            <Table className="min-w-[900px] table-fixed text-[11px]">
              <TableHeader>
                <TableRow className="h-9">
                  <TableHead className="w-[24%]">Asset</TableHead>
                  <TableHead className="w-[10%]">Brand</TableHead>
                  <TableHead className="w-[25%]">Authority (AHJ)</TableHead>
                  <TableHead className="w-[16%]">Permit ID</TableHead>
                  <TableHead className="w-[10%] text-right">Days Stale</TableHead>
                  <TableHead className="w-[15%] text-right">Automated Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PERMITTING_QUEUE.map((row) => (
                  <TableRow key={row.permit} className={cn("h-10 hover:bg-muted/30", entityAccentBarForLabel(row.brand))}>
                    <TableCell className="truncate py-2 font-medium">{row.asset}</TableCell>
                    <TableCell className="py-2">
                      <Badge variant="outline" className={cn("h-6", entityBadgeClassForLabel(row.brand))}>
                        {row.brand}
                      </Badge>
                    </TableCell>
                    <TableCell className="truncate py-2 text-xs">{row.authority}</TableCell>
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

      <PermittingAutomationGrid />
    </div>
  );
}
