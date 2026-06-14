import type { EntityBrand } from "./types";

export interface ProjectMilestone {
  id: string;
  projectName: string;
  clientAsset: string;
  entityBrand: EntityBrand;
  systemSizeKw: number;
  phase: string;
  interconnectionStatus: string;
  engineerAssigned: string;
  columnId: "structural" | "interconnection" | "commissioned" | "live";
}

export const milestonesData: ProjectMilestone[] = [
  {
    id: "ms-001",
    projectName: "DFW Retail Plaza Phase II",
    clientAsset: "DFW Retail Holdings",
    entityBrand: "Solar3K",
    systemSizeKw: 120,
    phase: "Structural Load Testing",
    interconnectionStatus: "Pending Utility Review",
    engineerAssigned: "T. Khan",
    columnId: "structural",
  },
  {
    id: "ms-002",
    projectName: "Hunt County Asset Expansion",
    clientAsset: "Yellow Star Power",
    entityBrand: "Yellow Star",
    systemSizeKw: 60,
    phase: "Commissioned",
    interconnectionStatus: "Approved & Live",
    engineerAssigned: "S. Khan",
    columnId: "live",
  },
  {
    id: "ms-003",
    projectName: "Collin County Utility Expansion",
    clientAsset: "Collin County Utility",
    entityBrand: "Solar3K",
    systemSizeKw: 150,
    phase: "OpenSolar Design Complete",
    interconnectionStatus: "Oncor App Filed",
    engineerAssigned: "T. Khan",
    columnId: "interconnection",
  },
  {
    id: "ms-004",
    projectName: "Frisco Office Complex",
    clientAsset: "Frisco Commercial LLC",
    entityBrand: "Solar3K",
    systemSizeKw: 85,
    phase: "PE Stamped Drawings",
    interconnectionStatus: "Not Started",
    engineerAssigned: "Design Partner",
    columnId: "structural",
  },
  {
    id: "ms-005",
    projectName: "Wylie Industrial Microgrid",
    clientAsset: "Wylie Industrial Park",
    entityBrand: "Yellow Star",
    systemSizeKw: 300,
    phase: "Interconnection Review",
    interconnectionStatus: "Pending Utility Review",
    engineerAssigned: "T. Khan",
    columnId: "interconnection",
  },
  {
    id: "ms-006",
    projectName: "TechPlex Roof Array",
    clientAsset: "TechPlex LLC",
    entityBrand: "Solar3K",
    systemSizeKw: 45,
    phase: "Final Inspection",
    interconnectionStatus: "Approved",
    engineerAssigned: "S. Khan",
    columnId: "commissioned",
  },
];

export const activeCiPipelineMw =
  milestonesData.filter((m) => m.columnId !== "live").reduce((sum, m) => sum + m.systemSizeKw, 0) / 1000;
