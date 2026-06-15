import { Bot, MailCheck, Send } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DashImplementationLabel } from "@/components/dashboard/implementation-label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  dashCardContentClass,
  dashCardHeaderClass,
  dashPageClass,
  dashPageHeaderClass,
  dashPlatformCardClass,
  dashSurfaceCardClass,
} from "@/lib/dashboard-ui";
import {
  dashCodeBlockClass,
  dashCodeBlockSmClass,
  dashKpiValueClass,
  dashProseClass,
  entityBrandStyles,
  statusStyles,
} from "@/lib/entity-brand";
import { implementationLabels } from "@/lib/implementation-labels";
import { cn } from "@/lib/utils";

const draftQueue = [
  {
    title: "Vendor COI Renewal Follow-up",
    source: "Vendor Ops -> North TX Racking Crews",
    trigger: "COI expiration inside 14-day window",
    fields: "vendorName, vendorEmail, driveFolderUrl, complianceStatus",
    status: "Needs Review",
  },
  {
    title: "AHJ Escalation Draft",
    source: "Permitting Queue -> City of McKinney / Oncor",
    trigger: "DaysStale > 30 or Permit Status = STALE_AHJ_REVIEW",
    fields: "projectName, authority, permitNumber, daysStale, missingRequirement",
    status: "Escalation Ready",
  },
  {
    title: "Calendar Reminder Email",
    source: "Calendar tab -> Vendor / AHJ meeting",
    trigger: "Meeting Status = Needs Reminder",
    fields: "meetingDate, attendeeEmail, vendorOrAhj, project, nextAction",
    status: "Draft Queued",
  },
];

const gmailDraftWorker = `import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';

export interface EmailDraftPayload {
  to: string;
  subject: string;
  body: string;
}

/**
 * Creates a pending draft inside the user's authenticated mailbox.
 * Requires user OAuth consent or Workspace domain-wide delegation.
 */
export async function createGmailDraft(auth: OAuth2Client, draft: EmailDraftPayload) {
  const gmail = google.gmail({ version: 'v1', auth });

  const mime = [
    \`To: \${draft.to}\`,
    \`Subject: \${draft.subject}\`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    draft.body,
  ].join('\\r\\n');

  // Gmail REST API requires strict base64URL for message.raw.
  const raw = Buffer.from(mime)
    .toString('base64')
    .replace(/\\+/g, '-')
    .replace(/\\//g, '_')
    .replace(/=+$/, '');

  return gmail.users.drafts.create({
    userId: 'me',
    requestBody: {
      message: { raw },
    },
  });
}`;

const aiDraftPromptContract = `SYSTEM: You are drafting concise operations email copy.
INPUT: { entity, recipientRole, project, blocker, nextAction, dueDate }
RULES:
- Do not invent facts.
- Keep under 120 words.
- Preserve permit IDs, vendor names, dates, and row metadata exactly.
- Output subject + body + approval checklist.
HUMAN STEP: Builder Ops reviews the draft before Gmail API send.`;

function DraftQueueCard() {
  return (
    <Card className={cn("h-full", dashPlatformCardClass)}>
      <CardHeader className={cn("border-border border-b", dashCardHeaderClass)}>
        <CardTitle className="flex items-center gap-2">
          <MailCheck className={cn("size-5", entityBrandStyles.solar3k.icon)} />
          Gmail Draft Queue
        </CardTitle>
        <CardDescription>
          Work queue for vendor follow-ups, AHJ escalations, and calendar reminders generated from workbook rows.
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("grid max-h-[560px] gap-2.5 overflow-y-auto pr-1", dashCardContentClass)}>
        {draftQueue.map((item) => (
          <div key={item.title} className="rounded-lg border border-border bg-muted/40 p-3 transition-colors hover:border-[var(--brand-3sk)]/40">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="font-semibold text-foreground text-sm">{item.title}</h2>
                <p className="mt-1 text-muted-foreground text-xs">{item.source}</p>
              </div>
              <Badge variant="outline" className={cn("h-5 font-mono text-[10px]", statusStyles.info)}>
                {item.status}
              </Badge>
            </div>
            <div className="mt-2.5 grid gap-1.5 border-border border-t pt-2 font-mono text-[10px] text-muted-foreground">
              <span className="text-foreground">Trigger</span>
              <span className="line-clamp-2">{item.trigger}</span>
              <span className="text-foreground">Row fields</span>
              <span className="truncate">{item.fields}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function GmailApiProofCard() {
  return (
    <Card className={dashPlatformCardClass}>
      <CardHeader className={cn("border-border border-b", dashCardHeaderClass)}>
        <DashImplementationLabel variant={implementationLabels.inboxApiContract.variant}>
          {implementationLabels.inboxApiContract.title}
        </DashImplementationLabel>
        <CardDescription>
          Gmail API draft worker and OAuth boundary — backend contract for creating drafts without exposing Google
          credentials to the browser.
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("grid gap-3 lg:grid-cols-[0.8fr_1.35fr]", dashCardContentClass)}>
        <div className={cn(dashCodeBlockSmClass, "space-y-2 text-[11px] leading-snug")}>
          <p>
            <strong className="text-foreground">Flow:</strong> Sheet row / app event -&gt; server route validates row
            metadata -&gt; OAuth-authenticated Gmail client creates a draft -&gt; draft ID is written back to the workbook
            for audit and approval tracking.
          </p>
          <p>
            <strong className="text-foreground">Accuracy guardrail:</strong> Gmail drafts require user OAuth consent or
            Google Workspace domain-wide delegation. A plain service account by itself cannot create drafts inside a
            user mailbox.
          </p>
          <p>
            <strong className="text-foreground">Architecture note:</strong> Spreadsheet triggers can webhook row metadata
            into the Next.js backend. The server centralizes OAuth tokens, compiles AI context, and calls the Gmail REST
            API instead of exposing credentials to Apps Script snippets or the browser.
          </p>
        </div>
        <pre className={cn(dashCodeBlockClass, "max-h-[260px] text-[10px]")}>
          <code>{gmailDraftWorker}</code>
        </pre>
      </CardContent>
    </Card>
  );
}

function AiDraftingCard() {
  return (
    <Card className={dashSurfaceCardClass}>
      <CardHeader className={cn("border-border border-b", dashCardHeaderClass)}>
        <CardTitle className="flex items-center gap-2">
          <Bot className={cn("size-5", entityBrandStyles.systems.icon)} />
          Prompt Engineering Contract
        </CardTitle>
        <CardDescription>
          Controlled prompt rules for turning workbook metadata into short, reviewable operations email drafts.
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("grid gap-3 lg:grid-cols-[1.2fr_0.8fr]", dashCardContentClass)}>
        <pre className={cn(dashCodeBlockClass, "max-h-44 overflow-auto text-[10px]")}>
          <code>{aiDraftPromptContract}</code>
        </pre>
        <div className={cn("rounded-lg border border-border bg-muted/40 p-3 text-xs leading-snug", dashProseClass)}>
          <p>
            The AI layer should never send email directly. It receives only normalized row fields, drafts concise copy,
            preserves IDs/dates/names, and hands the message to a human approval queue before Gmail draft creation or
            send.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function InboxKpiStrip() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Card size="sm" className={cn(dashSurfaceCardClass, entityBrandStyles.solar3k.accentBar)}>
        <CardHeader className={dashCardHeaderClass}>
          <CardDescription className="flex items-center gap-2 text-xs">
            <MailCheck className={cn("size-4", entityBrandStyles.solar3k.icon)} /> Drafts Waiting Review
          </CardDescription>
          <CardTitle className={dashKpiValueClass}>3</CardTitle>
        </CardHeader>
        <CardContent className={cn("text-muted-foreground text-xs leading-snug", dashCardContentClass)}>
          Vendor, AHJ, and calendar reminder drafts generated from workbook metadata.
        </CardContent>
      </Card>
      <Card size="sm" className={dashSurfaceCardClass}>
        <CardHeader className={dashCardHeaderClass}>
          <CardDescription className="flex items-center gap-2 text-xs">
            <Bot className="size-4" /> AI-Assisted Drafts
          </CardDescription>
          <CardTitle className={dashKpiValueClass}>2</CardTitle>
        </CardHeader>
        <CardContent className={cn("text-muted-foreground text-xs leading-snug", dashCardContentClass)}>
          Controlled prompt output awaiting human approval before any Gmail action.
        </CardContent>
      </Card>
      <Card size="sm" className={cn(dashSurfaceCardClass, entityBrandStyles.solar2sk.accentBar)}>
        <CardHeader className={dashCardHeaderClass}>
          <CardDescription className="flex items-center gap-2 text-xs">
            <Send className={cn("size-4", entityBrandStyles.solar2sk.icon)} /> Gmail API Path
          </CardDescription>
          <CardTitle className={dashKpiValueClass}>OAuth</CardTitle>
        </CardHeader>
        <CardContent className={cn("text-muted-foreground text-xs leading-snug", dashCardContentClass)}>
          Server-only Google client creates drafts; workbook stores draft IDs for audit.
        </CardContent>
      </Card>
    </div>
  );
}

function InboxWorkspace() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <DraftQueueCard />
      </div>
      <div className="grid gap-4 lg:col-span-7">
        <GmailApiProofCard />
        <AiDraftingCard />
      </div>
    </div>
  );
}

export default function InboxPage() {
  return (
    <div className={dashPageClass}>
      <div className={dashPageHeaderClass}>
        <h1 className="font-semibold text-2xl tracking-tight">Inbox & Drafting Automation</h1>
        <p className="max-w-3xl text-muted-foreground text-sm">
          Executive email management surface for Gmail draft queues, AI-assisted follow-ups, AHJ escalations, vendor
          reminders, and calendar-driven communications.
        </p>
      </div>

      <InboxKpiStrip />
      <InboxWorkspace />
    </div>
  );
}
