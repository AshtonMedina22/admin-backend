"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { RevenueSplitMonth } from "@/data/demo/revenue-split";
import { revenueSplitData } from "@/data/demo/revenue-split";
import { dashCardClass, dashSectionCardContentClass, dashSectionCardHeaderClass } from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

const chartConfig = {
  solar2sk: { label: "2SK Hardware", color: "#a3e635" },
  solar3k: { label: "3SK Services", color: "#22d3ee" },
  yellowStar: { label: "YSP Yield", color: "#fbbf24" },
} satisfies ChartConfig;

function statusLabel(status: RevenueSplitMonth["status"]) {
  return status === "finalized" ? "Finalized" : "Pending Reconciliation";
}

export function RevenueSplitChart({ data = revenueSplitData }: { data?: RevenueSplitMonth[] }) {
  const pendingCount = data.filter((row) => row.status === "pending_reconciliation").length;

  return (
    <Card size="sm" className={cn("@container/card border-indigo-500/70 border-l-4", dashCardClass)}>
      <CardHeader className={dashSectionCardHeaderClass}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-1">
            <CardTitle className="text-lg leading-tight md:text-xl">Combined Revenue Split Matrix</CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              $680k YTD combined revenue ledger - closed quarters vs. in-flight month requiring workbook cleanup.
            </CardDescription>
          </div>
          {pendingCount > 0 ? (
            <Badge
              variant="secondary"
              className="h-6 shrink-0 whitespace-nowrap border-amber-500/30 bg-amber-500/10 px-2 font-mono text-[10px] text-amber-800 dark:text-amber-200"
            >
              {pendingCount} period{pendingCount === 1 ? "" : "s"} pending reconciliation
            </Badge>
          ) : (
            <Badge variant="outline" className="shrink-0">
              All periods finalized
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 pt-2">
          <Badge
            variant="outline"
            className="whitespace-nowrap border-lime-500/30 bg-lime-500/10 text-lime-700 dark:text-lime-300"
          >
            2SK
          </Badge>
          <Badge
            variant="outline"
            className="whitespace-nowrap border-cyan-500/30 bg-sky-50 text-cyan-700 dark:text-cyan-300"
          >
            3SK
          </Badge>
          <Badge
            variant="outline"
            className="whitespace-nowrap border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300"
          >
            YSP
          </Badge>
          {data.map((row) => (
            <Tooltip key={row.month}>
              <TooltipTrigger asChild>
                <Badge
                  variant={row.status === "finalized" ? "outline" : "secondary"}
                  className={cn(
                    "h-6 px-2 font-mono text-[10px]",
                    row.status === "pending_reconciliation"
                      ? "cursor-help whitespace-nowrap border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200"
                      : "cursor-help whitespace-nowrap",
                  )}
                >
                  {row.month}: {statusLabel(row.status)}
                </Badge>
              </TooltipTrigger>
              {row.statusNote ? (
                <TooltipContent side="bottom" className="max-w-xs text-sm leading-relaxed">
                  {row.statusNote}
                </TooltipContent>
              ) : null}
            </Tooltip>
          ))}
        </div>
      </CardHeader>
      <CardContent className={dashSectionCardContentClass}>
        <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full overflow-hidden md:h-72">
          <BarChart data={data} margin={{ top: 8, right: 4, left: -8 }}>
            <CartesianGrid vertical={false} stroke="#18181b" strokeOpacity={1} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="whitespace-nowrap font-mono"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${Number(value) / 1000}k`}
              className="whitespace-nowrap font-mono"
            />
            <ChartTooltip
              cursor={{ fill: "#18181b", opacity: 0.45 }}
              content={
                <ChartTooltipContent
                  className="min-w-48 border border-[#1B1B3A]/10 bg-[#1B1B3A] text-zinc-100 shadow-lg"
                  indicator="dot"
                  labelFormatter={(_, payload) => {
                    const row = payload?.[0]?.payload as RevenueSplitMonth | undefined;
                    if (!row) return "";
                    return `${row.month} - ${statusLabel(row.status)}`;
                  }}
                  formatter={(value, name) => {
                    const label = chartConfig[name as keyof typeof chartConfig]?.label ?? String(name);
                    return [
                      <span key="value" className="whitespace-nowrap font-mono">
                        ${Number(value).toLocaleString()}
                      </span>,
                      label,
                    ];
                  }}
                />
              }
            />
            <ChartLegend verticalAlign="top" content={<ChartLegendContent className="mb-3 justify-end text-xs" />} />
            <Bar dataKey="solar2sk" stackId="revenue" fill="var(--color-solar2sk)" radius={[0, 0, 0, 0]} />
            <Bar dataKey="solar3k" stackId="revenue" fill="var(--color-solar3k)" radius={[0, 0, 0, 0]} />
            <Bar dataKey="yellowStar" stackId="revenue" fill="var(--color-yellowStar)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
        {pendingCount > 0 && data.some((r) => r.statusNote) ? (
          <p className="mt-3 text-muted-foreground text-xs">
            Reconciliation note: {data.find((r) => r.status === "pending_reconciliation")?.statusNote}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
