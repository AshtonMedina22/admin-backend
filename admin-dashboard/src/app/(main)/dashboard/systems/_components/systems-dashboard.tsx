"use client";

import { AlertTriangle, DollarSign, Globe2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { totalMonthlySpend, urgentAlertsCount } from "@/data/demo/systems";
import {
  dashAlertBannerClass,
  dashCardContentClass,
  dashCardHeaderClass,
  dashPageClass,
  dashPageHeaderClass,
  dashPlatformCardClass,
  dashSurfaceCardClass,
} from "@/lib/dashboard-ui";
import {
  dashCodeBlockSmClass,
  dashKpiValueClass,
  dashProseClass,
  dashSectionTitleClass,
  entityBrandStyles,
} from "@/lib/entity-brand";
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
  "DNS / cPanel / DreamHost check: audit authoritative DNS zones (apex A records, CNAME subdomains, and TXT/SPF authentication vectors).",
  "Redirect validation: validate TLS enforcement layers, HSTS headers, and 301 canonical redirect paths.",
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
    renewal: "Sep 13, 2026",
    admin: "Builder Ops",
    critical: false,
  },
  {
    domain: "yellowstarpower.com",
    detail: "Vercel | Next.js utility asset and grid operations platform",
    ssl: "OPERATIONAL",
    renewal: "Sep 11, 2026",
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
    <Card className={cn("h-full", dashSurfaceCardClass)}>
      <CardHeader className={cn("border-border border-b", dashCardHeaderClass)}>
        <CardTitle>Google Cloud Service Account / OAuth Scope Map</CardTitle>
        <CardDescription>
          Production permission model for connecting the dashboard, Apps Script, and Google Workspace APIs without
          hard-coding secrets in the client bundle.
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("space-y-3", dashCardContentClass)}>
        <div className={cn(dashCodeBlockSmClass, "grid gap-2 text-[11px] leading-snug md:grid-cols-[8rem_1fr]")}>
          <span className="text-foreground">Auth path</span>
          <span>
            Service account for shared Sheets/Drive assets, delegated OAuth for user mailbox/calendar actions →
            least-privilege Google scopes → server-only credentials in Vercel environment variables → backend API routes
            and scheduled workers.
          </span>
          <span className="text-foreground">Env keys</span>
          <span className="truncate font-mono text-foreground">
            GOOGLE_CLIENT_EMAIL | GOOGLE_PRIVATE_KEY | GOOGLE_WORKSPACE_ACT_AS_USER | GOOGLE_SHEET_ID | OPS_CALENDAR_ID
          </span>
        </div>
        <div className="grid max-h-[280px] gap-2 overflow-y-auto pr-1 md:grid-cols-2">
          {oauthScopeMap.map((item) => (
            <div key={item.scope} className="rounded-lg border border-border bg-muted/40 p-2.5">
              <p className="font-semibold text-foreground text-xs">{item.label}</p>
              <code className="mt-1 block truncate font-mono text-[10px] text-muted-foreground">
                {item.scope}
              </code>
              <p className="mt-1.5 line-clamp-3 text-muted-foreground text-[11px] leading-snug">{item.use}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function WebsiteMaintenanceRunbook() {
  return (
    <Card className={cn("h-full", dashSurfaceCardClass)}>
      <CardHeader className={cn("border-border border-b", dashCardHeaderClass)}>
        <CardTitle>Website Maintenance Runbook</CardTitle>
        <CardDescription>
          Operational checklist for WordPress, DNS, SSL, cPanel/DreamHost, backups, redirects, and issue logging.
        </CardDescription>
      </CardHeader>
      <CardContent className={dashCardContentClass}>
        <ol className="grid gap-2 text-muted-foreground text-[11px] leading-snug md:grid-cols-5">
          {websiteMaintenanceSteps.map((step, index) => (
            <li key={step} className="rounded-lg border border-border bg-muted/40 p-2.5">
              <span className="mb-1.5 block font-mono text-muted-foreground text-[10px] tabular-nums">
                0{index + 1}
              </span>
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
    <Card className={dashSurfaceCardClass}>
      <CardHeader className={dashCardHeaderClass}>
        <CardTitle>Automation Platform Registry</CardTitle>
        <CardDescription>
          Integration map for Zapier, Make, and AI tools used to bridge SaaS events, Drive routing, and operations copy.
        </CardDescription>
      </CardHeader>
      <CardContent className={dashCardContentClass}>
        <div className="grid gap-3 md:grid-cols-3">
          {automationRegistryRows.map((row) => (
            <div key={row.platform} className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="font-semibold text-foreground text-sm">{row.platform}</p>
              <p className={cn("mt-2 font-mono text-[11px] leading-relaxed", dashProseClass)}>{row.flow}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DomainMonitors({ domainMonitors }: { domainMonitors: DomainMonitorRow[] }) {
  return (
    <Card className={cn("h-full", dashSurfaceCardClass)}>
      <CardHeader className={cn("border-border border-b", dashCardHeaderClass)}>
        <CardTitle>Domain Monitors</CardTitle>
        <CardDescription>Certificate, hosting, and storefront status checks across managed domains.</CardDescription>
      </CardHeader>
      <CardContent className={cn("grid max-h-[430px] gap-2 overflow-y-auto pr-1", dashCardContentClass)}>
        {domainMonitors.map((domain) => (
          <div
            key={domain.domain}
            className={cn(
              "rounded-lg border border-border bg-muted/40 p-3",
              domain.critical && "border-l-4 border-l-[var(--status-critical)]",
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-mono font-semibold text-sm">{domain.domain}</h3>
                <p className="mt-1 line-clamp-2 text-muted-foreground text-xs leading-snug">{domain.detail}</p>
              </div>
              <Badge variant={domain.critical ? "destructive" : "outline"} className="h-5 font-mono text-[10px]">
                {domain.ssl}
              </Badge>
            </div>
            <div className="mt-2 grid gap-2 border-border border-t pt-2 text-[11px] text-muted-foreground sm:grid-cols-2">
              <span className="truncate font-mono">Renewal: {domain.renewal}</span>
              <span className="truncate font-mono">Admin: {domain.admin}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SubscriptionLedger({ subscriptions }: { subscriptions: SubscriptionRow[] }) {
  const monthlyTotal = subscriptions.reduce((sum, item) => sum + item.cost, 0);
  const annualTotal = monthlyTotal * 12;

  return (
    <Card className={cn("h-full", dashSurfaceCardClass)}>
      <CardHeader className={cn("border-border border-b", dashCardHeaderClass)}>
        <CardTitle>SaaS Subscription Ledger</CardTitle>
        <CardDescription>Dense monthly software spend ledger across corporate operating systems.</CardDescription>
      </CardHeader>
      <CardContent className={cn("grid gap-3", dashCardContentClass)}>
        <div className="scrollbar-none block w-full overflow-x-auto rounded-md border border-border">
          <Table className="min-w-[620px] table-fixed text-[11px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[28%]">Tool</TableHead>
                <TableHead className="w-[14%]">Cadence</TableHead>
                <TableHead className="w-[14%] text-right">Cost</TableHead>
                <TableHead className="w-[44%]">Purpose</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((subscription) => (
                <TableRow key={subscription.tool} className="h-9">
                  <TableCell className="truncate py-2 font-medium">{subscription.tool}</TableCell>
                  <TableCell className="py-2 font-mono">{subscription.cadence}</TableCell>
                  <TableCell className="py-2 text-right font-medium font-mono tabular-nums">
                    ${subscription.cost}
                  </TableCell>
                  <TableCell className="truncate py-2">{subscription.purpose}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="rounded-md border border-border bg-slate-50 px-3 py-2 font-medium font-mono text-muted-foreground text-xs">
          Aggregated Global Tool Burn Rate: ${monthlyTotal.toFixed(2)} / month (${annualTotal.toLocaleString()}.00 /
          year).
        </div>
      </CardContent>
    </Card>
  );
}

function AccessControls({ accessRows }: { accessRows: AccessRow[] }) {
  return (
    <Card className={dashSurfaceCardClass}>
      <CardHeader className={cn("border-border border-b", dashCardHeaderClass)}>
        <CardTitle>User Access / RBAC Controls</CardTitle>
        <CardDescription>
          Role-based safety parameters across corporate units and external field access.
        </CardDescription>
      </CardHeader>
      <CardContent className={dashCardContentClass}>
        <div className="scrollbar-none block w-full overflow-x-auto rounded-md border border-border">
          <Table className="min-w-[920px] table-fixed text-[11px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Profile</TableHead>
                <TableHead className="w-[18%]">Corporate Role Assigned</TableHead>
                <TableHead className="w-[17%]">Scope</TableHead>
                <TableHead className="w-[35%]">Module Permissions Profile</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accessRows.map((row) => (
                <TableRow key={row.profile} className="h-10">
                  <TableCell className="truncate py-2 font-medium">{row.profile}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="h-5 font-mono text-[10px]">
                      {row.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="truncate py-2">{row.scope}</TableCell>
                  <TableCell className="truncate py-2 font-mono text-[10px] text-muted-foreground">
                    {row.permissions}
                  </TableCell>
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
          cache invalidation around <span className={cn("font-mono", entityBrandStyles.solar3k.icon)}>lib/google-sheets.ts</span> so workbook
          pulls stay fast without hammering Google endpoints.
        </>
      ),
    },
    {
      title: "Data Transformation & Type-Casting Layer",
      body: (
        <>
          Acts as our core operational parser inside{" "}
          <span className={cn("font-mono", entityBrandStyles.solar3k.icon)}>lib/google-sheets.ts</span>. The backend receives raw, unvalidated
          string arrays from the Google Sheets API spreadsheet rows, strips out whitespace trailing anomalies, checks
          row integrity values, and maps strings into strongly typed JSON data models for the{" "}
          <span className={entityBrandStyles.solar2sk.text}>2SK</span>, <span className={entityBrandStyles.solar3k.text}>3SK</span>,
          and <span className={entityBrandStyles.yellowStar.text}>YSP</span> views.
        </>
      ),
    },
    {
      title: "Network Fail-Safe & Try/Catch Isolation",
      body: (
        <>
          Enforces data safety guardrails across the platform. All server-side connection queries are isolated inside
          robust
          <span className={cn("font-mono", entityBrandStyles.solar3k.icon)}> try/catch </span>exception loops. If a workbook formula breaks or a
          network timeout happens, route-level handlers fall through to the next provider, raise a targeted validation
          warning, and keep the dashboard online instead of returning a generic 500 crash.
        </>
      ),
    },
  ];

  return (
    <section className="space-y-3 border-border border-t pt-4">
      <div>
        <h2 className="font-semibold text-base text-foreground">
          Google Workspace Production Data Architecture & System Guardrails
        </h2>
        <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
          Technical implementation strategies protecting cloud synchronization pathways.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {specs.map((spec) => (
          <div
            key={spec.title}
            className="space-y-1.5 rounded-lg border border-border bg-muted/40 p-3"
          >
            <h3 className={cn("text-xs", dashSectionTitleClass)}>{spec.title}</h3>
            <p className={cn("line-clamp-6 font-mono text-[11px] leading-snug", dashProseClass)}>{spec.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function InfrastructureStatusLog() {
  return (
    <Card className={cn("h-full", dashSurfaceCardClass, entityBrandStyles.systems.accentBar)}>
      <CardHeader className={cn("border-border border-b", dashCardHeaderClass)}>
        <CardTitle className="text-base">Infrastructure Status Log</CardTitle>
      </CardHeader>
      <CardContent className={dashCardContentClass}>
        <p className={cn(dashAlertBannerClass, "font-mono text-sm leading-snug")}>
          DreamHost Server Status: 1 Domain Flagged URGENT (solar2sk.com SSL handshake exception)
        </p>
      </CardContent>
    </Card>
  );
}

function SystemsKpiStrip({ monthlySpend, urgentAlerts }: { monthlySpend: number; urgentAlerts: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Card size="sm" className={dashSurfaceCardClass}>
        <CardHeader className={dashCardHeaderClass}>
          <CardDescription className="flex items-center gap-2 text-xs">
            <DollarSign className="size-4" />
            Monthly SaaS Burn Rate
          </CardDescription>
          <CardTitle className={dashKpiValueClass}>${monthlySpend.toFixed(0)}</CardTitle>
        </CardHeader>
        <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
          DreamHost, Vercel, Zapier, DocuSign, and QuickBooks - low-overhead automated stack
        </CardContent>
      </Card>
      <Card size="sm" className={dashSurfaceCardClass}>
        <CardHeader className={dashCardHeaderClass}>
          <CardDescription className="flex items-center gap-2 text-xs">
            <Globe2 className="size-4" />
            Domain Monitors
          </CardDescription>
          <CardTitle className={dashKpiValueClass}>4</CardTitle>
        </CardHeader>
        <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
          Multi-tenant WordPress and Next.js property health
        </CardContent>
      </Card>
      <Card size="sm" className={dashSurfaceCardClass}>
        <CardHeader className={dashCardHeaderClass}>
          <CardDescription className="flex items-center gap-2 text-xs">
            <AlertTriangle className="size-4" />
            Urgent Infrastructure Alerts
          </CardDescription>
          <CardTitle className={dashKpiValueClass}>{urgentAlerts}</CardTitle>
        </CardHeader>
        <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
          SSL renewals, DreamHost certificate issues, domain monitoring
        </CardContent>
      </Card>
    </div>
  );
}

function PlatformEnvironmentSyncProfiles() {
  const profiles = [
    {
      label: "Published Workbook",
      code: "YSP_Operations HTML export -> server parser",
      description:
        "Public workbook tables are parsed server-side for read-only dashboard snapshots when private API credentials are unavailable.",
    },
    {
      label: "Apps Script Webhook",
      code: "doPost(JSON) -> normalize event -> append row",
      description:
        "Zapier, DocuSign, WooCommerce, and OpenSolar-style events normalize into workbook rows for audit-safe operational history.",
    },
    {
      label: "Sheets API Fallback",
      code: "service account -> slug map -> sheet tab range",
      description:
        "Private reads use route slugs mapped to exact tab names when the published workbook endpoint changes.",
    },
  ];

  return (
    <Card className={cn("h-full", dashPlatformCardClass)}>
      <CardHeader className={cn("border-border border-b", dashCardHeaderClass)}>
        <CardTitle className="text-base">Platform Environment Sync Profiles</CardTitle>
        <CardDescription>
          Non-interactive ingestion path mapping for published workbook, Apps Script webhook, and Sheets API fallbacks.
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("grid gap-2.5", dashCardContentClass)}>
        {profiles.map((profile, index) => (
          <div key={profile.label} className="rounded-lg border border-border bg-muted/40 p-3">
            <span className="font-mono font-semibold text-[10px] text-muted-foreground uppercase">
              0{index + 1}. {profile.label}
            </span>
            <code className={cn("mt-1 block truncate rounded border px-2 py-1 font-mono text-[10px]", dashCodeBlockSmClass)}>
              {profile.code}
            </code>
            <p className="mt-1.5 line-clamp-2 text-muted-foreground text-[11px] leading-snug">
              {profile.description}
            </p>
          </div>
        ))}
        <pre className={cn(dashCodeBlockSmClass, "text-[10px]")}>
          {`Data path: route -> published tables -> Apps Script payload -> fetchSheet(slug) -> typed UI rows`}
        </pre>
      </CardContent>
    </Card>
  );
}

function StatusAndRunbookRow() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <InfrastructureStatusLog />
      </div>
      <div className="lg:col-span-8">
        <WebsiteMaintenanceRunbook />
      </div>
    </div>
  );
}

function ConfigSyncRow() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <GoogleCloudServiceAccountScopeMap />
      </div>
      <div className="lg:col-span-5">
        <PlatformEnvironmentSyncProfiles />
      </div>
    </div>
  );
}

function SystemsDataRow({
  domainMonitors,
  subscriptions,
}: {
  domainMonitors: DomainMonitorRow[];
  subscriptions: SubscriptionRow[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <DomainMonitors domainMonitors={domainMonitors} />
      <SubscriptionLedger subscriptions={subscriptions} />
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

      <SystemsKpiStrip monthlySpend={monthlySpend} urgentAlerts={urgentAlerts} />

      <StatusAndRunbookRow />

      {showPlatformConfig ? <ConfigSyncRow /> : null}

      <GoogleWorkspaceArchitectureSpec />

      <SystemsDataRow domainMonitors={domainMonitors} subscriptions={subscriptions} />

      <AutomationPlatformRegistry />

      <AccessControls accessRows={accessRows} />
    </div>
  );
}
