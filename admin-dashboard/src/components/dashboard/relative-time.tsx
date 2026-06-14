"use client";

import { useEffect, useState } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatSyncAbsoluteTime, formatSyncRelativeTime } from "@/lib/sync-time";
import { cn } from "@/lib/utils";

type RelativeTimeProps = {
  value: string;
  className?: string;
  prefix?: string;
};

export function RelativeTime({ value, className, prefix }: RelativeTimeProps) {
  const [label, setLabel] = useState(() => formatSyncRelativeTime(value));

  useEffect(() => {
    setLabel(formatSyncRelativeTime(value));
    const interval = setInterval(() => setLabel(formatSyncRelativeTime(value)), 30_000);
    return () => clearInterval(interval);
  }, [value]);

  const content = prefix ? `${prefix}${label}` : label;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <time dateTime={value} className={cn("cursor-default underline decoration-dotted underline-offset-2", className)}>
          {content}
        </time>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs text-sm">
        {formatSyncAbsoluteTime(value)}
      </TooltipContent>
    </Tooltip>
  );
}
