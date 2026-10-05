// What Mark as done says first (../src/sessionShown.ts `unfinishedIntention`):
// nothing for a `completed` report on a session neither working nor waiting
// for input, else one statement for the most pressing situation. Cursor's
// held-screen words count as working and waiting. A pure reading of one
// record; the page journeys are ./agent-launch-done-question*.spec.ts.

import { expect, test } from "./support/pageTest.ts";
import { completionReport } from "./support/completionReport.ts";
import { stillWorking, waitingForInput } from "./support/markDone.ts";
import type { CompletionReport } from "../src/completionReport.ts";
import type { SessionState } from "../src/launchRecord.ts";
import { unfinishedIntention } from "../src/sessionShown.ts";

const claude = (activity: "review" | "waiting"): SessionState => ({
  kind: "available",
  availability: "loaded",
  activity,
});

// Literal held-screen words, so a changed Cursor label fails here.
const cursorHeld = (label: string): SessionState => ({
  kind: "unknown",
  label,
});

const cases: readonly {
  readonly reading: string;
  readonly sessionState: SessionState;
  readonly outcome?: CompletionReport["outcome"];
  readonly says: string | undefined;
}[] = [
  {
    reading: "idle Claude, completed",
    sessionState: claude("review"),
    outcome: "completed",
    says: undefined,
  },
  {
    reading: "Cursor at the follow-up prompt, completed",
    sessionState: cursorHeld("at the follow-up prompt"),
    outcome: "completed",
    says: undefined,
  },
  {
    reading: "Cursor held working, completed",
    sessionState: cursorHeld("working"),
    outcome: "completed",
    says: stillWorking,
  },
  {
    reading: "Cursor held waiting for an answer, completed",
    sessionState: cursorHeld("waiting for an answer"),
    outcome: "completed",
    says: waitingForInput,
  },
  {
    reading: "Claude waiting, unfinished",
    sessionState: claude("waiting"),
    outcome: "unfinished",
    says: waitingForInput,
  },
  {
    reading: "idle Claude, unfinished",
    sessionState: claude("review"),
    outcome: "unfinished",
    says: "This session reported unfinished work.",
  },
  {
    reading: "idle Claude, no report",
    sessionState: claude("review"),
    says: "This session has not reported its work complete. It reads Ready for review.",
  },
];

for (const { reading, sessionState, outcome, says } of cases) {
  test(`Mark as done says ${says === undefined ? "nothing" : `"${says}"`} for ${reading}`, () => {
    expect(
      unfinishedIntention({
        sessionState,
        ...(outcome === undefined
          ? {}
          : { completion: completionReport({ outcome }) }),
      }),
    ).toBe(says);
  });
}
