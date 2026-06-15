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

const fulfillmentZapSteps = [
  "Trigger: WooCommerce Order Created captures paid or newly created order payloads.",
  "Filter: continue only when line-item SKU contains inverter, battery, kit, or balance-of-system hardware.",
  "Formatter: normalize customer name, SKU, quantity, package weight, warehouse bin, and fulfillment status.",
  "Webhook POST: send cleaned JSON to an Apps Script web app doPost(e) endpoint.",
  "Sheet Action: append one sanitized row to the 2SK Fulfillment tab and preserve source order ID for dedupe.",
  "Optional Alert: send a Gmail/MailApp notification when package weight or battery freight rules exceed threshold.",
];

const FULFILLMENT_APPS_SCRIPT = `function doPost(e) {
  const payload = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp
    .openById(PropertiesService.getScriptProperties().getProperty('OPS_WORKBOOK_ID'))
    .getSheetByName('2SK Fulfillment');

  const row = [
    payload.order_id,
    payload.customer_name.trim(),
    payload.sku,
    Number(payload.quantity || 1),
    Number(payload.package_weight_lbs || 0),
    payload.warehouse_bin || 'UNASSIGNED',
    payload.fulfillment_status || 'Warehouse Pull',
    new Date(),
  ];

  sheet.appendRow(row);

  if (Number(payload.package_weight_lbs || 0) > 75) {
    MailApp.sendEmail('ops-alerts@demo-ops.local', '2SK freight review required', JSON.stringify(payload, null, 2));
  }

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}`;

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
      <Card size="sm" className={cn("border-lime-500 border-l-4", dashCardClass)}>
        <CardHeader className={dashCardHeaderClass}>
          <CardDescription className="flex items-center gap-2 text-xs">
            <Package className="size-4 text-lime-500" />
            Open Order Backlog
          </CardDescription>
          <CardTitle className="font-mono text-2xl tabular-nums">{Math.max(45, totalBacklogUnits)}</CardTitle>
        </CardHeader>
        <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
          Active WooCommerce orders across 2SK hardware fulfillment.
        </CardContent>
      </Card>
      <Card size="sm" className={cn("border-lime-500 border-l-4", dashCardClass)}>
        <CardHeader className={dashCardHeaderClass}>
          <CardDescription className="flex items-center gap-2 text-xs">
            <PackageCheck className="size-4 text-lime-500" />
            Awaiting Warehouse Pull
          </CardDescription>
          <CardTitle className="font-mono text-2xl tabular-nums">{stats.awaitingPull}</CardTitle>
        </CardHeader>
        <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
          Wylie warehouse pull queue for inverter and kit SKUs.
        </CardContent>
      </Card>
      <Card size="sm" className={cn("border-lime-500 border-l-4", dashCardClass)}>
        <CardHeader className={dashCardHeaderClass}>
          <CardDescription className="flex items-center gap-2 text-xs">
            <BatteryCharging className="size-4 text-lime-500" />
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

function ZapierFulfillmentZapCard() {
  return (
    <Card size="sm" className={cn("border-lime-500 border-l-2", dashCardClass)}>
      <CardHeader className={dashSectionCardHeaderClass}>
        <CardTitle>Zapier → Apps Script Fulfillment Zap</CardTitle>
        <CardDescription>
          Legitimate Zap pattern for routing WooCommerce orders into a Google Sheets-backed 2SK fulfillment queue.
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("grid gap-3", dashSectionCardContentClass)}>
        <div className="grid gap-2">
          {fulfillmentZapSteps.map((step, index) => (
            <div key={step} className="rounded-lg border border-zinc-900 bg-zinc-950/70 p-3">
              <p className="font-mono text-[10px] text-lime-300">STEP {index + 1}</p>
              <p className="mt-1 text-xs text-zinc-400 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-3 font-mono text-xs text-zinc-400 leading-relaxed">
          <strong className="text-zinc-200">Accuracy note:</strong> WooCommerce can trigger Zapier on order-created
          events, Zapier can filter/format fields, and Webhooks by Zapier can POST a JSON payload into an Apps Script
          web app endpoint. The Apps Script then owns Sheet writes, dedupe policy, and optional Gmail/MailApp alerts.
        </div>
        <pre className="max-h-80 overflow-x-auto rounded-md border border-zinc-800 bg-zinc-950/90 p-3 font-mono text-[11px] text-lime-300 leading-relaxed">
          <code>{FULFILLMENT_APPS_SCRIPT}</code>
        </pre>
      </CardContent>
    </Card>
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
            <Table className="min-w-[640px]">
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
                    <TableCell className="max-w-[10rem] whitespace-normal py-2">{order.customerName}</TableCell>
                    <TableCell className="max-w-[14rem] whitespace-normal py-2">{order.hardwareAllocated}</TableCell>
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

      <div className="grid gap-4 xl:col-span-4">
        <Card size="sm" className={cn("border-lime-500 border-l-2", dashCardClass)}>
          <CardHeader className={dashSectionCardHeaderClass}>
            <CardTitle>Order Webhook Payload Monitor</CardTitle>
            <CardDescription>
              WooCommerce-style order webhook → Zapier middleware → workbook row payload used by the 2SK fulfillment
              table.
            </CardDescription>
          </CardHeader>
          <CardContent className={dashSectionCardContentClass}>
            <div className="mb-3 space-y-1 rounded-xl border border-zinc-900 bg-zinc-900/40 p-4 text-xs text-zinc-400">
              <span className="block font-bold text-zinc-200">Webhook Ingestion Protocol</span>
              <p className="font-mono text-zinc-400 leading-relaxed">
                Production wiring would receive WooCommerce order.created webhook payloads through middleware, validate
                customer/SKU/shipping fields, strip duplicates and malformed rows, then append sanitized fulfillment
                records to the Google Sheets operations workbook through an Apps Script execution endpoint.
              </p>
            </div>
            <pre className="max-h-64 overflow-x-auto rounded-md border border-zinc-800 bg-zinc-950/90 p-3 font-mono text-[11px] text-lime-300 leading-relaxed md:p-4 md:text-xs">
              {JSON.stringify(webhookPayload, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <ZapierFulfillmentZapCard />
      </div>
    </div>
  );
}

function SupportTickets({ tickets }: { tickets: SupportTicket[] }) {
  return (
    <div className="grid gap-4">
      {tickets.map((ticket) => (
        <Card key={ticket.id} className={dashCardClass}>
          <CardHeader className={dashCardHeaderClass}>
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
          <CardContent className={cn("space-y-3 text-sm", dashCardContentClass)}>
            <p className="text-slate-400 leading-relaxed">{ticket.message}</p>
            <p className="text-slate-500 text-xs">
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
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl border border-[#dbe5ee] bg-[#ffffff]/90 p-1 shadow-[0_12px_35px_rgba(2,8,23,0.35)] md:w-fit">
          <TabsTrigger
            value="orders"
            className="gap-2 border border-transparent px-3 py-2 text-slate-400 transition-all hover:border-lime-400/20 hover:bg-[#f2f8fc] hover:text-slate-950 data-[state=active]:border-lime-400/40 data-[state=active]:bg-[#eef6ff] data-[state=active]:font-semibold data-[state=active]:text-lime-700"
          >
            <ShoppingCart className="size-4" />
            WooCommerce Order Management
          </TabsTrigger>
          <TabsTrigger
            value="support"
            className="gap-2 border border-transparent px-3 py-2 text-slate-400 transition-all hover:border-lime-400/20 hover:bg-[#f2f8fc] hover:text-slate-950 data-[state=active]:border-lime-400/40 data-[state=active]:bg-[#eef6ff] data-[state=active]:font-semibold data-[state=active]:text-lime-700"
          >
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
