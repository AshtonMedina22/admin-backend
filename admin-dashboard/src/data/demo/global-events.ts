import type { EntityBrand } from "./types";

export type GlobalEventStatus = "success" | "warning" | "critical" | "info";

export interface GlobalEvent {
  id: string;
  entityBrand: EntityBrand;
  message: string;
  status: GlobalEventStatus;
  /** Relative ("4 min ago") or ISO timestamp from workbook/API sync. */
  timestamp: string;
}

export const globalEventsData: GlobalEvent[] = [
  {
    id: "evt-001",
    entityBrand: "Solar2SK",
    status: "warning",
    timestamp: "4 min ago",
    message:
      "WooCommerce webhook received for Order #9401 but warehouse pull job is queued - Garrett Miller kit awaiting allocation.",
  },
  {
    id: "evt-002",
    entityBrand: "Solar3K",
    status: "success",
    timestamp: "11 min ago",
    message: "OpenSolar Design Model V2 saved for Frisco Commercial Plaza (120 kW array).",
  },
  {
    id: "evt-003",
    entityBrand: "Systems Alert",
    status: "critical",
    timestamp: "18 min ago",
    message:
      "Workbook sync to financial-summary tab failed: SSL handshake error on solar2sk.com - DreamHost cert expired Jun 10.",
  },
  {
    id: "evt-004",
    entityBrand: "Yellow Star",
    status: "success",
    timestamp: "22 min ago",
    message:
      "Hunt County 60 kW microgrid isolated load test held 35.8 kW output to the local battery bank; awaiting final Oncor PTO before grid export.",
  },
  {
    id: "evt-005",
    entityBrand: "Solar2SK",
    status: "critical",
    timestamp: "31 min ago",
    message:
      "Zapier hook orders.woocommerce.created returned HTTP 502 - retry scheduled in 15 min (3 of 5 attempts used).",
  },
  {
    id: "evt-006",
    entityBrand: "Solar3K",
    status: "info",
    timestamp: "1 hr ago",
    message: "DocuSign envelope sent for Collin County Utility bid ($185k) - awaiting client signature.",
  },
];
