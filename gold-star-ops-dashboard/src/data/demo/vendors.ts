export type VendorCategory = "install" | "equipment" | "service";

export interface VendorRecord {
  id: string;
  name: string;
  category: VendorCategory;
  region: string;
  specialty: string;
  activeAssignments: number;
  contact: string;
  lastCoordination: string;
  status: "Active" | "On Hold" | "Needs Review";
}

export const vendorsData: VendorRecord[] = [
  {
    id: "ven-001",
    name: "ABC Electrical",
    category: "install",
    region: "DFW North",
    specialty: "Residential install crews",
    activeAssignments: 4,
    contact: "Mike Torres — mike@abcelectrical.com",
    lastCoordination: "2026-06-12",
    status: "Active",
  },
  {
    id: "ven-002",
    name: "N TX Installers",
    category: "install",
    region: "North Texas",
    specialty: "Commercial rooftop",
    activeAssignments: 2,
    contact: "James Reed — james@ntxinstall.com",
    lastCoordination: "2026-06-11",
    status: "Active",
  },
  {
    id: "ven-003",
    name: "Rich Solar",
    category: "equipment",
    region: "National",
    specialty: "Inverters & panel kits",
    activeAssignments: 8,
    contact: "orders@richsolar.com",
    lastCoordination: "2026-06-13",
    status: "Active",
  },
  {
    id: "ven-004",
    name: "Battery Supply Co",
    category: "equipment",
    region: "Southwest",
    specialty: "LiFePO4 storage",
    activeAssignments: 3,
    contact: "sales@batterysupply.com",
    lastCoordination: "2026-06-10",
    status: "Needs Review",
  },
  {
    id: "ven-005",
    name: "TX Permit Solutions",
    category: "service",
    region: "Texas statewide",
    specialty: "Municipal permitting",
    activeAssignments: 5,
    contact: "permits@txpermitsolutions.com",
    lastCoordination: "2026-06-13",
    status: "Active",
  },
  {
    id: "ven-006",
    name: "Structural PE Partners",
    category: "service",
    region: "DFW",
    specialty: "PE stamped load calcs",
    activeAssignments: 3,
    contact: "eng@structuralpe.com",
    lastCoordination: "2026-06-09",
    status: "Active",
  },
];
