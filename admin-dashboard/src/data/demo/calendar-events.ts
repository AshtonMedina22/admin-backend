import type { EntityBrand } from "./types";

export type CalendarEventType = "Permit" | "Freight" | "Utility Inspection";

export interface CalendarEvent {
  id: string;
  title: string;
  entityBrand: EntityBrand;
  date: string;
  dayOfMonth: number;
  type: CalendarEventType;
  location: string;
}

export const calendarEventsData: CalendarEvent[] = [
  {
    id: "cal-001",
    title: "City of Plano Permit Hearing (Summit C&I Group)",
    entityBrand: "Solar3K",
    date: "2026-06-15",
    dayOfMonth: 15,
    type: "Permit",
    location: "Plano Building Inspections - 60kW Auto Body Build",
  },
  {
    id: "cal-002",
    title: "Freight Pallet Arrival - 42 Inverter Units at Wylie Hub (Nova Retail Co.)",
    entityBrand: "Solar2SK",
    date: "2026-06-18",
    dayOfMonth: 18,
    type: "Freight",
    location: "Wylie Warehouse operations hub",
  },
  {
    id: "cal-003",
    title: "Oncor On-Site Field Grid Utility Inspection (Cedar Grid Assets)",
    entityBrand: "Yellow Star",
    date: "2026-06-22",
    dayOfMonth: 22,
    type: "Utility Inspection",
    location: "Hunt County 60kW asset expansion tie-in",
  },
];

export function calendarEventsByDay(): Record<
  number,
  { brand: string; text: string; variant: "default" | "secondary" | "outline" }[]
> {
  return calendarEventsData.reduce<
    Record<number, { brand: string; text: string; variant: "default" | "secondary" | "outline" }[]>
  >((acc, event) => {
    const brandLabel =
      event.entityBrand === "Solar2SK"
        ? "Nova Retail Co."
        : event.entityBrand === "Solar3K"
          ? "Summit C&I Group"
          : "Cedar Grid Assets";

    const variant =
      event.entityBrand === "Solar2SK" ? "default" : event.entityBrand === "Yellow Star" ? "outline" : "secondary";

    acc[event.dayOfMonth] = [...(acc[event.dayOfMonth] || []), { brand: brandLabel, text: event.title, variant }];
    return acc;
  }, {});
}
