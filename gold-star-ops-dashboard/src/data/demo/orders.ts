import type { EntityBrand } from "./types";

export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

export interface SolarOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  entityBrand: EntityBrand;
  kitSku: string;
  systemSizeKw: number;
  total: number;
  status: OrderStatus;
  orderDate: string;
  fulfillmentNote: string;
}

export const ordersData: SolarOrder[] = [
  {
    id: "ord-001",
    orderNumber: "1094",
    customerName: "Marcus Vance",
    entityBrand: "Solar2SK",
    kitSku: "DIY-3KW-BACKUP",
    systemSizeKw: 3.5,
    total: 4200,
    status: "Shipped",
    orderDate: "2026-06-10",
    fulfillmentNote: "Rich Solar 3KW Inverter + LiFePO4 Battery Bank",
  },
  {
    id: "ord-002",
    orderNumber: "1095",
    customerName: "Garrett Miller",
    entityBrand: "Solar2SK",
    kitSku: "DIY-5KW-HYBRID",
    systemSizeKw: 5.2,
    total: 6800,
    status: "Processing",
    orderDate: "2026-06-11",
    fulfillmentNote: "Awaiting Anenji inverter allocation",
  },
  {
    id: "ord-003",
    orderNumber: "1093",
    customerName: "Sarah Chen",
    entityBrand: "Solar2SK",
    kitSku: "DIY-3KW-BACKUP",
    systemSizeKw: 3.5,
    total: 4100,
    status: "Delivered",
    orderDate: "2026-06-05",
    fulfillmentNote: "Delivered via regional carrier",
  },
  {
    id: "ord-004",
    orderNumber: "1096",
    customerName: "Robert Davis",
    entityBrand: "Solar2SK",
    kitSku: "BAT-LIFEPO4-5K",
    systemSizeKw: 0,
    total: 2400,
    status: "Pending",
    orderDate: "2026-06-12",
    fulfillmentNote: "Battery add-on — low stock hold",
  },
  {
    id: "ord-005",
    orderNumber: "1092",
    customerName: "Maria Martinez",
    entityBrand: "Solar2SK",
    kitSku: "DIY-3KW-BACKUP",
    systemSizeKw: 3.5,
    total: 4200,
    status: "Pending",
    orderDate: "2026-06-08",
    fulfillmentNote: "Payment confirmed — pick pending",
  },
];

export const pendingOrderCount = ordersData.filter((o) => o.status === "Pending" || o.status === "Processing").length;
