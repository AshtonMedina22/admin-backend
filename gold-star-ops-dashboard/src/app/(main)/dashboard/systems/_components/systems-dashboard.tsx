"use client";

import { DollarSign, Globe2, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type DomainMonitorRow = {
  domain: string;
  detail: string;
  ssl: string;
  renewal: string;
  admin: string;
  critical: boolean;
};

export type SubscriptionRow = {
  tool: string;
  cadence: string;
  cost: number;
  purpose: string;
  admin: string;
};

export type AccessRow = {
  profile: string;
  role: string;
  scope: string;
  permissions: string;
};

export const defaultDomainMonitors: DomainMonitorRow[] = [
  {
    domain: "solar2sk.com",
    detail: "DreamHost Hosting Console | Base Platform: WordPress Engine",
    ssl: "CRITICAL EXPIRED",
    renewal: "June 10, 2026 (Action Overdue)",
    admin: "S. Khan",
    critical: true,
  },
  {
    domain: "shop.solar2sk.com",
    detail: "WooCommerce",
    ssl: "OPERATIONAL",
    renewal: "Jan 15, 2027",
    admin: "S. Khan",
    critical: false,
  },
  {
    domain: "solar3k.com",
    detail: "Custom Next.js Platform",
    ssl: "OPERATIONAL",
    renewal: "Nov 22, 2026",
    admin: "T. Khan",
    critical: false,
  },
  {
    domain: "yellowstarpower.com",
    detail: "Custom Next.js Platform",
    ssl: "OPERATIONAL",
    renewal: "Dec 05, 2026",
    admin: "T. Khan",
    critical: false,
  },
];

export const defaultSubscriptions: SubscriptionRow[] = [
  {
    tool: "Google Workspace",
    cadence: "Monthly",
    cost: 72,
    purpose: "Global Holdings Identity (Emails/Docs)",
    admin: "T. Khan",
  },
  {
    tool: "DreamHost Server Stack",
    cadence: "Monthly",
    cost: 45,
    purpose: "Multi-Tenant Site Hosting Layer",
    admin: "T. Khan",
  },
  {
    tool: "QuickBooks Online",
    cadence: "Monthly",
    cost: 90,
    purpose: "Cross-Entity Invoicing Ledger",
    admin: "S. Khan",
  },
  {
    tool: "Zapier Automation Engine",
    cadence: "Monthly",
    cost: 49,
    purpose: "Webhook Lead Synchronization Pipeline",
    admin: "T. Khan",
  },
  {
    tool: "DocuSign Corporate Pro",
    cadence: "Monthly",
    cost: 45,
    purpose: "B2B Commercial Contract Delivery",
    admin: "T. Khan",
  },
  {
    tool: "OpenSolar Platform",
    cadence: "Monthly",
    cost: 0,
    purpose: "Freemium B2B CAD Array Design Layouts",
    admin: "T. Khan",
  },
  {
    tool: "SolarEdge Monitoring API",
    cadence: "Monthly",
    cost: 0,
    purpose: "Hardware Bundle / Telemetry Polling Layer",
    admin: "T. Khan",
  },
];

export const defaultAccessRows: AccessRow[] = [
  {
    profile: "Thureen Khan (t.khan@yellowstarpower.com)",
    role: "SUPER_ADMIN",
    scope: "Global Holdings",
    permissions:
      "Command Center (READ_WRITE) | CRM (READ_WRITE) | Telemetry (READ_WRITE) | Vendor Ops (READ_WRITE) | System Settings (READ_WRITE)",
  },
  {
    profile: "S. Khan (s.khan@solar2sk.com)",
    role: "OPS_MANAGER",
    scope: "Solar 2SK Retail",
    permissions:
      "Command Center (READ_ONLY) | CRM (READ_WRITE) | Telemetry (NO_ACCESS) | Vendor Ops (READ_WRITE) | System Settings (READ_ONLY)",
  },
  {
    profile: "Field Installation Contractor Team (install-dfw2@external-vendors.net)",
    role: "FIELD_CREW",
    scope: "Solar 3SK Sites",
    permissions:
      "Command Center (NO_ACCESS) | CRM (NO_ACCESS) | Telemetry (READ_ONLY) | Vendor Ops (READ_ONLY) | System Settings (NO_ACCESS)",
  },
];

function DomainMonitors({ domainMonitors }: { domainMonitors: DomainMonitorRow[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {domainMonitors.map((domain) => (
        <Card
          key={domain.domain}
          className={
            domain.critical ? "border-2 border-amber-500 shadow-[0_0_0_1px_theme(colors.amber.500/0.25)]" : "border"
          }
        >
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="grid gap-1">
                <CardTitle>{domain.domain}</CardTitle>
                <CardDescription>{domain.detail}</CardDescription>
              </div>
              {domain.critical ? (
                <span className="size-3 animate-pulse rounded-full bg-amber-500" />
              ) : (
                <span className="size-3 rounded-full bg-emerald-500" />
              )}
            </div>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-background px-3 py-2">
              <span className="text-muted-foreground">SSL Handshake Status</span>
              <Badge variant={domain.critical ? "destructive" : "outline"}>{domain.ssl}</Badge>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-background px-3 py-2">
              <span className="text-muted-foreground">Expiration / Renewal</span>
              <span className="font-medium">{domain.renewal}</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-background px-3 py-2">
              <span className="text-muted-foreground">Assigned Administrator Handle</span>
              <span className="font-medium">{domain.admin}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SubscriptionLedger({ subscriptions }: { subscriptions: SubscriptionRow[] }) {
  const monthlyTotal = subscriptions.reduce((sum, item) => sum + item.cost, 0);
  const annualTotal = monthlyTotal * 12;

  return (
    <Card>
      <CardHeader>
        <CardTitle>SaaS Subscription Ledger</CardTitle>
        <CardDescription>Dense monthly software spend ledger across corporate operating systems.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tool</TableHead>
                <TableHead>Cadence</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Admin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((subscription) => (
                <TableRow key={subscription.tool}>
                  <TableCell className="font-medium">{subscription.tool}</TableCell>
                  <TableCell>{subscription.cadence}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">${subscription.cost}</TableCell>
                  <TableCell>{subscription.purpose}</TableCell>
                  <TableCell>Admin: {subscription.admin}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="rounded-md border bg-muted/35 p-4 font-medium">
          Aggregated Global Tool Burn Rate: ${monthlyTotal.toFixed(2)} / month (${annualTotal.toLocaleString()}.00 /
          year).
        </div>
      </CardContent>
    </Card>
  );
}

function AccessControls({ accessRows }: { accessRows: AccessRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Access / RBAC Controls</CardTitle>
        <CardDescription>
          Role-based safety parameters across corporate units and external field access.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profile</TableHead>
                <TableHead>Corporate Role Assigned</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Module Permissions Profile</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accessRows.map((row) => (
                <TableRow key={row.profile}>
                  <TableCell className="font-medium">{row.profile}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.role}</Badge>
                  </TableCell>
                  <TableCell>{row.scope}</TableCell>
                  <TableCell className="max-w-2xl whitespace-normal leading-relaxed">{row.permissions}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export function SystemsDashboard({
  accessRows = defaultAccessRows,
  domainMonitors = defaultDomainMonitors,
  subscriptions = defaultSubscriptions,
}: {
  accessRows?: AccessRow[];
  domainMonitors?: DomainMonitorRow[];
  subscriptions?: SubscriptionRow[];
}) {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h1 className="font-semibold text-2xl tracking-tight">Systems & Settings</h1>
        <p className="max-w-3xl text-muted-foreground text-sm">
          Technical platform management for code asset health, system billing parameters, and corporate access controls.
        </p>
      </div>

      <Tabs defaultValue="domains" className="flex flex-col gap-4">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto p-1 md:w-fit">
          <TabsTrigger value="domains" className="gap-2">
            <Globe2 className="size-4" />
            Domain Monitors
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="gap-2">
            <DollarSign className="size-4" />
            SaaS Subscription Ledger
          </TabsTrigger>
          <TabsTrigger value="access" className="gap-2">
            <ShieldCheck className="size-4" />
            User Access / RBAC Controls
          </TabsTrigger>
        </TabsList>

        <TabsContent value="domains" className="m-0">
          <DomainMonitors domainMonitors={domainMonitors} />
        </TabsContent>

        <TabsContent value="subscriptions" className="m-0">
          <SubscriptionLedger subscriptions={subscriptions} />
        </TabsContent>

        <TabsContent value="access" className="m-0">
          <AccessControls accessRows={accessRows} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
