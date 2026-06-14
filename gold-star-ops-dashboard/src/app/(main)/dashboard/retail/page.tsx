import { ShoppingCart, TicketCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchWorkbookScriptPayloadOrNull, type ScriptRetailOrder } from "@/lib/apps-script-workbook";
import { fetchPublishedSectionTable } from "@/lib/published-workbook";

type RetailOrder = {
  id: string;
  customer: string;
  product: string;
  status: string;
  value: string;
  date: string;
};

const orders: RetailOrder[] = [
  {
    id: "WOO-9401",
    customer: "Garrett Miller",
    product: "Rich Solar 3KW Hybrid Inverter Pack",
    status: "Pending Warehouse Pull",
    value: "$4,200",
    date: "2026-06-12",
  },
  {
    id: "WOO-9402",
    customer: "Marcus Vance",
    product: "48V 100Ah LiFePO4 Battery Block",
    status: "Fulfillled & Packed",
    value: "$2,100",
    date: "2026-06-11",
  },
];

const webhookPayload = {
  api_event: "orders.woocommerce.created",
  origin_host: "shop.solar2sk.com",
  middleware_sync: "Zapier_Enterprise_Hook_Active",
  payload_integrity: "Verified_200_OK",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { currency: "USD", maximumFractionDigits: 0, style: "currency" }).format(value);
}

function formatSheetDate(value: string) {
  if (!value.includes("T")) return value;
  return value.slice(0, 10);
}

function mapScriptOrder(order: ScriptRetailOrder): RetailOrder {
  return {
    id: order.order_id,
    customer: order.customer,
    product: order.product,
    status: order.status,
    value: formatCurrency(order.value),
    date: formatSheetDate(order.date),
  };
}

async function fetchRetailOrders(): Promise<RetailOrder[]> {
  try {
    const rows = await fetchPublishedSectionTable("Retail Ops", "WooCommerce Order Management");
    const publishedOrders = rows
      .filter((row) => row.order_id)
      .map((row) => ({
        id: row.order_id,
        customer: row.customer,
        product: row.product,
        status: row.status,
        value: row.value,
        date: row.date,
      }));

    if (publishedOrders.length) return publishedOrders;
  } catch {
    // Fall back to Apps Script or local preview data below.
  }

  const scriptPayload = await fetchWorkbookScriptPayloadOrNull();
  return scriptPayload?.retailOrders?.length ? scriptPayload.retailOrders.map(mapScriptOrder) : orders;
}

function OrderManagement({ orderRows }: { orderRows: RetailOrder[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <Card className="xl:col-span-8">
        <CardHeader>
          <CardTitle>Order Registry</CardTitle>
          <CardDescription>Solar 2SK WooCommerce fulfillment queue and warehouse pull state.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderRows.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.product}</TableCell>
                    <TableCell>
                      <Badge variant={order.status === "Pending Warehouse Pull" ? "secondary" : "outline"}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{order.value}</TableCell>
                    <TableCell>{order.date}</TableCell>
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
          <CardDescription>JSON sync output from the Solar 2SK order middleware.</CardDescription>
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

function SupportTickets() {
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="grid gap-1">
              <CardTitle>Battery Parallel Configuration Validation</CardTitle>
              <CardDescription>Ticket ID: #2SK-TK-8012 | User Group: Retail DIY Purchaser (M. Allen)</CardDescription>
            </div>
            <Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/15 dark:text-amber-300">
              High Priority
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="max-w-5xl text-muted-foreground text-sm leading-relaxed">
            "Requesting engineering team review on wiring my three 48V Lithium blocks in parallel to hit targeted
            capacity margins without accidentally over-volting the input threshold of the Anenji 3KW inverter hardware
            bank."
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function Page() {
  const orderRows = await fetchRetailOrders();

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h1 className="font-semibold text-2xl tracking-tight">Consumer Retail Hub</h1>
        <p className="max-w-3xl text-muted-foreground text-sm">
          E-commerce system environment for Solar 2SK direct consumer retail order streams and DIY technical support.
        </p>
      </div>

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
          <OrderManagement orderRows={orderRows} />
        </TabsContent>

        <TabsContent value="support" className="m-0">
          <SupportTickets />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const dynamic = "force-dynamic";

export const revalidate = 0;
