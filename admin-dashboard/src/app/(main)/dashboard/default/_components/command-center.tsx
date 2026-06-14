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

function entityAccent(value: string) {
  const label = entityLabel(value);
  if (label === "2SK") return "border-lime-500 border-l-2";
  if (label === "3SK") return "border-cyan-500 border-l-2";
  if (label === "YSP") return "border-amber-500 border-l-2";
  return "border-l-4 border-slate-400/70";
}

function entityBadgeClass(value: string) {
  const label = entityLabel(value);
  if (label === "2SK") return "border-lime-500/20 bg-lime-950/20 text-lime-300";
  if (label === "3SK") return "border-cyan-500/20 bg-cyan-950/30 text-cyan-300";
  if (label === "YSP") return "border-amber-500/20 bg-amber-950/30 text-amber-300";
  return "border-border bg-muted/30 text-muted-foreground";
}

function metricValueClass(entity: MetricCardConfig["entity"]) {
  if (entity === "2SK") return "text-lime-300";
  if (entity === "3SK") return "text-cyan-300";
  return "text-amber-300";
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
      iconClassName: "text-cyan-500",
      entity: "3SK",
      accentClassName: "border-cyan-500 border-l-2",
    },
    {
      title: "Live Fleet Yield",
      value: `${metrics.fleetYield.toFixed(1)} MW`,
      caption: "Active macro fleet generation.",
      technicalNote:
        "Production wiring: a scheduled SolarEdge / SCADA polling worker batches inverter register reads, rate-limits API calls, and maps generation samples into YSP fleet-yield metrics.",
      trend: trends.fleetYield,
      icon: Activity,
      iconClassName: "text-amber-500",
      entity: "YSP",
      accentClassName: "border-amber-500 border-l-2",
    },
    {
      title: "Combined Portfolio",
      value: `${metrics.portfolioCapacity.toFixed(1)} MW`,
      caption: "Aggregated North Texas asset footprint.",
      technicalNote:
        "Production wiring: workbook and telemetry rows are cleaned, type-cast, entity-mapped, and rolled into MW-scale executive capacity metrics for portfolio review.",
      trend: trends.portfolioCapacity,
      icon: Zap,
      iconClassName: "text-amber-500",
      entity: "YSP",
      accentClassName: "border-amber-500 border-l-2",
    },
    {
      title: "DIY Retail Vol (Mo)",
      value: `${metrics.retailVolume} Units`,
      caption: "Monthly warehouse fulfillment flow.",
      technicalNote:
        "Production wiring: WooCommerce order webhooks post JSON payloads into middleware, which validates SKUs, deduplicates orders, and writes sanitized fulfillment rows to the operations workbook.",
      trend: trends.retailVolume,
      icon: ShoppingCart,
      iconClassName: "text-lime-500",
      entity: "2SK",
      accentClassName: "border-lime-500 border-l-2",
    },
  ];
}

function TelemetryMatrixCard() {
  const telemetry = useTelemetrySimulation();

  return (
    <Card size="sm" className={cn("h-full border-amber-500/70 border-l-4", dashCardClass)}>
      <CardHeader className={dashSectionCardHeaderClass}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-1">
            <CardTitle>Live Interconnection Telemetry</CardTitle>
            <CardDescription>SolarEdge polling loop for YSP grid export status.</CardDescription>
          </div>
          <Badge variant="outline" className={entityBadgeClass("YSP")}>
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
          <div className="rounded-md border bg-muted/25 p-3">
            <p className="text-[11px] text-muted-foreground uppercase">Generation</p>
            <p className="font-mono font-semibold text-amber-600 text-lg">{telemetry.liveYield.toFixed(1)} kW</p>
          </div>
          <div className="rounded-md border bg-muted/25 p-3">
            <p className="text-[11px] text-muted-foreground uppercase">Consumption</p>
            <p className="font-mono font-semibold text-lg">{telemetry.consumptionKw.toFixed(1)} kW</p>
          </div>
          <div className="rounded-md border bg-muted/25 p-3">
            <p className="text-[11px] text-muted-foreground uppercase">Grid Export</p>
            <p className="font-mono font-semibold text-emerald-600 text-lg">{telemetry.netExport.toFixed(1)} kW</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActiveProjectsMatrix({ projects }: { projects: CommandCenterData["projects"] }) {
  return (
    <Card size="sm" className={cn("border-indigo-500/70 border-l-4", dashCardClass)}>
      <CardHeader className={dashSectionCardHeaderClass}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-1">
            <CardTitle>Active Project Escalation Matrix</CardTitle>
            <CardDescription>
              Commercial, retail, and grid workstreams with utility-aware action drafts.
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
          >
            AI escalation lane
          </Badge>
        </div>
      </CardHeader>
      <CardContent className={dashSectionCardContentClass}>
        <div className="overflow-hidden rounded-md border border-border/60">
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow className="h-9 border-neutral-800/60 hover:bg-transparent">
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
                    className={cn("h-11 border-neutral-800/60 hover:bg-muted/30", entityAccent(entity))}
                  >
                    <TableCell className="max-w-[220px] truncate py-2 font-medium">{project.customer}</TableCell>
                    <TableCell className="py-2">
                      <Badge variant="outline" className={cn("h-6", entityBadgeClass(entity))}>
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
              className="h-6 border-amber-500/30 bg-amber-500/10 px-2 font-mono text-[10px] text-amber-700 dark:text-amber-300"
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
          <div className="flex items-center gap-2 rounded-md border bg-muted/35 px-2.5 py-1.5">
            <DatabaseZap className="size-4 text-primary" />
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
                      className={cn("h-5 shrink-0 px-1.5 text-[10px]", entityBadgeClass(metric.entity))}
                    >
                      {metric.entity}
                    </Badge>
                  </div>
                  <CardTitle
                    className={cn(
                      "whitespace-nowrap font-bold font-mono text-xl tabular-nums tracking-tight md:text-3xl",
                      metricValueClass(metric.entity),
                    )}
                  >
                    {metric.value}
                  </CardTitle>
                </div>
                <span className="rounded-full border border-border/60 bg-background/70 p-2 shadow-sm">
                  <Icon className={`size-4 ${metric.iconClassName}`} />
                </span>
              </CardHeader>
              <CardContent className={cn(dashCardContentClass, "px-3.5 pb-3.5 md:px-4 md:pb-4")}>
                <div className="flex items-center justify-between gap-2">
                  <p className="line-clamp-2 text-[11px] text-muted-foreground leading-snug">{metric.caption}</p>
                  <Badge
                    variant="outline"
                    className="shrink-0 whitespace-nowrap border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-600"
                  >
                    {metric.trend}
                  </Badge>
                </div>
                <p className="mt-2 border-zinc-900 border-t pt-2 font-mono text-[10px] text-zinc-500 leading-relaxed">
                  {metric.technicalNote}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
