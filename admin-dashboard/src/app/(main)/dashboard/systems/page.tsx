import { softwareSubscriptionData, websiteHealthData } from "@/data/demo/systems";
import { fetchWorkbookScriptPayloadOrNull } from "@/lib/apps-script-workbook";
import { fetchSheet } from "@/lib/google-sheets";
import { fetchPublishedFirstTable, fetchPublishedSectionTable } from "@/lib/published-workbook";

import {
  type AccessRow,
  type DomainMonitorRow,
  type SubscriptionRow,
  SystemsDashboard,
} from "./_components/systems-dashboard";

function formatSheetDate(value: string) {
  if (!value.includes("T")) return value;

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(value));
}

const SYSTEMS_ADMIN_HANDLE = "Builder Ops";

const DEFAULT_ACCESS_ROWS: AccessRow[] = [
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

const DEMO_ACCESS_PROFILES = DEFAULT_ACCESS_ROWS.map((row) => row.profile);

function normalizeAccessRow(row: AccessRow, index: number): AccessRow {
  return {
    ...row,
    profile: DEMO_ACCESS_PROFILES[index] || `Demo Access Profile ${index + 1}`,
  };
}

function formatOverdueExpirationDate() {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() - 4);

  return `${new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(expirationDate)} (Action Overdue)`;
}

function normalizeDomainMonitor(row: DomainMonitorRow): DomainMonitorRow {
  return {
    ...row,
    renewal: row.domain === "solar2sk.com" ? formatOverdueExpirationDate() : row.renewal,
    admin: SYSTEMS_ADMIN_HANDLE,
  };
}

function mapWebsiteHealthToDomainRows(): DomainMonitorRow[] {
  return websiteHealthData.map((site) =>
    normalizeDomainMonitor({
      domain: site.siteDomain,
      detail: `${site.hosting} | ${site.platform}`,
      ssl: site.sslStatus,
      renewal: site.lastChecked,
      admin: SYSTEMS_ADMIN_HANDLE,
      critical: site.status === "URGENT" || !site.sslValid,
    }),
  );
}

function mapSoftwareToSubscriptionRows(): SubscriptionRow[] {
  return softwareSubscriptionData.map((subscription) => ({
    tool: subscription.toolName,
    cadence: "Monthly",
    cost: subscription.monthlyCost,
    purpose: subscription.serves,
    admin: SYSTEMS_ADMIN_HANDLE,
  }));
}

async function fetchAccessRows(): Promise<AccessRow[]> {
  try {
    const rows = await fetchPublishedFirstTable("Access Control");
    const accessRows = rows
      .filter((record) => record.profile)
      .map((record, index) =>
        normalizeAccessRow(
          {
            profile: record.profile,
            role: record.corporate_role_assigned,
            scope: record.scope,
            permissions: record.module_permissions_profile,
          },
          index,
        ),
      );

    if (accessRows.length) return accessRows;
  } catch {
    // Fall back to private Sheets API or local preview data below.
  }

  try {
    const sheet = await fetchSheet("access-control");
    const rows = sheet.records
      .filter((record) => record.profile)
      .map((record, index) =>
        normalizeAccessRow(
          {
            profile: record.profile,
            role: record.corporate_role_assigned || record.role || "",
            scope: record.scope || "",
            permissions: record.module_permissions_profile || record.permissions || "",
          },
          index,
        ),
      )
      .filter((record) => record.profile);

    return rows.length ? rows : DEFAULT_ACCESS_ROWS;
  } catch {
    return DEFAULT_ACCESS_ROWS;
  }
}

async function fetchDomainMonitors(): Promise<DomainMonitorRow[]> {
  try {
    const rows = await fetchPublishedSectionTable("Website & Systems", "Domain Monitors");
    const domains = rows
      .filter((record) => record.site_domain)
      .map((record) => ({
        domain: record.site_domain,
        detail: `${record.hosting} | Base Platform: ${record.platform}`,
        ssl: (record.ssl || "UNKNOWN").toUpperCase(),
        renewal: record.renewal || "Pending verification",
        admin: SYSTEMS_ADMIN_HANDLE,
        critical: (record.status || "").toLowerCase().includes("critical"),
      }))
      .map(normalizeDomainMonitor);

    if (domains.length) return domains;
  } catch {
    // Fall back to Apps Script or local preview data below.
  }

  const scriptPayload = await fetchWorkbookScriptPayloadOrNull();
  if (scriptPayload?.domainMonitors?.length) {
    return scriptPayload.domainMonitors
      .map((domain) => ({
        domain: domain.domain,
        detail: domain.detail,
        ssl: domain.ssl_status,
        renewal: formatSheetDate(domain.renewal_date),
        admin: domain.admin_handle || SYSTEMS_ADMIN_HANDLE,
        critical: domain.is_critical,
      }))
      .map(normalizeDomainMonitor);
  }

  return mapWebsiteHealthToDomainRows();
}

async function fetchSubscriptions(): Promise<SubscriptionRow[]> {
  try {
    const rows = await fetchPublishedSectionTable("Website & Systems", "SaaS Subscription Ledger");
    const subscriptions = rows
      .filter((record) => record.tool)
      .map((record) => ({
        tool: record.tool,
        cadence: record.cadence,
        cost: Number(String(record.cost || 0).replace(/[$,]/g, "")) || 0,
        purpose: record.purpose || "Pending allocation",
        admin: SYSTEMS_ADMIN_HANDLE,
      }));

    if (subscriptions.length) return subscriptions;
  } catch {
    // Fall back to Apps Script or local preview data below.
  }

  const scriptPayload = await fetchWorkbookScriptPayloadOrNull();
  if (scriptPayload?.saasSubscriptions?.length) {
    return scriptPayload.saasSubscriptions.map((subscription) => ({
      tool: subscription.tool,
      cadence: subscription.cadence,
      cost: subscription.cost,
      purpose: subscription.purpose,
      admin: SYSTEMS_ADMIN_HANDLE,
    }));
  }

  return mapSoftwareToSubscriptionRows();
}

export default async function Page() {
  const [accessRows, domainMonitors, subscriptions] = await Promise.all([
    fetchAccessRows(),
    fetchDomainMonitors(),
    fetchSubscriptions(),
  ]);

  return (
    <SystemsDashboard
      accessRows={accessRows}
      domainMonitors={domainMonitors}
      subscriptions={subscriptions}
      showPlatformConfig
    />
  );
}

export const dynamic = "force-dynamic";

export const revalidate = 0;
