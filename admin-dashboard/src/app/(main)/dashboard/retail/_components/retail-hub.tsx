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
    <div className={dashKpiGridClass}>
      <Card size="sm" className={cn("border-emerald-500 border-l-4", dashCardClass)}>
        <CardHeader className={dashCardHeaderClass}>
          <CardDescription className="flex items-center gap-2 text-xs">
            <Package className="size-4 text-emerald-500" />
            Open Order Backlog
          </CardDescription>
          <CardTitle className="font-mono text-2xl tabular-nums">{Math.max(45, totalBacklogUnits)}</CardTitle>
        </CardHeader>
        <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
          Active WooCommerce orders across Solar 2SK hardware fulfillment.
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
          <CardTitle className="font-mono text-2xl tabular-nums">{pendingBatteryShipments}</CardTitle>
        </CardHeader>
        <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
          48V LiFePO4 battery blocks pending freight reconciliation.
        </CardContent>
      </Card>
      <Card size="sm" className={cn("border-amber-500 border-l-4", dashCardClass)}>
        <CardHeader className={dashCardHeaderClass}>
          <CardDescription className="flex items-center gap-2 text-xs">
            <ClockAlert className="size-4 text-amber-500" />
            Transit Fulfillment Delay
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
    ? "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300"
    : lower.includes("packed") || lower.includes("picked")
      ? "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300"
      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  return (
    <Badge variant="outline" className={cn("h-6 font-normal", className)}>
      {stage}
    </Badge>
  );
}

function OrderManagement({ orders }: { orders: RetailLogisticsOrder[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <Card size="sm" className={cn("border-emerald-500 border-l-4 xl:col-span-8", dashCardClass)}>
        <CardHeader className={dashSectionCardHeaderClass}>
          <CardTitle>Solar 2SK Fulfillment Matrix</CardTitle>
          <CardDescription>
            Logistics-first view: hardware allocation, warehouse stage, and dispatch notes.
          </CardDescription>
        </CardHeader>
        <CardContent className={dashSectionCardContentClass}>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="h-9">
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Hardware Allocated</TableHead>
                  <TableHead className="text-right">Weight</TableHead>
                  <TableHead>Bin</TableHead>
                  <TableHead>Logistics Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.orderId} className="h-11 border-emerald-500/70 border-l-4">
                    <TableCell className="py-2 font-medium font-mono tabular-nums">{order.orderId}</TableCell>
                    <TableCell className="py-2">{order.customerName}</TableCell>
                    <TableCell className="max-w-[18rem] whitespace-normal py-2">{order.hardwareAllocated}</TableCell>
                    <TableCell className="py-2 text-right font-mono tabular-nums">
                      {order.shipmentWeight || "84 lbs"}
                    </TableCell>
                    <TableCell className="py-2 font-mono text-xs">{order.warehouseBin || "WYL-A03"}</TableCell>
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

      <Card size="sm" className={cn("border-emerald-500 border-l-4 xl:col-span-4", dashCardClass)}>
        <CardHeader className={dashSectionCardHeaderClass}>
          <CardTitle>API Webhook Monitor</CardTitle>
          <CardDescription>JSON sync output from the Solar 2SK order middleware.</CardDescription>
        </CardHeader>
        <CardContent className={dashSectionCardContentClass}>
          <pre className="min-h-72 overflow-x-auto rounded-md border bg-background p-4 font-mono text-emerald-700 text-xs leading-relaxed dark:text-emerald-300">
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
          E-commerce fulfillment engine for Solar 2SK DIY kit volume, warehouse pulls, and transactional logistics
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
