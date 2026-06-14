import type { EntityBrand } from "./types";

export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

export interface SolarOrder {
  id: string;
  orderNumber: string;
  displayOrderId: string;
  customerName: string;
  entityBrand: EntityBrand;
  kitSku: string;
  systemSizeKw: number;
  total: number;
  status: OrderStatus;
  orderDate: string;
  hardwareAllocated: string;
  fulfillmentStage: string;
  logisticsNotes: string;
  fulfillmentNote: string;
  acquisitionSource?: string;
}

export const ordersData: SolarOrder[] = [
  {
    id: "ord-001",
    orderNumber: "9401",
    displayOrderId: "#WOO-9401",
    customerName: "Garrett Miller",
    entityBrand: "Solar2SK",
    kitSku: "RS-3KW-HYBRID-PACK",
    systemSizeKw: 3.0,
    total: 4200,
    status: "Pending",
    orderDate: "2026-06-12",
    hardwareAllocated: "Rich Solar 3KW Hybrid Inverter Pack",
    fulfillmentStage: "Pending Warehouse Pull",
    logisticsNotes: "Wylie Warehouse - pull queue; organic search attribution",
    fulfillmentNote: "Pending Warehouse Pull",
    acquisitionSource: "Organic search (shop.solar2sk.com)",
  },
  {
    id: "ord-002",
    orderNumber: "9402",
    displayOrderId: "#WOO-9402",
    customerName: "Marcus Vance",
    entityBrand: "Solar2SK",
    kitSku: "BAT-LIFEPO4-5K",
    systemSizeKw: 0,
    total: 2100,
    status: "Processing",
    orderDate: "2026-06-11",
    hardwareAllocated: "48V 100Ah LiFePO4 Lithium Battery Cells",
    fulfillmentStage: "Fulfilled & Packed",
    logisticsNotes: "Wylie Warehouse Bin B-12 - carrier dispatch scheduled",
    fulfillmentNote: "Fulfilled & Packed",
  },
  {
    id: "ord-003",
    orderNumber: "9398",
    displayOrderId: "#WOO-9398",
    customerName: "Robert Davis",
    entityBrand: "Solar2SK",
    kitSku: "BAT-LIFEPO4-5K",
    systemSizeKw: 0,
    total: 2400,
    status: "Pending",
    orderDate: "2026-06-12",
    hardwareAllocated: "48V 100Ah LiFePO4 Battery Pack",
    fulfillmentStage: "Inventory Hold",
    logisticsNotes: "Battery add-on - 8 units remaining in Wylie stock (INV-002)",
    fulfillmentNote: "Low stock hold on LiFePO4 wall block",
  },
  {
    id: "ord-004",
    orderNumber: "9396",
    displayOrderId: "#WOO-9396",
    customerName: "Maria Martinez",
    entityBrand: "Solar2SK",
    kitSku: "DIY-3KW-BACKUP",
    systemSizeKw: 3.5,
    total: 4200,
    status: "Processing",
    orderDate: "2026-06-08",
    hardwareAllocated: "Anenji 3KW Inverter Bank",
    fulfillmentStage: "Pick Queue",
    logisticsNotes: "Payment confirmed - awaiting Anenji inverter bin allocation",
    fulfillmentNote: "Tied to INV-3KW-ANENJI warehouse pool",
  },
];

export const pendingOrderCount = ordersData.filter((o) => o.status === "Pending" || o.status === "Processing").length;

export const totalBacklogUnits = pendingOrderCount;

export const pendingBatteryShipments = ordersData.filter(
  (o) =>
    (o.kitSku.includes("BAT") ||
      o.hardwareAllocated.toLowerCase().includes("battery") ||
      o.hardwareAllocated.toLowerCase().includes("lifepo4")) &&
    o.fulfillmentStage !== "Fulfilled & Packed" &&
    o.status !== "Shipped" &&
    o.status !== "Delivered",
).length;

export function fulfillmentStageIcon(stage: string): string {
  const lower = stage.toLowerCase();
  if (lower.includes("fulfilled") || lower.includes("packed") || lower.includes("shipped")) return "🚚";
  if (lower.includes("hold") || lower.includes("queue") || lower.includes("pending")) return "⏳";
  if (lower.includes("delivered")) return "✅";
  return "📦";
}
