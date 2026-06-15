import { Activity, RadioTower, Ruler } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  activeCommercialProjects,
  commercialPipelineData,
  isCommercialPipeline,
  openCommercialPipelineBalance,
} from "@/data/demo/pipeline";
import { dashPageClass, dashPageHeaderClass } from "@/lib/dashboard-ui";
import { fetchPipelineProjects } from "@/lib/sheet-mappers";
import { cn } from "@/lib/utils";

import { CommercialPipelineTab } from "./_components/commercial-pipeline-tab";
import { EngineeringMilestonesTab } from "./_components/engineering-milestones-tab";
import { TelemetryTab } from "./_components/telemetry-tab";

const enterpriseTabTriggerClass =
  "gap-2 border border-transparent px-3 py-2 text-muted-foreground transition-all hover:border-border hover:bg-muted/40 hover:text-foreground data-[state=active]:border-[color-mix(in_oklab,var(--brand-3sk)_30%,transparent)] data-[state=active]:bg-muted/40 data-[state=active]:font-semibold data-[state=active]:text-[var(--brand-3sk-text)]";

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
    <div className={dashPageClass}>
      <div className={dashPageHeaderClass}>
        <h1 className="font-semibold text-2xl text-foreground tracking-tight">Enterprise Hub</h1>
        <p className="max-w-3xl text-muted-foreground text-sm">
          High-ticket commercial pipeline, infrastructure telemetry, and engineering milestone tracking for 3SK and YSP.
        </p>
      </div>

      <Tabs defaultValue="telemetry" className="flex flex-col gap-4">
        <TabsList className="h-auto w-full max-w-xl justify-start gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1 shadow-sm md:w-fit">
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
