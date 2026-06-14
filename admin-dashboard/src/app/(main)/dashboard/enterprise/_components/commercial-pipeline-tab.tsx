"use client";

import { AlertTriangle, Briefcase, FileWarning, Gauge, Sigma } from "lucide-react";

import { AIEscalationButton } from "@/components/ai-escalation-button";
import { EntityBrandBadge } from "@/components/dashboard/entity-brand-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PipelineProject } from "@/data/demo/pipeline";
import {
  dashCardClass,
  dashCardContentClass,
  dashCardHeaderClass,
  dashKpiGrid3Class,
  dashSectionCardContentClass,
  dashSectionCardHeaderClass,
} from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { currency: "USD", maximumFractionDigits: 0, style: "currency" }).format(value);
}

type CommercialPipelineTabProps = {
  projects: PipelineProject[];
  openPipelineBalance: number;
  activeProjects: number;
};

function activeCapacityMw(projects: PipelineProject[]) {
  return projects.reduce((sum, project) => sum + project.systemSizeKw, 0) / 1000;
}

function staleDays(project: PipelineProject, index: number) {
  if (
    /hold|awaiting|pending|interconnection|permit|utility/i.test(
      `${project.pipelineStage} ${project.pipelinePhase} ${project.nextCriticalPath}`,
    )
  ) {
    return 31 + index * 4;
  }
  return 7 + index;
}

function permitNumber(project: PipelineProject, index: number) {
  const prefix = project.pipelinePhase.toLowerCase().includes("permit")
    ? "AL-ZON"
    : project.pipelinePhase.toLowerCase().includes("interconnection")
      ? "ONC-INT"
      : "ENG-REV";
  return `${prefix}-${4412 + index}`;
}

function utilityAuthority(project: PipelineProject) {
  const text = `${project.clientName} ${project.nextCriticalPath}`.toLowerCase();
  if (text.includes("plano")) return "City of Plano / Oncor";
  if (text.includes("mckinney")) return "City of McKinney / Oncor";
  if (text.includes("denton")) return "Denton Municipal Electric";
  if (text.includes("frisco")) return "City of Frisco / Oncor";
  return "Oncor Interconnection Desk";
}

function phaseBadgeClass(project: PipelineProject) {
  const phase = `${project.pipelineStage} ${project.pipelinePhase}`.toLowerCase();
  if (phase.includes("hold") || phase.includes("awaiting")) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300";
  }
  if (phase.includes("executed") || phase.includes("approved")) {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }
  return "border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300";
}

function shouldShowEscalation(project: PipelineProject) {
  return /McKinney Logistics Hub|Frisco Commercial Plaza|Wylie Industrial Microgrid/i.test(project.clientName);
}

function escalationBrand(project: PipelineProject) {
  return project.entityBrand === "Yellow Star" ? "YSP" : "3SK";
}

function PipelineKpiStrip({
  activeProjects,
  openPipelineBalance,
  projects,
}: Pick<CommercialPipelineTabProps, "activeProjects" | "openPipelineBalance" | "projects">) {
  const bidValue = projects
    .filter((project) => project.pipelineStage === "Active Bid Out" || project.pipelineStage === "OpenSolar Design")
    .reduce((sum, project) => sum + project.projectValue, 0);
  const underConstruction = projects
    .filter(
      (project) =>
        project.pipelineStage === "DocuSign Executed" ||
        project.pipelineStage === "Engineering Hold" ||
        project.pipelineStage === "Interconnection Review",
    )
    .reduce((sum, project) => sum + project.projectValue, 0);
  const alerts = projects.filter((project, index) => staleDays(project, index) >= 31).length;

  return (
    <div className={cn(dashKpiGrid3Class, "grid-cols-1 gap-3 md:grid-cols-3")}>
      <Card size="sm" className={cn("border-indigo-500 border-l-4", dashCardClass)}>
        <CardHeader className={dashCardHeaderClass}>
          <CardDescription className="flex items-center gap-2 text-xs">
            <Sigma className="size-4 text-indigo-500" />
            Open B2B Pipeline Value
          </CardDescription>
          <CardTitle className="font-mono text-2xl tabular-nums">{formatCurrency(openPipelineBalance)}</CardTitle>
        </CardHeader>
        <CardContent className={cn("grid gap-1.5 text-xs", dashCardContentClass)}>
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Bids Pending</span>
            <span className="font-medium font-mono">{formatCurrency(bidValue)}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Contracts Under Construction</span>
            <span className="font-medium font-mono">{formatCurrency(underConstruction)}</span>
          </div>
        </CardContent>
      </Card>
      <Card size="sm" className={cn("border-blue-500 border-l-4", dashCardClass)}>
        <CardHeader className={dashCardHeaderClass}>
          <CardDescription className="flex items-center gap-2 text-xs">
            <Gauge className="size-4 text-blue-500" />
            Active Consulting MW Capacity
          </CardDescription>
          <CardTitle className="font-mono text-2xl tabular-nums">{activeCapacityMw(projects).toFixed(2)} MW</CardTitle>
        </CardHeader>
        <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
          {activeProjects} active 3SK commercial and utility engineering workstreams.
        </CardContent>
      </Card>
      <Card size="sm" className={cn("border-amber-500 border-l-4", dashCardClass)}>
        <CardHeader className={dashCardHeaderClass}>
          <CardDescription className="flex items-center gap-2 text-xs">
            <FileWarning className="size-4 text-amber-500" />
            SLA Milestone Alerts
          </CardDescription>
          <CardTitle className="font-mono text-2xl tabular-nums">{alerts}</CardTitle>
        </CardHeader>
        <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
          Architectural, utility, or municipal checks requiring owner-visible follow-up.
        </CardContent>
      </Card>
    </div>
  );
}

function formatProjectAssetLabel(project: PipelineProject) {
  const valueLabel = `$${Math.round(project.projectValue / 1000)}k`;
  return `${project.clientName} (${valueLabel}) - Current Stage: ${project.pipelinePhase}`;
}

export function CommercialPipelineTab({ projects, openPipelineBalance, activeProjects }: CommercialPipelineTabProps) {
  return (
    <div className="flex flex-col gap-3">
      <PipelineKpiStrip openPipelineBalance={openPipelineBalance} activeProjects={activeProjects} projects={projects} />

      <Card size="sm" className={cn("border-indigo-500 border-l-4", dashCardClass)}>
        <CardHeader className={dashSectionCardHeaderClass}>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="size-5" />
            3SK Commercial Operations Matrix
          </CardTitle>
          <CardDescription>
            Multi-million dollar milestone progressions - structural design, utility interconnection, and DocuSign
            contract states.
          </CardDescription>
        </CardHeader>
        <CardContent className={dashSectionCardContentClass}>
          <div className="scrollbar-none block w-full overflow-x-auto rounded-md border">
            <Table className="min-w-[1120px]">
              <TableHeader>
                <TableRow className="h-9">
                  <TableHead>Project Asset</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead className="text-right">Capacity</TableHead>
                  <TableHead>Phase</TableHead>
                  <TableHead className="text-right">Contract Value</TableHead>
                  <TableHead>Tracking</TableHead>
                  <TableHead>Next Critical Path</TableHead>
                  <TableHead className="text-right">Automated Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project, index) => {
                  const daysStale = staleDays(project, index);
                  const authority = utilityAuthority(project);
                  const permit = permitNumber(project, index);
                  return (
                    <TableRow key={project.id} className="h-11 border-indigo-500/70 border-l-4">
                      <TableCell className="max-w-xs whitespace-normal py-2 font-medium">
                        <div>{formatProjectAssetLabel(project)}</div>
                        <div className="mt-1 font-mono text-[11px] text-muted-foreground">{project.id}</div>
                      </TableCell>
                      <TableCell className="py-2">
                        <EntityBrandBadge
                          brand={project.entityBrand}
                          className="border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                        />
                      </TableCell>
                      <TableCell className="py-2 text-right font-mono tabular-nums">
                        {project.systemSizeKw} kW
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge variant="outline" className={cn("h-6", phaseBadgeClass(project))}>
                          {project.pipelinePhase}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 text-right font-mono font-semibold tabular-nums">
                        {formatCurrency(project.projectValue)}
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="grid gap-1 font-mono text-[11px]">
                          <span>{permit}</span>
                          <span className="text-muted-foreground">{daysStale}d stale</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-sm whitespace-normal py-2">
                        <span className="flex items-start gap-2 text-sm">
                          {daysStale >= 31 ? (
                            <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
                          ) : null}
                          {project.nextCriticalPath}
                        </span>
                      </TableCell>
                      <TableCell className="py-2 text-right">
                        {shouldShowEscalation(project) ? (
                          <AIEscalationButton
                            projectName={project.clientName}
                            brandEntity={escalationBrand(project)}
                            utilityAuthority={authority}
                            permitNumber={permit}
                            daysStale={daysStale}
                          />
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
