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

const calendarCopyOverrides: Record<string, string> = {
  "bulk inbound freight pallet arrival": "Receiving cargo unit inventory stock at main Wylie warehouse hub.",
  "city of plano permit hearing": "Reviewing 60kW commercial rooftop system variance request.",
  "frisco commercial plaza load walk":
    "Structural engineer on-site roof load assessment walk for 120kW commercial array.",
  "frisco commercial plaza roof load walk":
    "Structural engineer on-site roof load assessment walk for 120kW commercial array.",
  "oncor on-site utility field inspection": "Testing system isolation protocols and point of interconnection matrix.",
};

function normalizedCalendarNotes(event: string, notes: string) {
  return calendarCopyOverrides[event.trim().toLowerCase()] || notes;
}

async function fetchCalendarEvents(): Promise<Record<number, CalendarEvent[]>> {
  try {
    const rows = await fetchPublishedFirstTable("Calendar");
    const events = rows.reduce<Record<number, CalendarEvent[]>>((acc, record) => {
      const day = dayFromDate(record.date || "");
      if (!day) return acc;

      const brand = record.brand || "";
      const event = record.event || "";
      const notes = normalizedCalendarNotes(event, record.notes || event);
      acc[day] = [
        ...(acc[day] || []),
        {
          brand,
          event,
          type: record.type || "Operations Milestone",
          time: record.time || "",
          notes,
          text: notes,
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
      const event = record.event || record.item || "";
      const notes = normalizedCalendarNotes(event, record.notes || event);
      acc[day] = [
        ...(acc[day] || []),
        {
          brand,
          event,
          type: record.type || "Operations Milestone",
          time: record.time || "",
          notes,
          text: notes,
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
