export type WorkbookSyncProvider = "published" | "apps-script" | "sheets-api";

export type WorkbookSyncStatus = {
  source: "workbook" | "demo";
  provider?: WorkbookSyncProvider;
  updatedAt: string;
};

const providerLabels: Record<WorkbookSyncProvider, string> = {
  published: "Published workbook",
  "apps-script": "Apps Script webhook",
  "sheets-api": "Sheets API",
};

export function workbookProviderLabel(provider?: WorkbookSyncProvider) {
  return provider ? providerLabels[provider] : undefined;
}
