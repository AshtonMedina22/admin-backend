"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import {
  Activity,
  CheckCircle2,
  DatabaseZap,
  type LucideIcon,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { AIEscalationButton } from "@/components/ai-escalation-button";
import { RelativeTime } from "@/components/dashboard/relative-time";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CommandCenterData } from "@/data/demo/command-center";
import {
  dashCardClass,
  dashCardContentClass,
  dashCardHeaderClass,
  dashKpiGridClass,
  dashPageClass,
  dashPageHeaderClass,
  dashSectionCardContentClass,
  dashSectionCardHeaderClass,
} from "@/lib/dashboard-ui";
import {
  dashCodeBlockClass,
  dashKpiValueClass,
  dashProseClass,
  entityAccentBarForLabel,
  entityBadgeClassForLabel,
  entityBrandStyles,
  statusStyles,
} from "@/lib/entity-brand";
import { cn } from "@/lib/utils";

import { TelemetrySimulatorControl, useTelemetrySimulation } from "../../enterprise/_components/telemetry-simulator";
import { GlobalEventsFeed } from "./global-events-feed";
import { RevenueSplitChart } from "./revenue-split-chart";

type CommandCenterProps = {
  data: CommandCenterData;
};

type MetricCardConfig = {
  title: string;
  value: string;
  caption: string;
  technicalNote: string;
  trend: string;
  icon: LucideIcon;
  iconClassName: string;
  entity: "2SK" | "3SK" | "YSP";
  accentClassName: string;
};

function entityLabel(value: string) {
  const lower = value.toLowerCase();
  if (lower.includes("yellow") || lower.includes("ysp")) return "YSP";
  if (lower.includes("3sk") || lower.includes("3k")) return "3SK";
  if (lower.includes("2sk")) return "2SK";
  return "Shared";
}

function utilityAuthorityFor(company: string, projectName: string) {
  const target = `${company} ${projectName}`.toLowerCase();
  if (target.includes("retail") || target.includes("warehouse") || target.includes("2sk"))
    return "Wylie Warehouse Operations";
  if (target.includes("yellow") || target.includes("hunt") || target.includes("cedar"))
    return "Oncor Utility Engineering";
  if (target.includes("plano")) return "City of Plano Building Inspections";
  return "Oncor Interconnection Desk";
}

function staleDaysFor(index: number, stage: string) {
  if (/blocked|pending|review|testing|interconnection|permit|hold/i.test(stage)) return 5 + index * 2;
  return Math.max(1, index + 1);
}

function permitNumberFor(projectName: string, index: number) {
  const slug = projectName.split(/\s+/).slice(0, 1)[0]?.slice(0, 3).toUpperCase() || "PRJ";
  return `${slug}-2026-${9940 + index}`;
}

function buildMetricCards(data: CommandCenterData): MetricCardConfig[] {
  const { metrics, trends } = data;

  return [
    {
      title: "Active B2B Pipeline",
      value: `$${metrics.b2bPipeline.toLocaleString()}`,
      caption: "Contract and proposal pipeline.",
      technicalNote:
        "Production wiring: Google Sheets API and Apps Script webhooks ingest workbook rows, normalize company fields, and reconcile multi-company balances before the KPI render pass.",
      trend: trends.b2bPipeline,
      icon: TrendingUp,
      iconClassName: entityBrandStyles.solar3k.icon,
      entity: "3SK",
      accentClassName: entityBrandStyles.solar3k.accentBar,
    },
    {
      title: "Live Fleet Yield",
      value: `${metrics.fleetYield.toFixed(1)} MW`,
      caption: "Active macro fleet generation.",
      technicalNote:
        "Production wiring: a scheduled SolarEdge / SCADA polling worker batches inverter register reads, rate-limits API calls, and maps generation samples into YSP fleet-yield metrics.",
      trend: trends.fleetYield,
      icon: Activity,
      iconClassName: entityBrandStyles.yellowStar.icon,
      entity: "YSP",
      accentClassName: entityBrandStyles.yellowStar.accentBar,
    },
    {
      title: "Combined Portfolio",
      value: `${metrics.portfolioCapacity.toFixed(1)} MW`,
      caption: "Aggregated North Texas asset footprint.",
      technicalNote:
        "Production wiring: workbook and telemetry rows are cleaned, type-cast, entity-mapped, and rolled into MW-scale executive capacity metrics for portfolio review.",
      trend: trends.portfolioCapacity,
      icon: Zap,
      iconClassName: entityBrandStyles.yellowStar.icon,
      entity: "YSP",
      accentClassName: entityBrandStyles.yellowStar.accentBar,
    },
    {
      title: "DIY Retail Vol (Mo)",
      value: `${metrics.retailVolume} Units`,
      caption: "Monthly warehouse fulfillment flow.",
      technicalNote:
        "Production wiring: WooCommerce order webhooks post JSON payloads into middleware, which validates SKUs, deduplicates orders, and writes sanitized fulfillment rows to the operations workbook.",
      trend: trends.retailVolume,
      icon: ShoppingCart,
      iconClassName: entityBrandStyles.solar2sk.icon,
      entity: "2SK",
      accentClassName: entityBrandStyles.solar2sk.accentBar,
    },
  ];
}

function TelemetryMatrixCard() {
  const telemetry = useTelemetrySimulation();

  return (
    <Card size="sm" className={cn("h-full", entityBrandStyles.yellowStar.accentBar, dashCardClass)}>
      <CardHeader className={dashSectionCardHeaderClass}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-1">
            <CardTitle>Live Interconnection Telemetry</CardTitle>
            <CardDescription>SolarEdge polling loop for YSP grid export status.</CardDescription>
          </div>
          <Badge variant="outline" className={entityBadgeClassForLabel("YSP")}>
            YSP
          </Badge>
        </div>
      </CardHeader>
      <CardContent className={cn("grid gap-3", dashSectionCardContentClass)}>
        <TelemetrySimulatorControl
          isSimulating={telemetry.isSimulating}
          onSimulatingChange={telemetry.setIsSimulating}
          liveYield={telemetry.liveYield}
        />
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-md border border-border bg-slate-50 p-3">
            <p className="text-[11px] text-muted-foreground uppercase">Generation</p>
            <p className={cn(dashKpiValueClass, "text-lg text-amber-600")}>{telemetry.liveYield.toFixed(1)} kW</p>
          </div>
          <div className="rounded-md border border-border bg-slate-50 p-3">
            <p className="text-[11px] text-muted-foreground uppercase">Consumption</p>
            <p className={cn(dashKpiValueClass, "text-lg")}>{telemetry.consumptionKw.toFixed(1)} kW</p>
          </div>
          <div className="rounded-md border border-border bg-slate-50 p-3">
            <p className="text-[11px] text-muted-foreground uppercase">Grid Export</p>
            <p className={cn(dashKpiValueClass, "text-lg text-emerald-600")}>{telemetry.netExport.toFixed(1)} kW</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function WorkbookSyncContractCard({ workbookConnected }: { workbookConnected: boolean }) {
  const syncSteps = [
    {
      label: "Sheet event source",
      detail:
        "Workbook tab changes, Apps Script doPost JSON payloads, or a time-based Apps Script pull consolidate rows.",
    },
    {
      label: "Next.js server fetch",
      detail:
        "fetchWorkbookCommandCenter() tries Apps Script JSON first, then Sheets API, then published workbook fallback.",
    },
    {
      label: "Mapping layer",
      detail: "mapScriptPayloadToCommandCenter() type-casts metrics, revenue rows, and operation-stream events.",
    },
    {
      label: "Executive render",
      detail: "Sanitized rows feed the KPI cards, revenue split matrix, and Global Operations Stream.",
    },
  ];

  return (
    <Card size="sm" className={cn(entityBrandStyles.solar3k.accentBar, dashCardClass)}>
      <CardHeader className={dashSectionCardHeaderClass}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-1">
            <CardTitle className="flex items-center gap-2">
              <DatabaseZap className={cn("size-5", entityBrandStyles.solar3k.icon)} />
              Command Center Workbook Sync Contract
            </CardTitle>
            <CardDescription>
              Literal backend path for turning workbook rows into the executive dashboard.
            </CardDescription>
          </div>
          <Badge
            variant={workbookConnected ? "default" : "outline"}
            className={cn(
              "h-6 px-2 font-mono text-[10px]",
              workbookConnected && statusStyles.live,
            )}
          >
            {workbookConnected ? "Live provider active" : "Preview fallback active"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className={cn("grid gap-3", dashSectionCardContentClass)}>
        <div className={cn("grid gap-2", dashCodeBlockClass)}>
          <p>
            <strong className="text-slate-100">Production flow:</strong>{" "}
            <span className="text-[var(--brand-3sk)]">Google Sheet tab update</span> →{" "}
            <span className="text-[var(--brand-3sk)]">Apps Script endpoint / scheduled pull</span> →{" "}
            <span className="text-[var(--brand-3sk)]">Next.js server fetch</span> →{" "}
            <span className="text-[var(--brand-3sk)]">mapScriptPayloadToCommandCenter()</span> → KPI cards + event
            stream.
          </p>
          <p>
            <strong className="text-slate-100">Current repository path:</strong>{" "}
            <span className="text-[var(--brand-3sk)]">fetchWorkbookCommandCenter()</span> calls{" "}
            <span className="text-[var(--brand-3sk)]">fetchWorkbookScriptPayloadOrNull()</span>, falls through to Sheets API /
            published workbook providers when needed, and preserves the dashboard with local demo data if every live
            provider fails.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
          {syncSteps.map((step, index) => (
            <div key={step.label} className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full border font-mono text-[10px]",
                    entityBrandStyles.solar3k.badge,
                  )}
                >
                  {index + 1}
                </span>
                <p className="font-semibold text-xs">{step.label}</p>
              </div>
              <p className={cn(dashProseClass, "font-mono text-[11px] text-muted-foreground")}>{step.detail}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ActiveProjectsMatrix({ projects }: { projects: CommandCenterData["projects"] }) {
  return (
    <Card size="sm" className={cn(entityBrandStyles.solar3k.accentBar, dashCardClass)}>
      <CardHeader className={dashSectionCardHeaderClass}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-1">
            <CardTitle>Active Project Escalation Matrix</CardTitle>
            <CardDescription>
              Commercial, retail, and grid workstreams with utility-aware action drafts.
            </CardDescription>
          </div>
          <Badge variant="outline" className={cn("h-6", entityBrandStyles.solar3k.badge)}>
            AI escalation lane
          </Badge>
        </div>
      </CardHeader>
      <CardContent className={dashSectionCardContentClass}>
        <div className="overflow-hidden rounded-md border border-border/60">
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow className="h-9 border-border/60 hover:bg-transparent">
                <TableHead>Project</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">Stale</TableHead>
                <TableHead>Authority</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.slice(0, 5).map((project, index) => {
                const entity = entityLabel(project.company);
                const daysStale = staleDaysFor(index, project.stage);
                const authority = utilityAuthorityFor(project.company, project.customer);
                const permitNumber = permitNumberFor(project.customer, index);
                const showEscalation =
                  daysStale >= 3 || /hold|review|interconnection|permit|pending/i.test(project.stage);
                return (
                  <TableRow
                    key={project.id}
                    className={cn("h-11 border-border/60 hover:bg-muted/30", entityAccentBarForLabel(entity))}
                  >
                    <TableCell className="max-w-[220px] truncate py-2 font-medium">{project.customer}</TableCell>
                    <TableCell className="py-2">
                      <Badge variant="outline" className={cn("h-6", entityBadgeClassForLabel(entity))}>
                        {entity}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2 text-muted-foreground text-xs">{project.stage}</TableCell>
                    <TableCell className="py-2 text-right font-medium font-mono tabular-nums">
                      {project.value}
                    </TableCell>
                    <TableCell className="py-2 text-right font-mono tabular-nums">{daysStale}d</TableCell>
                    <TableCell className="max-w-[220px] truncate py-2 text-xs">{authority}</TableCell>
                    <TableCell className="py-2 text-right">
                      {showEscalation ? (
                        <AIEscalationButton
                          projectName={project.customer}
                          brandEntity={entity}
                          daysStale={daysStale}
                          utilityAuthority={authority}
                          permitNumber={permitNumber}
                        />
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export function CommandCenter({ data }: CommandCenterProps) {
  const router = useRouter();
  const [isSyncing, startSync] = useTransition();
  const [syncToastId, setSyncToastId] = useState<string | number | null>(null);
  const metricCards = useMemo(() => buildMetricCards(data), [data]);
  const openIssues = data.events.filter((e) => e.status === "critical" || e.status === "warning").length;

  useEffect(() => {
    if (!syncToastId || isSyncing) return;

    const timeout = window.setTimeout(() => {
      toast.success("Workbook sync complete", {
        id: syncToastId,
        description:
          openIssues > 0
            ? `Latest rows settled. ${openIssues} open issue${openIssues === 1 ? "" : "s"} in the operations stream.`
            : "Latest Google Sheets rows settled in the command center.",
      });
      setSyncToastId(null);
    }, 150);

    return () => window.clearTimeout(timeout);
  }, [isSyncing, openIssues, syncToastId]);

  function handleSyncNow() {
    const toastId = toast.loading("Syncing workbook", {
      description:
        data.source === "workbook"
          ? "Refreshing the Google Sheets-backed command center."
          : "Reloading the preview command center dataset.",
    });
    setSyncToastId(toastId);
    startSync(() => {
      router.refresh();
    });
  }

  return (
    <div className={cn(dashPageClass, "mx-auto w-full max-w-[1600px] gap-4 p-3 md:gap-6 md:p-5 xl:p-6")}>
      <div className={cn(dashPageHeaderClass, "gap-3 pb-4 lg:flex-row lg:items-end lg:justify-between")}>
        <div className="grid gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-semibold text-xl tracking-tight md:text-3xl">Executive Control Tower</h1>
            <Badge
              variant="outline"
              className={cn("h-6 px-2 font-mono text-[10px]", entityBrandStyles.yellowStar.badge)}
            >
              Proof-of-capability demo
            </Badge>
            <Badge variant={data.source === "workbook" ? "default" : "outline"} className="h-6 px-2 text-[10px]">
              {data.source === "workbook" ? "Workbook connected" : "Preview mode"}
            </Badge>
          </div>
          <p className="max-w-3xl text-muted-foreground text-xs leading-relaxed md:text-sm">
            Workbook-led review surface for YSP, 2SK, and 3SK operating signals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-2 rounded-md border border-border bg-slate-50 px-2.5 py-1.5">
            <DatabaseZap className={cn("size-4", entityBrandStyles.solar3k.icon)} />
            <span className="font-medium">
              {data.source === "workbook" ? "Google Sheets live sync" : "Preview fallback"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>
              Updated <RelativeTime value={data.updatedAt} />
            </span>
          </div>
          <Button variant="outline" size="sm" disabled={isSyncing} onClick={handleSyncNow}>
            <RefreshCw className={cn("size-4", isSyncing && "animate-spin")} data-icon="inline-start" />
            {isSyncing ? "Syncing…" : "Sync Now"}
          </Button>
        </div>
      </div>

      <div className={cn(dashKpiGridClass, "gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-4")}>
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card
              key={metric.title}
              size="sm"
              className={cn(dashCardClass, "overflow-hidden shadow-sm", metric.accentClassName)}
            >
              <CardHeader
                className={cn(
                  "flex flex-row items-start justify-between gap-3 space-y-0 px-3.5 pt-3.5 md:px-4 md:pt-4",
                  dashCardHeaderClass,
                )}
              >
                <div className="grid min-w-0 gap-1">
                  <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                    <CardDescription className="whitespace-nowrap text-[11px] md:text-xs">
                      {metric.title}
                    </CardDescription>
                    <Badge
                      variant="outline"
                      className={cn("h-5 shrink-0 px-1.5 text-[10px]", entityBadgeClassForLabel(metric.entity))}
                    >
                      {metric.entity}
                    </Badge>
                  </div>
                  <CardTitle className={cn(dashKpiValueClass, "whitespace-nowrap md:text-3xl")}>
                    {metric.value}
                  </CardTitle>
                </div>
                <span className="rounded-full border border-border bg-slate-50 p-2 shadow-sm">
                  <Icon className={`size-4 ${metric.iconClassName}`} />
                </span>
              </CardHeader>
              <CardContent className={cn(dashCardContentClass, "px-3.5 pb-3.5 md:px-4 md:pb-4")}>
                <div className="flex items-center justify-between gap-2">
                  <p className="line-clamp-2 text-[11px] text-muted-foreground leading-snug">{metric.caption}</p>
                  <Badge
                    variant="outline"
                    className={cn("shrink-0 whitespace-nowrap text-[10px]", statusStyles.live)}
                  >
                    {metric.trend}
                  </Badge>
                </div>
                <p className="mt-2 border-border border-t pt-2 font-mono text-[10px] text-muted-foreground leading-relaxed">
                  {metric.technicalNote}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <WorkbookSyncContractCard workbookConnected={data.source === "workbook"} />

      <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <RevenueSplitChart data={data.revenueSplit} />
        </div>
        <div className="xl:col-span-4">
          <GlobalEventsFeed
            events={data.events}
            lastSyncedAt={data.updatedAt}
            workbookConnected={data.source === "workbook"}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <TelemetryMatrixCard />
        </div>
        <div className="xl:col-span-7">
          <ActiveProjectsMatrix projects={data.projects} />
        </div>
      </div>
    </div>
  );
}
