import { Bot, MailCheck, Send, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
    <Card className={dashPlatformCardClass}>
      <CardHeader className={dashCardHeaderClass}>
        <CardTitle className="flex items-center gap-2">
          <MailCheck className={cn("size-5", entityBrandStyles.solar3k.icon)} />
          Gmail Draft Queue
        </CardTitle>
        <CardDescription>
          Work queue for vendor follow-ups, AHJ escalations, and calendar reminders generated from workbook rows.
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("grid gap-3", dashCardContentClass)}>
        {draftQueue.map((item) => (
          <div key={item.title} className="rounded-xl border border-border bg-muted/40 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="font-semibold text-foreground text-sm">{item.title}</h2>
                <p className="mt-1 text-muted-foreground text-xs">{item.source}</p>
              </div>
              <Badge variant="outline" className={cn("font-mono", statusStyles.info)}>
                {item.status}
              </Badge>
            </div>
            <div className="mt-3 grid gap-2 font-mono text-[11px] text-muted-foreground md:grid-cols-[9rem_1fr]">
              <span className="text-foreground">Trigger</span>
              <span>{item.trigger}</span>
              <span className="text-foreground">Row fields</span>
              <span>{item.fields}</span>
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
      <CardHeader className={dashCardHeaderClass}>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className={cn("size-5", entityBrandStyles.solar2sk.icon)} />
          Gmail API Draft Worker
        </CardTitle>
        <CardDescription>
          Backend implementation contract for creating drafts without exposing Google credentials to the browser.
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("grid gap-4 lg:grid-cols-[0.9fr_1.3fr]", dashCardContentClass)}>
        <div className={cn(dashCodeBlockSmClass, "space-y-3 text-xs leading-relaxed")}>
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
        <pre className={cn(dashCodeBlockClass, "max-h-[26rem] text-[10px]")}>
          <code>{gmailDraftWorker}</code>
        </pre>
      </CardContent>
    </Card>
  );
}

function AiDraftingCard() {
  return (
    <Card className={dashSurfaceCardClass}>
      <CardHeader className={dashCardHeaderClass}>
        <CardTitle className="flex items-center gap-2">
          <Bot className={cn("size-5", entityBrandStyles.systems.icon)} />
          AI Draft Generation Contract
        </CardTitle>
        <CardDescription>
          Controlled prompt rules for turning workbook metadata into short, reviewable operations email drafts.
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("grid gap-4 lg:grid-cols-[1fr_1fr]", dashCardContentClass)}>
        <pre className={cn(dashCodeBlockClass, "overflow-auto text-[10px]")}>
          <code>{aiDraftPromptContract}</code>
        </pre>
        <div className={cn("rounded-xl border border-border bg-muted/40 p-4 text-xs leading-relaxed", dashProseClass)}>
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

      <div className="grid gap-4 md:grid-cols-3">
        <Card size="sm" className={cn(dashSurfaceCardClass, entityBrandStyles.solar3k.accentBar)}>
          <CardHeader className={dashCardHeaderClass}>
            <CardDescription className="flex items-center gap-2 text-xs">
              <MailCheck className={cn("size-4", entityBrandStyles.solar3k.icon)} /> Drafts Waiting Review
            </CardDescription>
            <CardTitle className={dashKpiValueClass}>3</CardTitle>
          </CardHeader>
          <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
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
          <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
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
          <CardContent className={cn("text-muted-foreground text-xs", dashCardContentClass)}>
            Server-only Google client creates drafts; workbook stores draft IDs for audit.
          </CardContent>
        </Card>
      </div>

      <DraftQueueCard />
      <GmailApiProofCard />
      <AiDraftingCard />
    </div>
  );
}
