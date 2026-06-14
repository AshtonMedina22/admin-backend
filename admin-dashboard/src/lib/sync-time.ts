import { format, formatDistanceToNowStrict, isValid, parseISO } from "date-fns";

/** Parse timestamps stored in the workbook (ISO, date-only, or US datetime strings). */
export function parseWorkbookTimestamp(value: string | undefined | null): string | null {
  if (!value?.trim()) return null;

  const trimmed = value.trim();
  if (/ago|just now/i.test(trimmed)) return null;

  const iso = parseISO(trimmed);
  if (isValid(iso)) return iso.toISOString();

  const usDateTime = Date.parse(trimmed.replace(" ", "T"));
  if (!Number.isNaN(usDateTime)) return new Date(usDateTime).toISOString();

  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(trimmed);
  if (dateOnly) {
    const parsed = parseISO(`${trimmed}T12:00:00`);
    if (isValid(parsed)) return parsed.toISOString();
  }

  return null;
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
