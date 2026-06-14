"use client";

import { Activity, AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";

import { EntityBrandBadge } from "@/components/dashboard/entity-brand-badge";
import { RelativeTime } from "@/components/dashboard/relative-time";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { GlobalEvent, GlobalEventStatus } from "@/data/demo/global-events";
import { globalEventsData } from "@/data/demo/global-events";
import { formatSyncRelativeTime } from "@/lib/sync-time";
import { dashCardClass, dashSectionCardContentClass, dashSectionCardHeaderClass } from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

const statusStyles: Record<GlobalEventStatus, string> = {
  critical: "border-destructive/40 bg-destructive/5 dark:bg-destructive/10",
  warning: "border-amber-500/40 bg-amber-500/5 dark:bg-amber-500/10",
  success: "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10",
  info: "border-border bg-muted/20",
};

const statusIcons: Record<GlobalEventStatus, typeof AlertCircle> = {
  critical: AlertCircle,
  warning: AlertTriangle,
  success: CheckCircle2,
  info: Info,
};

const statusBadgeVariant: Record<GlobalEventStatus, "destructive" | "secondary" | "outline" | "default"> = {
  critical: "destructive",
  warning: "secondary",
  success: "outline",
  info: "outline",
};

function formatEventTime(timestamp: string) {
  return formatSyncRelativeTime(timestamp);
}

type GlobalEventsFeedProps = {
  events?: GlobalEvent[];
  lastSyncedAt?: string;
  workbookConnected?: boolean;
};

export function GlobalEventsFeed({
  events = globalEventsData,
  lastSyncedAt,
  workbookConnected = false,
}: GlobalEventsFeedProps) {
  const openIssues = events.filter((e) => e.status === "critical" || e.status === "warning").length;

  return (
    <Card size="sm" className={cn("flex h-full flex-col border-amber-500 border-l-4", dashCardClass)}>
      <CardHeader className={dashSectionCardHeaderClass}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2 leading-none">
            <Activity className="size-5" />
            Global Operations Stream
          </CardTitle>
          {openIssues > 0 ? (
            <Badge variant="destructive" className="shrink-0">
              {openIssues} open {openIssues === 1 ? "issue" : "issues"}
            </Badge>
          ) : null}
        </div>
        <CardDescription>
          Workbook and API sync log - failures surface here for triage before they hit the operating dashboard.
          {lastSyncedAt ? (
            <>
              {" "}
              Last pull <RelativeTime value={lastSyncedAt} className="text-muted-foreground" />.
            </>
          ) : null}
        </CardDescription>
        {workbookConnected ? (
          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-emerald-950 text-sm dark:text-emerald-100">
            Live workbook pull - event timestamps use each row&apos;s Logged At column when present, otherwise the sync pull time.
          </div>
        ) : null}
      </CardHeader>
      <CardContent className={cn("min-h-0 flex-1", dashSectionCardContentClass)}>
        <ScrollArea className="h-72 pr-3">
          <div className="grid gap-3">
            {events.map((event) => {
              const StatusIcon = statusIcons[event.status];
              const isIsoTimestamp = !/ago|just now/i.test(event.timestamp);

              return (
                <div key={event.id} className={cn("rounded-md border p-3", statusStyles[event.status])}>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <StatusIcon
                        className={cn(
                          "size-3.5 shrink-0",
                          event.status === "critical" && "text-destructive",
                          event.status === "warning" && "text-amber-600 dark:text-amber-400",
                          event.status === "success" && "text-emerald-600 dark:text-emerald-400",
                          event.status === "info" && "text-muted-foreground",
                        )}
                      />
                      <EntityBrandBadge brand={event.entityBrand} className="h-5 px-1.5 text-[10px]" />
                      <Badge variant={statusBadgeVariant[event.status]} className="h-5 px-1.5 text-[10px]">
                        {event.status}
                      </Badge>
                    </div>
                    {isIsoTimestamp ? (
                      <RelativeTime
                        value={event.timestamp}
                        className="shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums"
                      />
                    ) : (
                      <span className="shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">
                        {formatEventTime(event.timestamp)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed">{event.message}</p>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
