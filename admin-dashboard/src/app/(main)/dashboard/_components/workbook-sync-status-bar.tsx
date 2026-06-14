"use client";

import { useTransition } from "react";

import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { DatabaseZap, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { WorkbookSyncStatus } from "@/lib/workbook-sync-types";
import { workbookProviderLabel } from "@/lib/workbook-sync-types";
import { cn } from "@/lib/utils";

type WorkbookSyncStatusBarProps = WorkbookSyncStatus;

export function WorkbookSyncStatusBar({ source, provider, updatedAt }: WorkbookSyncStatusBarProps) {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();
  const isLive = source === "workbook";
  const updatedLabel = formatDistanceToNowStrict(parseISO(updatedAt), { addSuffix: true });

  return (
    <div
      className={cn(
        "hidden items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs md:flex",
        isLive ? "border-emerald-500/30 bg-emerald-500/10" : "border-border bg-muted/35",
      )}
    >
      <DatabaseZap className={cn("size-3.5", isLive ? "text-emerald-600" : "text-muted-foreground")} />
      <div className="flex flex-col leading-tight">
        <span className="font-medium">
          Status: {isLive ? "Google Sheets Live Sync Active" : "Demo Preview Mode"}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {isLive && provider ? `${workbookProviderLabel(provider)} · ` : "Local dataset · "}
          Updated {updatedLabel}
        </span>
      </div>
      {isLive ? (
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
      ) : (
        <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
          Preview
        </Badge>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        disabled={isRefreshing}
        onClick={() => startRefresh(() => router.refresh())}
        aria-label="Refresh workbook sync"
      >
        <RefreshCw className={cn("size-3.5", isRefreshing && "animate-spin")} />
      </Button>
    </div>
  );
}
