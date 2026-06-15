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

const enterpriseTabListClass =
  "grid h-auto w-full grid-cols-1 gap-0 rounded-none border-border border-b bg-card/60 p-0 shadow-none sm:grid-cols-3";

const enterpriseTabTriggerClass =
  "flex h-auto min-h-11 w-full flex-none items-center justify-center gap-2 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 py-2.5 text-center text-xs font-medium text-muted-foreground uppercase tracking-wide shadow-none transition-all hover:bg-muted/30 hover:text-foreground sm:justify-start sm:text-left data-[state=active]:border-[var(--brand-3sk)] data-[state=active]:bg-[var(--brand-3sk-bg)] data-[state=active]:font-semibold data-[state=active]:text-[var(--brand-3sk-text)] [&_svg]:size-4 [&_svg]:shrink-0";

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
        <TabsList variant="line" className={cn(enterpriseTabListClass)}>
          <TabsTrigger value="pipeline" className={cn(enterpriseTabTriggerClass, "after:hidden")}>
            <Activity />
            <span className="leading-tight">
              <span className="block font-semibold text-[13px] sm:text-sm">Commercial Pipeline</span>
              <span className="mt-0.5 hidden font-normal text-[10px] text-muted-foreground normal-case tracking-normal xl:block">
                B2B deals & OpenSolar sync
              </span>
            </span>
          </TabsTrigger>
          <TabsTrigger value="telemetry" className={cn(enterpriseTabTriggerClass, "after:hidden")}>
            <RadioTower />
            <span className="leading-tight">
              <span className="block font-semibold text-[13px] sm:text-sm">Telemetry Analytics</span>
              <span className="mt-0.5 hidden font-normal text-[10px] text-muted-foreground normal-case tracking-normal xl:block">
                SolarEdge & SCADA live data
              </span>
            </span>
          </TabsTrigger>
          <TabsTrigger value="engineering" className={cn(enterpriseTabTriggerClass, "after:hidden")}>
            <Ruler />
            <span className="leading-tight">
              <span className="block font-semibold text-[13px] sm:text-sm">Engineering Milestones</span>
              <span className="mt-0.5 hidden font-normal text-[10px] text-muted-foreground normal-case tracking-normal xl:block">
                CAD, permits & BOM allocator
              </span>
            </span>
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
