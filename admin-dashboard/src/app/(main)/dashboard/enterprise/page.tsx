import { Activity, RadioTower, Ruler } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  activeCommercialProjects,
  commercialPipelineData,
  isCommercialPipeline,
  openCommercialPipelineBalance,
} from "@/data/demo/pipeline";
import { fetchPipelineProjects } from "@/lib/sheet-mappers";
import { cn } from "@/lib/utils";

import { CommercialPipelineTab } from "./_components/commercial-pipeline-tab";
import { EngineeringMilestonesTab } from "./_components/engineering-milestones-tab";
import { TelemetryTab } from "./_components/telemetry-tab";

const enterpriseTabTriggerClass =
  "gap-2 border border-transparent px-3 py-2 text-slate-400 transition-all hover:border-cyan-400/20 hover:bg-[#f2f8fc] hover:text-slate-950 data-[state=active]:border-cyan-400/40 data-[state=active]:bg-[#eef6ff] data-[state=active]:font-semibold data-[state=active]:text-sky-700 data-[state=active]:shadow-[0_0_18px_rgba(34,211,238,0.12)]";

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
      <div className="flex flex-col gap-1 border-[#dbe5ee] border-b pb-3">
        <h1 className="font-semibold text-2xl text-slate-950 tracking-tight">Enterprise Hub</h1>
        <p className="max-w-3xl text-slate-400 text-sm">
          High-ticket commercial pipeline, infrastructure telemetry, and engineering milestone tracking for 3SK and YSP.
        </p>
      </div>

      <Tabs defaultValue="telemetry" className="flex flex-col gap-4">
        <TabsList className="h-auto w-full max-w-xl justify-start gap-1 overflow-x-auto rounded-xl border border-[#dbe5ee] bg-[#ffffff]/90 p-1 shadow-[0_12px_35px_rgba(2,8,23,0.35)] md:w-fit">
          <TabsTrigger value="pipeline" className={cn(enterpriseTabTriggerClass)}>
            <Activity className="size-4" />
            Commercial Pipeline
          </TabsTrigger>
          <TabsTrigger value="telemetry" className={cn(enterpriseTabTriggerClass)}>
            <RadioTower className="size-4" />
            Telemetry Analytics
          </TabsTrigger>
          <TabsTrigger value="engineering" className={cn(enterpriseTabTriggerClass)}>
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
