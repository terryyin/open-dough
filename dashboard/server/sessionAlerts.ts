// The macOS notification for a session that needs the developer, for the
// local launch boundary (`./agentLaunchPlugin.ts`), which starts it with the
// boundary and stops it with the same cleanup. One loop, never overlapping,
// reads the machine's sessions (`./agentLaunches.ts`) every few seconds and
// remembers each session's last reading (`../src/sessionShown.ts`), per
// server run: the first read only sets that baseline, a session first seen
// later counts as having been working, and a session is notified once when
// it enters a reading that needs the developer, again only after a reading
// that does not. The notification is `osascript` with the text passed as
// arguments, never spliced into script text; where it cannot run, or
// refuses, the loop goes on. Raw stderr is never kept.

import { execFile } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { launchSubject, type LaunchWithState } from "../src/agentLaunch.ts";
import { catalog } from "../src/publishedSource.ts";
import { alertReading } from "../src/sessionShown.ts";
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

function notify(
  message: string,
  title: string,
  signal: AbortSignal,
): Promise<void> {
  return new Promise((resolve) => {
    execFile(
      "osascript",
      [...notifyScript.flatMap((line) => ["-e", line]), "--", message, title],
      { signal },
      () => {
        resolve();
      },
    ).stdin?.end();
  });
}

function notification(
  reading: string,
  { request, sessionState }: LaunchWithState,
): { readonly message: string; readonly title: string } {
  const project =
    catalog.find((source) => source.id === request.source)?.label ??
    request.source;
  const waitingFor =
    sessionState.kind === "listed" ? sessionState.waitingFor : undefined;
  return {
    message: waitingFor === undefined ? reading : `${reading}: ${waitingFor}`,
    title: `${project} · ${launchSubject(request).title}`,
  };
}

export class SessionAlerts {
  private readonly stopped = new AbortController();
  // Each session's last reading that needs the developer, or nothing; unset
  // until the first read of this run.
  private readings: ReadonlyMap<string, string | undefined> | undefined;

  constructor(private readonly launches: AgentLaunches) {
    void this.run();
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
    const before = this.readings;
    const now = sessions.map((session) => ({
      session,
      id: session.session.sessionId,
      reading: alertReading(session),
    }));
    this.readings = new Map(now.map(({ id, reading }) => [id, reading]));
    if (before === undefined) return;
    for (const { session, id, reading } of now) {
      if (reading === undefined || reading === before.get(id) || signal.aborted)
        continue;
      const { message, title } = notification(reading, session);
      await notify(message, title, signal);
    }
  }

  // Ends the loop and any `osascript` it started.
  close(): void {
    this.stopped.abort();
  }
}
