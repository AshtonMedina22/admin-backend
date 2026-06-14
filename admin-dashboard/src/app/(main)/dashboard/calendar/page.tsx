import { DEMO_ORG } from "@/config/demo-identity";
import { calendarEventsByDay } from "@/data/demo/calendar-events";
import { fetchSheet } from "@/lib/google-sheets";
import { fetchPublishedFirstTable } from "@/lib/published-workbook";

import { type CalendarEvent, CalendarPage, defaultCalendarEvents } from "./_components/calendar-page";

function dayFromDate(value: string) {
  const match = value.match(/2026-06-(\d{2})/);
  return match ? Number(match[1]) : null;
}

function eventVariant(brand: string): CalendarEvent["variant"] {
  if (brand.includes(DEMO_ORG.retail) || brand.includes("2SK")) return "default";
  if (brand.includes(DEMO_ORG.portfolio) || brand.includes("Yellow")) return "outline";
  return "secondary";
}

async function fetchCalendarEvents(): Promise<Record<number, CalendarEvent[]>> {
  try {
    const rows = await fetchPublishedFirstTable("Calendar");
    const events = rows.reduce<Record<number, CalendarEvent[]>>((acc, record) => {
      const day = dayFromDate(record.date || "");
      if (!day) return acc;

      const brand = record.brand || "";
      acc[day] = [
        ...(acc[day] || []),
        {
          brand,
          event: record.event || "",
          type: record.type || "Operations Milestone",
          time: record.time || "",
          notes: record.notes || record.event || "",
          text: record.notes || record.event || "",
          variant: eventVariant(brand),
        },
      ];
      return acc;
    }, {});

    if (Object.keys(events).length) return events;
  } catch {
    // Fall back to private Sheets API or local preview data below.
  }

  try {
    const sheet = await fetchSheet("calendar");
    const events = sheet.records.reduce<Record<number, CalendarEvent[]>>((acc, record) => {
      const day = dayFromDate(record.date || "");
      if (!day) return acc;

      const brand = record.brand || "";
      acc[day] = [
        ...(acc[day] || []),
        {
          brand,
          event: record.event || record.item || "",
          type: record.type || "Operations Milestone",
          time: record.time || "",
          notes: record.notes || record.event || record.item || "",
          text: record.notes || record.event || record.item || "",
          variant: eventVariant(brand),
        },
      ];
      return acc;
    }, {});

    return Object.keys(events).length ? events : defaultCalendarEvents;
  } catch {
    return calendarEventsByDay();
  }
}

export default async function Page() {
  const calendarEvents = await fetchCalendarEvents();

  return <CalendarPage calendarEvents={calendarEvents} />;
}

export const dynamic = "force-dynamic";

export const revalidate = 0;
