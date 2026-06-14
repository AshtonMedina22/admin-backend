import type { EntityBrand } from "./types";

export type CalendarEventType = "Permit" | "Assessment" | "Delivery" | "Meeting";

export interface CalendarEvent {
  id: string;
  title: string;
  entityBrand: EntityBrand;
  date: string;
  time: string;
  type: CalendarEventType;
  owner: string;
  location: string;
}

export const calendarEventsData: CalendarEvent[] = [
  {
    id: "cal-001",
    title: "Collin County permit hearing",
    entityBrand: "Solar3K",
    date: "2026-06-16",
    time: "10:00 AM",
    type: "Permit",
    owner: "TX Permit Solutions",
    location: "McKinney City Hall",
  },
  {
    id: "cal-002",
    title: "Structural PE assessment — DFW Retail Plaza",
    entityBrand: "Solar3K",
    date: "2026-06-18",
    time: "2:00 PM",
    type: "Assessment",
    owner: "Structural PE Partners",
    location: "DFW Retail Plaza site",
  },
  {
    id: "cal-003",
    title: "Order #1095 kit delivery window",
    entityBrand: "Solar2SK",
    date: "2026-06-19",
    time: "9:00 AM - 12:00 PM",
    type: "Delivery",
    owner: "T. Khan",
    location: "Garrett Miller residence",
  },
  {
    id: "cal-004",
    title: "Vendor coordination — Rich Solar restock",
    entityBrand: "Solar2SK",
    date: "2026-06-20",
    time: "11:00 AM",
    type: "Meeting",
    owner: "S. Khan",
    location: "Video call",
  },
  {
    id: "cal-005",
    title: "Hunt County commissioning walkthrough",
    entityBrand: "Yellow Star",
    date: "2026-06-23",
    time: "8:00 AM",
    type: "Assessment",
    owner: "T. Khan",
    location: "Hunt County site",
  },
  {
    id: "cal-006",
    title: "Frisco permit submission deadline",
    entityBrand: "Solar3K",
    date: "2026-06-25",
    time: "5:00 PM",
    type: "Permit",
    owner: "TX Permit Solutions",
    location: "Frisco permitting portal",
  },
  {
    id: "cal-007",
    title: "Contractor crew assignment review",
    entityBrand: "Solar2SK",
    date: "2026-06-27",
    time: "3:00 PM",
    type: "Meeting",
    owner: "T. Khan",
    location: "Office",
  },
];
