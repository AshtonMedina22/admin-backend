import { ordersData, pendingBatteryShipments, totalBacklogUnits } from "@/data/demo/orders";
import type { SupportTicket } from "@/data/demo/support-tickets";
import { supportTicketsData } from "@/data/demo/support-tickets";
import { fetchWorkbookScriptPayloadOrNull, type ScriptRetailOrder } from "@/lib/apps-script-workbook";
import { fetchPublishedSectionTable } from "@/lib/published-workbook";

import { RetailHub, type RetailLogisticsOrder } from "./_components/retail-hub";

function mapDemoOrder(order: (typeof ordersData)[number]): RetailLogisticsOrder {
  return {
    orderId: order.displayOrderId,
    customerName: order.customerName,
    hardwareAllocated: order.hardwareAllocated,
    fulfillmentStage: order.fulfillmentStage,
    logisticsNotes: order.logisticsNotes,
  };
}

function mapLegacyRetailRow(row: {
  id: string;
  customer: string;
  product: string;
  status: string;
}): RetailLogisticsOrder {
  const stage =
    row.status === "Pending Warehouse Pull"
      ? "Inventory Hold"
      : row.status.includes("Packed") || row.status.includes("Fulfill")
        ? "Picked & Packed"
        : row.status;

  return {
    orderId: row.id.startsWith("#") ? row.id : `#WOO-${row.id.replace(/^WOO-?/i, "")}`,
    customerName: row.customer,
    hardwareAllocated: row.product,
    fulfillmentStage: stage,
    logisticsNotes: row.status,
  };
}

function mapScriptOrder(order: ScriptRetailOrder): RetailLogisticsOrder {
  return mapLegacyRetailRow({
    id: order.order_id,
    customer: order.customer,
    product: order.product,
    status: order.status,
  });
}

async function fetchRetailOrders(): Promise<RetailLogisticsOrder[]> {
  try {
    const rows = await fetchPublishedSectionTable("Retail Ops", "WooCommerce Order Management");
    const publishedOrders = rows
      .filter((row) => row.order_id)
      .map((row) =>
        mapLegacyRetailRow({
          id: row.order_id,
          customer: row.customer,
          product: row.product,
          status: row.status,
        }),
      );

    if (publishedOrders.length) return publishedOrders;
  } catch {
    // Fall back to Apps Script or local preview data below.
  }

  const scriptPayload = await fetchWorkbookScriptPayloadOrNull();
  if (scriptPayload?.retailOrders?.length) {
    return scriptPayload.retailOrders.map(mapScriptOrder);
  }

  return ordersData.map(mapDemoOrder);
}

function normalizePriority(value: string): SupportTicket["priority"] {
  if (value.toLowerCase().includes("high")) return "High";
  if (value.toLowerCase().includes("medium")) return "Medium";
  return "Low";
}

function customerFromUserGroup(value: string) {
  const match = value.match(/\(([^)]+)\)|-\s*([^-\n]+)$/);
  return match?.[1] || match?.[2]?.trim() || value || "Retail Customer";
}

async function fetchSupportTickets(): Promise<SupportTicket[]> {
  try {
    const rows = await fetchPublishedSectionTable("Retail Ops", "DIY Technical Support Tickets");
    const tickets = rows
      .filter((row) => row.ticket_id)
      .map((row, index) => ({
        id: `retail-ticket-${index + 1}`,
        ticketNumber: row.ticket_id.startsWith("#") ? row.ticket_id : `#${row.ticket_id}`,
        customerName: customerFromUserGroup(row.user_group || ""),
        orderNumber: row.order_number || "Pending",
        subject: row.subject || "Support Review",
        message: row.message_snippet || "Pending support summary.",
        status: (row.status || "Open") as SupportTicket["status"],
        priority: normalizePriority(row.priority || "Medium"),
        createdAt: row.created_at || "2026-06-13",
        assignedTo: row.assigned_to || "S. Khan",
      }));

    if (tickets.length) return tickets;
  } catch {
    // Fall back to local preview data below.
  }

  return supportTicketsData;
}

function computeRetailKpis(orders: RetailLogisticsOrder[]) {
  const backlog = orders.filter((order) => {
    const stage = order.fulfillmentStage.toLowerCase();
    return stage.includes("hold") || stage.includes("queue") || stage.includes("pick");
  }).length;

  const batteryPending = orders.filter((order) => {
    const hardware = order.hardwareAllocated.toLowerCase();
    const stage = order.fulfillmentStage.toLowerCase();
    return (
      (hardware.includes("battery") || hardware.includes("lifepo4")) &&
      !stage.includes("delivered") &&
      !stage.includes("shipped")
    );
  }).length;

  return {
    totalBacklogUnits: backlog || totalBacklogUnits,
    pendingBatteryShipments: batteryPending || pendingBatteryShipments,
  };
}

export default async function Page() {
  const [orders, supportTickets] = await Promise.all([fetchRetailOrders(), fetchSupportTickets()]);
  const kpis = computeRetailKpis(orders);

  return (
    <RetailHub
      orders={orders}
      totalBacklogUnits={kpis.totalBacklogUnits}
      pendingBatteryShipments={kpis.pendingBatteryShipments}
      supportTickets={supportTickets}
    />
  );
}

export const dynamic = "force-dynamic";

export const revalidate = 0;
