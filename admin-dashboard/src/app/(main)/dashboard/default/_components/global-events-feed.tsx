"use client";

import { Activity, AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";

import { EntityBrandBadge } from "@/components/dashboard/entity-brand-badge";
import { RelativeTime } from "@/components/dashboard/relative-time";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { GlobalEvent, GlobalEventStatus } from "@/data/demo/global-events";
import { globalEventsData } from "@/data/demo/global-events";
import { dashCardClass, dashInfoBannerClass, dashSectionCardContentClass, dashSectionCardHeaderClass } from "@/lib/dashboard-ui";
import { entityBrandStyles, statusStyles } from "@/lib/entity-brand";
import { formatSyncRelativeTime } from "@/lib/sync-time";
import { cn } from "@/lib/utils";

const eventStatusStyles: Record<GlobalEventStatus, string> = {
  critical: cn(statusStyles.critical, "border-l-2 shadow-none"),
  warning: cn(statusStyles.warning, "border-l-2 shadow-none"),
  success: cn(statusStyles.live, "border-l-2 shadow-none"),
  info: cn(statusStyles.info, "border-l-2 shadow-none"),
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
    <Card size="sm" className={cn("flex h-full flex-col", entityBrandStyles.yellowStar.accentBar, dashCardClass)}>
      <CardHeader className={dashSectionCardHeaderClass}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2 leading-none">
            <Activity className="size-5" />
            Global Operations Stream
          </CardTitle>
          {openIssues > 0 ? (
            <Badge variant="destructive" className="shrink-0 whitespace-nowrap">
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
          <div className={cn(dashInfoBannerClass, "text-sm")}>
            Live workbook pull - event timestamps use each row&apos;s Logged At column when present, otherwise the sync
            pull time.
          </div>
        ) : null}
      </CardHeader>
      <CardContent className={cn("min-h-0 flex-1", dashSectionCardContentClass)}>
        <ScrollArea className="h-72 pr-3">
          <div className="divide-y divide-border/60">
            {events.map((event) => {
              const StatusIcon = statusIcons[event.status];
              const isIsoTimestamp = !/ago|just now/i.test(event.timestamp);

              return (
                <div
                  key={event.id}
                  className={cn("border-l-2 px-0 py-3 first:pt-0 last:pb-0", eventStatusStyles[event.status])}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <StatusIcon
                        className={cn(
                          "size-3.5 shrink-0",
                          event.status === "critical" && "text-[var(--status-critical)]",
                          event.status === "warning" && "text-[var(--status-warning-text)]",
                          event.status === "success" && "text-[var(--status-live)]",
                          event.status === "info" && "text-muted-foreground",
                        )}
                      />
                      <EntityBrandBadge
                        brand={event.entityBrand}
                        className="h-5 whitespace-nowrap px-1.5 text-[10px]"
                      />
                      <Badge
                        variant={statusBadgeVariant[event.status]}
                        className={cn(
                          "h-5 whitespace-nowrap px-1.5 text-[10px]",
                          event.status === "critical" && statusStyles.critical,
                          event.status === "warning" && statusStyles.warning,
                          event.status === "success" && statusStyles.live,
                          event.status === "info" && statusStyles.info,
                        )}
                      >
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
                  <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{event.message}</p>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
