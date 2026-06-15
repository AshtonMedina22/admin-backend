import { EntityBrandBadge } from "@/components/dashboard/entity-brand-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { calendarEventsByDay } from "@/data/demo/calendar-events";
import {
  dashAlertBannerClass,
  dashCardClass,
  dashPageClass,
  dashSectionCardContentClass,
  dashSectionCardHeaderClass,
  dashSurfaceCardClass,
} from "@/lib/dashboard-ui";
import {
  dashCodeBlockClass,
  dashCodeBlockSmClass,
  dashKpiValueClass,
  dashProseClass,
  entityAccentBarForLabel,
  entityBadgeClassForLabel,
  entityBrandStyles,
  entityBrandStylesFor,
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

function eventAccentClass(_brand: string) {
  return "";
}

function flattenEvents(calendarEvents: Record<number, CalendarEvent[]>) {
  return Object.entries(calendarEvents)
    .flatMap(([day, events]) => events.map((event) => ({ day: Number(day), ...event })))
    .sort((a, b) => a.day - b.day || String(a.time ?? "").localeCompare(String(b.time ?? "")));
}

const calendarSyncSteps = [
  "Calendar tab row is marked Ready to Schedule in the workbook.",
  "Apps Script time trigger reads unsynced rows from the Calendar tab.",
  "Calendar.Events.insert() creates the meeting with attendees and reminders.",
  "The returned calendarEventId is written back to the same row for idempotent updates.",
];

const GOOGLE_CALENDAR_SYNC_SCRIPT = `function syncCalendarRows() {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Calendar');
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0].map(String);
  const col = (name) => headers.indexOf(name);
  const calendarId = PropertiesService.getScriptProperties().getProperty('OPS_CALENDAR_ID');
  if (!calendarId) throw new Error('Missing OPS_CALENDAR_ID script property');

  rows.slice(1).forEach((row, index) => {
    if (row[col('Status')] !== 'Ready to Schedule') return;
    if (row[col('Calendar Event ID')]) return;

    const event = Calendar.Events.insert({
      summary: row[col('Meeting Title')],
      description: row[col('Next Action')],
      start: { dateTime: new Date(row[col('Start Time')]).toISOString() },
      end: { dateTime: new Date(row[col('End Time')]).toISOString() },
      attendees: String(row[col('Attendees')])
        .split(',')
        .map((email) => ({ email: email.trim() }))
        .filter((attendee) => attendee.email),
      reminders: { useDefault: false, overrides: [{ method: 'email', minutes: 1440 }] },
    }, calendarId, { sendUpdates: 'all' });

    sheet.getRange(index + 2, col('Calendar Event ID') + 1).setValue(event.id);
    sheet.getRange(index + 2, col('Status') + 1).setValue('Scheduled');
  });
}`;

const GMAIL_REMINDER_DRAFT_SCRIPT = `function buildMeetingReminderDraft(row) {
  if (row['Meeting Status'] !== 'Needs Reminder') return;

  GmailApp.createDraft(
    row['Vendor Email'],
    'Reminder: ' + row['Project'] + ' / ' + row['Meeting Date'],
    'Meeting: ' + row['Meeting Date'] +
      '\nVendor/AHJ: ' + row['Vendor or AHJ'] +
      '\nProject: ' + row['Project'] +
      '\nNext action: ' + row['Next Action'],
    { name: 'Demo Ops Scheduling Desk' }
  );
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
    <Card className={dashCardClass}>
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
    <div className="mb-2 grid grid-cols-1 gap-5 lg:grid-cols-2">
      <Card className={dashCardClass}>
        <CardHeader className={dashSectionCardHeaderClass}>
          <CardTitle>Operational Action Items</CardTitle>
          <CardDescription>
            Current administrative and system priorities sorted by business entity handle.
          </CardDescription>
        </CardHeader>
        <CardContent className={cn("grid gap-3", dashSectionCardContentClass)}>
          {actionItems.map((item) => (
            <div
              key={item.text}
              className={cn(
                "rounded-lg border border-border bg-muted/40 p-3",
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

      <Card className={dashCardClass}>
        <CardHeader className={dashSectionCardHeaderClass}>
          <CardTitle>Automated Document Tracking</CardTitle>
          <CardDescription>
            Active status of spreadsheet-driven document generation and template workflows.
          </CardDescription>
        </CardHeader>
        <CardContent className={cn("grid gap-4", dashSectionCardContentClass)}>
          <div className="rounded-lg border border-border bg-muted/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-foreground text-sm">Project Charter & Agreement Automation</h3>
              <span className={cn("rounded-full px-2 py-0.5 font-mono text-[10px]", statusStyles.live)}>
                Active Listener
              </span>
            </div>
            <p className={cn("mt-2 font-mono text-xs", dashProseClass)}>
              Production wiring: DocuSign Connect completion event ➔ Google Apps Script handler ➔ formatted PDF compile
              ➔ shared Google Drive asset folder upload.
            </p>
            <div className={cn("mt-2 border-border border-t pt-2 font-mono text-xs", dashProseClass)}>
              <strong className="text-foreground">Document Assembly Engineering:</strong> Production wiring would parse
              spreadsheet tracking arrays, initialize a Google Docs contract template, populate project metadata and
              custom tables, compile the final agreement PDF, and upload it into a permissioned Google Drive folder by
              entity, project, and document type.
            </div>
          </div>
          <Button className="w-full rounded-md border border-border bg-slate-50 px-3 py-2 font-mono text-foreground text-xs transition-all hover:bg-muted/40 active:scale-[0.98]">
            📄 Re-Generate System Manifest PDF
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function CalendarApiSyncCard() {
  return (
    <Card className={dashSurfaceCardClass}>
      <CardHeader className={dashSectionCardHeaderClass}>
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle>Google Calendar API Sync</CardTitle>
            <CardDescription>
              Scripted scheduling workflow that turns workbook rows into calendar events, reminders, and auditable row
              IDs.
            </CardDescription>
          </div>
          <span className={cn("w-fit rounded-full px-2.5 py-1 font-mono text-[10px]", entityBrandStyles.solar3k.badge)}>
            Calendar.Events.insert()
          </span>
        </div>
      </CardHeader>
      <CardContent className={cn("grid gap-4 lg:grid-cols-[0.85fr_1.25fr]", dashSectionCardContentClass)}>
        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className={cn("font-mono text-[11px] uppercase tracking-[0.18em]", entityBrandStyles.solar3k.text)}>
              Scheduling contract
            </p>
            <ol className="mt-3 space-y-2 text-muted-foreground text-xs leading-relaxed">
              {calendarSyncSteps.map((step, index) => (
                <li key={step} className="flex gap-2">
                  <span className={cn("font-mono tabular-nums", entityBrandStyles.solar3k.text)}>{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className={cn(dashAlertBannerClass, "font-mono text-xs leading-relaxed")}>
            <strong>Gmail reminder draft companion:</strong> when a row's meeting status is
            <span> Needs Reminder</span>, Apps Script can build a Gmail draft containing the
            meeting date, vendor/AHJ, project, and next action for human review before sending.
          </div>
        </div>
        <div className="grid gap-3">
          <pre className={cn(dashCodeBlockClass, "max-h-80 text-[10px]")}>
            <code>{GOOGLE_CALENDAR_SYNC_SCRIPT}</code>
          </pre>
          <pre className={cn(dashCodeBlockClass, "max-h-52 text-[10px]")}>
            <code>{GMAIL_REMINDER_DRAFT_SCRIPT}</code>
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}

function AgendaFeed({ events }: { events: Array<CalendarEvent & { day: number }> }) {
  return (
    <Card size="sm" className={dashSurfaceCardClass}>
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
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {events.map((event) => (
            <div
              key={`${event.day}-${event.brand}-${event.event || event.text}`}
              className={cn(
                "min-w-0 rounded-xl border border-border bg-slate-50 p-3",
                eventAccentClass(event.brand),
              )}
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className="grid w-16 shrink-0 justify-items-center rounded-lg border border-border bg-muted/40 px-2 py-2 text-center">
                  <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Jun</span>
                  <span className={cn(dashKpiValueClass, "text-2xl leading-none")}>{event.day}</span>
                  {event.time ? (
                    <span className="mt-1 font-mono text-[10px] text-muted-foreground tabular-nums">{event.time}</span>
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    <EntityBrandBadge brand={event.brand} className="h-5 px-1.5 text-[10px]" />
                    {event.type ? (
                      <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 font-medium text-[10px] text-muted-foreground">
                        {event.type}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="text-balance font-semibold text-sm leading-snug">{event.event || event.text}</h3>
                  <p className="mt-1 line-clamp-2 text-muted-foreground text-xs leading-relaxed">
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

      <CalendarApiSyncCard />

      <AgendaFeed events={agendaEvents} />

      <div className="hidden md:block">
        <Card size="sm" className={dashCardClass}>
          <CardHeader className={cn("border-border border-b", dashSectionCardHeaderClass)}>
            <CardTitle>Month View Reference</CardTitle>
            <CardDescription>Compact 7-column planning reference for desktop review.</CardDescription>
          </CardHeader>
          <CardContent className={dashSectionCardContentClass}>
            <div className="mx-auto w-full max-w-5xl">
              <div className="grid grid-cols-7 border-border border-t border-l text-sm">
                {weekdays.map((weekday) => (
                  <div
                    key={weekday}
                    className="border-border border-r border-b bg-muted/30 px-2 py-2 font-medium text-muted-foreground text-xs"
                  >
                    {weekday}
                  </div>
                ))}
                {monthCells.map((cell) => (
                  <div
                    key={cell.key}
                    className="max-h-[120px] min-h-24 overflow-hidden border-border border-r border-b bg-card p-1.5 empty:bg-muted/15"
                  >
                    {cell.day && (
                      <div className="grid gap-1.5">
                        <div className="font-medium font-mono text-sm tabular-nums">{cell.day}</div>
                        {calendarEvents[cell.day]?.map((event) => (
                          <div
                            key={`${cell.day}-${event.brand}-${event.event || event.text}`}
                            className={cn(
                              "rounded-md border border-l-4 bg-muted/40 p-1.5",
                              eventAccentClass(event.brand),
                            )}
                          >
                            <div className="mb-1 flex flex-wrap items-center gap-1">
                              <EntityBrandBadge brand={event.brand} className="h-5 px-1.5 text-[10px]" />
                              {event.time ? (
                                <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                                  {event.time}
                                </span>
                              ) : null}
                            </div>
                            <div className="line-clamp-2 font-medium text-[11px] leading-snug">
                              {event.event || event.text}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
