import { demoCommandCenterData } from "@/data/demo/command-center";
import { fetchWorkbookScriptPayloadOrNull, mapScriptPayloadToCommandCenter } from "@/lib/apps-script-workbook";
import { fetchDashboardSummary } from "@/lib/google-sheets";
import { fetchPublishedCommandCenter } from "@/lib/published-workbook";
import { mapWorkbookToCommandCenter } from "@/lib/sheet-mappers";
import type { WorkbookSyncStatus } from "@/lib/workbook-sync-types";

export type { WorkbookSyncProvider, WorkbookSyncStatus } from "@/lib/workbook-sync-types";
export { workbookProviderLabel } from "@/lib/workbook-sync-types";

export async function getWorkbookSyncStatus(): Promise<WorkbookSyncStatus> {
  try {
    const data = await fetchPublishedCommandCenter();
    return { source: "workbook", provider: "published", updatedAt: data.updatedAt };
  } catch {
    try {
      const scriptPayload = await fetchWorkbookScriptPayloadOrNull();
      if (!scriptPayload) throw new Error("Apps Script workbook payload unavailable");
      const data = mapScriptPayloadToCommandCenter(scriptPayload);
      return { source: "workbook", provider: "apps-script", updatedAt: data.updatedAt };
    } catch {
      try {
        const summary = await fetchDashboardSummary();
        const data = mapWorkbookToCommandCenter(summary);
        return { source: "workbook", provider: "sheets-api", updatedAt: data.updatedAt };
      } catch {
        return { source: "demo", updatedAt: demoCommandCenterData.updatedAt };
      }
    }
  }
}

export async function fetchCommandCenterDataWithSource() {
  const status = await getWorkbookSyncStatus();
  if (status.source === "workbook") {
    if (status.provider === "published") {
      const data = await fetchPublishedCommandCenter();
      return { data: { ...data, source: "workbook" as const }, status };
    }
    if (status.provider === "apps-script") {
      const scriptPayload = await fetchWorkbookScriptPayloadOrNull();
      if (scriptPayload) {
        const data = mapScriptPayloadToCommandCenter(scriptPayload);
        return { data: { ...data, source: "workbook" as const }, status };
      }
    }
    if (status.provider === "sheets-api") {
      const summary = await fetchDashboardSummary();
      const data = mapWorkbookToCommandCenter(summary);
      return { data: { ...data, source: "workbook" as const }, status };
    }
  }
  return { data: { ...demoCommandCenterData, source: "demo" as const }, status };
}
