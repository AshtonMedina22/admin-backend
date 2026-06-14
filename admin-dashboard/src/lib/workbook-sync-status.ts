import { demoCommandCenterData } from "@/data/demo/command-center";
import { fetchWorkbookScriptPayloadOrNull, mapScriptPayloadToCommandCenter } from "@/lib/apps-script-workbook";
import { fetchDashboardSummary } from "@/lib/google-sheets";
import { hasAppsScriptUrl, hasPublishedSheetId, hasSheetsApiCredentials } from "@/lib/workbook-env";
import { fetchPublishedCommandCenter } from "@/lib/published-workbook";
import { mapWorkbookToCommandCenter } from "@/lib/sheet-mappers";
import type { WorkbookSyncStatus } from "@/lib/workbook-sync-types";

export type { WorkbookSyncProvider, WorkbookSyncStatus } from "@/lib/workbook-sync-types";
export { workbookProviderLabel } from "@/lib/workbook-sync-types";

export async function fetchWorkbookCommandCenter() {
  if (hasAppsScriptUrl()) {
    try {
      const scriptPayload = await fetchWorkbookScriptPayloadOrNull();
      if (!scriptPayload) throw new Error("Apps Script workbook payload unavailable");
      const data = mapScriptPayloadToCommandCenter(scriptPayload);
      return {
        data: { ...data, source: "workbook" as const },
        status: {
          source: "workbook" as const,
          provider: "apps-script" as const,
          updatedAt: data.updatedAt,
        },
      };
    } catch {
      // Fall through to Sheets API / published CSV.
    }
  }

  if (hasSheetsApiCredentials() && hasPublishedSheetId()) {
    try {
      const summary = await fetchDashboardSummary();
      const data = mapWorkbookToCommandCenter(summary);
      return {
        data: { ...data, source: "workbook" as const },
        status: {
          source: "workbook" as const,
          provider: "sheets-api" as const,
          updatedAt: data.updatedAt,
        },
      };
    } catch {
      // Fall through to published CSV.
    }
  }

  if (hasPublishedSheetId()) {
    try {
      const data = await fetchPublishedCommandCenter();
      return {
        data: { ...data, source: "workbook" as const },
        status: {
          source: "workbook" as const,
          provider: "published" as const,
          updatedAt: data.updatedAt,
        },
      };
    } catch {
      // Fall through to local preview data.
    }
  }

  return {
    data: { ...demoCommandCenterData, source: "demo" as const },
    status: {
      source: "demo" as const,
      updatedAt: demoCommandCenterData.updatedAt,
    } satisfies WorkbookSyncStatus,
  };
}

export async function getWorkbookSyncStatus(): Promise<WorkbookSyncStatus> {
  const { status } = await fetchWorkbookCommandCenter();
  return status;
}

export async function fetchCommandCenterDataWithSource() {
  return fetchWorkbookCommandCenter();
}
