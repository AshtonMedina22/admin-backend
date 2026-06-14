"use client";

import { AlertTriangle, Briefcase, DollarSign, Milestone } from "lucide-react";

import { EntityBrandBadge } from "@/components/dashboard/entity-brand-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PipelineProject } from "@/data/demo/pipeline";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { currency: "USD", maximumFractionDigits: 0, style: "currency" }).format(value);
}

type CommercialPipelineTabProps = {
  projects: PipelineProject[];
  openPipelineBalance: number;
  activeProjects: number;
};

function PipelineKpiStrip({ openPipelineBalance, activeProjects }: Pick<CommercialPipelineTabProps, "openPipelineBalance" | "activeProjects">) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="sm:col-span-2">
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <DollarSign className="size-4" />
            Open Commercial Pipeline Balance
          </CardDescription>
          <CardTitle className="text-3xl tabular-nums">{formatCurrency(openPipelineBalance)}</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-xs">
          Aggregate contract value across Solar 3SK consulting and Yellow Star utility assets - excludes retail DIY kits
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <Briefcase className="size-4" />
            Active Commercial Projects
          </CardDescription>
          <CardTitle className="text-3xl tabular-nums">{activeProjects}</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-xs">Engineering, interconnection, and utility bid phases in flight</CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <Milestone className="size-4" />
            Pipeline Type
          </CardDescription>
          <CardTitle className="text-base">High-ticket consulting</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-xs">Slow-moving B2B milestones - not warehouse SKU velocity</CardContent>
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
    <div className="flex flex-col gap-4">
      <PipelineKpiStrip openPipelineBalance={openPipelineBalance} activeProjects={activeProjects} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="size-5" />
            Commercial Contract Pipeline
          </CardTitle>
          <CardDescription>
            Multi-million dollar milestone progressions - structural design, utility interconnection, and DocuSign contract states.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Asset</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Phase</TableHead>
                  <TableHead className="text-right">Contract Value</TableHead>
                  <TableHead>Next Critical Path</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="max-w-md whitespace-normal font-medium">{formatProjectAssetLabel(project)}</TableCell>
                    <TableCell>
                      <EntityBrandBadge brand={project.entityBrand} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{project.pipelinePhase}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{formatCurrency(project.projectValue)}</TableCell>
                    <TableCell className="max-w-sm whitespace-normal">
                      <span className="flex items-start gap-2 text-sm">
                        {project.nextCriticalPath.toLowerCase().includes("awaiting") ||
                        project.nextCriticalPath.toLowerCase().includes("follow-up") ? (
                          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
                        ) : null}
                        {project.nextCriticalPath}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
