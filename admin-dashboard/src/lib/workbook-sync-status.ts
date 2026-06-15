import { type CommandCenterData, demoCommandCenterData } from "@/data/demo/command-center";
import { fetchWorkbookScriptPayloadOrNull, mapScriptPayloadToCommandCenter } from "@/lib/apps-script-workbook";
import { fetchDashboardSummary } from "@/lib/google-sheets";
import { hasAppsScriptUrl, hasPublishedSheetId, hasSheetsApiCredentials } from "@/lib/workbook-env";
import { fetchPublishedCommandCenter } from "@/lib/published-workbook";
import { mapWorkbookToCommandCenter } from "@/lib/sheet-mappers";
import type { WorkbookSyncStatus } from "@/lib/workbook-sync-types";

export type { WorkbookSyncProvider, WorkbookSyncStatus } from "@/lib/workbook-sync-types";
export { workbookProviderLabel } from "@/lib/workbook-sync-types";

const WORKBOOK_CACHE_TTL_MS = 60_000;

type WorkbookCommandCenterResult = {
  data: CommandCenterData;
  status: WorkbookSyncStatus;
};

let commandCenterCache: (WorkbookCommandCenterResult & { cachedAt: number }) | null = null;

function getFreshCommandCenterCache() {
  if (!commandCenterCache) return null;
  if (Date.now() - commandCenterCache.cachedAt > WORKBOOK_CACHE_TTL_MS) return null;

  return {
    data: commandCenterCache.data,
    status: commandCenterCache.status,
  };
}

function cacheWorkbookCommandCenter(result: WorkbookCommandCenterResult) {
  commandCenterCache = { ...result, cachedAt: Date.now() };
  return result;
}

export async function fetchWorkbookCommandCenter() {
  const cached = getFreshCommandCenterCache();
  if (cached) return cached;

  if (hasSheetsApiCredentials() && hasPublishedSheetId()) {
    try {
      const summary = await fetchDashboardSummary();
      const data = mapWorkbookToCommandCenter(summary);
      return cacheWorkbookCommandCenter({
        data: { ...data, source: "workbook" as const },
        status: {
          source: "workbook" as const,
          provider: "sheets-api" as const,
          updatedAt: data.updatedAt,
        },
      });
    } catch {
      // Fall through to Apps Script / published CSV.
    }
  }

  if (hasAppsScriptUrl()) {
    try {
      const scriptPayload = await fetchWorkbookScriptPayloadOrNull();
      if (!scriptPayload) throw new Error("Apps Script workbook payload unavailable");
      const data = mapScriptPayloadToCommandCenter(scriptPayload);
      return cacheWorkbookCommandCenter({
        data: { ...data, source: "workbook" as const },
        status: {
          source: "workbook" as const,
          provider: "apps-script" as const,
          updatedAt: data.updatedAt,
        },
      });
    } catch {
      // Fall through to published CSV.
    }
  }

  if (hasPublishedSheetId()) {
    try {
      const data = await fetchPublishedCommandCenter();
      return cacheWorkbookCommandCenter({
        data: { ...data, source: "workbook" as const },
        status: {
          source: "workbook" as const,
          provider: "published" as const,
          updatedAt: data.updatedAt,
        },
      });
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
