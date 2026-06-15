"use client";

import { useMemo, useState } from "react";

import { Copy, Sparkles, Terminal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type AIEscalationButtonProps = {
  projectName: string;
  brandEntity: string;
  utilityAuthority: string;
  permitNumber: string;
  daysStale: number;
  className?: string;
};

export function buildEscalationEmail({
  projectName,
  brandEntity,
  utilityAuthority,
  permitNumber,
  daysStale,
}: AIEscalationButtonProps) {
  return `Subject: URGENT: Interconnection Status Inquiry - ${projectName} (${permitNumber})

Dear ${utilityAuthority},

I am writing on behalf of ${brandEntity} regarding the active engineering review for the ${projectName} project. Our documentation indicates that the initial submittal packet was confirmed received ${daysStale} business days ago.

As this commercial facility is currently holding installation schedules, we request an expedited update on any pending engineering variances or outstanding documentation holds.

Best Regards,
YS Ops Demo Automated Dispatch`;
}

export function AIEscalationButton({
  projectName,
  brandEntity,
  utilityAuthority,
  permitNumber,
  daysStale,
  className,
}: AIEscalationButtonProps) {
  const [open, setOpen] = useState(false);
  const draft = useMemo(
    () =>
      buildEscalationEmail({
        projectName,
        brandEntity,
        utilityAuthority,
        permitNumber,
        daysStale,
      }),
    [projectName, brandEntity, utilityAuthority, permitNumber, daysStale],
  );
  const [emailText, setEmailText] = useState(draft);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) setEmailText(draft);
    setOpen(nextOpen);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(emailText);
      toast.success("AI email draft copied to system clipboard.");
    } catch {
      toast.error("Unable to copy draft to clipboard.");
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(
          "h-8 gap-1.5 rounded-md border border-[#1B1B3A]/10 bg-[#FFFFFF] px-3 py-1.5 font-mono text-[#1B1B3A]/80 text-xs shadow-sm transition-all hover:border-[#00F5D4]/50 hover:bg-[#F7F7FF] hover:text-[#6A00FF]",
          className,
        )}
        onClick={() => handleOpenChange(true)}
      >
        <Sparkles className="size-3.5 text-amber-500" />
        AI Escalation Draft
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="gap-0 overflow-hidden border-[#00F5D4]/20 bg-[#F7F7FF] p-0 text-[#1B1B3A] sm:max-w-2xl"
          showCloseButton
        >
          <DialogHeader className="border-[#00F5D4]/20 border-b bg-[#FFFFFF]/95 px-5 py-4">
            <DialogTitle className="flex items-center gap-2 font-mono text-[#6A00FF] text-sm uppercase tracking-wider">
              <Terminal className="size-4" />
              AI Escalation Console
            </DialogTitle>
            <DialogDescription className="font-mono text-[#1B1B3A]/55 text-[11px]">
              Automated dispatch template · {projectName} · {permitNumber} · {daysStale}d stale
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 px-5 py-4">
            <div className="rounded-md border border-emerald-500/15 bg-slate-950 p-3 font-mono text-[11px] text-emerald-300">
              <p>&gt; context.load({`{ authority: "${utilityAuthority}", brand: "${brandEntity}" }`})</p>
              <p>&gt; template.render("interconnection_escalation_v2")</p>
              <p className="text-emerald-400">&gt; status: draft_ready</p>
            </div>

            <Textarea
              value={emailText}
              onChange={(event) => setEmailText(event.target.value)}
              className="min-h-72 resize-y border-[#1B1B3A]/10 bg-[#FFFFFF]/95 font-mono text-[#1B1B3A] text-xs leading-relaxed"
              spellCheck={false}
            />
          </div>

          <DialogFooter className="border-[#00F5D4]/20 border-t bg-[#FFFFFF]/95 px-5 py-4 sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              className="text-[#1B1B3A]/70 hover:text-[#6A00FF]"
              onClick={() => setOpen(false)}
            >
              Dismiss
            </Button>
            <Button type="button" className="gap-2 bg-emerald-600 hover:bg-emerald-500" onClick={handleCopy}>
              <Copy className="size-4" />
              Copy Text
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
