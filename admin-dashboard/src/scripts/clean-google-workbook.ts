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
      ["Active B2B Pipeline", "$680,000", "Summit C&I Group active contract and proposal pipeline value.", "Summit C&I Group", "Healthy"],
      ["Live Fleet Yield", "48.2 kW", "Real-time grid performance across active managed arrays.", "Cedar Grid Assets", "Healthy"],
      [
        "Combined Portfolio Capacity",
        "633.5 kW",
        "Aggregated footprint: Hunt County, Frisco, Wylie, Plano, and McKinney.",
        "Portfolio",
        "Healthy",
      ],
      [
        "DIY Retail Vol (Mo)",
        "54 Units",
        "Nova Retail Co. active monthly WooCommerce warehouse fulfillment flow.",
        "Nova Retail Co.",
        "Healthy",
      ],
      [],
      ["Combined Revenue Split Matrix"],
      [
        "Period",
        "Nova Retail Co. Direct Hardware Margins",
        "Summit C&I Group Commercial Consulting and Design Fees",
        "Cedar Grid Assets Macro Grid Yield Dividends",
      ],
      ["Q1-26", "$96,500", "$225,000", "$110,000"],
      ["Q2-26", "$142,000", "$270,000", "$155,000"],
      ["Current Month", "$38,000", "$185,000", "$72,000"],
      [],
      ["Global Operations Stream"],
      ["Brand", "Event", "Status"],
      ["Nova Retail Co.", "Order #9401 synced via WooCommerce API webhook - pending warehouse pull for Garrett Miller.", "Info"],
      ["Summit C&I Group", "OpenSolar Design Model V2 saved for Frisco Commercial Plaza, 120kW array.", "Info"],
      ["Systems Alert", "SSL handshake failing on base domain novaretail.demo. Action required in DreamHost panel.", "Critical"],
      ["Cedar Grid Assets", "Hunt County 60kW microgrid injection balance stabilized at 35.8 kW export.", "Info"],
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
      ["LD-201", "2026-06-10", "Frisco Office Complex", "Summit C&I Group", "B2B Commercial Roof", "DFW Appointment Setters", "New", "$145,000", "120 kW"],
      ["LD-202", "2026-06-11", "Garrett Miller", "Nova Retail Co.", "Residential DIY Kit", "Organic Search", "Contacted", "$4,200", "3.5 kW"],
      ["LD-203", "2026-06-12", "Wylie Industrial Park", "Cedar Grid Assets", "Microgrid / Asset Development", "Executive Referral", "In Progress", "$450,000", "300 kW"],
      ["LD-204", "2026-06-13", "Plano Auto Body Shop", "Summit C&I Group", "B2B Commercial Roof", "Cold Outreach", "New", "$85,000", "60 kW"],
    ],
  },
  "Solar3K Bids": {
    headerRows: [1],
    values: [
      ["Proposal ID", "Client Name", "Company", "Scope of Work", "OpenSolar Layout", "Structural PE Status", "Interconnection Status", "Contract Status", "Bid Total"],
      ["BID-301", "McKinney Logistics Hub", "Summit C&I Group", "150kW Array Layout", "Completed", "Pending Review", "Oncor App Filed", "DocuSign Executed", "$185,000"],
      ["BID-302", "Denton Multi-Family Array", "Summit C&I Group", "200kW Grid Interconnection", "Completed", "PE Approved", "Approved by Utility", "Active Proposal Out", "$240,000"],
      ["BID-303", "Rockwall Retail Strip", "Summit C&I Group", "90kW Structural Assessment", "In Progress", "Awaiting Draft", "Not Started", "Reviewing Scope", "$110,000"],
      ["BID-304", "Frisco Commercial Plaza", "Summit C&I Group", "120kW Roof Layout and PE Coordination", "Model V2 Saved", "Awaiting Load Assessment", "Utility Pre-Screen", "Engineering Hold", "$145,000"],
    ],
  },
  "Solar3K Contracts": {
    headerRows: [1],
    values: [
      ["Contract ID", "Client Name", "Company", "Scope", "Status", "Contract Value", "Signature Channel", "Next Action"],
      ["CTR-401", "McKinney Logistics Hub", "Summit C&I Group", "150kW Layout Design", "Executed", "$185,000", "DocuSign", "Kickoff engineering package"],
      ["CTR-402", "Denton Multi-Family Array", "Summit C&I Group", "200kW Grid Interconnection", "Proposal Out", "$240,000", "DocuSign", "Follow up decision maker"],
      ["CTR-403", "Frisco Commercial Plaza", "Summit C&I Group", "120kW Array Engineering", "Blocked", "$145,000", "Pending", "Wait for structural PE upload"],
    ],
  },
  "Project Tracker": {
    headerRows: [1],
    values: [
      ["Project ID", "Customer Name", "Company", "Project Type", "Contractor", "Contract Value", "Stage", "Permit Status", "Grid Status", "Contract Date", "Est Completion", "System kW", "Notes"],
      ["PRJ-101", "Hunt County Asset Expansion", "Cedar Grid Assets", "Microgrid / Asset Development", "Lone Star Electrical & Interconnection", "$450,000", "Combiner Box Tie-In", "Approved (Local)", "Live - 48.2kW", "2026-06-01", "2026-06-30", "60", "Oncor field inspection window active."],
      ["PRJ-102", "Frisco Commercial Plaza", "Summit C&I Group", "B2B Commercial Roof", "North Texas Structural PE Group", "$145,000", "Structural Load Testing", "Pending Municipality", "Provisioned (Offline)", "2026-06-10", "2026-07-15", "120", "Blocked until PE load assessment blueprints are uploaded."],
      ["PRJ-103", "Wylie Warehouse Restock", "Nova Retail Co.", "Residential DIY Kit Fulfillment", "Internal Ops Core", "$38,000", "Inbound Freight Check", "N/A Retail", "N/A", "2026-06-11", "2026-06-18", "54", "Rich Solar pallet arrival scheduled."],
    ],
  },
  "Contractors & Vendors": {
    headerRows: [1],
    values: [
      ["Vendor", "Type", "Scope", "Company", "Status", "Budget", "Region", "Assignments", "Compliance"],
      ["Rich Solar Distribution", "Hardware Wholesaler", "Bulk 3KW Inverter Pallet Freight", "Nova Retail Co.", "In Transit via LTL", "$14,250", "North Texas", "1", "Verified Active"],
      ["North Texas Structural PE Group", "Structural Engineering Stamp", "120kW Roof Load Assessment", "Summit C&I Group", "Awaiting PE Signature", "$3,200", "DFW Metro", "1", "Verified Active"],
      ["Lone Star Electrical & Interconnection", "Field Subcontractor", "Hunt County Combiner Box Upgrade", "Cedar Grid Assets", "On-Site Crew Dispatched", "$8,500", "Hunt County", "1", "Verified Active"],
      ["DFW Solar Appointment Setters", "Marketing Agency / Lead Gen", "Commercial Roof Pre-Qualification Run", "Summit C&I Group", "Completed Pay-Per-Sit Out", "$1,800", "DFW Metro", "0", "Verified Active"],
    ],
  },
  "Financial Summary": {
    sectionRows: [1],
    headerRows: [2],
    values: [
      ["Revenue Split Matrix"],
      ["Company", "Jan", "Feb", "Mar", "Apr", "May", "Jun YTD"],
      ["Nova Retail Co.", "$28,000", "$31,500", "$37,000", "$54,000", "$50,000", "$38,000"],
      ["Summit C&I Group", "$65,000", "$72,000", "$88,000", "$85,000", "$100,000", "$185,000"],
      ["Cedar Grid Assets", "$35,000", "$40,000", "$35,000", "$72,000", "$83,000", "$72,000"],
    ],
  },
  "Website & Systems": {
    sectionRows: [1, 8],
    headerRows: [2, 9],
    values: [
      ["Domain Monitors"],
      ["Site Domain", "Hosting", "Platform", "SSL", "Renewal", "Admin", "Status"],
      ["novaretail.demo", "DreamHost Hosting Console", "WordPress Engine", "CRITICAL EXPIRED", "June 10, 2026 (Action Overdue)", "Jordan Lee", "Critical"],
      ["shop.novaretail.demo", "DreamHost Hosting Console", "WooCommerce", "OPERATIONAL", "Jan 15, 2027", "Jordan Lee", "Healthy"],
      ["summitci.demo", "Vercel", "Custom Next.js Platform", "OPERATIONAL", "Nov 22, 2026", "Alex Morgan", "Healthy"],
      ["cedargrid.demo", "Vercel", "Custom Next.js Platform", "OPERATIONAL", "Dec 05, 2026", "Alex Morgan", "Healthy"],
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
      ["Order ID", "Customer", "Product", "Status", "Value", "Date"],
      ["WOO-9401", "Garrett Miller", "Rich Solar 3KW Hybrid Inverter Pack", "Pending Warehouse Pull", "$4,200", "2026-06-12"],
      ["WOO-9402", "Marcus Vance", "48V 100Ah LiFePO4 Battery Block", "Fulfilled & Packed", "$2,100", "2026-06-11"],
      ["WOO-9403", "M. Allen", "Anenji 3KW Inverter Hardware Bank", "Support Review Required", "$3,850", "2026-06-13"],
      [],
      ["DIY Technical Support Tickets"],
      ["Ticket ID", "User Group", "Subject", "Message Snippet", "Priority", "Status", "Created At", "Assigned To", "Order Number"],
      ["NRC-8012", "Retail DIY Purchaser - M. Allen", "Battery Parallel Configuration Validation", "Requesting engineering review on wiring three 48V Lithium blocks in parallel without over-volting the Anenji 3KW inverter input threshold.", "High Priority", "Open", "2026-06-13", "Alex Morgan", "9394"],
      ["NRC-8010", "Retail DIY Purchaser - Garrett Miller", "Hybrid inverter pack pre-install checklist", "Garrett Miller is requesting confirmation on Rich Solar 3KW hybrid inverter combiner wiring before warehouse pull ships from Wylie.", "Medium Priority", "In Progress", "2026-06-12", "Jordan Lee", "9401"],
      ["NRC-8008", "Retail DIY Purchaser - Robert Davis", "LiFePO4 add-on compatibility with existing DIY kit", "Battery add-on order on inventory hold needs validation that the 48V 100Ah LiFePO4 block matches the existing Anenji 3KW input threshold on the parallel bus.", "High Priority", "Open", "2026-06-13", "Jordan Lee", "9398"],
    ],
  },
  Calendar: {
    headerRows: [1],
    values: [
      ["Date", "Brand", "Event", "Owner"],
      ["2026-06-15", "Summit C&I Group", "Submit zoning variance paperwork to City of Plano Building Inspections Department for 60kW Auto Body build.", "Alex Morgan"],
      ["2026-06-18", "Nova Retail Co.", "Inbound bulk freight pallet arrival from Rich Solar at Wylie Warehouse.", "Jordan Lee"],
      ["2026-06-22", "Cedar Grid Assets", "Oncor on-site utility engineering field inspection window for Hunt County 60kW asset expansion tie-in.", "Alex Morgan"],
      ["2026-06-26", "Summit C&I Group", "Structural engineer on-site roof load assessment walk at Frisco Commercial Plaza.", "North Texas Structural PE Group"],
    ],
  },
  "Access Control": {
    sectionRows: [1],
    headerRows: [2],
    values: [
      ["User Access / RBAC Controls"],
      ["Profile", "Corporate Role Assigned", "Scope", "Module Permissions Profile"],
      ["Alex Morgan (alex.morgan@demo-ops.local)", "SUPER_ADMIN", "Global Holdings", "Command Center READ_WRITE | CRM READ_WRITE | Telemetry READ_WRITE | Vendor Ops READ_WRITE | System Settings READ_WRITE"],
      ["Jordan Lee (jordan.lee@demo-retail.local)", "OPS_MANAGER", "Nova Retail Co. Retail", "Command Center READ_ONLY | CRM READ_WRITE | Telemetry NO_ACCESS | Vendor Ops READ_WRITE | System Settings READ_ONLY"],
      ["Field Installation Contractor Team (install-dfw2@external-vendors.net)", "FIELD_CREW", "Summit C&I Group Sites", "Command Center NO_ACCESS | CRM NO_ACCESS | Telemetry READ_ONLY | Vendor Ops READ_ONLY | System Settings NO_ACCESS"],
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

function cell(value: string) {
  return { userEnteredValue: value ? { stringValue: value } : undefined };
}

function row(values: string[]) {
  return { values: values.map(cell) };
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
  const tabs = new Map(metadata.data.sheets?.map((sheet) => [sheet.properties?.title, sheet.properties?.sheetId]) ?? []);

  for (const sheetName of Object.keys(workbook)) {
    if (!tabs.has(sheetName)) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests: [{ addSheet: { properties: { title: sheetName } } }] },
      });
    }
  }

  const refreshed = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetIds = new Map(refreshed.data.sheets?.map((sheet) => [sheet.properties?.title, sheet.properties?.sheetId]) ?? []);

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
              textFormat: { fontFamily: "Arial", fontSize: 10, foregroundColor: { red: 0.12, green: 0.12, blue: 0.12 } },
              wrapStrategy: "WRAP",
              verticalAlignment: "MIDDLE",
            },
          },
          fields: "userEnteredFormat(backgroundColor,textFormat,wrapStrategy,verticalAlignment)",
        },
      },
      { autoResizeDimensions: { dimensions: { sheetId, dimension: "COLUMNS", startIndex: 0, endIndex: Math.max(maxColumns, 1) } } },
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
