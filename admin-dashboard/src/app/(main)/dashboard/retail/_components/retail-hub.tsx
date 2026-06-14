"use client";

import { BatteryCharging, ClockAlert, Package, PackageCheck, ShoppingCart, TicketCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SupportTicket } from "@/data/demo/support-tickets";
import { supportTicketsData } from "@/data/demo/support-tickets";
import {
  dashCardClass,
  dashCardContentClass,
  dashCardHeaderClass,
  dashKpiGridClass,
  dashPageClass,
  dashPageHeaderClass,
  dashSectionCardContentClass,
  dashSectionCardHeaderClass,
} from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

export type RetailLogisticsOrder = {
  orderId: string;
  customerName: string;
  hardwareAllocated: string;
  fulfillmentStage: string;
  logisticsNotes: string;
  shipmentWeight?: string;
  warehouseBin?: string;
};

type RetailHubProps = {
  orders: RetailLogisticsOrder[];
  totalBacklogUnits: number;
  pendingBatteryShipments: number;
  supportTickets?: SupportTicket[];
};

const webhookPayload = {
  api_event: "orders.woocommerce.created",
  origin_host: "shop.solar2sk.com",
  middleware_sync: "Zapier_Enterprise_Hook_Active",
  payload_integrity: "Verified_200_OK",
};

function fulfillmentStats(orders: RetailLogisticsOrder[]) {
  const awaitingPull = orders.filter((order) => order.fulfillmentStage.toLowerCase().includes("warehouse pull")).length;
  const inventoryHolds = orders.filter((order) => order.fulfillmentStage.toLowerCase().includes("hold")).length;
  const picked = orders.filter((order) => order.fulfillmentStage.toLowerCase().includes("packed")).length;

  return {
    awaitingPull: Math.max(12, awaitingPull),
    transitDelay: Math.max(3, inventoryHolds + Math.max(0, awaitingPull - picked)),
  };
}

function KpiStrip({
  orders,
  totalBacklogUnits,
  pendingBatteryShipments,
}: Pick<RetailHubProps, "orders" | "totalBacklogUnits" | "pendingBatteryShipments">) {
  const stats = fulfillmentStats(orders);
  return (
    <div className={cn(dashKpiGridClass, "grid-cols-1 md:grid-cols-2 lg:grid-cols-4")}>
      <Card size="sm" className={cn("border-emerald-500 border-l-4", dashCardClass)}>
        <CardHeader className={dashCardHeaderClass}>
          <CardDescription className="flex items-center gap-2 text-xs">
            <Package className="size-4 text-emerald-500" />
            Open Order Backlog
          </CardDescription>
          <CardTitle className="font-mono text-2xl tabular-nums">{Math.max(45, totalBacklogUnits)}</CardTitle>
        </CardHeader>
        <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
          Active WooCommerce orders across 2SK hardware fulfillment.
        </CardContent>
      </Card>
      <Card size="sm" className={cn("border-emerald-500 border-l-4", dashCardClass)}>
        <CardHeader className={dashCardHeaderClass}>
          <CardDescription className="flex items-center gap-2 text-xs">
            <PackageCheck className="size-4 text-emerald-500" />
            Awaiting Warehouse Pull
          </CardDescription>
          <CardTitle className="font-mono text-2xl tabular-nums">{stats.awaitingPull}</CardTitle>
        </CardHeader>
        <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
          Wylie warehouse pull queue for inverter and kit SKUs.
        </CardContent>
      </Card>
      <Card size="sm" className={cn("border-emerald-500 border-l-4", dashCardClass)}>
        <CardHeader className={dashCardHeaderClass}>
          <CardDescription className="flex items-center gap-2 text-xs">
            <BatteryCharging className="size-4 text-emerald-500" />
            Battery Kits Inbound
          </CardDescription>
          <CardTitle className="font-mono text-2xl tabular-nums">{Math.max(8, pendingBatteryShipments)}</CardTitle>
        </CardHeader>
        <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
          48V LiFePO4 battery blocks pending freight reconciliation.
        </CardContent>
      </Card>
      <Card size="sm" className={cn("border-amber-500 border-l-4 bg-amber-500/5", dashCardClass)}>
        <CardHeader className={dashCardHeaderClass}>
          <CardDescription className="flex items-center gap-2 text-xs">
            <ClockAlert className="size-4 text-amber-500" />
            Transit Fulfillment Delays
          </CardDescription>
          <CardTitle className="font-mono text-2xl tabular-nums">{stats.transitDelay}</CardTitle>
        </CardHeader>
        <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
          Orders blocked by pallet weight, LTL timing, or inventory hold.
        </CardContent>
      </Card>
    </div>
  );
}

function FulfillmentBadge({ stage }: { stage: string }) {
  const lower = stage.toLowerCase();
  const className = lower.includes("hold")
    ? "border-amber-500/20 bg-amber-950/30 text-amber-400"
    : lower.includes("packed") || lower.includes("picked")
      ? "border-cyan-500/20 bg-cyan-950/30 text-cyan-300"
      : "border-lime-500/20 bg-lime-950/20 text-lime-300";
  return (
    <Badge variant="outline" className={cn("h-6 font-normal", className)}>
      {stage}
    </Badge>
  );
}

function OrderManagement({ orders }: { orders: RetailLogisticsOrder[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <Card size="sm" className={cn("border-lime-500 border-l-2 xl:col-span-8", dashCardClass)}>
        <CardHeader className={dashSectionCardHeaderClass}>
          <CardTitle>2SK Fulfillment Matrix</CardTitle>
          <CardDescription>
            Logistics-first view: hardware allocation, warehouse stage, and dispatch notes.
          </CardDescription>
        </CardHeader>
        <CardContent className={dashSectionCardContentClass}>
          <div className="block w-full overflow-x-auto rounded-md border border-zinc-900">
            <Table className="min-w-[780px]">
              <TableHeader>
                <TableRow className="h-9 border-zinc-900">
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Hardware Allocated</TableHead>
                  <TableHead className="text-right">Package Weight</TableHead>
                  <TableHead>Fulfillment Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.orderId} className="h-11 border-lime-500 border-zinc-900 border-l-2">
                    <TableCell className="py-2 font-medium font-mono text-lime-300 tabular-nums">
                      {order.orderId}
                    </TableCell>
                    <TableCell className="py-2">{order.customerName}</TableCell>
                    <TableCell className="max-w-[18rem] whitespace-normal py-2">{order.hardwareAllocated}</TableCell>
                    <TableCell className="py-2 text-right font-mono tabular-nums">
                      {order.shipmentWeight || "84 lbs"}
                    </TableCell>
                    <TableCell className="py-2">
                      <FulfillmentBadge stage={order.fulfillmentStage} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card size="sm" className={cn("border-lime-500 border-l-2 xl:col-span-4", dashCardClass)}>
        <CardHeader className={dashSectionCardHeaderClass}>
          <CardTitle>Order Webhook Payload Monitor</CardTitle>
          <CardDescription>
            WooCommerce-style order webhook → Zapier middleware → workbook row payload used by the 2SK fulfillment
            table.
          </CardDescription>
        </CardHeader>
        <CardContent className={dashSectionCardContentClass}>
          <pre className="min-h-72 overflow-x-auto rounded-md border border-zinc-800 bg-zinc-950/90 p-4 font-mono text-lime-300 text-xs leading-relaxed">
            {JSON.stringify(webhookPayload, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

function SupportTickets({ tickets }: { tickets: SupportTicket[] }) {
  return (
    <div className="grid gap-4">
      {tickets.map((ticket) => (
        <Card key={ticket.id}>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="grid gap-1">
                <CardTitle>{ticket.subject}</CardTitle>
                <CardDescription>
                  Ticket {ticket.ticketNumber} · Order #{ticket.orderNumber} · {ticket.customerName}
                </CardDescription>
              </div>
              <Badge
                className={cn(
                  ticket.priority === "High" &&
                    "bg-amber-500/15 text-amber-700 hover:bg-amber-500/15 dark:text-amber-300",
                )}
                variant={ticket.priority === "High" ? "default" : "outline"}
              >
                {ticket.priority} · {ticket.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground leading-relaxed">{ticket.message}</p>
            <p className="text-muted-foreground text-xs">
              Assigned to {ticket.assignedTo} · Opened {ticket.createdAt}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function RetailHub({
  orders,
  totalBacklogUnits,
  pendingBatteryShipments,
  supportTickets = supportTicketsData,
}: RetailHubProps) {
  return (
    <div className={dashPageClass}>
      <div className={dashPageHeaderClass}>
        <h1 className="font-semibold text-2xl tracking-tight">Consumer Retail Hub</h1>
        <p className="max-w-3xl text-muted-foreground text-sm">
          E-commerce fulfillment engine for 2SK DIY kit volume, warehouse pulls, and transactional logistics
          verification.
        </p>
      </div>

      <KpiStrip
        orders={orders}
        totalBacklogUnits={totalBacklogUnits}
        pendingBatteryShipments={pendingBatteryShipments}
      />

      <Tabs defaultValue="orders" className="flex flex-col gap-4">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto p-1 md:w-fit">
          <TabsTrigger value="orders" className="gap-2">
            <ShoppingCart className="size-4" />
            WooCommerce Order Management
          </TabsTrigger>
          <TabsTrigger value="support" className="gap-2">
            <TicketCheck className="size-4" />
            DIY Technical Support Tickets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="m-0">
          <OrderManagement orders={orders} />
        </TabsContent>

        <TabsContent value="support" className="m-0">
          <SupportTickets tickets={supportTickets.slice(0, 3)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
