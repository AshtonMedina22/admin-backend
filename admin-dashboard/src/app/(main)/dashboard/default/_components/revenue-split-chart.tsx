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
import {
  dashSectionCardContentClass,
  dashSectionCardHeaderClass,
  dashPlatformCardClass,
} from "@/lib/dashboard-ui";
import { entityBrandStyles, statusStyles } from "@/lib/entity-brand";
import { cn } from "@/lib/utils";

const chartConfig = {
  solar2sk: { label: "2SK Hardware", color: "var(--brand-2sk)" },
  solar3k: { label: "3SK Services", color: "var(--brand-3sk)" },
  yellowStar: { label: "YSP Yield", color: "var(--brand-ysp)" },
} satisfies ChartConfig;

function statusLabel(status: RevenueSplitMonth["status"]) {
  return status === "finalized" ? "Finalized" : "Pending Reconciliation";
}

export function RevenueSplitChart({ data = revenueSplitData }: { data?: RevenueSplitMonth[] }) {
  const pendingCount = data.filter((row) => row.status === "pending_reconciliation").length;

  return (
    <Card size="sm" className={cn("min-w-0", "@container/card", dashPlatformCardClass)}>
      <CardHeader className={dashSectionCardHeaderClass}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-1">
            <CardTitle className="text-base leading-tight md:text-lg">Combined Revenue Split Matrix</CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              $680k YTD combined revenue ledger - closed quarters vs. in-flight month requiring workbook cleanup.
            </CardDescription>
          </div>
          {pendingCount > 0 ? (
            <Badge
              variant="secondary"
              className={cn("h-6 shrink-0 whitespace-nowrap px-2 font-mono text-[10px]", statusStyles.warning)}
            >
              {pendingCount} period{pendingCount === 1 ? "" : "s"} pending reconciliation
            </Badge>
          ) : (
            <Badge variant="outline" className="shrink-0">
              All periods finalized
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          <Badge variant="outline" className={cn("whitespace-nowrap", entityBrandStyles.solar2sk.badge)}>
            2SK
          </Badge>
          <Badge variant="outline" className={cn("whitespace-nowrap", entityBrandStyles.solar3k.badge)}>
            3SK
          </Badge>
          <Badge variant="outline" className={cn("whitespace-nowrap", entityBrandStyles.yellowStar.badge)}>
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
                      ? cn("cursor-help whitespace-nowrap", statusStyles.warning)
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
        <ChartContainer config={chartConfig} className="aspect-auto h-48 w-full max-w-full overflow-hidden md:h-56">
          <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} className="stroke-border" />
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
              cursor={{ fill: "var(--border)", opacity: 0.45 }}
              content={
                <ChartTooltipContent
                  className="min-w-48 border border-border bg-card text-card-foreground shadow-lg"
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
