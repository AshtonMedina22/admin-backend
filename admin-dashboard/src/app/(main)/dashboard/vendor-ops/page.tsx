import { vendorsData } from "@/data/demo/vendors";
import { fetchSheet } from "@/lib/google-sheets";
import { fetchPublishedFirstTable } from "@/lib/published-workbook";
import { mapRecordsToVendors } from "@/lib/sheet-mappers";

import { VendorOps } from "./_components/vendor-ops";

function hasGenericVendorPlaceholders(vendors: Awaited<ReturnType<typeof mapRecordsToVendors>>) {
  return vendors.some((vendor) =>
    /vendor a|vendor b|vendor c|type x|type y|rich solar distribution|dfw solar appointment/i.test(
      `${vendor.name} ${vendor.specialtyType} ${vendor.specialty}`,
    ),
  );
}

async function fetchVendorRecords() {
  try {
    const rows = await fetchPublishedFirstTable("Contractors & Vendors");
    const vendors = mapRecordsToVendors(
      rows
        .filter((record) => record.vendor)
        .map((record) => ({
          vendor_name: record.vendor,
          category: record.type,
          specialty: record.scope,
          region: record.region || "North Texas",
          active_assignments: record.assignments || "0",
          compliance_status: record.compliance || record.insurance || "Verified Active",
          specialty_type: record.type,
        })),
    );

    if (vendors.length && !hasGenericVendorPlaceholders(vendors)) return vendors;
  } catch {
    // Fall back to private Sheets API or local preview data below.
  }

  try {
    const sheet = await fetchSheet("contractors-vendors");
    const vendors = mapRecordsToVendors(sheet.records);
    if (vendors.length && !hasGenericVendorPlaceholders(vendors)) return vendors;
    return vendorsData;
  } catch {
    return vendorsData;
  }
}

export default async function Page() {
  const vendors = await fetchVendorRecords();

  return <VendorOps vendors={vendors} />;
}

export const dynamic = "force-dynamic";

export const revalidate = 0;
