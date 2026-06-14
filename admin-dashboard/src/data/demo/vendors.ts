export type VendorCategory = "install" | "equipment" | "service";

export type ComplianceStatus =
  | "Verified Active"
  | "General Liability Expiring"
  | "Needs COI Review"
  | "Certificate Lapsed";

export interface VendorRecord {
  id: string;
  name: string;
  category: VendorCategory;
  specialtyType: string;
  region: string;
  specialty: string;
  activeAssignments: number;
  contact: string;
  lastCoordination: string;
  status: "Active" | "On Hold" | "Needs Review";
  complianceStatus: ComplianceStatus;
}

export const vendorCategoryLabel: Record<VendorCategory, string> = {
  install: "Structural Install",
  equipment: "Hardware Supply",
  service: "Regulatory/Zoning",
};

export const vendorsData: VendorRecord[] = [
  {
    id: "ven-001",
    name: "ABC Electrical",
    category: "install",
    specialtyType: "Master Electrician Crew",
    region: "Collin/Hunt Counties",
    specialty: "Residential & commercial tie-in",
    activeAssignments: 2,
    contact: "Mike Torres - mike@abcelectrical.com",
    lastCoordination: "2026-06-12",
    status: "Active",
    complianceStatus: "Verified Active",
  },
  {
    id: "ven-002",
    name: "North TX Racking Crews (Structural Install)",
    category: "install",
    specialtyType: "Structural Install",
    region: "Collin/Hunt Counties",
    specialty: "Commercial rooftop racking",
    activeAssignments: 2,
    contact: "James Reed - james@ntxinstall.com",
    lastCoordination: "2026-06-11",
    status: "Active",
    complianceStatus: "General Liability Expiring",
  },
  {
    id: "ven-003",
    name: "Rich Solar",
    category: "equipment",
    specialtyType: "Hardware Supply",
    region: "National LTL Freight",
    specialty: "Inverters & panel kits",
    activeAssignments: 8,
    contact: "orders@richsolar.com",
    lastCoordination: "2026-06-13",
    status: "Active",
    complianceStatus: "Verified Active",
  },
  {
    id: "ven-004",
    name: "Battery Supply Co",
    category: "equipment",
    specialtyType: "Battery Logistics",
    region: "Southwest Distribution",
    specialty: "LiFePO4 storage",
    activeAssignments: 3,
    contact: "sales@batterysupply.com",
    lastCoordination: "2026-06-10",
    status: "Needs Review",
    complianceStatus: "Needs COI Review",
  },
  {
    id: "ven-005",
    name: "TX Permit Solutions (Regulatory)",
    category: "service",
    specialtyType: "Regulatory/Zoning",
    region: "North Texas",
    specialty: "Municipal permitting & zoning audits",
    activeAssignments: 4,
    contact: "permits@txpermitsolutions.com",
    lastCoordination: "2026-06-13",
    status: "Active",
    complianceStatus: "Verified Active",
  },
  {
    id: "ven-006",
    name: "North Texas Structural PE Group",
    category: "service",
    specialtyType: "Structural Engineering",
    region: "DFW Metro",
    specialty: "PE stamped load calcs",
    activeAssignments: 3,
    contact: "eng@structuralpe.com",
    lastCoordination: "2026-06-09",
    status: "Active",
    complianceStatus: "Verified Active",
  },
];

export const activeVendorAssignments = vendorsData.reduce((sum, vendor) => sum + vendor.activeAssignments, 0);

export const complianceRiskCount = vendorsData.filter(
  (vendor) => vendor.complianceStatus !== "Verified Active",
).length;
