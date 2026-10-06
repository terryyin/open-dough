// What this machine keeps for the Recently done journeys
// (recently-done-stories.spec.ts and recently-done-story-sessions.spec.ts):
// session records of an ad hoc session and of the queued story, and, for the
// done cards' sessions, of done stories, each listed by the synthetic `claude`
// and launched at the times ./recentlyDoneRecords.ts places them.
import type { LaunchRecord } from "../src/agentLaunch.ts";
import {
  at,
  executed,
  expired,
  lastWeek,
  placed,
  queuedIdentity,
  queuedTitle,
} from "./recentlyDoneRecords.ts";

const session = (sessionId: string, name: string) => ({
  host: "claude" as const,
  sessionId,
  shortId: sessionId.slice(0, 8),
  name,
});

// A story's session record, launched `before` `now`.
const storySession = (
  now: number,
  story: { readonly identity: string; readonly title: string },
  workflow: "execution" | "refinement",
  sessionId: string,
  before: number,
): LaunchRecord => ({
  request: { source: "open-dough", ...story, workflow, host: "claude" },
  session: session(sessionId, story.title),
  launchedAt: at(now, before),
});

// This machine's sessions of the done stories, oldest first, of the sessions
// the synthetic `claude` lists by these ids: Card shows avatar's execution
// marked done and its open refinement, the story done last week's execution
// launched yesterday and marked done, and the 31-day-old story's retained closed execution.
export function doneStorySessions(
  now: number,
  sessionIds: {
    readonly executedDone: string;
    readonly executedOpen: string;
    readonly lastWeek: string;
    readonly expired: string;
  },
): LaunchRecord[] {
  return [
    {
      ...storySession(
        now,
        expired,
        "execution",
        sessionIds.expired,
        placed.expiredSessionLaunched,
      ),
      doneAt: at(now, placed.executedDoneSessionMarked),
    },
    {
      ...storySession(
        now,
        executed,
        "execution",
        sessionIds.executedDone,
        placed.executedDoneSessionLaunched,
      ),
      doneAt: at(now, placed.executedDoneSessionMarked),
    },
    storySession(
      now,
      executed,
      "refinement",
      sessionIds.executedOpen,
      placed.executedOpenSessionLaunched,
    ),
    {
      ...storySession(
        now,
        lastWeek,
        "execution",
        sessionIds.lastWeek,
        placed.lastWeekSessionLaunched,
      ),
      doneAt: at(now, placed.lastWeekSessionLaunched),
    },
  ];
}

// This machine's sessions for the project, each launched `placed` before
// `now`, of the sessions the synthetic `claude` lists by these ids.
export function keptSessions(
  now: number,
  sessionIds: { readonly adHoc: string; readonly queued: string },
): LaunchRecord[] {
  return [
    storySession(
      now,
      { identity: queuedIdentity, title: queuedTitle },
      "execution",
      sessionIds.queued,
      placed.queuedLaunched,
    ),
    {
      request: {
        source: "open-dough",
        workflow: "ad-hoc",
        title: "Open Dough session",
        host: "claude",
      },
      session: session(sessionIds.adHoc, "Open Dough session"),
      launchedAt: at(now, placed.adHocLaunched),
    },
  ];
}
