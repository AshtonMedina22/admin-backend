import { Activity, AlertTriangle, Cpu, RadioTower, Ruler, ScrollText, Table2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchWorkbookScriptPayloadOrNull, type ScriptBid } from "@/lib/apps-script-workbook";
import { fetchPublishedFirstTable } from "@/lib/published-workbook";

type B2bBid = {
  id: string;
  account: string;
  brand: string;
  scope: string;
  status: string;
  value: string;
};

const b2bBids: B2bBid[] = [
  {
    id: "BID-301",
    account: "McKinney Logistics Hub",
    brand: "Solar 3SK",
    scope: "150kW Array Layout",
    status: "DocuSign Executed",
    value: "$185,000",
  },
  {
    id: "BID-302",
    account: "Denton Multi-Family Array",
    brand: "Solar 3SK",
    scope: "200kW Grid Interconnection",
    status: "Active Proposal Out",
    value: "$240,000",
  },
];

const milestoneLanes = [
  {
    title: "CAD & Electric Usage Review",
    card: "Plano Auto Body Shop (60kW)",
  },
  {
    title: "OpenSolar Layout Mapping",
    card: "Frisco Commercial Plaza (120kW)",
  },
  {
    title: "Municipal Permitting",
    card: "Rockwall Retail Strip (90kW)",
  },
];

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border bg-background px-3 py-2">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="font-medium text-sm tabular-nums">{value}</span>
    </div>
  );
}

function TelemetryAssets() {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="grid gap-1">
              <CardTitle>Hunt County Microgrid Array Core</CardTitle>
              <CardDescription>Yellow Star Power Operations</CardDescription>
            </div>
            <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-300">
              <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
              ACTIVE GENERATING
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3">
          <MetricRow label="Current Array Generation" value="48.2 kW" />
          <MetricRow label="Local Consumption Load" value="12.4 kW" />
          <MetricRow label="Net Grid Export Feed-In" value="35.8 kW (Surplus to Oncor Grid)" />
          <MetricRow label="Battery Storage Capacity" value="92.5% (LiFePO4 Core Bank)" />

          <div className="mt-2 rounded-md border bg-muted/35 p-3 text-sm">
            <div className="mb-2 flex items-center gap-2 font-medium">
              <Cpu className="size-4" />
              Hardware Data
            </div>
            <p className="text-muted-foreground">
              SolarEdge SE66.6K-USRW | SN: 7E120934-21B | Core Temp: 41.2°C | Lifetime Yield: 184.5 MWh
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="grid gap-1">
              <CardTitle>Frisco Commercial Array (Inverter A)</CardTitle>
              <CardDescription>Solar 3SK Client Operations</CardDescription>
            </div>
            <Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/15 dark:text-amber-300">
              <AlertTriangle className="size-3 animate-pulse" />
              SYSTEM FAULT
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3">
          <MetricRow label="Current Array Generation" value="0.0 kW" />
          <MetricRow label="Local Consumption Load" value="45.1 kW" />
          <MetricRow
            label="Net Utility Grid Draw"
            value="-45.1 kW (System drawing from grid to cover business facility load)"
          />

          <div className="mt-2 rounded-md border bg-muted/35 p-3 text-sm">
            <div className="mb-2 flex items-center gap-2 font-medium">
              <Cpu className="size-4" />
              Hardware Data & Telemetry Error Output
            </div>
            <p className="text-muted-foreground">
              SolarEdge SE100K-USR4 | SN: 7F003821-99C | Core Temp: 22.8°C | Last Ping: 18 minutes ago (Stale).
            </p>
          </div>

          <pre className="overflow-x-auto rounded-md border bg-background p-3 font-mono text-amber-700 text-xs dark:text-amber-300">
            {`[ERR-CODE: 18x2] - Utility Isolation Timeout Fault. Check Oncor Interconnection Circuit Line Balance Status.`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { currency: "USD", maximumFractionDigits: 0, style: "currency" }).format(value);
}

function mapScriptBid(bid: ScriptBid): B2bBid {
  return {
    id: bid.bid_id,
    account: bid.account,
    brand: bid.brand,
    scope: bid.scope,
    status: bid.status,
    value: formatCurrency(bid.value),
  };
}

async function fetchB2bBids(): Promise<B2bBid[]> {
  try {
    const rows = await fetchPublishedFirstTable("Solar3K Bids");
    const bids = rows
      .filter((row) => row.proposal_id)
      .slice(0, 2)
      .map((row) => ({
        id: row.proposal_id,
        account: row.client_name,
        brand: row.entity_brand,
        scope: row.scope_of_work,
        status: row.contract_status,
        value: formatCurrency(Number(row.bid_total.replace(/[$,]/g, "")) || 0),
      }));

    if (bids.length) return bids;
  } catch {
    // Fall back to Apps Script or local preview data below.
  }

  const scriptPayload = await fetchWorkbookScriptPayloadOrNull();
  return scriptPayload?.b2bBids?.length ? scriptPayload.b2bBids.map(mapScriptBid) : b2bBids;
}

function B2bBidsTable({ bids }: { bids: B2bBid[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Table2 className="size-5" />
          CRM & B2B Bids
        </CardTitle>
        <CardDescription>Commercial account pipeline for Solar 3SK consulting and design work.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bid ID</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bids.map((bid) => (
                <TableRow key={bid.id}>
                  <TableCell className="font-medium">{bid.id}</TableCell>
                  <TableCell>{bid.account}</TableCell>
                  <TableCell>{bid.brand}</TableCell>
                  <TableCell>{bid.scope}</TableCell>
                  <TableCell>
                    <Badge variant={bid.status === "DocuSign Executed" ? "default" : "outline"}>{bid.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{bid.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function EngineeringMilestones() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {milestoneLanes.map((lane) => (
        <Card key={lane.title} className="min-h-72">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ScrollText className="size-4" />
              {lane.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border bg-muted/35 p-4">
              <div className="font-medium">{lane.card}</div>
              <div className="mt-2 flex items-center gap-2 text-muted-foreground text-sm">
                <span className="size-2 rounded-full bg-primary" />
                Design advancement pipeline
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default async function Page() {
  const bids = await fetchB2bBids();

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h1 className="font-semibold text-2xl tracking-tight">Enterprise Hub</h1>
        <p className="max-w-3xl text-muted-foreground text-sm">
          Dense operating view for Yellow Star Power infrastructure telemetry and Solar 3SK commercial delivery.
        </p>
      </div>

      <Tabs defaultValue="telemetry" className="flex flex-col gap-4">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto p-1 md:w-fit">
          <TabsTrigger value="telemetry" className="gap-2">
            <RadioTower className="size-4" />
            Telemetry Analytics
          </TabsTrigger>
          <TabsTrigger value="crm" className="gap-2">
            <Activity className="size-4" />
            CRM & B2B Bids
          </TabsTrigger>
          <TabsTrigger value="engineering" className="gap-2">
            <Ruler className="size-4" />
            Engineering Milestones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="telemetry" className="m-0">
          <TelemetryAssets />
        </TabsContent>

        <TabsContent value="crm" className="m-0">
          <B2bBidsTable bids={bids} />
        </TabsContent>

        <TabsContent value="engineering" className="m-0">
          <EngineeringMilestones />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const dynamic = "force-dynamic";

export const revalidate = 0;
