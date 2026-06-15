import { EntityBrandBadge } from "@/components/dashboard/entity-brand-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { calendarEventsByDay } from "@/data/demo/calendar-events";
import {
  dashAlertBannerClass,
  dashPageClass,
  dashPlatformCardClass,
  dashSectionCardContentClass,
  dashSectionCardHeaderClass,
  dashSurfaceCardClass,
} from "@/lib/dashboard-ui";
import {
  dashCodeBlockClass,
  dashKpiValueClass,
  dashProseClass,
  entityAccentBarForLabel,
  entityBadgeClassForLabel,
  entityBrandStyles,
  statusStyles,
} from "@/lib/entity-brand";
import { cn } from "@/lib/utils";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type CalendarEvent = {
  brand: string;
  event?: string;
  type?: string;
  time?: string;
  notes?: string;
  text: string;
  variant: "default" | "secondary" | "outline";
};

export const defaultCalendarEvents: Record<number, CalendarEvent[]> = calendarEventsByDay();

const monthCells = Array.from({ length: 35 }, (_, index) => {
  const day = index;
  return {
    key: `june-2026-cell-${index}`,
    day: day >= 1 && day <= 30 ? day : null,
  };
});

function eventAccentClass(brand: string) {
  return entityAccentBarForLabel(brand);
}

function flattenEvents(calendarEvents: Record<number, CalendarEvent[]>) {
  return Object.entries(calendarEvents)
    .flatMap(([day, events]) => events.map((event) => ({ day: Number(day), ...event })))
    .sort((a, b) => a.day - b.day || String(a.time ?? "").localeCompare(String(b.time ?? "")));
}

const calendarSyncSteps = [
  "Calendar tab row is marked Ready to Schedule in the workbook.",
  "Apps Script sync reads unsynced rows and skips rows that already have a Calendar Event ID.",
  "Calendar.Events.insert() creates the meeting through the Advanced Calendar service.",
  "Calendar Event ID and status are written back to the same row for idempotent reruns.",
  "Needs Reminder rows create Gmail drafts with the same header-index mapping.",
];

const GOOGLE_CALENDAR_SYNC_SCRIPT = `/**
 * Synchronizes workbook rows with the enterprise Google Calendar.
 * Requires the "Google Calendar API" Advanced Service to be enabled.
 */
function syncCalendarRows() {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Calendar');
  if (!sheet) throw new Error('Data Integrity Fault: Calendar sheet tab not found.');

  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return;

  const headers = rows[0].map(String);
  const col = (name) => headers.indexOf(name);
  const calendarId = PropertiesService.getScriptProperties().getProperty('OPS_CALENDAR_ID');
  if (!calendarId) throw new Error('Configuration Fault: Missing OPS_CALENDAR_ID script property.');

  rows.slice(1).forEach((row, index) => {
    const statusIndex = col('Status');
    const eventIdIndex = col('Calendar Event ID');

    if (row[statusIndex] === 'Ready to Schedule' && !row[eventIdIndex]) {
      try {
        const eventResource = {
          summary: row[col('Meeting Title')],
          description: row[col('Next Action')],
          start: { dateTime: new Date(row[col('Start Time')]).toISOString() },
          end: { dateTime: new Date(row[col('End Time')]).toISOString() },
          attendees: String(row[col('Attendees')] || '')
            .split(',')
            .map((email) => ({ email: email.trim() }))
            .filter((attendee) => attendee.email),
          reminders: { useDefault: false, overrides: [{ method: 'email', minutes: 1440 }] },
        };

        const event = Calendar.Events.insert(eventResource, calendarId, { sendUpdates: 'all' });
        const sheetRow = index + 2;
        sheet.getRange(sheetRow, eventIdIndex + 1).setValue(event.id);
        sheet.getRange(sheetRow, statusIndex + 1).setValue('Scheduled');
      } catch (error) {
        console.error('Calendar insertion rejected on row ' + (index + 2) + ': ' + error.toString());
      }
    }

    if (row[statusIndex] === 'Needs Reminder') {
      buildMeetingReminderDraft(row, col);
      sheet.getRange(index + 2, statusIndex + 1).setValue('Reminder Drafted');
    }
  });
}`;

const GMAIL_REMINDER_DRAFT_SCRIPT = `function buildMeetingReminderDraft(rowArray, col) {
  try {
    GmailApp.createDraft(
      rowArray[col('Vendor Email')],
      'Ops Follow-Up: ' + rowArray[col('Project')] + ' / Schedule Target Confirmation',
      'Meeting Target Date: ' + rowArray[col('Meeting Date')] +
        '\nEntity/AHJ Endpoint: ' + rowArray[col('Vendor or AHJ')] +
        '\n\nNext Critical Path Action:\n' + rowArray[col('Next Action')],
      { name: 'Operations Scheduling Desk' }
    );
  } catch (error) {
    console.error('Gmail reminder draft generation failed: ' + error.toString());
  }
}`;

const actionItems = [
  {
    brand: "3SK",
    text: "Follow up with Alex Morgan on the McKinney Logistics Hub CAD blueprint adjustments.",
  },
  {
    brand: "2SK",
    text: "Verify warehouse pull inventory levels for the pending bulk Anenji hybrid inverter freight cargo.",
  },
  {
    brand: "YSP",
    text: "Review Oncor POI interconnection circuit line balance logs ahead of Friday's field review.",
  },
];

function TasksHeader() {
  return (
    <Card className={dashSurfaceCardClass}>
      <CardContent className="grid gap-2 p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-border bg-slate-50 px-2.5 py-1 font-mono text-[11px] text-muted-foreground uppercase tracking-[0.18em]">
            Task Management
          </span>
          <span className={cn("rounded-full px-2.5 py-1 font-mono text-[11px]", entityBrandStyles.solar3k.badge)}>
            3SK · 2SK · YSP
          </span>
        </div>
        <h1 className="text-balance font-bold text-2xl text-foreground tracking-tight md:text-3xl">Tasks & Schedule</h1>
        <p className={cn("max-w-3xl text-sm", dashProseClass)}>
          Operational timelines, multi-company action items, and document automation tracking.
        </p>
      </CardContent>
    </Card>
  );
}

function TaskAndDocumentDeck() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card className={cn("h-full", dashSurfaceCardClass)}>
        <CardHeader className={cn("border-border border-b", dashSectionCardHeaderClass)}>
          <CardTitle>Operational Action Items</CardTitle>
          <CardDescription>
            Current administrative and system priorities sorted by business entity handle.
          </CardDescription>
        </CardHeader>
        <CardContent className={cn("grid gap-2.5", dashSectionCardContentClass)}>
          {actionItems.map((item) => (
            <div
              key={item.text}
              className={cn(
                "rounded-lg border border-border bg-muted/40 px-3 py-2.5",
                entityAccentBarForLabel(item.brand),
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "rounded-md border px-2 py-1 font-mono font-semibold text-[11px] tracking-tight",
                    entityBadgeClassForLabel(item.brand),
                  )}
                >
                  {item.brand}
                </span>
                <p className={cn("font-mono text-xs leading-relaxed", dashProseClass)}>{item.text}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className={cn("h-full", dashSurfaceCardClass)}>
        <CardHeader className={cn("border-border border-b", dashSectionCardHeaderClass)}>
          <CardTitle>Automated Document Tracking</CardTitle>
          <CardDescription>
            Active status of spreadsheet-driven document generation and template workflows.
          </CardDescription>
        </CardHeader>
        <CardContent className={cn("grid gap-3", dashSectionCardContentClass)}>
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-foreground text-sm">Project Charter & Agreement Automation</h3>
              <span className={cn("rounded-full px-2 py-0.5 font-mono text-[10px]", statusStyles.live)}>
                Active Listener
              </span>
            </div>
            <p className={cn("mt-2 font-mono text-xs leading-relaxed", dashProseClass)}>
              Production wiring: DocuSign Connect completion event to Google Apps Script handler to formatted PDF compile
              to shared Google Drive asset folder upload.
            </p>
            <div className={cn("mt-2 border-border border-t pt-2 font-mono text-xs", dashProseClass)}>
              <strong className="text-foreground">Document Assembly Engineering:</strong> Production wiring would parse
              spreadsheet tracking arrays, initialize a Google Docs contract template, populate project metadata and
              custom tables, compile the final agreement PDF, and upload it into a permissioned Google Drive folder by
              entity, project, and document type.
            </div>
          </div>
          <Button className="h-9 w-full rounded-md border border-border bg-slate-50 px-3 font-mono text-foreground text-xs transition-all hover:bg-muted/40 active:scale-[0.98]">
            Re-Generate System Manifest PDF
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function CalendarApiSyncCard() {
  return (
    <Card className={cn("h-full", dashPlatformCardClass)}>
      <CardHeader className={cn("border-border border-b", dashSectionCardHeaderClass)}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-1">
            <CardTitle>Google Calendar API Sync</CardTitle>
            <CardDescription>
              Scripted scheduling workflow that turns workbook rows into idempotent calendar events, reminder drafts,
              and auditable row IDs.
            </CardDescription>
          </div>
          <span className={cn("w-fit rounded-full px-2.5 py-1 font-mono text-[10px]", entityBrandStyles.solar3k.badge)}>
            Calendar.Events.insert()
          </span>
        </div>
      </CardHeader>
      <CardContent className={cn("grid gap-4 lg:grid-cols-12", dashSectionCardContentClass)}>
        <div className="space-y-3 lg:col-span-4">
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className={cn("font-mono text-[11px] uppercase tracking-[0.18em]", entityBrandStyles.solar3k.text)}>
              Scheduling contract
            </p>
            <ol className="mt-3 space-y-2 text-muted-foreground text-xs leading-snug">
              {calendarSyncSteps.slice(0, 4).map((step, index) => (
                <li key={step} className="flex gap-2">
                  <span className={cn("font-mono tabular-nums", entityBrandStyles.solar3k.text)}>{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className={cn(dashAlertBannerClass, "font-mono text-xs leading-relaxed")}>
            <p>
              <strong>Advanced service dependency:</strong>{" "}
              <span className="font-mono">Calendar.Events.insert()</span> uses the Google Calendar API Advanced Service,
              which must be enabled in the Apps Script project before this syncer runs.
            </p>
          </div>
          <div className={cn(dashAlertBannerClass, "font-mono text-xs leading-relaxed")}>
            <strong>Gmail reminder draft companion:</strong> when a row's meeting status is
            <span> Needs Reminder</span>, Apps Script can build a Gmail draft containing the
            meeting date, vendor/AHJ, project, and next action for human review before sending.
          </div>
        </div>
        <div className="grid gap-3 lg:col-span-8">
          <pre className={cn(dashCodeBlockClass, "max-h-[260px] text-[10px]")}>
            <code>{GOOGLE_CALENDAR_SYNC_SCRIPT}</code>
          </pre>
          <pre className={cn(dashCodeBlockClass, "max-h-32 text-[10px]")}>
            <code>{GMAIL_REMINDER_DRAFT_SCRIPT}</code>
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}

function AgendaFeed({ events }: { events: Array<CalendarEvent & { day: number }> }) {
  return (
    <Card size="sm" className={cn("h-full", dashSurfaceCardClass)}>
      <CardHeader className={cn("border-border border-b", dashSectionCardHeaderClass)}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-1">
            <CardTitle>Upcoming Milestones</CardTitle>
            <CardDescription>
              Chronological timeline of active North Texas utility, municipal, and freight events.
            </CardDescription>
          </div>
          <span className={cn("rounded-full px-2.5 py-1 font-mono text-[11px]", entityBrandStyles.solar3k.badge)}>
            {events.length} scheduled
          </span>
        </div>
      </CardHeader>
      <CardContent className={dashSectionCardContentClass}>
        <div className="grid max-h-[420px] grid-cols-1 gap-2 overflow-y-auto pr-1">
          {events.map((event) => (
            <div
              key={`${event.day}-${event.brand}-${event.event || event.text}`}
              className={cn(
                "min-w-0 rounded-lg border border-border bg-slate-50 p-2.5",
                eventAccentClass(event.brand),
              )}
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className="grid w-14 shrink-0 justify-items-center rounded-lg border border-border bg-muted/40 px-2 py-1.5 text-center">
                  <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Jun</span>
                  <span className={cn(dashKpiValueClass, "text-xl leading-none")}>{event.day}</span>
                  {event.time ? (
                    <span className="mt-1 font-mono text-[10px] text-muted-foreground tabular-nums">{event.time}</span>
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                    <EntityBrandBadge brand={event.brand} className="h-5 px-1.5 text-[10px]" />
                    {event.type ? (
                      <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 font-medium text-[10px] text-muted-foreground">
                        {event.type}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="text-balance font-semibold text-sm leading-snug">{event.event || event.text}</h3>
                  <p className="mt-1 line-clamp-2 text-muted-foreground text-xs leading-snug">
                    {event.notes || event.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MonthViewReference({ calendarEvents }: { calendarEvents: Record<number, CalendarEvent[]> }) {
  return (
    <Card size="sm" className={cn("h-full", dashSurfaceCardClass)}>
      <CardHeader className={cn("border-border border-b", dashSectionCardHeaderClass)}>
        <CardTitle>Month View Reference</CardTitle>
        <CardDescription>Compact 7-column planning reference for desktop review.</CardDescription>
      </CardHeader>
      <CardContent className={dashSectionCardContentClass}>
        <div className="grid grid-cols-7 border-border border-t border-l text-sm">
          {weekdays.map((weekday) => (
            <div
              key={weekday}
              className="border-border border-r border-b bg-muted/30 px-2 py-1 font-medium text-muted-foreground text-[11px]"
            >
              {weekday}
            </div>
          ))}
          {monthCells.map((cell) => (
            <div
              key={cell.key}
              className="min-h-16 overflow-hidden border-border border-r border-b bg-card p-1 empty:bg-muted/15"
            >
              {cell.day && (
                <div className="grid gap-1">
                  <div className="font-medium font-mono text-[11px] tabular-nums">{cell.day}</div>
                  {calendarEvents[cell.day]?.slice(0, 1).map((event) => (
                    <div
                      key={`${cell.day}-${event.brand}-${event.event || event.text}`}
                      className={cn("rounded-md border border-l-4 bg-muted/40 p-1", eventAccentClass(event.brand))}
                    >
                      <div className="mb-1 flex flex-wrap items-center gap-1">
                        <EntityBrandBadge brand={event.brand} className="h-5 px-1.5 text-[10px]" />
                        {event.time ? (
                          <span className="font-mono text-[10px] text-muted-foreground tabular-nums">{event.time}</span>
                        ) : null}
                      </div>
                      <div className="line-clamp-2 font-medium text-[11px] leading-snug">
                        {event.event || event.text}
                      </div>
                    </div>
                  ))}
                  {(calendarEvents[cell.day]?.length ?? 0) > 1 ? (
                    <span className="font-mono text-[10px] text-muted-foreground">
                      +{(calendarEvents[cell.day]?.length ?? 1) - 1} more
                    </span>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CalendarAndApiGrid({
  calendarEvents,
}: {
  calendarEvents: Record<number, CalendarEvent[]>;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <div className="hidden md:block xl:col-span-5">
        <MonthViewReference calendarEvents={calendarEvents} />
      </div>
      <div className="xl:col-span-7">
        <CalendarApiSyncCard />
      </div>
    </div>
  );
}

export function CalendarPage({
  calendarEvents = defaultCalendarEvents,
}: {
  calendarEvents?: Record<number, CalendarEvent[]>;
}) {
  const agendaEvents = flattenEvents(calendarEvents);

  return (
    <div className={dashPageClass}>
      <TasksHeader />

      <TaskAndDocumentDeck />

      <CalendarAndApiGrid calendarEvents={calendarEvents} />

      <AgendaFeed events={agendaEvents} />
    </div>
  );
}
