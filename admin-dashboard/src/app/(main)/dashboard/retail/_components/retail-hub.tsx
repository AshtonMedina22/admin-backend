"use client";

import { BatteryCharging, ClockAlert, Package, PackageCheck, ShoppingCart, TicketCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DashImplementationLabel } from "@/components/dashboard/implementation-label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SupportTicket } from "@/data/demo/support-tickets";
import { supportTicketsData } from "@/data/demo/support-tickets";
import {
  dashCardContentClass,
  dashCardHeaderClass,
  dashKpiGridClass,
  dashPageClass,
  dashPageHeaderClass,
  dashSectionCardContentClass,
  dashSectionCardHeaderClass,
  dashSurfaceCardClass,
} from "@/lib/dashboard-ui";
import {
  dashCodeBlockSmClass,
  dashKpiValueClass,
  dashProseClass,
  entityAccentBarForLabel,
  entityBrandStyles,
  statusStyles,
} from "@/lib/entity-brand";
import { implementationLabels } from "@/lib/implementation-labels";
import { cn } from "@/lib/utils";

const retailTabTriggerClass =
  "gap-2 rounded-md border border-transparent px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-border hover:bg-muted/40 hover:text-foreground data-[state=active]:border-[color-mix(in_oklab,var(--brand-2sk)_30%,transparent)] data-[state=active]:bg-card data-[state=active]:font-semibold data-[state=active]:text-[var(--brand-2sk-text)] data-[state=active]:shadow-sm";

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
  "Sheet Action: reject duplicate source order IDs before appending one sanitized 2SK Fulfillment row.",
  "Optional Alert: send a Gmail/MailApp notification when package weight or battery freight rules exceed threshold.",
];

const FULFILLMENT_APPS_SCRIPT = `function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const workbookId = PropertiesService.getScriptProperties().getProperty('OPS_WORKBOOK_ID');

    if (!workbookId) {
      throw new Error('Configuration Fault: OPS_WORKBOOK_ID script property is unconfigured.');
    }

    const sheet = SpreadsheetApp.openById(workbookId).getSheetByName('2SK Fulfillment');
    if (!sheet) {
      throw new Error("Data Integrity Fault: '2SK Fulfillment' tab not found.");
    }

    const orderId = String(payload.order_id || '').trim();
    if (!orderId) {
      throw new Error('Payload Fault: order_id is required for fulfillment dedupe.');
    }

    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const existingOrderIds = sheet
        .getRange(2, 1, lastRow - 1, 1)
        .getValues()
        .map((row) => String(row[0]).trim());

      if (existingOrderIds.includes(orderId)) {
        return jsonResponse({ ok: true, status: 'SKIPPED_DUPLICATE', order_id: orderId });
      }
    }

    const packageWeightLbs = Number(payload.package_weight_lbs || 0);
    const row = [
      orderId,
      payload.customer_name ? String(payload.customer_name).trim() : 'UNKNOWN CUSTOMER',
      payload.sku || 'UNKNOWN-SKU',
      Number(payload.quantity || 1),
      packageWeightLbs,
      payload.warehouse_bin || 'UNASSIGNED',
      payload.fulfillment_status || 'Pending Warehouse Pull',
      new Date(),
    ];

    sheet.appendRow(row);

    if (packageWeightLbs > 75) {
      MailApp.sendEmail(
        'ops-alerts@demo-ops.local',
        '2SK LTL Freight Review Required',
        JSON.stringify(payload, null, 2),
      );
    }

    return jsonResponse({ ok: true, status: 'RECORDED', order_id: orderId });
  } catch (error) {
    console.error('Webhook Ingestion Failure: ' + error.toString());
    return jsonResponse({ ok: false, error: error.message });
  }
}

function jsonResponse(body) {
  return ContentService.createTextOutput(JSON.stringify(body))
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
  const cardClass = cn(dashSurfaceCardClass, entityBrandStyles.solar2sk.accentBar, "min-h-[7.25rem]");
  const contentClass = cn("line-clamp-2 text-muted-foreground text-[11px] leading-snug", dashCardContentClass);
  return (
    <div className={cn(dashKpiGridClass, "grid-cols-2 gap-3 lg:grid-cols-4")}>
      <Card size="sm" className={cardClass}>
        <CardHeader className={dashCardHeaderClass}>
          <CardDescription className="flex items-center gap-2 text-xs">
            <Package className={cn("size-4", entityBrandStyles.solar2sk.icon)} />
            Open Order Backlog
          </CardDescription>
          <CardTitle className={dashKpiValueClass}>{Math.max(45, totalBacklogUnits)}</CardTitle>
        </CardHeader>
        <CardContent className={contentClass}>
          Active WooCommerce orders across 2SK hardware fulfillment.
        </CardContent>
      </Card>
      <Card size="sm" className={cardClass}>
        <CardHeader className={dashCardHeaderClass}>
          <CardDescription className="flex items-center gap-2 text-xs">
            <PackageCheck className={cn("size-4", entityBrandStyles.solar2sk.icon)} />
            Awaiting Warehouse Pull
          </CardDescription>
          <CardTitle className={dashKpiValueClass}>{stats.awaitingPull}</CardTitle>
        </CardHeader>
        <CardContent className={contentClass}>
          Wylie warehouse pull queue for inverter and kit SKUs.
        </CardContent>
      </Card>
      <Card size="sm" className={cardClass}>
        <CardHeader className={dashCardHeaderClass}>
          <CardDescription className="flex items-center gap-2 text-xs">
            <BatteryCharging className={cn("size-4", entityBrandStyles.solar2sk.icon)} />
            Battery Kits Inbound
          </CardDescription>
          <CardTitle className={dashKpiValueClass}>{Math.max(8, pendingBatteryShipments)}</CardTitle>
        </CardHeader>
        <CardContent className={contentClass}>
          48V LiFePO4 battery blocks pending freight reconciliation.
        </CardContent>
      </Card>
      <Card size="sm" className={cn(dashSurfaceCardClass, "min-h-[7.25rem]")}>
        <CardHeader className={dashCardHeaderClass}>
          <CardDescription className="flex items-center gap-2 text-xs">
            <ClockAlert className={cn("size-4", entityBrandStyles.yellowStar.icon)} />
            Transit Fulfillment Delays
          </CardDescription>
          <CardTitle className={dashKpiValueClass}>{stats.transitDelay}</CardTitle>
        </CardHeader>
        <CardContent className={contentClass}>
          Orders blocked by pallet weight, LTL timing, or inventory hold.
        </CardContent>
      </Card>
    </div>
  );
}

function FulfillmentBadge({ stage }: { stage: string }) {
  const lower = stage.toLowerCase();
  const className = lower.includes("hold")
    ? statusStyles.warning
    : lower.includes("packed") || lower.includes("picked")
      ? statusStyles.live
      : statusStyles.info;
  return (
    <Badge variant="outline" className={cn("h-6 font-normal", className)}>
      {stage}
    </Badge>
  );
}

function ZapierWorkflowCard() {
  return (
    <Card size="sm" className={cn("h-full", dashSurfaceCardClass)}>
      <CardHeader className={dashSectionCardHeaderClass}>
        <CardTitle>Zapier Ingestion Workflow</CardTitle>
        <CardDescription>
          Legitimate Zap pattern for routing WooCommerce orders into a Google Sheets-backed 2SK fulfillment queue.
        </CardDescription>
      </CardHeader>
      <CardContent className={dashSectionCardContentClass}>
        <div className="grid max-h-[460px] gap-2 overflow-y-auto pr-1">
          {fulfillmentZapSteps.map((step, index) => (
            <div key={step} className="rounded-lg border border-border bg-muted/40 p-2.5">
              <p className={cn("font-mono text-[10px]", entityBrandStyles.solar2sk.text)}>STEP {index + 1}</p>
              <p className={cn("mt-1 text-xs", dashProseClass)}>{step}</p>
            </div>
          ))}
        </div>
        <div className={cn(dashCodeBlockSmClass, "mt-3 text-xs leading-relaxed")}>
          <strong className="text-foreground">Accuracy note:</strong> WooCommerce can trigger Zapier on order-created
          events, Zapier can filter/format fields, and Webhooks by Zapier can POST a JSON payload into an Apps Script
          web app endpoint. The Apps Script then owns Sheet writes, dedupe policy, and optional Gmail/MailApp alerts.
        </div>
      </CardContent>
    </Card>
  );
}

function WebhookPayloadCard() {
  return (
    <Card size="sm" className={dashSurfaceCardClass}>
      <CardHeader className={dashSectionCardHeaderClass}>
        <CardTitle>Order Webhook Payload Monitor</CardTitle>
        <CardDescription>
          WooCommerce-style order webhook -&gt; Zapier middleware -&gt; workbook row payload.
        </CardDescription>
      </CardHeader>
      <CardContent className={dashSectionCardContentClass}>
        <div className="mb-3 rounded-lg border border-border bg-muted/40 p-3 text-xs">
          <DashImplementationLabel variant={implementationLabels.retailIngestion.variant} inline>
            {implementationLabels.retailIngestion.title}
          </DashImplementationLabel>
          <p className={cn("mt-2 line-clamp-3 font-mono leading-relaxed", dashProseClass)}>
            Middleware validates customer/SKU/shipping fields, rejects duplicate order IDs and malformed rows, then
            appends sanitized fulfillment records to the operations workbook.
          </p>
        </div>
        <pre className={cn(dashCodeBlockSmClass, "max-h-48 overflow-y-auto md:text-xs")}>
          {JSON.stringify(webhookPayload, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}

function AppsScriptContractCard() {
  return (
    <Card size="sm" className={dashSurfaceCardClass}>
      <CardHeader className={dashSectionCardHeaderClass}>
        <CardTitle>Fulfillment API Script</CardTitle>
        <CardDescription>Apps Script endpoint with dedupe, freight alerting, and JSON responses.</CardDescription>
      </CardHeader>
      <CardContent className={dashSectionCardContentClass}>
        <pre className={cn(dashCodeBlockSmClass, "max-h-[260px] overflow-y-auto text-[11px]")}>
          <code>{FULFILLMENT_APPS_SCRIPT}</code>
        </pre>
      </CardContent>
    </Card>
  );
}

function OrderManagement({ orders }: { orders: RetailLogisticsOrder[] }) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <Card size="sm" className={dashSurfaceCardClass}>
        <CardHeader className={dashSectionCardHeaderClass}>
          <CardTitle>2SK Fulfillment Matrix</CardTitle>
          <CardDescription>
            Logistics-first view: hardware allocation, warehouse stage, and dispatch notes.
          </CardDescription>
        </CardHeader>
        <CardContent className={dashSectionCardContentClass}>
          <div className="block w-full overflow-x-auto rounded-md border border-border">
            <Table className="min-w-[920px] table-fixed text-[11px]">
              <TableHeader>
                <TableRow className="h-9 border-border/60">
                  <TableHead className="w-[12%]">Order ID</TableHead>
                  <TableHead className="w-[20%]">Customer</TableHead>
                  <TableHead className="w-[33%]">Hardware Allocated</TableHead>
                  <TableHead className="w-[15%] text-right">Package Weight</TableHead>
                  <TableHead className="w-[20%]">Fulfillment Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow
                    key={order.orderId}
                    className={cn("h-11 border-border/60 hover:bg-muted/30", entityAccentBarForLabel("2SK"))}
                  >
                    <TableCell
                      className={cn("py-2 font-medium font-mono tabular-nums", entityBrandStyles.solar2sk.text)}
                    >
                      {order.orderId}
                    </TableCell>
                    <TableCell className="truncate py-2 font-medium">{order.customerName}</TableCell>
                    <TableCell className="truncate py-2 text-muted-foreground">{order.hardwareAllocated}</TableCell>
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <ZapierWorkflowCard />
        </div>
        <div className="grid gap-4 lg:col-span-7">
          <WebhookPayloadCard />
          <AppsScriptContractCard />
        </div>
      </div>
    </div>
  );
}

function SupportTickets({ tickets }: { tickets: SupportTicket[] }) {
  return (
    <div className="grid gap-4">
      {tickets.map((ticket) => (
        <Card key={ticket.id} className={cn(dashSurfaceCardClass, entityBrandStyles.solar2sk.accentBar)}>
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
                  ticket.priority === "High" && statusStyles.warning,
                )}
                variant={ticket.priority === "High" ? "default" : "outline"}
              >
                {ticket.priority} · {ticket.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className={cn("space-y-3 text-sm", dashCardContentClass)}>
            <p className={cn(dashProseClass, "leading-relaxed")}>{ticket.message}</p>
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
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1 shadow-sm md:w-fit">
          <TabsTrigger value="orders" className={cn(retailTabTriggerClass)}>
            <ShoppingCart className="size-4" />
            WooCommerce Order Management
          </TabsTrigger>
          <TabsTrigger value="support" className={cn(retailTabTriggerClass)}>
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
