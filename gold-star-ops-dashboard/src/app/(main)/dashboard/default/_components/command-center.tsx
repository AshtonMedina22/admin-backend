"use client";

import { useMemo, useTransition } from "react";

import { useRouter } from "next/navigation";

import { formatDistanceToNowStrict, parseISO } from "date-fns";
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

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CommandCenterData } from "@/data/demo/command-center";
import { cn } from "@/lib/utils";

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
};

function buildMetricCards(data: CommandCenterData): MetricCardConfig[] {
  const { metrics, trends } = data;

  return [
    {
      title: "Active B2B Pipeline",
      value: `$${metrics.b2bPipeline.toLocaleString()}`,
      caption: "Solar 3SK active contract and proposal pipeline.",
      trend: trends.b2bPipeline,
      icon: TrendingUp,
      iconClassName: "text-emerald-500",
    },
    {
      title: "Live Fleet Yield",
      value: `${metrics.fleetYield} kW`,
      caption: "Yellow Star Power grid performance.",
      trend: trends.fleetYield,
      icon: Activity,
      iconClassName: "text-emerald-500",
    },
    {
      title: "Combined Portfolio",
      value: `${metrics.portfolioCapacity} kW`,
      caption: "Aggregated 3SK + Yellow Star capacity.",
      trend: trends.portfolioCapacity,
      icon: Zap,
      iconClassName: "text-amber-500",
    },
    {
      title: "DIY Retail Vol (Mo)",
      value: `${metrics.retailVolume} Units`,
      caption: "Solar 2SK warehouse fulfillment flow.",
      trend: trends.retailVolume,
      icon: ShoppingCart,
      iconClassName: "text-blue-500",
    },
  ];
}

export function CommandCenter({ data }: CommandCenterProps) {
  const router = useRouter();
  const [isSyncing, startSync] = useTransition();
  const updatedLabel = formatDistanceToNowStrict(parseISO(data.updatedAt), { addSuffix: true });
  const metricCards = useMemo(() => buildMetricCards(data), [data]);
  const openIssues = data.events.filter((e) => e.status === "critical" || e.status === "warning").length;

  function handleSyncNow() {
    startSync(async () => {
      router.refresh();
      toast.message("Workbook sync initiated", {
        description:
          openIssues > 0
            ? `Pulling latest rows - ${openIssues} open issue${openIssues === 1 ? "" : "s"} in the operations stream.`
            : "Pulling latest rows from the Google Sheets workbook.",
      });
    });
  }

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-3 border-b pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-semibold text-2xl tracking-tight">Executive Control Tower</h1>
            <Badge variant={data.source === "workbook" ? "default" : "outline"}>
              {data.source === "workbook" ? "Workbook connected" : "Preview mode"}
            </Badge>
          </div>
          <p className="max-w-3xl text-muted-foreground text-sm">
            Master executive control tower for Yellow Star Power, Solar 2SK, and Solar 3SK operating signals — metrics
            derived from the same schema as the operating workbook.
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
            <CheckCircle2 className="size-4" />
            Updated {updatedLabel}
          </div>
          <Button variant="outline" size="sm" disabled={isSyncing} onClick={handleSyncNow}>
            <RefreshCw className={cn("size-4", isSyncing && "animate-spin")} data-icon="inline-start" />
            {isSyncing ? "Syncing…" : "Sync Now"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                <div className="grid gap-1">
                  <CardDescription>{metric.title}</CardDescription>
                  <CardTitle className="font-semibold text-3xl tabular-nums tracking-tight">{metric.value}</CardTitle>
                </div>
                <Icon className={`size-5 ${metric.iconClassName}`} />
              </CardHeader>
              <CardContent>
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
          <GlobalEventsFeed events={data.events} lastSyncedAt={data.updatedAt} />
        </div>
      </div>
    </div>
  );
}
