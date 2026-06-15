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
  "grid h-auto w-full grid-cols-1 gap-2 rounded-xl border border-border bg-muted/30 p-2 shadow-sm sm:grid-cols-3";

const enterpriseTabTriggerClass =
  "group/tab h-auto min-h-[4.5rem] w-full flex-none cursor-pointer justify-start whitespace-normal rounded-lg border border-border bg-card px-3 py-3 text-foreground shadow-sm transition-all hover:border-[color-mix(in_oklab,var(--brand-3sk)_28%,transparent)] hover:bg-card hover:shadow-md data-[state=active]:border-[color-mix(in_oklab,var(--brand-3sk)_45%,transparent)] data-[state=active]:bg-[var(--brand-3sk-bg)] data-[state=active]:text-[var(--brand-3sk-text)] data-[state=active]:shadow-md [&_svg]:size-[1.125rem] [&_svg]:shrink-0";

function EnterpriseTabLabel({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof Activity;
  title: string;
  subtitle: string;
}) {
  return (
    <span className="flex w-full min-w-0 items-start gap-3 text-left">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground shadow-sm group-data-[state=active]/tab:border-[color-mix(in_oklab,var(--brand-3sk)_35%,transparent)] group-data-[state=active]/tab:bg-card group-data-[state=active]/tab:text-[var(--brand-3sk)]">
        <Icon />
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block font-semibold text-sm tracking-tight">{title}</span>
        <span className="mt-1 block text-[11px] text-muted-foreground leading-snug group-data-[state=active]/tab:text-[var(--brand-3sk-text)]/85">
          {subtitle}
        </span>
      </span>
    </span>
  );
}

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
        <TabsList className={cn(enterpriseTabListClass)}>
          <TabsTrigger value="pipeline" className={enterpriseTabTriggerClass}>
            <EnterpriseTabLabel
              icon={Activity}
              title="Commercial Pipeline"
              subtitle="B2B deals & OpenSolar sync"
            />
          </TabsTrigger>
          <TabsTrigger value="telemetry" className={enterpriseTabTriggerClass}>
            <EnterpriseTabLabel
              icon={RadioTower}
              title="Telemetry Analytics"
              subtitle="SolarEdge & SCADA live data"
            />
          </TabsTrigger>
          <TabsTrigger value="engineering" className={enterpriseTabTriggerClass}>
            <EnterpriseTabLabel
              icon={Ruler}
              title="Engineering Milestones"
              subtitle="CAD, permits & BOM allocator"
            />
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
