import type { EntityBrand } from "./types";

export type CalendarEventType = "Regulatory Gate" | "Warehouse Logistics" | "Grid Interconnection";

export interface CalendarEvent {
  id: string;
  title: string;
  entityBrand: EntityBrand;
  date: string;
  dayOfMonth: number;
  type: CalendarEventType;
  time: string;
  location: string;
  notes: string;
}

export const calendarEventsData: CalendarEvent[] = [
  {
    id: "cal-001",
    title: "City of Plano Permit Hearing",
    entityBrand: "Solar3K",
    date: "2026-06-15",
    dayOfMonth: 15,
    type: "Regulatory Gate",
    time: "09:00 AM",
    location: "Plano Building Inspections",
    notes: "Reviewing 60kW commercial rooftop system variance request.",
  },
  {
    id: "cal-002",
    title: "Bulk Inbound Freight Pallet Arrival",
    entityBrand: "Solar2SK",
    date: "2026-06-18",
    dayOfMonth: 18,
    type: "Warehouse Logistics",
    time: "01:30 PM",
    location: "Wylie Hub",
    notes: "Receiving cargo unit inventory stock at main Wylie warehouse hub.",
  },
  {
    id: "cal-003",
    title: "Oncor On-Site Utility Field Inspection",
    entityBrand: "Yellow Star",
    date: "2026-06-22",
    dayOfMonth: 22,
    type: "Grid Interconnection",
    time: "03:15 PM",
    location: "Hunt County Asset Expansion",
    notes: "Testing system isolation protocols and point of interconnection matrix.",
  },
  {
    id: "cal-004",
    title: "Frisco Commercial Plaza Roof Load Walk",
    entityBrand: "Solar3K",
    date: "2026-06-26",
    dayOfMonth: 26,
    type: "Regulatory Gate",
    time: "10:45 AM",
    location: "Frisco Commercial Plaza",
    notes: "Structural engineer on-site roof load assessment walk for 120kW commercial array",
  },
];

export function calendarEventsByDay(): Record<
  number,
  {
    brand: string;
    event: string;
    type: string;
    time: string;
    notes: string;
    text: string;
    variant: "default" | "secondary" | "outline";
  }[]
> {
  return calendarEventsData.reduce<
    Record<
      number,
      {
        brand: string;
        event: string;
        type: string;
        time: string;
        notes: string;
        text: string;
        variant: "default" | "secondary" | "outline";
      }[]
    >
  >((acc, event) => {
    const brandLabel = event.entityBrand === "Solar2SK" ? "2SK" : event.entityBrand === "Solar3K" ? "3SK" : "YSP";

    const variant =
      event.entityBrand === "Solar2SK" ? "default" : event.entityBrand === "Yellow Star" ? "outline" : "secondary";

    acc[event.dayOfMonth] = [
      ...(acc[event.dayOfMonth] || []),
      {
        brand: brandLabel,
        event: event.title,
        type: event.type,
        time: event.time,
        notes: event.notes,
        text: `${event.time} - ${event.title}: ${event.notes}`,
        variant,
      },
    ];
    return acc;
  }, {});
}
