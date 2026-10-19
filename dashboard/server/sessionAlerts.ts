import { sessionKey } from "../src/sessionReference.ts";
// The macOS notification for a session that needs the developer, for the
// local launch boundary (`./launchBoundary.ts`), which starts it with the
// boundary and stops it with the same cleanup. One loop, never overlapping,
// reads the machine's sessions (`./agentLaunches.ts`) every few seconds and
// remembers each session's last native reading and unread report
// (`../src/sessionShown.ts`), per server run. The first read quietly baselines
// existing waits; later sessions alert when they first need input. A handled
// input request stays quiet across observation gaps, omissions and changed
// summaries. Only available working rearms it, so work and a new question
// missed entirely between polls may stay quiet. Review uses the same continuity
// rule through observation gaps; a confirmed change of activity can rearm it.
// Other readings alert on entry,
// and reports alert once in their own words when they arrive unread. The notification is
// `osascript` with the text passed as arguments, never spliced into script
// text; where it cannot run, or refuses, the loop goes on. Availability is the latest `osascript` outcome,
// a probe at start and then each notification, with one of two fixed
// reasons; raw stderr is never kept or forwarded.

import { execFile } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import {
  launchSubject,
  type Alerts,
  type LaunchWithState,
} from "../src/agentLaunch.ts";
import { configuredProjects } from "./projectConfiguration.ts";
import {
  alertReading,
  alertUnreadReport,
  sessionShown,
} from "../src/sessionShown.ts";
import type { AgentLaunches } from "./agentLaunches.ts";

const defaultCheckMs = 15_000;

// How often the sessions are read. A test may shorten it through the
// environment.
function checkMs(): number {
  const configured = Number(process.env["DOUGH_ALERT_CHECK_MS"]);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : defaultCheckMs;
}

const notifyScript = [
  "on run argv",
  'display notification (item 1 of argv) with title (item 2 of argv) sound name "Glass"',
  "end run",
];

const notFound =
  "osascript was not found on this machine, so alerts need macOS";
const refused = "macOS did not accept the notification";

// Runs `osascript`, answering why alerts are unavailable, or nothing when it
// worked. A run ended by closing the server says nothing.
function osascript(
  args: readonly string[],
  signal: AbortSignal,
): Promise<string | undefined> {
  return new Promise((resolve) => {
    execFile("osascript", args, { signal }, (error) => {
      if (error === null) resolve(undefined);
      else if (signal.aborted) resolve(undefined);
      else
        resolve(
          (error as NodeJS.ErrnoException).code === "ENOENT"
            ? notFound
            : refused,
        );
    }).stdin?.end();
  });
}

// What a native reading's notification says: the reading, with what the
// session waits for.
function readingMessage(
  reading: string,
  { sessionState }: LaunchWithState,
): string {
  const waitingFor =
    sessionState.kind === "available" && sessionState.activity === "waiting"
      ? sessionState.waitingFor
      : undefined;
  return waitingFor === undefined ? reading : `${reading}: ${waitingFor}`;
}

function notificationTitle({ request }: LaunchWithState): string {
  const project =
    configuredProjects().find((source) => source.id === request.source)
      ?.label ?? request.source;
  return `${project} · ${launchSubject(request).title}`;
}

// What a session last read as, for alerting: its native reading and its
// unread report's words, each that tells the developer, or nothing.
type Alerting = {
  readonly reading: string | undefined;
  readonly report: string | undefined;
};

export class SessionAlerts {
  private readonly stopped = new AbortController();
  // Each session's last alerting reading and unread report; unset until the
  // first read of this run.
  private lastAlerting: ReadonlyMap<string, Alerting> | undefined;
  // Input requests already notified or quietly baselined in this run. Unlike
  // the latest reading, this survives unknown observations and omitted records.
  private readonly handledInput = new Set<string>();
  // Confirmed review survives gaps until known activity changes its meaning.
  private readonly handledReview = new Set<string>();
  // Why the latest `osascript` did not work, or nothing while it did or none
  // has run.
  private unavailable: string | undefined;

  constructor(private readonly launches: AgentLaunches) {
    void this.probe();
    void this.run();
  }

  // Whether alerts can be raised, as the latest `osascript` left it.
  availability(): Alerts {
    return this.unavailable === undefined
      ? { available: true }
      : { available: false, reason: this.unavailable };
  }

  private async attempt(args: readonly string[]): Promise<void> {
    const { signal } = this.stopped;
    const unavailable = await osascript(args, signal);
    if (!signal.aborted) this.unavailable = unavailable;
  }

  // One harmless run at start, so a machine that cannot alert says so before
  // any session needs the developer.
  private probe(): Promise<void> {
    return this.attempt(["-e", "return 0"]);
  }

  private async run(): Promise<void> {
    const { signal } = this.stopped;
    while (!signal.aborted) {
      try {
        await this.poll(signal);
      } catch {
        // A read that fails is tried again at the next check.
      }
      try {
        await delay(checkMs(), undefined, { signal });
      } catch {
        return;
      }
    }
  }

  private async poll(signal: AbortSignal): Promise<void> {
    const sessions = await this.launches.machineSessions();
    const before = this.lastAlerting;
    const now = sessions.map((session) => {
      const { tone } = sessionShown(session);
      return {
        session,
        id: sessionKey(session.session),
        needsInput: tone === "needs-input",
        needsReview: tone === "ready",
        alerting: {
          reading: alertReading(session),
          report: alertUnreadReport(session),
        },
      };
    });
    this.lastAlerting = new Map(now.map(({ id, alerting }) => [id, alerting]));
    for (const { session, id, needsInput, needsReview, alerting } of now) {
      if (
        session.sessionState.kind === "available" &&
        session.sessionState.activity === "working"
      ) {
        this.handledInput.delete(id);
        this.handledReview.delete(id);
      } else if (
        !needsReview &&
        session.sessionState.kind === "available" &&
        session.sessionState.activity !== "unknown"
      ) {
        this.handledReview.delete(id);
      }
      const repeatReview = needsReview && this.handledReview.has(id);
      if (needsReview) this.handledReview.add(id);
      const repeatInput = needsInput && this.handledInput.has(id);
      if (needsInput) this.handledInput.add(id);
      if (before === undefined) continue;
      const { reading, report } = alerting;
      const last = before.get(id);
      const messages = [
        ...(repeatInput ||
        repeatReview ||
        reading === undefined ||
        reading === last?.reading
          ? []
          : [readingMessage(reading, session)]),
        ...(report === undefined || report === last?.report ? [] : [report]),
      ];
      for (const message of messages) {
        if (signal.aborted) return;
        await this.attempt([
          ...notifyScript.flatMap((line) => ["-e", line]),
          "--",
          message,
          notificationTitle(session),
        ]);
      }
    }
  }

  // Ends the loop and any `osascript` it started.
  close(): void {
    this.stopped.abort();
  }
}
