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

const oauthScopeMap = [
  {
    label: "Sheets read/write",
    scope: "https://www.googleapis.com/auth/spreadsheets",
    use: "Read operational tabs and write normalized status / sync IDs back to the workbook.",
  },
  {
    label: "Drive file create",
    scope: "https://www.googleapis.com/auth/drive.file",
    use: "Create PDFs or attach generated documents only in files the app creates or is granted access to.",
  },
  {
    label: "Gmail draft / send",
    scope: "https://www.googleapis.com/auth/gmail.compose",
    use: "Create human-reviewed Gmail drafts for permit, vendor, and executive scheduling follow-ups; requires user OAuth or Workspace domain-wide delegation, not an undelegated service account.",
  },
  {
    label: "Calendar events",
    scope: "https://www.googleapis.com/auth/calendar.events",
    use: "Insert and update project meetings, AHJ appointments, reminders, and vendor events.",
  },
];

const websiteMaintenanceSteps = [
  "SSL check: verify certificate validity and renewal date for apex and subdomains.",
  "DNS / cPanel / DreamHost check: confirm A, CNAME, and hosting panel routing records.",
  "Redirect validation: test HTTP→HTTPS and legacy URL forwarding paths.",
  "Backup verification: confirm recent WordPress/database snapshot or host backup exists.",
  "Issue log append: write failed checks to the Systems ledger with owner and next action.",
];

const automationRegistryRows = [
  {
    platform: "Zapier",
    flow: "WooCommerce Order Created → Webhook POST → Apps Script doPost() → 2SK fulfillment row.",
  },
  {
    platform: "Make",
    flow: "Drive folder watch → route generated PDF → entity/project folder → append document ledger row.",
  },
  {
    platform: "ChatGPT / Claude / Gemini",
    flow: "Draft generation, SOP summarization, AHJ/vendor response polishing, and meeting-note cleanup.",
  },
];

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

function GoogleCloudServiceAccountScopeMap() {
  return (
    <Card className={cn("border-cyan-500/60 border-l-4", dashCardClass)}>
      <CardHeader className={dashCardHeaderClass}>
        <CardTitle>Google Cloud Service Account / OAuth Scope Map</CardTitle>
        <CardDescription>
          Production permission model for connecting the dashboard, Apps Script, and Google Workspace APIs without
          hard-coding secrets in the client bundle.
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("space-y-4", dashCardContentClass)}>
        <div className="grid gap-2 rounded-lg border border-[#1B1B3A]/10 bg-[#1B1B3A] p-3 font-mono text-[#F7F7FF]/75 text-xs leading-relaxed md:grid-cols-[10rem_1fr]">
          <span className="text-zinc-200">Auth path</span>
          <span>
            Service account for shared Sheets/Drive assets, delegated OAuth for user mailbox/calendar actions →
            least-privilege Google scopes → server-only credentials in Vercel environment variables → backend API routes
            and scheduled workers.
          </span>
          <span className="text-zinc-200">Env keys</span>
          <span className="text-cyan-300">
            GOOGLE_CLIENT_EMAIL · GOOGLE_PRIVATE_KEY · GOOGLE_SHEET_ID · OPS_CALENDAR_ID
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {oauthScopeMap.map((item) => (
            <div key={item.scope} className="rounded-lg border border-[#1B1B3A]/10 bg-[#1B1B3A]/60 p-3">
              <p className="font-semibold text-sm text-zinc-200">{item.label}</p>
              <code className="mt-1 block break-all font-mono text-[11px] text-cyan-300">{item.scope}</code>
              <p className="mt-2 text-muted-foreground text-xs leading-relaxed">{item.use}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function WebsiteMaintenanceRunbook() {
  return (
    <Card className={cn("border-amber-500/60 border-l-4", dashCardClass)}>
      <CardHeader className={dashCardHeaderClass}>
        <CardTitle>Website Maintenance Runbook</CardTitle>
        <CardDescription>
          Operational checklist for WordPress, DNS, SSL, cPanel/DreamHost, backups, redirects, and issue logging.
        </CardDescription>
      </CardHeader>
      <CardContent className={dashCardContentClass}>
        <ol className="grid gap-2 text-muted-foreground text-xs leading-relaxed md:grid-cols-5">
          {websiteMaintenanceSteps.map((step, index) => (
            <li key={step} className="rounded-lg border border-[#1B1B3A]/10 bg-[#F7F7FF] p-3">
              <span className="mb-2 block font-mono text-amber-300 tabular-nums">0{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

function AutomationPlatformRegistry() {
  return (
    <Card className={cn("border-fuchsia-500/50 border-l-4", dashCardClass)}>
      <CardHeader className={dashCardHeaderClass}>
        <CardTitle>Automation Platform Registry</CardTitle>
        <CardDescription>
          Integration map for Zapier, Make, and AI tools used to bridge SaaS events, Drive routing, and operations copy.
        </CardDescription>
      </CardHeader>
      <CardContent className={dashCardContentClass}>
        <div className="grid gap-3 md:grid-cols-3">
          {automationRegistryRows.map((row) => (
            <div key={row.platform} className="rounded-lg border border-[#1B1B3A]/10 bg-[#F7F7FF] p-3">
              <p className="font-semibold text-sm text-zinc-100">{row.platform}</p>
              <p className="mt-2 font-mono text-[#1B1B3A]/60 text-[11px] leading-relaxed">{row.flow}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DomainMonitors({ domainMonitors }: { domainMonitors: DomainMonitorRow[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {domainMonitors.map((domain) => (
        <Card
          key={domain.domain}
          className={cn(
            dashCardClass,
            domain.critical ? "border-amber-500/70 shadow-[0_0_0_1px_rgba(245,158,11,0.25)]" : undefined,
          )}
        >
          <CardHeader className={dashCardHeaderClass}>
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
          <CardContent className={cn("grid gap-2 text-sm", dashCardContentClass)}>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[#1B1B3A]/10 bg-[#FFFFFF]/80 px-3 py-2">
              <span className="text-[#1B1B3A]/60">SSL Handshake Status</span>
              <Badge variant={domain.critical ? "destructive" : "outline"} className="font-mono">
                {domain.ssl}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[#1B1B3A]/10 bg-[#FFFFFF]/80 px-3 py-2">
              <span className="text-[#1B1B3A]/60">Expiration / Renewal</span>
              <span className="font-medium font-mono">{domain.renewal}</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[#1B1B3A]/10 bg-[#FFFFFF]/80 px-3 py-2">
              <span className="text-[#1B1B3A]/60">Assigned Administrator Handle</span>
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
    <Card className={dashCardClass}>
      <CardHeader className={dashCardHeaderClass}>
        <CardTitle>SaaS Subscription Ledger</CardTitle>
        <CardDescription>Dense monthly software spend ledger across corporate operating systems.</CardDescription>
      </CardHeader>
      <CardContent className={cn("grid gap-4", dashCardContentClass)}>
        <div className="scrollbar-none block w-full overflow-x-auto rounded-md border border-[#1B1B3A]/10">
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
        <div className="rounded-md border border-[#1B1B3A]/10 bg-[#FFFFFF]/80 p-4 font-medium font-mono text-[#1B1B3A]/70">
          Aggregated Global Tool Burn Rate: ${monthlyTotal.toFixed(2)} / month (${annualTotal.toLocaleString()}.00 /
          year).
        </div>
      </CardContent>
    </Card>
  );
}

function AccessControls({ accessRows }: { accessRows: AccessRow[] }) {
  return (
    <Card className={dashCardClass}>
      <CardHeader className={dashCardHeaderClass}>
        <CardTitle>User Access / RBAC Controls</CardTitle>
        <CardDescription>
          Role-based safety parameters across corporate units and external field access.
        </CardDescription>
      </CardHeader>
      <CardContent className={dashCardContentClass}>
        <div className="scrollbar-none block w-full overflow-x-auto rounded-md border border-[#1B1B3A]/10">
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

function GoogleWorkspaceArchitectureSpec() {
  const specs = [
    {
      title: "Workbook Fetch Strategy & Quota Guardrails",
      body: (
        <>
          Production wiring protects Google quotas by checking Apps Script webhook payloads first, then authenticated
          Sheets API reads, then published CSV fallback. A deployed version would add timed revalidation or tag-based
          cache invalidation around <span className="font-mono text-cyan-400">lib/google-sheets.ts</span> so workbook
          pulls stay fast without hammering Google endpoints.
        </>
      ),
    },
    {
      title: "Data Transformation & Type-Casting Layer",
      body: (
        <>
          Acts as our core operational parser inside{" "}
          <span className="font-mono text-cyan-400">lib/google-sheets.ts</span>. The backend receives raw, unvalidated
          string arrays from the Google Sheets API spreadsheet rows, strips out whitespace trailing anomalies, checks
          row integrity values, and maps strings into strongly typed JSON data models for the{" "}
          <span className="font-mono text-lime-400">2SK</span>, <span className="font-mono text-cyan-400">3SK</span>,
          and <span className="font-mono text-amber-400">YSP</span> views.
        </>
      ),
    },
    {
      title: "Network Fail-Safe & Try/Catch Isolation",
      body: (
        <>
          Enforces data safety guardrails across the platform. All server-side connection queries are isolated inside
          robust
          <span className="font-mono text-cyan-400"> try/catch </span>exception loops. If a workbook formula breaks or a
          network timeout happens, route-level handlers fall through to the next provider, raise a targeted validation
          warning, and keep the dashboard online instead of returning a generic 500 crash.
        </>
      ),
    },
  ];

  return (
    <section className="mt-6 space-y-4 border-[#1B1B3A]/10 border-t pt-6">
      <div>
        <h2 className="font-semibold text-base text-zinc-200">
          Google Workspace Production Data Architecture & System Guardrails
        </h2>
        <p className="mt-0.5 font-mono text-[11px] text-zinc-500">
          Technical implementation strategies protecting cloud synchronization pathways.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {specs.map((spec) => (
          <div
            key={spec.title}
            className="space-y-2 rounded-xl border border-[#1B1B3A]/10 bg-zinc-900/40 p-5 backdrop-blur-md"
          >
            <h3 className="font-bold font-mono text-cyan-400 text-xs">{spec.title}</h3>
            <p className="font-mono text-[#1B1B3A]/60 text-xs leading-relaxed">{spec.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function InfrastructureStatusLog() {
  return (
    <Card className={cn("border-amber-500/60 border-l-4", dashCardClass)}>
      <CardHeader className={dashCardHeaderClass}>
        <CardTitle className="text-base">Infrastructure Status Log</CardTitle>
      </CardHeader>
      <CardContent className={dashCardContentClass}>
        <p className="font-mono text-amber-200 text-sm leading-relaxed">
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

      <WebsiteMaintenanceRunbook />

      <SystemsKpiStrip monthlySpend={monthlySpend} urgentAlerts={urgentAlerts} />

      {showPlatformConfig ? (
        <Card className={dashCardClass}>
          <CardHeader className={dashCardHeaderClass}>
            <CardTitle className="text-base">Platform Environment Sync Profiles</CardTitle>
            <CardDescription>
              Non-interactive ingestion path mapping for published workbook, Apps Script webhook, and Sheets API
              fallbacks.
            </CardDescription>
          </CardHeader>
          <CardContent className={cn("space-y-3", dashCardContentClass)}>
            <div className="grid gap-2 text-sm">
              <div className="grid gap-1 rounded-md border border-[#1B1B3A]/10 px-3 py-2 md:grid-cols-[11rem_1fr] md:items-center">
                <span className="font-medium">Published Workbook</span>
                <div className="grid gap-1">
                  <code className="w-fit select-all rounded border border-[#1B1B3A]/10/80 bg-[#1B1B3A]/95 px-2 py-1 font-mono text-[11px] text-cyan-300/90">
                    YSP_Operations HTML export → server parser
                  </code>
                  <p className="text-muted-foreground text-xs">
                    Public workbook tables are parsed server-side for read-only dashboard snapshots when private API
                    credentials are unavailable.
                  </p>
                </div>
              </div>
              <div className="grid gap-1 rounded-md border border-[#1B1B3A]/10 px-3 py-2 md:grid-cols-[11rem_1fr] md:items-center">
                <span className="font-medium">Apps Script Webhook</span>
                <div className="grid gap-1">
                  <code className="w-fit select-all rounded border border-[#1B1B3A]/10/80 bg-[#1B1B3A]/95 px-2 py-1 font-mono text-[11px] text-cyan-300/90">
                    doPost(JSON) → normalize event → append row
                  </code>
                  <p className="text-muted-foreground text-xs">
                    Zapier, DocuSign, WooCommerce, and OpenSolar-style events can be normalized into workbook rows for
                    audit-safe operational history.
                  </p>
                </div>
              </div>
              <div className="grid gap-1 rounded-md border border-[#1B1B3A]/10 px-3 py-2 md:grid-cols-[11rem_1fr] md:items-center">
                <span className="font-medium">Sheets API Fallback</span>
                <div className="grid gap-1">
                  <code className="w-fit select-all rounded border border-[#1B1B3A]/10/80 bg-[#1B1B3A]/95 px-2 py-1 font-mono text-[11px] text-cyan-300/90">
                    service account → slug map → sheet tab range
                  </code>
                  <p className="text-muted-foreground text-xs">
                    Private reads use route slugs mapped to exact tab names, giving the app a stable fallback when the
                    published workbook endpoint changes.
                  </p>
                </div>
              </div>
            </div>
            <pre className="overflow-x-auto rounded-md border border-[#1B1B3A]/10/80 bg-[#1B1B3A]/95 p-3 font-mono text-[11px] text-cyan-300/90 leading-relaxed">
              {`Data path: dashboard route → fetchPublishedSectionTable() → Apps Script payload fallback → fetchSheet(slug) → typed UI rows`}
            </pre>
          </CardContent>
        </Card>
      ) : null}

      {showPlatformConfig ? <GoogleCloudServiceAccountScopeMap /> : null}

      <GoogleWorkspaceArchitectureSpec />

      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Globe2 className="size-4 text-muted-foreground" />
          <h2 className="font-semibold text-base">Domain Monitors</h2>
        </div>
        <DomainMonitors domainMonitors={domainMonitors} />
      </section>

      <SubscriptionLedger subscriptions={subscriptions} />

      <AutomationPlatformRegistry />

      <AccessControls accessRows={accessRows} />
    </div>
  );
}
