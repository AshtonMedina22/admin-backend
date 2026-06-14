"use client";

import { AlertTriangle, DollarSign, Globe2, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { totalMonthlySpend, urgentAlertsCount } from "@/data/demo/systems";
import {
  dashCardClass,
  dashCardContentClass,
  dashCardHeaderClass,
  dashKpiGrid3Class,
  dashPageClass,
  dashPageHeaderClass,
} from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

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
    detail: "DreamHost | Base Platform: WordPress - SSL handshake failing on apex domain",
    ssl: "CRITICAL EXPIRED",
    renewal: "June 10, 2026 (Action Overdue)",
    admin: "Jordan Lee",
    critical: true,
  },
  {
    domain: "shop.solar2sk.com",
    detail: "DreamHost | WooCommerce retail storefront - active customer traffic",
    ssl: "OPERATIONAL",
    renewal: "Jan 15, 2027",
    admin: "Jordan Lee",
    critical: false,
  },
  {
    domain: "solar3k.com",
    detail: "Vercel | Next.js commercial consultation platform",
    ssl: "OPERATIONAL",
    renewal: "Nov 22, 2026",
    admin: "Alex Morgan",
    critical: false,
  },
  {
    domain: "yellowstarpower.com",
    detail: "Vercel | Next.js utility asset and grid operations platform",
    ssl: "OPERATIONAL",
    renewal: "Dec 05, 2026",
    admin: "Alex Morgan",
    critical: false,
  },
];

export const defaultSubscriptions: SubscriptionRow[] = [
  {
    tool: "DreamHost Server Stack",
    cadence: "Monthly",
    cost: 45,
    purpose: "PHP/WordPress retail storefront (shop.solar2sk.com)",
    admin: "Alex Morgan",
  },
  {
    tool: "Vercel Pro Tier",
    cadence: "Monthly",
    cost: 20,
    purpose: "Next.js commercial landing pages (Solar 3SK / Yellow Star Power)",
    admin: "Alex Morgan",
  },
  {
    tool: "Zapier Team Tier",
    cadence: "Monthly",
    cost: 49,
    purpose: "WooCommerce webhooks, lead forms, Google Sheets sync",
    admin: "Alex Morgan",
  },
  {
    tool: "DocuSign Corporate Pro",
    cadence: "Monthly",
    cost: 45,
    purpose: "Solar 3SK engineering layouts and power consultation contracts",
    admin: "Alex Morgan",
  },
  {
    tool: "QuickBooks Online",
    cadence: "Monthly",
    cost: 90,
    purpose: "Retail invoicing ledger and cross-entity financial reconciliation",
    admin: "Jordan Lee",
  },
];

export const defaultAccessRows: AccessRow[] = [
  {
    profile: "Alex Morgan (alex.morgan@demo-ops.local)",
    role: "SUPER_ADMIN",
    scope: "Global Holdings",
    permissions:
      "Command Center (READ_WRITE) | CRM (READ_WRITE) | Telemetry (READ_WRITE) | Vendor Ops (READ_WRITE) | System Settings (READ_WRITE)",
  },
  {
    profile: "Jordan Lee (jordan.lee@demo-retail.local)",
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

function InfrastructureStatusLog() {
  return (
    <Card className="border-amber-500/40 bg-amber-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Infrastructure Status Log</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-mono text-amber-900 text-sm leading-relaxed dark:text-amber-100">
          DreamHost Server Status: 1 Domain Flagged URGENT (solar2sk.com SSL handshake exception)
        </p>
      </CardContent>
    </Card>
  );
}

function SystemsKpiStrip({ monthlySpend, urgentAlerts }: { monthlySpend: number; urgentAlerts: number }) {
  return (
    <div className={dashKpiGrid3Class}>
      <Card size="sm" className={dashCardClass}>
        <CardHeader className={dashCardHeaderClass}>
          <CardDescription className="flex items-center gap-2 text-xs">
            <DollarSign className="size-4" />
            Monthly SaaS Burn Rate
          </CardDescription>
          <CardTitle className="text-2xl tabular-nums">${monthlySpend.toFixed(0)}</CardTitle>
        </CardHeader>
        <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
          DreamHost, Vercel, Zapier, DocuSign, and QuickBooks - low-overhead automated stack
        </CardContent>
      </Card>
      <Card size="sm" className={dashCardClass}>
        <CardHeader className={dashCardHeaderClass}>
          <CardDescription className="flex items-center gap-2 text-xs">
            <Globe2 className="size-4" />
            Domain Monitors
          </CardDescription>
          <CardTitle className="text-2xl tabular-nums">4</CardTitle>
        </CardHeader>
        <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
          Multi-tenant WordPress and Next.js property health
        </CardContent>
      </Card>
      <Card size="sm" className={cn(dashCardClass, urgentAlerts > 0 ? "border-amber-500/40" : undefined)}>
        <CardHeader className={dashCardHeaderClass}>
          <CardDescription className="flex items-center gap-2 text-xs">
            <AlertTriangle className="size-4" />
            Urgent Infrastructure Alerts
          </CardDescription>
          <CardTitle className={cn("text-2xl tabular-nums", urgentAlerts > 0 && "text-amber-600")}>{urgentAlerts}</CardTitle>
        </CardHeader>
        <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
          SSL renewals, DreamHost certificate issues, domain monitoring
        </CardContent>
      </Card>
    </div>
  );
}

export function SystemsDashboard({
  accessRows = defaultAccessRows,
  domainMonitors = defaultDomainMonitors,
  subscriptions = defaultSubscriptions,
  showPlatformConfig = false,
}: {
  accessRows?: AccessRow[];
  domainMonitors?: DomainMonitorRow[];
  subscriptions?: SubscriptionRow[];
  showPlatformConfig?: boolean;
}) {
  const monthlySpend = subscriptions.reduce((sum, item) => sum + item.cost, 0) || totalMonthlySpend;
  const urgentAlerts = domainMonitors.filter((domain) => domain.critical).length || urgentAlertsCount;

  return (
    <div className={dashPageClass}>
      <div className={dashPageHeaderClass}>
        <h1 className="font-semibold text-2xl tracking-tight">Systems & Settings</h1>
        <p className="max-w-3xl text-muted-foreground text-sm">
          Cloud optimization overhead, domain configuration, hosting stability, and corporate SaaS budget tracking.
        </p>
      </div>

      <InfrastructureStatusLog />

      <SystemsKpiStrip monthlySpend={monthlySpend} urgentAlerts={urgentAlerts} />

      {showPlatformConfig ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Platform Environment Sync Profiles</CardTitle>
            <CardDescription>
              Non-interactive ingestion path mapping for published workbook, Apps Script webhook, and Sheets API
              fallbacks.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between rounded-md border px-3 py-2">
                <span className="font-medium">Published Workbook</span>
                <span className="text-muted-foreground">YellowStarPower_Operations (HTML export)</span>
              </div>
              <div className="flex justify-between rounded-md border px-3 py-2">
                <span className="font-medium">Apps Script Webhook</span>
                <span className="text-muted-foreground">Zapier + OpenSolar event bridge</span>
              </div>
              <div className="flex justify-between rounded-md border px-3 py-2">
                <span className="font-medium">Sheets API Fallback</span>
                <span className="text-muted-foreground">Service account slug routing</span>
              </div>
            </div>
            <pre className="overflow-x-auto rounded-md border bg-muted/40 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
              Active Data Path Mapping via lib/google-sheets.ts: [slug] -&gt; SLUG_SHEET_NAMES Dictionary Validation Pass
            </pre>
          </CardContent>
        </Card>
      ) : null}

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
