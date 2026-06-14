import type { EntityBrand } from "./types";

export type PipelineStage =
  | "New Lead"
  | "OpenSolar Design"
  | "Active Bid Out"
  | "DocuSign Executed"
  | "Interconnection Review";

export type ProjectType = "Residential DIY" | "Commercial Rooftop" | "Utility Portfolio" | "Gov Asset";

export interface PipelineProject {
  id: string;
  clientName: string;
  entityBrand: EntityBrand;
  systemSizeKw: number;
  projectType: ProjectType;
  pipelineStage: PipelineStage;
  projectValue: number;
}

export const crmPipelineData: PipelineProject[] = [
  {
    id: "pipe-101",
    clientName: "Collin County Utility Expansion",
    entityBrand: "Solar3K",
    systemSizeKw: 150,
    projectType: "Commercial Rooftop",
    pipelineStage: "Active Bid Out",
    projectValue: 185000,
  },
  {
    id: "pipe-102",
    clientName: "Marcus Vance (DIY Kit Order)",
    entityBrand: "Solar2SK",
    systemSizeKw: 3.5,
    projectType: "Residential DIY",
    pipelineStage: "New Lead",
    projectValue: 4200,
  },
  {
    id: "pipe-103",
    clientName: "DFW Retail Plaza Phase II",
    entityBrand: "Solar3K",
    systemSizeKw: 120,
    projectType: "Commercial Rooftop",
    pipelineStage: "Interconnection Review",
    projectValue: 145000,
  },
  {
    id: "pipe-104",
    clientName: "Hunt County Asset Expansion",
    entityBrand: "Yellow Star",
    systemSizeKw: 60,
    projectType: "Utility Portfolio",
    pipelineStage: "DocuSign Executed",
    projectValue: 98000,
  },
  {
    id: "pipe-105",
    clientName: "Frisco Office Complex",
    entityBrand: "Solar3K",
    systemSizeKw: 85,
    projectType: "Commercial Rooftop",
    pipelineStage: "OpenSolar Design",
    projectValue: 112000,
  },
  {
    id: "pipe-106",
    clientName: "Garrett Miller",
    entityBrand: "Solar2SK",
    systemSizeKw: 5.2,
    projectType: "Residential DIY",
    pipelineStage: "New Lead",
    projectValue: 6800,
  },
  {
    id: "pipe-107",
    clientName: "Wylie Industrial Park",
    entityBrand: "Yellow Star",
    systemSizeKw: 300,
    projectType: "Gov Asset",
    pipelineStage: "Active Bid Out",
    projectValue: 450000,
  },
  {
    id: "pipe-108",
    clientName: "TechPlex LLC",
    entityBrand: "Solar3K",
    systemSizeKw: 45,
    projectType: "Commercial Rooftop",
    pipelineStage: "OpenSolar Design",
    projectValue: 67000,
  },
];
