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
import { dashCodeBlockSmClass, statusStyles } from "@/lib/entity-brand";
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
          "h-8 gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 font-mono text-foreground text-xs shadow-sm transition-all hover:border-[color-mix(in_oklab,var(--brand-3sk)_30%,transparent)] hover:bg-muted/40",
          className,
        )}
        onClick={() => handleOpenChange(true)}
      >
        <Sparkles className="size-3.5 text-amber-500" />
        AI Escalation Draft
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="gap-0 overflow-hidden border-border bg-muted/40 p-0 text-foreground sm:max-w-2xl"
          showCloseButton
        >
          <DialogHeader className="border-border border-b bg-card px-5 py-4">
            <DialogTitle className="flex items-center gap-2 font-mono text-[var(--brand-3sk-text)] text-sm uppercase tracking-wider">
              <Terminal className="size-4" />
              AI Escalation Console
            </DialogTitle>
            <DialogDescription className="font-mono text-[11px] text-muted-foreground">
              Automated dispatch template · {projectName} · {permitNumber} · {daysStale}d stale
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 px-5 py-4">
            <div className={dashCodeBlockSmClass}>
              <p>&gt; context.load({`{ authority: "${utilityAuthority}", brand: "${brandEntity}" }`})</p>
              <p>&gt; template.render("interconnection_escalation_v2")</p>
              <p className="text-[var(--status-live)]">&gt; status: draft_ready</p>
            </div>

            <Textarea
              value={emailText}
              onChange={(event) => setEmailText(event.target.value)}
              className="min-h-72 resize-y border-border bg-card font-mono text-foreground text-xs leading-relaxed"
              spellCheck={false}
            />
          </div>

          <DialogFooter className="border-border border-t bg-card px-5 py-4 sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              Dismiss
            </Button>
            <Button type="button" className={cn("gap-2", statusStyles.live)} onClick={handleCopy}>
              <Copy className="size-4" />
              Copy Text
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
