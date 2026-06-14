import { fetchSheet } from "@/lib/google-sheets";
import { fetchPublishedFirstTable } from "@/lib/published-workbook";

import { defaultVendorOpsRows, VendorOps, type VendorOpsRow } from "./_components/vendor-ops";

async function fetchVendorOpsRows(): Promise<VendorOpsRow[]> {
  try {
    const rows = await fetchPublishedFirstTable("Contractors & Vendors");
    const vendors = rows
      .filter((record) => record.vendor)
      .map((record) => ({
        name: record.vendor,
        category: record.type,
        scope: record.scope,
        brand: record.brand,
        status: record.status,
        value: record.value,
      }));

    if (vendors.length) return vendors;
  } catch {
    // Fall back to private Sheets API or local preview data below.
  }

  try {
    const sheet = await fetchSheet("contractors-vendors");
    const rows = sheet.records
      .filter((record) => record.vendor || record.name)
      .map((record) => ({
        name: record.vendor || record.name || "",
        category: record.type || record.category || "",
        scope: record.scope || record.specialty || "",
        brand: record.brand || record.company || "",
        status: record.status || "",
        value: record.value || record.cost || "",
      }))
      .filter((record) => record.name);

    return rows.length ? rows : defaultVendorOpsRows;
  } catch {
    return defaultVendorOpsRows;
  }
}

export default async function Page() {
  const vendors = await fetchVendorOpsRows();

  return <VendorOps vendors={vendors} />;
}

export const dynamic = "force-dynamic";

export const revalidate = 0;
