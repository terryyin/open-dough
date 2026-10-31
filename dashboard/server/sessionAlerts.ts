import { sessionKey } from "../src/sessionReference.ts";
// The macOS notification for a session that needs the developer, for the
// local launch boundary (`./launchBoundary.ts`), which starts it with the
// boundary and stops it with the same cleanup. One loop, never overlapping,
// reads the machine's shared sessions observation
// (`./machineSessionObservation.ts`) every few seconds and
// remembers each session's last native reading and unread report
// (`../src/sessionShown.ts`), per server run. The first read quietly baselines
// existing waits; later sessions alert when they first need input. A handled
// input request stays quiet across observation gaps, omissions and changed
// summaries. Only available working rearms it, so work and a new question
// missed entirely between polls may stay quiet. Review uses the same continuity
// rule through observation gaps; a confirmed change of activity can rearm it.
// Other readings alert on entry,
// and reports alert once in their own words when they arrive unread. Delivery is
// Open Dough's own notification sender (`./terminalNotifier.ts`), opening the
// serving dashboard's project/story URL on a click. Text uses the helper's
// leading-character escape;
// its durable browser callback receives a safely quoted URL argument. A version and
// permission diagnostic probes availability at start and after a refusal;
// missing/unsupported/refused helpers leave the loop running. Raw stderr is
// never forwarded. The server owns every child, including diagnostics.

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
import type { MachineSessionObservation } from "./machineSessionObservation.ts";
import { configuredLimit } from "./configuredLimit.ts";
import { repeatUntilStopped } from "./repeatingCheck.ts";
import { dashboardDestinationPath } from "../src/dashboardDestination.ts";
import {
  probeTerminalNotifier,
  sendTerminalNotification,
} from "./terminalNotifier.ts";

// How often the sessions are read. A test may shorten it through the
// environment.
function checkMs(): number {
  return configuredLimit("DOUGH_ALERT_CHECK_MS", 15_000);
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
  // Input requests already notified or quietly baselined in this run. Unlike
  // the latest reading, this survives unknown observations and omitted records.
  private readonly handledInput = new Set<string>();
  // Confirmed review survives gaps until known activity changes its meaning.
  private readonly handledReview = new Set<string>();
  // The latest helper outcome. Checking is not yet established availability.
  private unavailable: string | undefined =
    "Checking the Open Dough notification sender.";
  private readonly probing: Promise<void>;

  constructor(
    private readonly sessions: Pick<
      MachineSessionObservation,
      "machineSessions"
    >,
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
    await repeatUntilStopped(signal, checkMs, async () => {
      await this.poll(signal);
      return undefined;
    });
  }

  private async poll(signal: AbortSignal): Promise<void> {
    const sessions = await this.sessions.machineSessions(signal);
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
        await this.attempt(session, message);
      }
    }
  }

  // Ends the loop and every owned notifier, including a startup diagnostic.
  close(): void {
    this.stopped.abort();
  }
}
