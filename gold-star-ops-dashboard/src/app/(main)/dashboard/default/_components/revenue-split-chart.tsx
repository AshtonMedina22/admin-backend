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
import type { RevenueSplitMonth } from "@/data/demo/revenue-split";
import { revenueSplitData } from "@/data/demo/revenue-split";

const chartConfig = {
  solar2sk: { label: "Solar 2SK", color: "var(--chart-1)" },
  solar3k: { label: "Solar 3SK", color: "var(--chart-2)" },
  yellowStar: { label: "Yellow Star Power", color: "var(--chart-3)" },
} satisfies ChartConfig;

function statusLabel(status: RevenueSplitMonth["status"]) {
  return status === "finalized" ? "Finalized" : "Pending Reconciliation";
}

export function RevenueSplitChart({ data = revenueSplitData }: { data?: RevenueSplitMonth[] }) {
  const pendingCount = data.filter((row) => row.status === "pending_reconciliation").length;

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-1">
            <CardTitle className="leading-none">Combined Revenue Split Matrix</CardTitle>
            <CardDescription>
              Multi-entity revenue by period — closed quarters vs. in-flight month requiring workbook cleanup.
            </CardDescription>
          </div>
          {pendingCount > 0 ? (
            <Badge
              variant="secondary"
              className="shrink-0 border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200"
            >
              {pendingCount} period{pendingCount === 1 ? "" : "s"} pending reconciliation
            </Badge>
          ) : (
            <Badge variant="outline" className="shrink-0">
              All periods finalized
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          {data.map((row) => (
            <Badge
              key={row.month}
              variant={row.status === "finalized" ? "outline" : "secondary"}
              className={
                row.status === "pending_reconciliation"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200"
                  : undefined
              }
              title={row.statusNote}
            >
              {row.month}: {statusLabel(row.status)}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 8 }}>
            <CartesianGrid vertical={false} strokeOpacity={0.5} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${Number(value) / 1000}k`} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(_, payload) => {
                    const row = payload?.[0]?.payload as RevenueSplitMonth | undefined;
                    if (!row) return "";
                    return `${row.month} — ${statusLabel(row.status)}`;
                  }}
                  formatter={(value, name) => (
                    <>
                      <span className="text-muted-foreground">
                        {chartConfig[name as keyof typeof chartConfig]?.label}
                      </span>
                      <span className="font-medium font-mono tabular-nums">${Number(value).toLocaleString()}</span>
                    </>
                  )}
                />
              }
            />
            <ChartLegend verticalAlign="top" content={<ChartLegendContent className="mb-5 justify-end" />} />
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
