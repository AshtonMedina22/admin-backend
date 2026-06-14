"use client";

import { useEffect, useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { DatabaseZap, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { RelativeTime } from "@/components/dashboard/relative-time";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WorkbookSyncStatus } from "@/lib/workbook-sync-types";
import { workbookProviderLabel } from "@/lib/workbook-sync-types";

type WorkbookSyncStatusBarProps = WorkbookSyncStatus;

export function WorkbookSyncStatusBar({ source, provider, updatedAt }: WorkbookSyncStatusBarProps) {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();
  const [refreshToastId, setRefreshToastId] = useState<string | number | null>(null);
  const isLive = source === "workbook";

  useEffect(() => {
    if (!refreshToastId || isRefreshing) return;

    const timeout = window.setTimeout(() => {
      toast.success("Workbook refreshed", {
        id: refreshToastId,
        description: isLive ? "Latest workbook rows settled in the dashboard." : "Local preview data reloaded.",
      });
      setRefreshToastId(null);
    }, 150);

    return () => window.clearTimeout(timeout);
  }, [isLive, isRefreshing, refreshToastId]);

  function handleRefresh() {
    const toastId = toast.loading("Syncing workbook", {
      description: isLive ? "Refreshing Google Sheets-backed server data." : "Reloading local preview data.",
    });
    setRefreshToastId(toastId);
    startRefresh(() => {
      router.refresh();
    });
  }

  return (
    <div
      className={cn(
        "hidden min-w-0 items-center gap-2 rounded-md border px-3 py-2 text-xs md:flex",
        isLive ? "border-emerald-500/30 bg-emerald-500/10" : "border-border bg-muted/35",
      )}
    >
      <DatabaseZap className={cn("size-4 shrink-0", isLive ? "text-emerald-600" : "text-muted-foreground")} />
      <div className="flex min-w-0 flex-col leading-snug">
        <span className="truncate font-medium">{isLive ? "Google Sheets live sync" : "Demo preview mode"}</span>
        <span className="truncate text-muted-foreground">
          {isLive && provider ? `${workbookProviderLabel(provider)} · ` : "Local dataset · "}
          <RelativeTime value={updatedAt} prefix="Updated " className="text-muted-foreground" />
        </span>
      </div>
      {isLive ? (
        <span className="relative flex size-2 shrink-0">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
      ) : (
        <Badge variant="outline" className="h-5 shrink-0 px-1.5 text-[10px]">
          Preview
        </Badge>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="size-7 shrink-0"
        disabled={isRefreshing}
        onClick={handleRefresh}
        aria-label="Refresh workbook sync"
      >
        <RefreshCw className={cn("size-3.5", isRefreshing && "animate-spin")} />
      </Button>
    </div>
  );
}
