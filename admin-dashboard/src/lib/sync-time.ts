import { format, formatDistanceToNowStrict, parseISO } from "date-fns";

/** Realistic ages for demo / workbook event rows (minutes before now). */
export const DEMO_EVENT_AGE_MINUTES = [4, 11, 18, 22, 31, 60] as const;

/** Default "last successful sync" age when the workbook has no explicit sync timestamp. */
export const DEFAULT_SYNC_AGE_MINUTES = 3;

export function minutesAgoIso(minutes: number, anchorMs = Date.now()) {
  return new Date(anchorMs - minutes * 60_000).toISOString();
}

export function staggerEventTimestamp(index: number, anchorMs = Date.now()) {
  const minutes = DEMO_EVENT_AGE_MINUTES[index] ?? (index + 1) * 8;
  return minutesAgoIso(minutes, anchorMs);
}

export function formatSyncRelativeTime(value: string, now = new Date()): string {
  if (/ago|just now/i.test(value)) return value;

  try {
    const date = parseISO(value);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 0) return "Just now";
    if (seconds < 45) return "Just now";
    return formatDistanceToNowStrict(date, { addSuffix: true });
  } catch {
    return value;
  }
}

export function formatSyncAbsoluteTime(value: string) {
  try {
    return format(parseISO(value), "MMM d, yyyy · h:mm a");
  } catch {
    return value;
  }
}
