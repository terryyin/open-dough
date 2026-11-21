// Attempt-path landings refuse inconsistent reports or kept evidence.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { LaunchAttemptRecord } from "../../src/launchOutcome.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import type {
  LaunchLanding,
  LandingRepository,
} from "../../src/launchLanding.ts";
import {
  decideLanding,
  type LandingDecisionInput,
} from "../../server/launchLandingDecision.ts";
import { RefusedRequest } from "../../server/localOrigin.ts";

const origin = "http://127.0.0.1:4173";
const comparison = { base: "a1".repeat(20), revision: "b2".repeat(20) };
const submission = makeMe.aLandingSubmission.comparing(comparison).please();
const authority = makeMe.aLandingAuthority
  .ofRepository("/repo")
  .inWorktree({ workspace: "/work", branch: "dough/decision" })
  .please();
const reporting = {
  origin,
  reference: submission.reference,
  command: "report",
};
const session = { host: "claude", sessionId: "decision-session" } as const;
const story = { identity: "SEED-413#owned", title: "Story" };

type Refusal = {
  scenario: string;
  message: string;
  operation?: LandingDecisionInput["operation"];
  report?: LandingDecisionInput["report"];
  request?: LaunchAttemptRecord["request"];
  authority?: LandingRepository;
  session?: typeof session;
  records?: LaunchRecord[];
  landing?: LaunchLanding;
};

test.each<Refusal>([
  {
    scenario: "a deleted reporting session",
    session,
    records: [
      makeMe.aLaunchRecord
        .adHoc({ title: "Bound landing" })
        .inClaudeSession({ sessionId: session.sessionId })
        .reportingThrough(reporting)
        .withLandingReporting({
          origin,
          authority,
          preparations: [],
          deletedAt: "2026-11-20T11:00:00.000Z",
        })
        .please(),
    ],
    message: "The reporting session was deleted.",
  },
  {
    scenario: "a completed launch with no bound record",
    session,
    message: "This launch has no retained reporting session.",
  },
  {
    scenario: "another story's identity",
    report: makeMe.aLandingSubmission
      .forLaunch({ identity: "SEED-413#other" })
      .comparing(comparison)
      .please(),
    request: makeMe.aLaunchRequest.executing(story).please(),
    authority: makeMe.aLandingAuthority
      .ofRepository(authority.repository)
      .inWorktree(authority)
      .forStory(story.identity)
      .please(),
    message: "This is not the established launch's authorized landing.",
  },
  {
    scenario: "recording a comparison that was never prepared",
    operation: "record",
    message:
      "This comparison was not retained for this launch before publication.",
  },
  {
    scenario: "a different comparison after acceptance",
    operation: "record",
    report: makeMe.aLandingSubmission
      .comparing({ ...comparison, revision: "c3".repeat(20) })
      .please(),
    landing: makeMe.aLaunchLanding
      .capturedFrom(authority)
      .forLaunch(submission.reference)
      .comparing(comparison)
      .please(),
    message: "This launch already retained a different landing comparison.",
  },
])(
  "refuses $scenario",
  async ({
    message,
    operation = "prepare",
    report = submission,
    request = makeMe.aLaunchRequest.adHoc().please(),
    authority: landingRepository = authority,
    session,
    records = [],
    landing,
  }) => {
    const builder = makeMe.anAcceptedAttempt
      .requesting(request)
      .withId(report.reference)
      .reportingTo(origin)
      .capturingLanding({ reporting, landingRepository, landing });
    if (session !== undefined) builder.launched(session);

    const answer = decideLanding({
      report,
      origin,
      operation,
      attempts: [builder.please()],
      records,
      receiptId: "44444444-4444-4444-8444-444444444444",
      receivedAt: "2026-11-20T12:00:00.000Z",
    });

    await expect(answer).rejects.toBeInstanceOf(RefusedRequest);
    await expect(answer).rejects.toMatchObject({ status: 409, message });
  },
);
