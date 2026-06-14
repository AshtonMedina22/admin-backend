"use client";

import { Package, ShoppingCart, TicketCheck, Truck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fulfillmentStageIcon } from "@/data/demo/orders";
import type { SupportTicket } from "@/data/demo/support-tickets";
import { supportTicketsData } from "@/data/demo/support-tickets";
import { cn } from "@/lib/utils";

export type RetailLogisticsOrder = {
  orderId: string;
  customerName: string;
  hardwareAllocated: string;
  fulfillmentStage: string;
  logisticsNotes: string;
};

type RetailHubProps = {
  orders: RetailLogisticsOrder[];
  totalBacklogUnits: number;
  pendingBatteryShipments: number;
  supportTickets?: SupportTicket[];
};

const webhookPayload = {
  api_event: "orders.woocommerce.created",
  origin_host: "shop.novaretail.demo",
  middleware_sync: "Zapier_Enterprise_Hook_Active",
  payload_integrity: "Verified_200_OK",
};

function KpiStrip({ totalBacklogUnits, pendingBatteryShipments }: Pick<RetailHubProps, "totalBacklogUnits" | "pendingBatteryShipments">) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <Package className="size-4" />
            Total Backlog Units
          </CardDescription>
          <CardTitle className="text-3xl tabular-nums">{totalBacklogUnits}</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-xs">Pending + processing WooCommerce pulls at Wylie warehouse</CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <Truck className="size-4" />
            Pending Battery Shipments
          </CardDescription>
          <CardTitle className="text-3xl tabular-nums">{pendingBatteryShipments}</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-xs">LiFePO4 add-ons awaiting stock release or carrier dispatch</CardContent>
      </Card>
      <Card className="sm:col-span-2 xl:col-span-2">
        <CardHeader className="pb-2">
          <CardDescription>Physical product velocity</CardDescription>
          <CardTitle className="text-base">Nova Retail Co. inventory turnover rules</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm leading-relaxed">
          High-volume kit fulfillment depends on bin-level allocation, pallet weights, and LTL dispatch windows - not contract milestones.
        </CardContent>
      </Card>
    </div>
  );
}

function FulfillmentBadge({ stage }: { stage: string }) {
  const lower = stage.toLowerCase();
  const variant =
    lower.includes("hold") || lower.includes("queue") ? "secondary" : lower.includes("delivered") ? "outline" : "default";

  return (
    <Badge variant={variant} className="gap-1 font-normal">
      <span aria-hidden>{fulfillmentStageIcon(stage)}</span>
      {stage}
    </Badge>
  );
}

function OrderManagement({ orders }: { orders: RetailLogisticsOrder[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <Card className="xl:col-span-8">
        <CardHeader>
          <CardTitle>WooCommerce Fulfillment Queue</CardTitle>
          <CardDescription>Logistics-first view: hardware allocation, warehouse stage, and dispatch notes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Hardware Allocated</TableHead>
                  <TableHead>Logistics Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.orderId}>
                    <TableCell className="font-medium tabular-nums">{order.orderId}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell className="max-w-[12rem] whitespace-normal">{order.hardwareAllocated}</TableCell>
                    <TableCell>
                      <FulfillmentBadge stage={order.fulfillmentStage} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="xl:col-span-4">
        <CardHeader>
          <CardTitle>API Webhook Monitor</CardTitle>
          <CardDescription>JSON sync output from the Nova Retail Co. order middleware.</CardDescription>
        </CardHeader>
        <CardContent>
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
                  ticket.priority === "High" && "bg-amber-500/15 text-amber-700 hover:bg-amber-500/15 dark:text-amber-300",
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
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h1 className="font-semibold text-2xl tracking-tight">Consumer Retail Hub</h1>
        <p className="max-w-3xl text-muted-foreground text-sm">
          E-commerce fulfillment engine for Nova Retail Co. DIY kit volume, warehouse pulls, and transactional logistics verification.
        </p>
      </div>

      <KpiStrip totalBacklogUnits={totalBacklogUnits} pendingBatteryShipments={pendingBatteryShipments} />

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
