import { Activity, RadioTower, Ruler } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  activeCommercialProjects,
  commercialPipelineData,
  isCommercialPipeline,
  openCommercialPipelineBalance,
} from "@/data/demo/pipeline";
import { fetchPipelineProjects } from "@/lib/sheet-mappers";

import { CommercialPipelineTab } from "./_components/commercial-pipeline-tab";
import { EngineeringMilestonesTab } from "./_components/engineering-milestones-tab";
import { TelemetryTab } from "./_components/telemetry-tab";

async function fetchCommercialPipeline() {
  try {
    const projects = await fetchPipelineProjects();
    const commercial = projects.filter(isCommercialPipeline);
    if (commercial.length) {
      return {
        projects: commercial,
        openPipelineBalance: commercial.reduce((sum, project) => sum + project.projectValue, 0),
        activeProjects: commercial.filter(
          (project) => project.pipelineStage !== "DocuSign Executed" || project.pipelinePhase !== "Commissioning",
        ).length,
      };
    }
  } catch {
    // Fall back to demo dataset below.
  }

  return {
    projects: commercialPipelineData,
    openPipelineBalance: openCommercialPipelineBalance,
    activeProjects: activeCommercialProjects,
  };
}

export default async function Page() {
  const pipeline = await fetchCommercialPipeline();

  return (
    <div className="flex flex-col gap-3 md:gap-4">
      <div className="flex flex-col gap-1 border-b pb-3">
        <h1 className="font-semibold text-2xl tracking-tight">Enterprise Hub</h1>
        <p className="max-w-3xl text-muted-foreground text-sm">
          High-ticket commercial pipeline, infrastructure telemetry, and engineering milestone tracking for Solar 3SK
          and Yellow Star Power.
        </p>
      </div>

      <Tabs defaultValue="pipeline" className="flex flex-col gap-4">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto p-1 md:w-fit">
          <TabsTrigger value="pipeline" className="gap-2">
            <Activity className="size-4" />
            Commercial Pipeline
          </TabsTrigger>
          <TabsTrigger value="telemetry" className="gap-2">
            <RadioTower className="size-4" />
            Telemetry Analytics
          </TabsTrigger>
          <TabsTrigger value="engineering" className="gap-2">
            <Ruler className="size-4" />
            Engineering Milestones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="m-0">
          <CommercialPipelineTab
            projects={pipeline.projects}
            openPipelineBalance={pipeline.openPipelineBalance}
            activeProjects={pipeline.activeProjects}
          />
        </TabsContent>

        <TabsContent value="telemetry" className="m-0">
          <TelemetryTab />
        </TabsContent>

        <TabsContent value="engineering" className="m-0">
          <EngineeringMilestonesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const dynamic = "force-dynamic";

export const revalidate = 0;
