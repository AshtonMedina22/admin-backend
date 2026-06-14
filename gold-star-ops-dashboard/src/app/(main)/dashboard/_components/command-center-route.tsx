import { demoCommandCenterData } from "@/data/demo/command-center";
import { fetchWorkbookScriptPayloadOrNull, mapScriptPayloadToCommandCenter } from "@/lib/apps-script-workbook";
import { fetchDashboardSummary } from "@/lib/google-sheets";
import { fetchPublishedCommandCenter } from "@/lib/published-workbook";
import { mapWorkbookToCommandCenter } from "@/lib/sheet-mappers";

import { CommandCenter } from "../default/_components/command-center";

export async function CommandCenterRoute() {
  let data = demoCommandCenterData;
  let source: "demo" | "workbook" = "demo";

  try {
    data = await fetchPublishedCommandCenter();
    source = "workbook";
  } catch {
    try {
      const scriptPayload = await fetchWorkbookScriptPayloadOrNull();
      if (!scriptPayload) throw new Error("Apps Script workbook payload unavailable");
      data = mapScriptPayloadToCommandCenter(scriptPayload);
      source = "workbook";
    } catch {
      try {
        const summary = await fetchDashboardSummary();
        data = mapWorkbookToCommandCenter(summary);
        source = "workbook";
      } catch {
        // Keep local preview data available when workbook credentials are not configured.
      }
    }
  }

  return <CommandCenter data={{ ...data, source }} />;
}
