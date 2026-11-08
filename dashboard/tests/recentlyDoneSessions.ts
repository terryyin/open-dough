// What this machine keeps for the Recently done journeys
// (recently-done-stories.spec.ts and recently-done-story-sessions.spec.ts):
// session records of an ad hoc session and of the queued story, and, for the
// done cards' sessions, of done stories, each listed by the synthetic `claude`
// and launched at the times ./recentlyDoneRecords.ts places them.
import { makeMe } from "../../tests/support/makeMe.mjs";
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

// A story's launch by its workflow, in the `claude` session `sessionId`,
// launched `before` `now`.
const storySession = (
  now: number,
  story: { readonly identity: string; readonly title: string },
  workflow: "execution" | "refinement",
  sessionId: string,
  before: number,
) =>
  makeMe.aLaunchRecord
    .ofWorkflow(workflow, story)
    .inClaudeSession({ sessionId })
    .launchedAt(at(now, before));

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
    storySession(
      now,
      expired,
      "execution",
      sessionIds.expired,
      placed.expiredSessionLaunched,
    )
      .markedDoneAt(at(now, placed.executedDoneSessionMarked))
      .please(),
    storySession(
      now,
      executed,
      "execution",
      sessionIds.executedDone,
      placed.executedDoneSessionLaunched,
    )
      .markedDoneAt(at(now, placed.executedDoneSessionMarked))
      .please(),
    storySession(
      now,
      executed,
      "refinement",
      sessionIds.executedOpen,
      placed.executedOpenSessionLaunched,
    ).please(),
    storySession(
      now,
      lastWeek,
      "execution",
      sessionIds.lastWeek,
      placed.lastWeekSessionLaunched,
    )
      .markedDoneAt(at(now, placed.lastWeekSessionLaunched))
      .please(),
  ];
}

// This machine's sessions for the project, each launched `placed` before
// `now`, of the sessions the synthetic `claude` lists by these ids: the
// queued story's execution and a blank ad hoc session, each marked Done at
// the time `doneAt` gives it, if any.
export function keptSessions(
  now: number,
  sessionIds: { readonly adHoc: string; readonly queued: string },
  doneAt: { readonly adHoc?: string; readonly queued?: string } = {},
): LaunchRecord[] {
  const queued = storySession(
    now,
    { identity: queuedIdentity, title: queuedTitle },
    "execution",
    sessionIds.queued,
    placed.queuedLaunched,
  );
  const adHoc = makeMe.aLaunchRecord
    .adHoc({ title: "Open Dough session" })
    .inClaudeSession({ sessionId: sessionIds.adHoc })
    .launchedAt(at(now, placed.adHocLaunched));
  if (doneAt.queued !== undefined) queued.markedDoneAt(doneAt.queued);
  if (doneAt.adHoc !== undefined) adHoc.markedDoneAt(doneAt.adHoc);
  return [queued.please(), adHoc.please()];
}
