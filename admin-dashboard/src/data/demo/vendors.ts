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
    name: "North TX Racking Crews",
    category: "install",
    specialtyType: "Structural Install",
    region: "Collin / Hunt Counties",
    specialty: "Commercial rooftop racking and structural install crews",
    activeAssignments: 2,
    contact: "James Reed - james@ntxinstall.com",
    lastCoordination: "2026-06-11",
    status: "Needs Review",
    complianceStatus: "General Liability Expiring",
  },
  {
    id: "ven-002",
    name: "TX Permit Solutions",
    category: "service",
    specialtyType: "Regulatory / Zoning",
    region: "North Texas Core",
    specialty: "Municipal permitting, zoning packets, and AHJ audit response",
    activeAssignments: 4,
    contact: "permits@txpermitsolutions.com",
    lastCoordination: "2026-06-13",
    status: "Active",
    complianceStatus: "Verified Active",
  },
  {
    id: "ven-003",
    name: "Kaufman Master Electricians",
    category: "install",
    specialtyType: "Electrical / Interconnection Tie-In",
    region: "Kaufman / Rockwall",
    specialty: "Master electrician dispatch for service-panel and utility tie-ins",
    activeAssignments: 0,
    contact: "dispatch@kaufmanelectricians.com",
    lastCoordination: "2026-06-12",
    status: "Active",
    complianceStatus: "Verified Active",
  },
];

export const activeVendorAssignments = vendorsData.reduce((sum, vendor) => sum + vendor.activeAssignments, 0);

export const complianceRiskCount = vendorsData.filter((vendor) => vendor.complianceStatus !== "Verified Active").length;
