"use client";

import { Bot, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type AIEscalationButtonProps = {
  projectName: string;
  brandEntity: string;
  daysStale: number;
  utilityAuthority: string;
  permitNumber?: string;
};

function buildEscalationEmail({
  projectName,
  brandEntity,
  daysStale,
  utilityAuthority,
  permitNumber,
}: AIEscalationButtonProps) {
  return `Subject: Escalation required - ${projectName}

${utilityAuthority} team,

Please confirm the current status for ${projectName}. This ${brandEntity} workstream has been stale for ${daysStale} day${daysStale === 1 ? "" : "s"} and is now blocking the executive operations dashboard.
${permitNumber ? `\nPermit / tracking reference: ${permitNumber}\n` : ""}

Requested update:
- Current interconnection or permitting status
- Missing documents or approvals
- Next available action window
- Responsible contact for closeout

Thank you.`;
}

export function AIEscalationButton(props: AIEscalationButtonProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 px-2 text-xs">
          <Bot className="size-3.5" />
          Draft
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="size-4" />
            Escalation Draft
          </DialogTitle>
          <DialogDescription>
            Context-aware follow-up generated from project, entity, stale-day, and authority fields.
          </DialogDescription>
        </DialogHeader>
        <pre className="max-h-[26rem] overflow-auto whitespace-pre-wrap rounded-md border bg-muted/35 p-4 font-mono text-xs leading-relaxed">
          {buildEscalationEmail(props)}
        </pre>
      </DialogContent>
    </Dialog>
  );
}
