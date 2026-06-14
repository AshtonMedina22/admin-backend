"use client";

import { useMemo, useTransition } from "react";

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

import { RelativeTime } from "@/components/dashboard/relative-time";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CommandCenterData } from "@/data/demo/command-center";
import { cn } from "@/lib/utils";
import { TelemetrySimulatorControl, useTelemetrySimulation } from "../../enterprise/_components/telemetry-simulator";

import { AIEscalationButton } from "./ai-escalation-button";
import { GlobalEventsFeed } from "./global-events-feed";
import { RevenueSplitChart } from "./revenue-split-chart";

type CommandCenterProps = {
  data: CommandCenterData;
};

type MetricCardConfig = {
  title: string;
  value: string;
  caption: string;
  trend: string;
  icon: LucideIcon;
  iconClassName: string;
  entity: "Solar 2SK" | "Solar 3SK" | "Yellow Star Power";
  accentClassName: string;
};

function entityLabel(value: string) {
  const lower = value.toLowerCase();
  if (lower.includes("yellow") || lower.includes("cedar")) return "Yellow Star Power";
  if (lower.includes("3sk") || lower.includes("3k") || lower.includes("summit")) return "Solar 3SK";
  if (lower.includes("2sk") || lower.includes("nova") || lower.includes("retail")) return "Solar 2SK";
  return "Shared";
}

function entityAccent(value: string) {
  const label = entityLabel(value);
  if (label === "Solar 2SK") return "border-l-4 border-emerald-500";
  if (label === "Solar 3SK") return "border-l-4 border-indigo-500";
  if (label === "Yellow Star Power") return "border-l-4 border-amber-500";
  return "border-l-4 border-slate-400";
}

function entityBadgeClass(value: string) {
  const label = entityLabel(value);
  if (label === "Solar 2SK") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  if (label === "Solar 3SK") return "border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300";
  if (label === "Yellow Star Power") return "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300";
  return "border-border bg-muted/30 text-muted-foreground";
}

function utilityAuthorityFor(company: string, projectName: string) {
  const target = `${company} ${projectName}`.toLowerCase();
  if (target.includes("retail") || target.includes("warehouse") || target.includes("2sk")) return "Wylie Warehouse Operations";
  if (target.includes("yellow") || target.includes("hunt") || target.includes("cedar")) return "Oncor Utility Engineering";
  if (target.includes("plano")) return "City of Plano Building Inspections";
  return "Oncor Interconnection Desk";
}

function staleDaysFor(index: number, stage: string) {
  if (/blocked|pending|review|testing/i.test(stage)) return 5 + index * 2;
  return Math.max(1, index + 1);
}

function buildMetricCards(data: CommandCenterData): MetricCardConfig[] {
  const { metrics, trends } = data;

  return [
    {
      title: "Active B2B Pipeline",
      value: `$${metrics.b2bPipeline.toLocaleString()}`,
      caption: "Solar 3SK active contract and proposal pipeline value.",
      trend: trends.b2bPipeline,
      icon: TrendingUp,
      iconClassName: "text-indigo-500",
      entity: "Solar 3SK",
      accentClassName: "border-l-4 border-indigo-500",
    },
    {
      title: "Live Fleet Yield",
      value: `${metrics.fleetYield} kW`,
      caption: "Yellow Star Power active managed array performance.",
      trend: trends.fleetYield,
      icon: Activity,
      iconClassName: "text-emerald-500",
      entity: "Yellow Star Power",
      accentClassName: "border-l-4 border-amber-500",
    },
    {
      title: "Combined Portfolio",
      value: `${metrics.portfolioCapacity} kW`,
      caption: "Aggregated Hunt Co., Frisco, Wylie, Plano, and McKinney footprint.",
      trend: trends.portfolioCapacity,
      icon: Zap,
      iconClassName: "text-amber-500",
      entity: "Yellow Star Power",
      accentClassName: "border-l-4 border-amber-500",
    },
    {
      title: "DIY Retail Vol (Mo)",
      value: `${metrics.retailVolume} Units`,
      caption: "Solar 2SK active monthly WooCommerce warehouse fulfillment flow.",
      trend: trends.retailVolume,
      icon: ShoppingCart,
      iconClassName: "text-emerald-500",
      entity: "Solar 2SK",
      accentClassName: "border-l-4 border-emerald-500",
    },
  ];
}

function TelemetryMatrixCard() {
  const telemetry = useTelemetrySimulation();

  return (
    <Card className="h-full border-l-4 border-amber-500 [--card-spacing:--spacing(5)]">
      <CardHeader className="p-5 pb-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-1">
            <CardTitle>Live Interconnection Telemetry</CardTitle>
            <CardDescription>SolarEdge polling loop for Yellow Star Power grid export status.</CardDescription>
          </div>
          <Badge variant="outline" className={entityBadgeClass("Yellow Star Power")}>
            Yellow Star Power
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 p-5">
        <TelemetrySimulatorControl
          isSimulating={telemetry.isSimulating}
          onSimulatingChange={telemetry.setIsSimulating}
          liveYield={telemetry.liveYield}
        />
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-md border bg-muted/25 p-3">
            <p className="text-[11px] text-muted-foreground uppercase">Generation</p>
            <p className="font-mono font-semibold text-lg text-amber-600">{telemetry.liveYield.toFixed(1)} kW</p>
          </div>
          <div className="rounded-md border bg-muted/25 p-3">
            <p className="text-[11px] text-muted-foreground uppercase">Consumption</p>
            <p className="font-mono font-semibold text-lg">{telemetry.consumptionKw.toFixed(1)} kW</p>
          </div>
          <div className="rounded-md border bg-muted/25 p-3">
            <p className="text-[11px] text-muted-foreground uppercase">Grid Export</p>
            <p className="font-mono font-semibold text-lg text-emerald-600">{telemetry.netExport.toFixed(1)} kW</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActiveProjectsMatrix({ projects }: { projects: CommandCenterData["projects"] }) {
  return (
    <Card className="border-l-4 border-indigo-500 [--card-spacing:--spacing(5)]">
      <CardHeader className="p-5 pb-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-1">
            <CardTitle>Active Project Escalation Matrix</CardTitle>
            <CardDescription>Commercial, retail, and grid workstreams with utility-aware action drafts.</CardDescription>
          </div>
          <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
            AI escalation lane
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="h-9">
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
                return (
                  <TableRow key={project.id} className={cn("h-11", entityAccent(entity))}>
                    <TableCell className="py-2 font-medium">{project.customer}</TableCell>
                    <TableCell className="py-2">
                      <Badge variant="outline" className={cn("h-6", entityBadgeClass(entity))}>
                        {entity}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2 text-muted-foreground text-xs">{project.stage}</TableCell>
                    <TableCell className="py-2 text-right font-mono font-medium">{project.value}</TableCell>
                    <TableCell className="py-2 text-right font-mono">{daysStale}d</TableCell>
                    <TableCell className="py-2 text-xs">{authority}</TableCell>
                    <TableCell className="py-2 text-right">
                      <AIEscalationButton
                        projectName={project.customer}
                        brandEntity={entity}
                        daysStale={daysStale}
                        utilityAuthority={authority}
                      />
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
  const metricCards = useMemo(() => buildMetricCards(data), [data]);
  const openIssues = data.events.filter((e) => e.status === "critical" || e.status === "warning").length;

  function handleSyncNow() {
    startSync(async () => {
      router.refresh();
      toast.success("Workbook sync complete", {
        description:
          openIssues > 0
            ? `Pulled latest rows. ${openIssues} open issue${openIssues === 1 ? "" : "s"} in the operations stream.`
            : "Pulled latest rows from the Google Sheets workbook.",
      });
    });
  }

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-5">
      <div className="flex flex-col gap-3 border-b pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-semibold text-2xl tracking-tight">Executive Control Tower</h1>
            <Badge variant={data.source === "workbook" ? "default" : "outline"}>
              {data.source === "workbook" ? "Workbook connected" : "Preview mode"}
            </Badge>
          </div>
          <p className="max-w-3xl text-muted-foreground text-sm">
            Master executive control tower for Yellow Star Power, Solar 2SK, and Solar 3SK operating signals - metrics
            derived from the same schema as the Google Sheets operating workbook.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-md border bg-muted/35 px-3 py-2 text-sm">
            <DatabaseZap className="size-4 text-primary" />
            <span className="font-medium">
              {data.source === "workbook" ? "Google Sheets live sync" : "Preview fallback"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className={cn("min-h-44 [--card-spacing:--spacing(5)]", metric.accentClassName)}>
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-5 pb-0">
                <div className="grid gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardDescription>{metric.title}</CardDescription>
                    <Badge variant="outline" className={cn("h-5 px-1.5 text-[10px]", entityBadgeClass(metric.entity))}>
                      {metric.entity}
                    </Badge>
                  </div>
                  <CardTitle className="font-mono font-semibold text-3xl tabular-nums tracking-tight">
                    {metric.value}
                  </CardTitle>
                </div>
                <Icon className={`size-5 ${metric.iconClassName}`} />
              </CardHeader>
              <CardContent className="p-5 pt-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-muted-foreground text-sm">{metric.caption}</p>
                  <Badge variant="outline" className="shrink-0 text-emerald-600">
                    {metric.trend}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-12">
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

      <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-12">
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
