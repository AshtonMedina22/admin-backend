"use client";

import { AlertTriangle, DollarSign, Globe2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { totalMonthlySpend, urgentAlertsCount } from "@/data/demo/systems";
import {
  dashCardClass,
  dashCardContentClass,
  dashCardHeaderClass,
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

function getOverdueExpirationDate() {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() - 4);

  return `${new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(expirationDate)} (Action Overdue)`;
}

export const defaultDomainMonitors: DomainMonitorRow[] = [
  {
    domain: "solar2sk.com",
    detail: "DreamHost | Base Platform: WordPress - SSL handshake failing on apex domain",
    ssl: "CRITICAL EXPIRED",
    renewal: getOverdueExpirationDate(),
    admin: "Builder Ops",
    critical: true,
  },
  {
    domain: "shop.solar2sk.com",
    detail: "DreamHost | WooCommerce retail storefront - active customer traffic",
    ssl: "OPERATIONAL",
    renewal: "Jan 15, 2027",
    admin: "Builder Ops",
    critical: false,
  },
  {
    domain: "solar3k.com",
    detail: "Vercel | Next.js commercial consultation platform",
    ssl: "OPERATIONAL",
    renewal: "Nov 22, 2026",
    admin: "Builder Ops",
    critical: false,
  },
  {
    domain: "yellowstarpower.com",
    detail: "Vercel | Next.js utility asset and grid operations platform",
    ssl: "OPERATIONAL",
    renewal: "Dec 05, 2026",
    admin: "Builder Ops",
    critical: false,
  },
];

export const defaultSubscriptions: SubscriptionRow[] = [
  {
    tool: "DreamHost Server Stack",
    cadence: "Monthly",
    cost: 45,
    purpose: "PHP/WordPress retail storefront (shop.solar2sk.com)",
    admin: "Builder Ops",
  },
  {
    tool: "Vercel Pro Tier",
    cadence: "Monthly",
    cost: 20,
    purpose: "Next.js commercial landing pages (3SK / YSP)",
    admin: "Builder Ops",
  },
  {
    tool: "Zapier Team Tier",
    cadence: "Monthly",
    cost: 49,
    purpose: "WooCommerce webhooks, lead forms, Google Sheets sync",
    admin: "Builder Ops",
  },
  {
    tool: "DocuSign Corporate Pro",
    cadence: "Monthly",
    cost: 45,
    purpose: "3SK engineering layouts and power consultation contracts",
    admin: "Builder Ops",
  },
  {
    tool: "QuickBooks Online",
    cadence: "Monthly",
    cost: 90,
    purpose: "Retail invoicing ledger and cross-entity financial reconciliation",
    admin: "Builder Ops",
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
    scope: "2SK Retail",
    permissions:
      "Command Center (READ_ONLY) | CRM (READ_WRITE) | Telemetry (NO_ACCESS) | Vendor Ops (READ_WRITE) | System Settings (READ_ONLY)",
  },
  {
    profile: "Field Installation Contractor Team (install-dfw2@external-vendors.net)",
    role: "FIELD_CREW",
    scope: "3SK Sites",
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
          <CardHeader className="p-4 pb-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="grid gap-1">
                <CardTitle className="font-mono text-base">{domain.domain}</CardTitle>
                <CardDescription>{domain.detail}</CardDescription>
              </div>
              {domain.critical ? (
                <span className="size-3 animate-pulse rounded-full bg-amber-500" />
              ) : (
                <span className="size-3 rounded-full bg-emerald-500" />
              )}
            </div>
          </CardHeader>
          <CardContent className="grid gap-2 p-4 pt-0 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-background px-3 py-2">
              <span className="text-muted-foreground">SSL Handshake Status</span>
              <Badge variant={domain.critical ? "destructive" : "outline"} className="font-mono">
                {domain.ssl}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-background px-3 py-2">
              <span className="text-muted-foreground">Expiration / Renewal</span>
              <span className="font-medium font-mono">{domain.renewal}</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-background px-3 py-2">
              <span className="text-muted-foreground">Assigned Administrator Handle</span>
              <span className="font-medium font-mono">{domain.admin}</span>
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
      <CardHeader className="p-4 pb-2">
        <CardTitle>SaaS Subscription Ledger</CardTitle>
        <CardDescription>Dense monthly software spend ledger across corporate operating systems.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 p-4 pt-0">
        <div className="scrollbar-none block w-full overflow-x-auto rounded-md border">
          <Table className="min-w-[860px]">
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
                  <TableCell className="font-mono">{subscription.cadence}</TableCell>
                  <TableCell className="text-right font-medium font-mono tabular-nums">${subscription.cost}</TableCell>
                  <TableCell>{subscription.purpose}</TableCell>
                  <TableCell className="font-mono">Admin: {subscription.admin}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="rounded-md border bg-muted/35 p-4 font-medium font-mono">
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
      <CardHeader className="p-4 pb-2">
        <CardTitle>User Access / RBAC Controls</CardTitle>
        <CardDescription>
          Role-based safety parameters across corporate units and external field access.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="scrollbar-none block w-full overflow-x-auto rounded-md border">
          <Table className="min-w-[860px]">
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card size="sm" className={dashCardClass}>
        <CardHeader className={dashCardHeaderClass}>
          <CardDescription className="flex items-center gap-2 text-xs">
            <DollarSign className="size-4" />
            Monthly SaaS Burn Rate
          </CardDescription>
          <CardTitle className="font-mono text-2xl tabular-nums">${monthlySpend.toFixed(0)}</CardTitle>
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
          <CardTitle className="font-mono text-2xl tabular-nums">4</CardTitle>
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
          <CardTitle className={cn("font-mono text-2xl tabular-nums", urgentAlerts > 0 && "text-amber-600")}>
            {urgentAlerts}
          </CardTitle>
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
              <div className="grid gap-1 rounded-md border border-zinc-900 px-3 py-2 md:grid-cols-[11rem_1fr] md:items-center">
                <span className="font-medium">Published Workbook</span>
                <div className="grid gap-1">
                  <code className="w-fit select-all rounded border border-zinc-800/80 bg-zinc-900/80 px-2 py-1 font-mono text-[11px] text-cyan-300/90">
                    YSP_Operations HTML export → server parser
                  </code>
                  <p className="text-muted-foreground text-xs">
                    Public workbook tables are parsed server-side for read-only dashboard snapshots when private API
                    credentials are unavailable.
                  </p>
                </div>
              </div>
              <div className="grid gap-1 rounded-md border border-zinc-900 px-3 py-2 md:grid-cols-[11rem_1fr] md:items-center">
                <span className="font-medium">Apps Script Webhook</span>
                <div className="grid gap-1">
                  <code className="w-fit select-all rounded border border-zinc-800/80 bg-zinc-900/80 px-2 py-1 font-mono text-[11px] text-cyan-300/90">
                    doPost(JSON) → normalize event → append row
                  </code>
                  <p className="text-muted-foreground text-xs">
                    Zapier, DocuSign, WooCommerce, and OpenSolar-style events can be normalized into workbook rows for
                    audit-safe operational history.
                  </p>
                </div>
              </div>
              <div className="grid gap-1 rounded-md border border-zinc-900 px-3 py-2 md:grid-cols-[11rem_1fr] md:items-center">
                <span className="font-medium">Sheets API Fallback</span>
                <div className="grid gap-1">
                  <code className="w-fit select-all rounded border border-zinc-800/80 bg-zinc-900/80 px-2 py-1 font-mono text-[11px] text-cyan-300/90">
                    service account → slug map → sheet tab range
                  </code>
                  <p className="text-muted-foreground text-xs">
                    Private reads use route slugs mapped to exact tab names, giving the app a stable fallback when the
                    published workbook endpoint changes.
                  </p>
                </div>
              </div>
            </div>
            <pre className="overflow-x-auto rounded-md border border-zinc-800/80 bg-zinc-900/80 p-3 font-mono text-[11px] text-cyan-300/90 leading-relaxed">
              {`Data path: dashboard route → fetchPublishedSectionTable() → Apps Script payload fallback → fetchSheet(slug) → typed UI rows`}
            </pre>
          </CardContent>
        </Card>
      ) : null}

      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Globe2 className="size-4 text-muted-foreground" />
          <h2 className="font-semibold text-base">Domain Monitors</h2>
        </div>
        <DomainMonitors domainMonitors={domainMonitors} />
      </section>

      <SubscriptionLedger subscriptions={subscriptions} />

      <AccessControls accessRows={accessRows} />
    </div>
  );
}
