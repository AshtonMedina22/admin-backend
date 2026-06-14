import type { EntityBrand } from "./types";

export type PipelineStage =
  | "New Lead"
  | "OpenSolar Design"
  | "Active Bid Out"
  | "DocuSign Executed"
  | "Interconnection Review"
  | "Engineering Hold";

export type ProjectType = "Residential DIY" | "Commercial Rooftop" | "Utility Portfolio" | "Gov Asset";

export interface PipelineProject {
  id: string;
  clientName: string;
  entityBrand: EntityBrand;
  systemSizeKw: number;
  projectType: ProjectType;
  pipelineStage: PipelineStage;
  pipelinePhase: string;
  projectValue: number;
  nextCriticalPath: string;
}

export const crmPipelineData: PipelineProject[] = [
  {
    id: "pipe-101",
    clientName: "McKinney Logistics Hub",
    entityBrand: "Solar3K",
    systemSizeKw: 150,
    projectType: "Commercial Rooftop",
    pipelineStage: "DocuSign Executed",
    pipelinePhase: "Engineering Design Check",
    projectValue: 185000,
    nextCriticalPath:
      "File Oncor interconnection application; hand OpenSolar layout to structural engineers",
  },
  {
    id: "pipe-102",
    clientName: "Denton Multi-Family Array",
    entityBrand: "Solar3K",
    systemSizeKw: 200,
    projectType: "Commercial Rooftop",
    pipelineStage: "Active Bid Out",
    pipelinePhase: "Proposal Out",
    projectValue: 240000,
    nextCriticalPath: "Client active proposal review for 200kW grid integration model",
  },
  {
    id: "pipe-103",
    clientName: "Frisco Commercial Plaza",
    entityBrand: "Solar3K",
    systemSizeKw: 120,
    projectType: "Commercial Rooftop",
    pipelineStage: "Engineering Hold",
    pipelinePhase: "Engineering Hold",
    projectValue: 145000,
    nextCriticalPath:
      "Awaiting structural PE weight-load blueprint assessment from North Texas Structural PE Group",
  },
  {
    id: "pipe-104",
    clientName: "Hunt County Asset Expansion",
    entityBrand: "Yellow Star",
    systemSizeKw: 60,
    projectType: "Utility Portfolio",
    pipelineStage: "Interconnection Review",
    pipelinePhase: "Utility Interconnection",
    projectValue: 98000,
    nextCriticalPath: "Oncor on-site utility engineering field inspection window (June 22)",
  },
  {
    id: "pipe-105",
    clientName: "Plano Auto Body Shop",
    entityBrand: "Solar3K",
    systemSizeKw: 60,
    projectType: "Commercial Rooftop",
    pipelineStage: "OpenSolar Design",
    pipelinePhase: "Municipal Permitting",
    projectValue: 72000,
    nextCriticalPath: "Submit zoning variance paperwork to City of Plano Building Inspections (June 15)",
  },
  {
    id: "pipe-106",
    clientName: "Wylie Industrial Microgrid",
    entityBrand: "Yellow Star",
    systemSizeKw: 300,
    projectType: "Gov Asset",
    pipelineStage: "Active Bid Out",
    pipelinePhase: "Utility Interconnection",
    projectValue: 450000,
    nextCriticalPath: "DocuSign signature follow-up on Oncor interconnection scope",
  },
];

export function isCommercialPipeline(project: PipelineProject) {
  return project.projectType !== "Residential DIY";
}

export const commercialPipelineData = crmPipelineData.filter(isCommercialPipeline);

export const openCommercialPipelineBalance = commercialPipelineData.reduce((sum, project) => sum + project.projectValue, 0);

export const activeCommercialProjects = commercialPipelineData.filter(
  (project) => project.pipelineStage !== "DocuSign Executed" || project.pipelinePhase !== "Commissioning",
).length;
