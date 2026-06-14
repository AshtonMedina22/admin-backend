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
  shipmentWeight: string;
  warehouseBin: string;
  acquisitionSource?: string;
}

export const ordersData: SolarOrder[] = [
  {
    id: "ord-001",
    orderNumber: "9412",
    displayOrderId: "#2SK-9412",
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
    shipmentWeight: "84 lbs",
    warehouseBin: "WYL-A03",
    acquisitionSource: "Organic search (shop.solar2sk.com)",
  },
  {
    id: "ord-002",
    orderNumber: "9413",
    displayOrderId: "#2SK-9413",
    customerName: "Marcus Vance",
    entityBrand: "Solar2SK",
    kitSku: "BAT-LIFEPO4-5K",
    systemSizeKw: 0,
    total: 2100,
    status: "Processing",
    orderDate: "2026-06-11",
    hardwareAllocated: "48V 100Ah LiFePO4 Battery Block",
    fulfillmentStage: "Picked & Packed",
    logisticsNotes: "Wylie Warehouse Bin B-12 - carrier dispatch scheduled",
    fulfillmentNote: "Picked & Packed",
    shipmentWeight: "115 lbs",
    warehouseBin: "WYL-B12",
  },
  {
    id: "ord-003",
    orderNumber: "9414",
    displayOrderId: "#2SK-9414",
    customerName: "J. Allen",
    entityBrand: "Solar2SK",
    kitSku: "DIY-5KW-OFFGRID-COMPLETE",
    systemSizeKw: 5,
    total: 6850,
    status: "Pending",
    orderDate: "2026-06-12",
    hardwareAllocated: "5kW DIY Off-Grid Solar Kit (Complete)",
    fulfillmentStage: "Inventory Hold",
    logisticsNotes: "Combiner box pallet waiting on inbound freight reconciliation",
    fulfillmentNote: "Inventory Hold",
    shipmentWeight: "420 lbs",
    warehouseBin: "WYL-PAL-07",
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
