"use client";

import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { Activity, AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { GlobalEvent, GlobalEventStatus } from "@/data/demo/global-events";
import { globalEventsData } from "@/data/demo/global-events";
import { formatCompany } from "@/data/demo/types";
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
  if (/ago|min|hr|sec/i.test(timestamp)) return timestamp;
  try {
    return formatDistanceToNowStrict(parseISO(timestamp), { addSuffix: true });
  } catch {
    return timestamp;
  }
}

type GlobalEventsFeedProps = {
  events?: GlobalEvent[];
  lastSyncedAt?: string;
};

export function GlobalEventsFeed({ events = globalEventsData, lastSyncedAt }: GlobalEventsFeedProps) {
  const openIssues = events.filter((e) => e.status === "critical" || e.status === "warning").length;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
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
          {lastSyncedAt ? ` Last pull ${formatEventTime(lastSyncedAt)}.` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-0 flex-1">
        <ScrollArea className="h-72 pr-3">
          <div className="grid gap-3">
            {events.map((event) => {
              const StatusIcon = statusIcons[event.status];
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
                      <span className="truncate font-semibold text-xs uppercase tracking-wide">
                        {formatCompany(event.entityBrand)}
                      </span>
                      <Badge variant={statusBadgeVariant[event.status]} className="h-5 px-1.5 text-[10px]">
                        {event.status}
                      </Badge>
                    </div>
                    <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
                      {formatEventTime(event.timestamp)}
                    </span>
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
