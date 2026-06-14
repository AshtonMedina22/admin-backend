import { loadEnvConfig } from "@next/env";
import { google } from "googleapis";

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

loadEnvConfig(process.cwd());

type ServiceAccountCredentials = {
  client_email: string;
  private_key: string;
};

type SheetSpec = {
  values: string[][];
  sectionRows?: number[];
  headerRows?: number[];
};

const spreadsheetId = process.env.GOOGLE_SHEET_ID;

const workbook: Record<string, SheetSpec> = {
  Dashboard: {
    sectionRows: [1, 8, 14],
    headerRows: [2, 9, 15],
    values: [
      ["Command Center Metrics"],
      ["Metric", "Value", "Detail", "Company", "Status"],
      ["Active B2B Pipeline", "$680,000", "3SK active contract and proposal pipeline value.", "3SK", "Healthy"],
      ["Live Fleet Yield", "3.4 MW", "Real-time grid performance across active managed arrays.", "YSP", "Healthy"],
      [
        "Combined Portfolio Capacity",
        "4.5 MW",
        "Aggregated footprint: Hunt County, Frisco, Wylie, Plano, and McKinney.",
        "Portfolio",
        "Healthy",
      ],
      [
        "DIY Retail Vol (Mo)",
        "54 Units",
        "2SK active monthly WooCommerce warehouse fulfillment flow.",
        "2SK",
        "Healthy",
      ],
      [],
      ["Combined Revenue Split Matrix"],
      [
        "Period",
        "2SK Direct Hardware Margins",
        "3SK Commercial Consulting and Design Fees",
        "YSP Macro Grid Yield Dividends",
      ],
      ["Q1-26", "$96,500", "$225,000", "$110,000"],
      ["Q2-26", "$142,000", "$270,000", "$155,000"],
      ["Current Month", "$38,000", "$185,000", "$72,000"],
      [],
      ["Global Operations Stream"],
      ["Brand", "Event", "Status", "Logged At"],
      [
        "2SK",
        "Order #9401 synced via WooCommerce API webhook - pending warehouse pull for Garrett Miller.",
        "Info",
        "2026-06-13 14:22",
      ],
      ["3SK", "OpenSolar Design Model V2 saved for Frisco Commercial Plaza, 120kW array.", "Info", "2026-06-13 13:15"],
      [
        "Systems Alert",
        "SSL handshake failing on base domain solar2sk.com. Action required in DreamHost panel.",
        "Critical",
        "2026-06-13 12:48",
      ],
      ["YSP", "Hunt County 60kW microgrid injection balance stabilized at 35.8 kW export.", "Info", "2026-06-13 11:30"],
    ],
  },
  "Lead Tracker": {
    headerRows: [1],
    values: [
      [
        "Lead ID",
        "Timestamp",
        "Client Business Name",
        "Entity Brand",
        "Project Type",
        "Source",
        "Status",
        "Expected Value",
        "Estimated kW Size",
      ],
      [
        "LD-201",
        "2026-06-10",
        "Frisco Office Complex",
        "3SK",
        "B2B Commercial Roof",
        "DFW Appointment Setters",
        "New",
        "$145,000",
        "120 kW",
      ],
      [
        "LD-202",
        "2026-06-11",
        "Garrett Miller",
        "2SK",
        "Residential DIY Kit",
        "Organic Search",
        "Contacted",
        "$4,200",
        "3.5 kW",
      ],
      [
        "LD-203",
        "2026-06-12",
        "Wylie Industrial Park",
        "YSP",
        "Microgrid / Asset Development",
        "Executive Referral",
        "In Progress",
        "$450,000",
        "300 kW",
      ],
      [
        "LD-204",
        "2026-06-13",
        "Plano Auto Body Shop",
        "3SK",
        "B2B Commercial Roof",
        "Cold Outreach",
        "New",
        "$85,000",
        "60 kW",
      ],
    ],
  },
  "Solar3K Bids": {
    headerRows: [1],
    values: [
      [
        "Proposal ID",
        "Client Name",
        "Company",
        "Scope of Work",
        "OpenSolar Layout",
        "Structural PE Status",
        "Interconnection Status",
        "Contract Status",
        "Bid Total",
      ],
      [
        "BID-301",
        "McKinney Logistics Hub",
        "3SK",
        "150kW Array Layout",
        "Completed",
        "Pending Review",
        "Oncor App Filed",
        "DocuSign Executed",
        "$185,000",
      ],
      [
        "BID-302",
        "Denton Multi-Family Array",
        "3SK",
        "200kW Grid Interconnection",
        "Completed",
        "PE Approved",
        "Approved by Utility",
        "Active Proposal Out",
        "$240,000",
      ],
      [
        "BID-303",
        "Rockwall Retail Strip",
        "3SK",
        "90kW Structural Assessment",
        "In Progress",
        "Awaiting Draft",
        "Not Started",
        "Reviewing Scope",
        "$110,000",
      ],
      [
        "BID-304",
        "Frisco Commercial Plaza",
        "3SK",
        "120kW Roof Layout and PE Coordination",
        "Model V2 Saved",
        "Awaiting Load Assessment",
        "Utility Pre-Screen",
        "Engineering Hold",
        "$145,000",
      ],
    ],
  },
  "Solar3K Contracts": {
    headerRows: [1],
    values: [
      [
        "Contract ID",
        "Client Name",
        "Company",
        "Scope",
        "Status",
        "Contract Value",
        "Signature Channel",
        "Next Action",
      ],
      [
        "CTR-401",
        "McKinney Logistics Hub",
        "3SK",
        "150kW Layout Design",
        "Executed",
        "$185,000",
        "DocuSign",
        "Kickoff engineering package",
      ],
      [
        "CTR-402",
        "Denton Multi-Family Array",
        "3SK",
        "200kW Grid Interconnection",
        "Proposal Out",
        "$240,000",
        "DocuSign",
        "Follow up decision maker",
      ],
      [
        "CTR-403",
        "Frisco Commercial Plaza",
        "3SK",
        "120kW Array Engineering",
        "Blocked",
        "$145,000",
        "Pending",
        "Wait for structural PE upload",
      ],
    ],
  },
  "Project Tracker": {
    headerRows: [1],
    values: [
      [
        "Project ID",
        "Customer Name",
        "Company",
        "Project Type",
        "Contractor",
        "Contract Value",
        "Stage",
        "Permit Status",
        "Grid Status",
        "Contract Date",
        "Est Completion",
        "System kW",
        "Notes",
      ],
      [
        "PRJ-101",
        "Hunt County Asset Expansion",
        "YSP",
        "Microgrid / Asset Development",
        "Lone Star Electrical & Interconnection",
        "$450,000",
        "Combiner Box Tie-In",
        "Approved (Local)",
        "Live - 3.4MW",
        "2026-06-01",
        "2026-06-30",
        "60",
        "Oncor field inspection window active.",
      ],
      [
        "PRJ-102",
        "Frisco Commercial Plaza",
        "3SK",
        "B2B Commercial Roof",
        "North Texas Structural PE Group",
        "$145,000",
        "Structural Load Testing",
        "Pending Municipality",
        "Provisioned (Offline)",
        "2026-06-10",
        "2026-07-15",
        "120",
        "Blocked until PE load assessment blueprints are uploaded.",
      ],
      [
        "PRJ-103",
        "Wylie Warehouse Restock",
        "2SK",
        "Residential DIY Kit Fulfillment",
        "Internal Ops Core",
        "$38,000",
        "Inbound Freight Check",
        "N/A Retail",
        "N/A",
        "2026-06-11",
        "2026-06-18",
        "54",
        "Rich Solar pallet arrival scheduled.",
      ],
    ],
  },
  "Contractors & Vendors": {
    headerRows: [1],
    values: [
      ["Vendor", "Type", "Scope", "Company", "Status", "Budget", "Region", "Assignments", "Compliance"],
      [
        "North TX Racking Crews",
        "Structural Install",
        "Commercial rooftop racking and structural install crews",
        "3SK",
        "Needs Review",
        "$8,500",
        "Collin / Hunt Counties",
        "2",
        "General Liability Expiring",
      ],
      [
        "TX Permit Solutions",
        "Regulatory / Zoning",
        "Municipal permitting, zoning packets, and AHJ audit response",
        "3SK",
        "Active",
        "$3,200",
        "North Texas Core",
        "4",
        "Verified Active",
      ],
      [
        "Kaufman Master Electricians",
        "Electrical / Interconnection Tie-In",
        "Master electrician dispatch for service-panel and utility tie-ins",
        "YSP",
        "Active",
        "$0",
        "Kaufman / Rockwall",
        "0",
        "Verified Active",
      ],
    ],
  },
  "Financial Summary": {
    sectionRows: [1],
    headerRows: [2],
    values: [
      ["Revenue Split Matrix"],
      ["Company", "Jan", "Feb", "Mar", "Apr", "May", "Jun YTD"],
      ["2SK", "$28,000", "$31,500", "$37,000", "$54,000", "$50,000", "$38,000"],
      ["3SK", "$65,000", "$72,000", "$88,000", "$85,000", "$100,000", "$185,000"],
      ["YSP", "$35,000", "$40,000", "$35,000", "$72,000", "$83,000", "$72,000"],
    ],
  },
  "Website & Systems": {
    sectionRows: [1, 8],
    headerRows: [2, 9],
    values: [
      ["Domain Monitors"],
      ["Site Domain", "Hosting", "Platform", "SSL", "Renewal", "Admin", "Status"],
      [
        "solar2sk.com",
        "DreamHost Hosting Console",
        "WordPress Engine",
        "CRITICAL EXPIRED",
        "June 10, 2026 (Action Overdue)",
        "Jordan Lee",
        "Critical",
      ],
      [
        "shop.solar2sk.com",
        "DreamHost Hosting Console",
        "WooCommerce",
        "OPERATIONAL",
        "Jan 15, 2027",
        "Jordan Lee",
        "Healthy",
      ],
      ["solar3k.com", "Vercel", "Custom Next.js Platform", "OPERATIONAL", "Nov 22, 2026", "Alex Morgan", "Healthy"],
      [
        "yellowstarpower.com",
        "Vercel",
        "Custom Next.js Platform",
        "OPERATIONAL",
        "Dec 05, 2026",
        "Alex Morgan",
        "Healthy",
      ],
      [],
      ["SaaS Subscription Ledger"],
      ["Tool", "Cadence", "Cost", "Purpose", "Admin"],
      ["Google Workspace", "Monthly", "$72", "Global Holdings Identity - email and docs", "Alex Morgan"],
      ["DreamHost Server Stack", "Monthly", "$45", "Multi-tenant site hosting layer", "Alex Morgan"],
      ["QuickBooks Online", "Monthly", "$90", "Cross-entity invoicing ledger", "Jordan Lee"],
      ["Zapier Automation Engine", "Monthly", "$49", "Webhook lead synchronization pipeline", "Alex Morgan"],
      ["DocuSign Corporate Pro", "Monthly", "$45", "B2B commercial contract delivery", "Alex Morgan"],
      ["OpenSolar Platform", "Monthly", "$0", "Freemium B2B CAD array design layouts", "Alex Morgan"],
      ["SolarEdge Monitoring API", "Monthly", "$0", "Hardware bundle telemetry polling layer", "Alex Morgan"],
    ],
  },
  "Retail Ops": {
    sectionRows: [1, 7],
    headerRows: [2, 8],
    values: [
      ["WooCommerce Order Management"],
      ["Order ID", "Customer", "Product", "Status", "Value", "Date", "Weight", "Bin"],
      [
        "2SK-9412",
        "Garrett Miller",
        "Rich Solar 3KW Hybrid Inverter Pack",
        "Pending Warehouse Pull",
        "$4,200",
        "2026-06-12",
        "84 lbs",
        "WYL-A03",
      ],
      [
        "2SK-9413",
        "Marcus Vance",
        "48V 100Ah LiFePO4 Battery Block",
        "Picked & Packed",
        "$2,100",
        "2026-06-11",
        "115 lbs",
        "WYL-B12",
      ],
      [
        "2SK-9414",
        "J. Allen",
        "5kW DIY Off-Grid Solar Kit (Complete)",
        "Inventory Hold",
        "$6,850",
        "2026-06-13",
        "420 lbs",
        "WYL-PAL-07",
      ],
      [],
      ["DIY Technical Support Tickets"],
      [
        "Ticket ID",
        "User Group",
        "Subject",
        "Message Snippet",
        "Priority",
        "Status",
        "Created At",
        "Assigned To",
        "Order Number",
      ],
      [
        "NRC-8012",
        "Retail DIY Purchaser - M. Allen",
        "Battery Parallel Configuration Validation",
        "Requesting engineering review on wiring three 48V Lithium blocks in parallel without over-volting the Anenji 3KW inverter input threshold.",
        "High Priority",
        "Open",
        "2026-06-13",
        "Alex Morgan",
        "9394",
      ],
      [
        "NRC-8010",
        "Retail DIY Purchaser - Garrett Miller",
        "Hybrid inverter pack pre-install checklist",
        "Garrett Miller is requesting confirmation on Rich Solar 3KW hybrid inverter combiner wiring before warehouse pull ships from Wylie.",
        "Medium Priority",
        "In Progress",
        "2026-06-12",
        "Jordan Lee",
        "9401",
      ],
      [
        "NRC-8008",
        "Retail DIY Purchaser - Robert Davis",
        "LiFePO4 add-on compatibility with existing DIY kit",
        "Battery add-on order on inventory hold needs validation that the 48V 100Ah LiFePO4 block matches the existing Anenji 3KW input threshold on the parallel bus.",
        "High Priority",
        "Open",
        "2026-06-13",
        "Jordan Lee",
        "9398",
      ],
    ],
  },
  Calendar: {
    headerRows: [1],
    values: [
      ["Date", "Time", "Event", "Type", "Brand", "Notes", "Owner"],
      [
        "2026-06-15",
        "09:00 AM",
        "City of Plano Permit Hearing",
        "Regulatory Gate",
        "3SK",
        "Reviewing 60kW auto body build zoning variance",
        "Alex Morgan",
      ],
      [
        "2026-06-18",
        "01:30 PM",
        "Bulk Inbound Freight Pallet Arrival",
        "Warehouse Logistics",
        "2SK",
        "Receiving 42 units of Anenji 3KW Inverter stock at Wylie Hub",
        "Jordan Lee",
      ],
      [
        "2026-06-22",
        "03:15 PM",
        "Oncor On-Site Utility Field Inspection",
        "Grid Interconnection",
        "YSP",
        "Testing 60kW macro asset expansion tie-in matrix",
        "Alex Morgan",
      ],
      [
        "2026-06-26",
        "10:45 AM",
        "Frisco Commercial Plaza Roof Load Walk",
        "Engineering Field Log",
        "3SK",
        "Structural engineer on-site roof load assessment walk for 120kW commercial array",
        "North Texas Structural PE Group",
      ],
    ],
  },
  "Access Control": {
    sectionRows: [1],
    headerRows: [2],
    values: [
      ["User Access / RBAC Controls"],
      ["Profile", "Corporate Role Assigned", "Scope", "Module Permissions Profile"],
      [
        "Alex Morgan (alex.morgan@demo-ops.local)",
        "SUPER_ADMIN",
        "Global Holdings",
        "Command Center READ_WRITE | CRM READ_WRITE | Telemetry READ_WRITE | Vendor Ops READ_WRITE | System Settings READ_WRITE",
      ],
      [
        "Jordan Lee (jordan.lee@demo-retail.local)",
        "OPS_MANAGER",
        "2SK Retail",
        "Command Center READ_ONLY | CRM READ_WRITE | Telemetry NO_ACCESS | Vendor Ops READ_WRITE | System Settings READ_ONLY",
      ],
      [
        "Field Installation Contractor Team (install-dfw2@external-vendors.net)",
        "FIELD_CREW",
        "3SK Sites",
        "Command Center NO_ACCESS | CRM NO_ACCESS | Telemetry READ_ONLY | Vendor Ops READ_ONLY | System Settings NO_ACCESS",
      ],
    ],
  },
};

async function getCredentials(): Promise<ServiceAccountCredentials> {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON) as ServiceAccountCredentials;
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const filePath = resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS);
    return JSON.parse(await readFile(filePath, "utf8")) as ServiceAccountCredentials;
  }

  throw new Error("Set GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS.");
}

function range(sheetId: number, startRowIndex: number, endRowIndex: number, startColumnIndex = 0, endColumnIndex = 12) {
  return { sheetId, startRowIndex, endRowIndex, startColumnIndex, endColumnIndex };
}

async function main() {
  if (!spreadsheetId) throw new Error("Set GOOGLE_SHEET_ID.");

  const credentials = await getCredentials();
  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const metadata = await sheets.spreadsheets.get({ spreadsheetId });
  const tabs = new Map(
    metadata.data.sheets?.map((sheet) => [sheet.properties?.title, sheet.properties?.sheetId]) ?? [],
  );

  for (const sheetName of Object.keys(workbook)) {
    if (!tabs.has(sheetName)) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests: [{ addSheet: { properties: { title: sheetName } } }] },
      });
    }
  }

  const refreshed = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetIds = new Map(
    refreshed.data.sheets?.map((sheet) => [sheet.properties?.title, sheet.properties?.sheetId]) ?? [],
  );

  await sheets.spreadsheets.values.batchClear({
    spreadsheetId,
    requestBody: { ranges: Object.keys(workbook).map((sheetName) => `'${sheetName}'!A1:Z200`) },
  });

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: "USER_ENTERED",
      data: Object.entries(workbook).map(([sheetName, spec]) => ({
        range: `'${sheetName}'!A1`,
        values: spec.values,
      })),
    },
  });

  const requests = [];
  const dark = { red: 0.078, green: 0.118, blue: 0.176 };
  const header = { red: 0.898, green: 0.929, blue: 0.957 };
  const white = { red: 1, green: 1, blue: 1 };

  for (const [sheetName, spec] of Object.entries(workbook)) {
    const sheetId = sheetIds.get(sheetName);
    if (typeof sheetId !== "number") continue;

    const maxColumns = Math.max(...spec.values.map((values) => values.length));

    requests.push(
      {
        updateSheetProperties: {
          properties: {
            sheetId,
            gridProperties: { frozenRowCount: spec.sectionRows?.includes(1) ? 0 : 1, hideGridlines: true },
          },
          fields: "gridProperties.frozenRowCount,gridProperties.hideGridlines",
        },
      },
      {
        repeatCell: {
          range: range(sheetId, 0, Math.max(spec.values.length, 1), 0, Math.max(maxColumns, 1)),
          cell: {
            userEnteredFormat: {
              backgroundColor: white,
              textFormat: {
                fontFamily: "Arial",
                fontSize: 10,
                foregroundColor: { red: 0.12, green: 0.12, blue: 0.12 },
              },
              wrapStrategy: "WRAP",
              verticalAlignment: "MIDDLE",
            },
          },
          fields: "userEnteredFormat(backgroundColor,textFormat,wrapStrategy,verticalAlignment)",
        },
      },
      {
        autoResizeDimensions: {
          dimensions: { sheetId, dimension: "COLUMNS", startIndex: 0, endIndex: Math.max(maxColumns, 1) },
        },
      },
    );

    for (const sectionRow of spec.sectionRows ?? []) {
      requests.push({
        repeatCell: {
          range: range(sheetId, sectionRow - 1, sectionRow, 0, Math.max(maxColumns, 1)),
          cell: {
            userEnteredFormat: {
              backgroundColor: dark,
              textFormat: { bold: true, fontSize: 12, foregroundColor: white },
            },
          },
          fields: "userEnteredFormat(backgroundColor,textFormat)",
        },
      });
    }

    for (const headerRow of spec.headerRows ?? []) {
      requests.push({
        repeatCell: {
          range: range(sheetId, headerRow - 1, headerRow, 0, Math.max(maxColumns, 1)),
          cell: {
            userEnteredFormat: {
              backgroundColor: header,
              textFormat: { bold: true, foregroundColor: { red: 0.12, green: 0.12, blue: 0.12 } },
            },
          },
          fields: "userEnteredFormat(backgroundColor,textFormat)",
        },
      });
    }
  }

  await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
  console.log("Workbook synced to the current admin dashboard demo data.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
