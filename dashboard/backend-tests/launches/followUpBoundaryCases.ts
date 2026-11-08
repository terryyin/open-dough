// The follow-up boundary specs' sources, requests and first-input reading:
// agent-launch-follow-up-boundary.spec.ts (what the first input holds),
// agent-launch-follow-up-identity.spec.ts (identity, retries and refusals),
// agent-launch-follow-up-story.spec.ts (a done story) and the Codex and
// Cursor specs beside them.

import type { LaunchRecord, LaunchWithState } from "../../src/launchRecord.ts";
import type { RecordedLaunchRequest } from "../../src/launchRequest.ts";
import type { EstablishedSession } from "../../src/unattachedSession.ts";
import type { DashboardServer } from "../../tests/support/dashboardServer.ts";
import { expect } from "../../tests/support/preparationPage.ts";
import { expectReportingBlock } from "../../tests/support/reportingInputAssertions.ts";
import { sessionBlock } from "../../tests/support/startSessionLanding.ts";
import {
  followUpContextOf,
  quietSession,
  quietTitle,
  retiredSession,
  retiredTitle,
} from "../../tests/support/followUpSources.ts";

export type Answer = {
  kind: string;
  reason?: string;
  record?: LaunchWithState;
};

export const answerOf = async (answer: Promise<{ body: string }>) =>
  JSON.parse((await answer).body) as Answer;

export const request = {
  source: "open-dough",
  workflow: "ad-hoc",
  host: "claude",
};

const landed = "ab".repeat(20);
export const report =
  "The cache key changed; I restored it.\nCI now takes 4 minutes.";

// A Done session whose isolated workspace was retired, with its final report
// and the revision its work landed at.
export const reported = (home: string): LaunchRecord =>
  retiredSession(home, { report, landed, doneAt: new Date() });

// A Done session that completed quietly.
export const quiet: LaunchRecord = quietSession("quiet-source", new Date());

export const reportedContext = followUpContextOf(retiredTitle, [
  "- Workflow: Ad hoc",
  `- Original request: ${retiredTitle}`,
  "- Final report (Completed with attention):",
  report,
  `- Landed at revision: ${landed}`,
]);

export const quietContext = followUpContextOf(quietTitle, [
  "- Workflow: Ad hoc",
  `- Original request: ${quietTitle}`,
  "- Final report: No final report was submitted.",
]);

// The parts of a first input before and after `context`, whose own blocks
// hold no blank line.
export const partsOf = (input: string | undefined, context: string) => {
  const text = input ?? "";
  expect(text).toContain(context);
  const [before, after] = text.split(context);
  return {
    before: (before ?? "").split("\n\n").filter((part) => part !== ""),
    after: (after ?? "").split("\n\n").filter((part) => part !== ""),
  };
};

// A follow-up's first input on any host: `[context, own, reporting]` with no
// established session and `[block, reporting, context, own]` with one; a
// blank request has no part of its own.
export function expectFollowUpInput(
  input: string | undefined,
  expected: {
    context: string;
    own?: string;
    session?: EstablishedSession;
    request: RecordedLaunchRequest | undefined;
    server: Pick<DashboardServer, "home" | "origin">;
  },
) {
  const { context, own, session, request, server } = expected;
  const { before, after } = partsOf(input, context);
  const owned = own === undefined ? [] : [own];
  const reporting = session === undefined ? after[owned.length] : before[1];
  expect(before).toEqual(
    session === undefined ? [] : [sessionBlock(session), reporting],
  );
  expect(after).toEqual(session === undefined ? [...owned, reporting] : owned);
  expectReportingBlock(reporting, request, server);
}
