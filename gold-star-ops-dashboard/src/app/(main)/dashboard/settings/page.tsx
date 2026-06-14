import { fetchWorkbookScriptPayloadOrNull } from "@/lib/apps-script-workbook";
import { fetchSheet } from "@/lib/google-sheets";
import { fetchPublishedFirstTable, fetchPublishedSectionTable } from "@/lib/published-workbook";

import {
  type AccessRow,
  type DomainMonitorRow,
  defaultAccessRows,
  defaultDomainMonitors,
  defaultSubscriptions,
  type SubscriptionRow,
  SystemsDashboard,
} from "../systems/_components/systems-dashboard";

function formatSheetDate(value: string) {
  if (!value.includes("T")) return value;

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(value));
}

async function fetchAccessRows(): Promise<AccessRow[]> {
  try {
    const rows = await fetchPublishedFirstTable("Access Control");
    const accessRows = rows
      .filter((record) => record.profile)
      .map((record) => ({
        profile: record.profile,
        role: record.corporate_role_assigned,
        scope: record.scope,
        permissions: record.module_permissions_profile,
      }));

    if (accessRows.length) return accessRows;
  } catch {
    // Fall back to private Sheets API or local preview data below.
  }

  try {
    const sheet = await fetchSheet("access-control");
    const rows = sheet.records
      .filter((record) => record.profile)
      .map((record) => ({
        profile: record.profile,
        role: record.corporate_role_assigned || record.role || "",
        scope: record.scope || "",
        permissions: record.module_permissions_profile || record.permissions || "",
      }))
      .filter((record) => record.profile);

    return rows.length ? rows : defaultAccessRows;
  } catch {
    return defaultAccessRows;
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
        ssl: record.ssl.toUpperCase(),
        renewal: record.renewal,
        admin: record.admin,
        critical: record.status.toLowerCase().includes("critical"),
      }));

    if (domains.length) return domains;
  } catch {
    // Fall back to Apps Script or local preview data below.
  }

  const scriptPayload = await fetchWorkbookScriptPayloadOrNull();
  return scriptPayload?.domainMonitors?.length
    ? scriptPayload.domainMonitors.map((domain) => ({
        domain: domain.domain,
        detail: domain.detail,
        ssl: domain.ssl_status,
        renewal: formatSheetDate(domain.renewal_date),
        admin: domain.admin_handle,
        critical: domain.is_critical,
      }))
    : defaultDomainMonitors;
}

async function fetchSubscriptions(): Promise<SubscriptionRow[]> {
  try {
    const rows = await fetchPublishedSectionTable("Website & Systems", "SaaS Subscription Ledger");
    const subscriptions = rows
      .filter((record) => record.tool)
      .map((record) => ({
        tool: record.tool,
        cadence: record.cadence,
        cost: Number(record.cost.replace(/[$,]/g, "")) || 0,
        purpose: record.purpose,
        admin: record.admin,
      }));

    if (subscriptions.length) return subscriptions;
  } catch {
    // Fall back to Apps Script or local preview data below.
  }

  const scriptPayload = await fetchWorkbookScriptPayloadOrNull();
  return scriptPayload?.saasSubscriptions?.length
    ? scriptPayload.saasSubscriptions.map((subscription) => ({
        tool: subscription.tool,
        cadence: subscription.cadence,
        cost: subscription.cost,
        purpose: subscription.purpose,
        admin: subscription.admin,
      }))
    : defaultSubscriptions;
}

export default async function Page() {
  const [accessRows, domainMonitors, subscriptions] = await Promise.all([
    fetchAccessRows(),
    fetchDomainMonitors(),
    fetchSubscriptions(),
  ]);

  return <SystemsDashboard accessRows={accessRows} domainMonitors={domainMonitors} subscriptions={subscriptions} />;
}

export const dynamic = "force-dynamic";

export const revalidate = 0;
