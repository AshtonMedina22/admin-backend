export function hasAppsScriptUrl() {
  const url = process.env.GOOGLE_APPS_SCRIPT_URL?.trim();
  return Boolean(url && !url.includes(".../exec"));
}

export function hasSheetsApiCredentials() {
  return Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS);
}

export function hasPublishedSheetId() {
  return Boolean(process.env.GOOGLE_SHEET_ID?.trim());
}
