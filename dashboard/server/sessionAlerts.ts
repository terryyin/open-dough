import { sessionKey } from "../src/sessionReference.ts";
// The macOS notification for a session that needs the developer, for the
// local launch boundary (`./launchBoundary.ts`), which starts it with the
// boundary and stops it with the same cleanup. One loop, never overlapping,
// reads the machine's sessions (`./agentLaunches.ts`) every few seconds and
// remembers each session's last native reading and unread report
// (`../src/sessionShown.ts`), per server run: the first read only sets that
// baseline, a session first seen later counts as having been working with no
// report, and a session is notified once when it enters a reading that needs
// the developer, again only after a reading that does not, and once, in the
// report's own words, when a report arrives unread. The notification is
// separately installed `terminal-notifier`, opening the serving dashboard's
// project/story URL on a click. Text uses the helper's leading-character escape;
// its durable browser callback receives a safely quoted URL argument. A version and
// permission diagnostic probes availability at start and after a refusal;
// missing/unsupported/refused helpers leave the loop running. Raw stderr is
// never forwarded. The server owns every child, including diagnostics.

import { setTimeout as delay } from "node:timers/promises";
import {
  launchSubject,
  type Alerts,
  type LaunchWithState,
} from "../src/agentLaunch.ts";
import { configuredProjects } from "./projectConfiguration.ts";
import { alertReading, alertUnreadReport } from "../src/sessionShown.ts";
import type { AgentLaunches } from "./agentLaunches.ts";
import { dashboardDestinationPath } from "../src/dashboardDestination.ts";
import {
  probeTerminalNotifier,
  sendTerminalNotification,
} from "./terminalNotifier.ts";

const defaultCheckMs = 15_000;

// How often the sessions are read. A test may shorten it through the
// environment.
function checkMs(): number {
  const configured = Number(process.env["DOUGH_ALERT_CHECK_MS"]);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : defaultCheckMs;
}

const noDestination =
  "The dashboard has no listening loopback HTTP address for notification clicks.";

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
  // The latest helper outcome. Checking is not yet established availability.
  private unavailable: string | undefined =
    "Checking terminal-notifier availability.";
  private readonly probing: Promise<void>;

  constructor(
    private readonly launches: Pick<AgentLaunches, "machineSessions">,
    private readonly origin: () => string | undefined,
  ) {
    this.probing = this.probe();
    void this.run();
  }

  // A usable helper and an actual destination are both required.
  availability(): Alerts {
    const reason =
      this.unavailable ??
      (this.origin() === undefined ? noDestination : undefined);
    return reason === undefined
      ? { available: true }
      : { available: false, reason };
  }

  // Cancellation can change across awaits despite AbortSignal's readonly type.
  private isStopped(): boolean {
    return this.stopped.signal.aborted;
  }

  private async attempt(
    session: LaunchWithState,
    message: string,
  ): Promise<void> {
    const { signal } = this.stopped;
    await this.probing;
    if (signal.aborted) return;
    if (this.unavailable !== undefined) await this.probe();
    if (this.isStopped() || this.unavailable !== undefined) return;
    const origin = this.origin();
    if (origin === undefined) return;
    const { request } = session;
    const unavailable = await sendTerminalNotification(
      {
        title: notificationTitle(session),
        message,
        destination: `${origin}${dashboardDestinationPath(request.source, launchSubject(request).identity)}`,
      },
      signal,
    );
    if (!this.isStopped()) this.unavailable = unavailable;
  }

  // These options do not post a notification or request permission. Reject
  // older helpers before trusting -diagnose, and retry after a failed send.
  private async probe(): Promise<void> {
    const { signal } = this.stopped;
    const unavailable = await probeTerminalNotifier(signal);
    if (!signal.aborted) this.unavailable = unavailable;
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
    const now = sessions.map((session) => ({
      session,
      id: sessionKey(session.session),
      alerting: {
        reading: alertReading(session),
        report: alertUnreadReport(session),
      },
    }));
    this.lastAlerting = new Map(now.map(({ id, alerting }) => [id, alerting]));
    if (before === undefined) return;
    for (const { session, id, alerting } of now) {
      const { reading, report } = alerting;
      const last = before.get(id);
      const messages = [
        ...(reading === undefined || reading === last?.reading
          ? []
          : [readingMessage(reading, session)]),
        ...(report === undefined || report === last?.report ? [] : [report]),
      ];
      for (const message of messages) {
        if (signal.aborted) return;
        await this.attempt(session, message);
      }
    }
  }

  // Ends the loop and every owned notifier, including a startup diagnostic.
  close(): void {
    this.stopped.abort();
  }
}
