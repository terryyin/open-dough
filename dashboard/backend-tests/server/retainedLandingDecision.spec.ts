// Retained-record landings refuse unauthorized reports or an unexpired attempt.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  decideLanding,
  type LandingDecisionInput,
} from "../../server/launchLandingDecision.ts";
import { RefusedRequest } from "../../server/localOrigin.ts";

const dashboardOrigin = "http://127.0.0.1:4173";
const comparison = { base: "a1".repeat(20), revision: "b2".repeat(20) };
const submission = makeMe.aLandingSubmission.comparing(comparison).please();
const branchRefusal = {
  status: 409,
  message: "This is not the session's authorized branch landing.",
};
const retainedAuthority = makeMe.aLandingAuthority
  .ofRepository("/repo")
  .inWorktree({ workspace: "/work", branch: "dough/decision" })
  .please();

type Refusal = {
  scenario: string;
  expected: { status: number; message: string };
  reportOrigin?: string;
  host?: LandingDecisionInput["report"]["host"];
  operation?: LandingDecisionInput["operation"];
  record?: LandingDecisionInput["records"][number];
  receivedAt?: string;
  deletedAt?: string;
};

test.each<Refusal>([
  {
    scenario: "a declared branch landing from another origin",
    reportOrigin: "http://127.0.0.1:9999",
    expected: branchRefusal,
  },
  {
    scenario: "a declared branch landing from another host",
    host: "codex",
    expected: branchRefusal,
  },
  {
    scenario: "a deleted declared landing",
    deletedAt: "2026-11-20T11:00:00.000Z",
    expected: branchRefusal,
  },
  {
    scenario: "a missing attempt inside retention at receipt time",
    operation: "record",
    receivedAt: "2000-11-21T12:00:00.000Z",
    record: makeMe.aLaunchRecord
      .adHoc({ title: "Settled retained landing" })
      .inClaudeSession({ sessionId: "settled-decision-session" })
      .inIsolatedWorkspace(retainedAuthority)
      .reportingThrough({
        origin: dashboardOrigin,
        reference: submission.reference,
        command: "report",
      })
      .withLandingReporting({
        origin: dashboardOrigin,
        authority: retainedAuthority,
        preparations: [],
        settledAt: "2000-11-20T12:00:00.000Z",
      })
      .please(),
    expected: {
      status: 404,
      message: "This dashboard accepted no such reporting launch.",
    },
  },
])(
  "refuses $scenario",
  async ({
    expected,
    reportOrigin = dashboardOrigin,
    host = "claude",
    operation = "prepare",
    record,
    receivedAt = "2026-11-20T12:00:00.000Z",
    deletedAt,
  }) => {
    const answer = decideLanding({
      report: makeMe.aLandingSubmission
        .forLaunch({ host })
        .comparing(comparison)
        .please(),
      origin: reportOrigin,
      operation,
      attempts: [],
      records: [
        record ??
          makeMe.aLaunchRecord
            .adHoc({ title: "Declared landing" })
            .inClaudeSession({ sessionId: "declared-decision-session" })
            .withDeclaredLanding({
              origin: dashboardOrigin,
              ...(deletedAt !== undefined && { deletedAt }),
            })
            .please(),
      ],
      receiptId: "44444444-4444-4444-8444-444444444444",
      receivedAt,
    });

    await expect(answer).rejects.toBeInstanceOf(RefusedRequest);
    await expect(answer).rejects.toMatchObject(expected);
  },
);

test("a migrated Done launch repeats its original unbound landing with or without its kept attempt", async () => {
  const reporting = {
    origin: dashboardOrigin,
    reference: submission.reference,
    command: "node report.mjs",
  };
  const landing = makeMe.aLaunchLanding
    .capturedFrom(retainedAuthority)
    .forLaunch(reporting.reference)
    .comparing(comparison)
    .please();
  const storyIdentity = "SEED-112#converted-done-story";
  const record = makeMe.aLaunchRecord
    .adHoc({ title: "Converted Done launch", storyIdentity })
    .inClaudeSession({ sessionId: "kept-converted-session" })
    .inIsolatedWorkspace(retainedAuthority)
    .reportingThrough(reporting)
    .withLanding(landing)
    .withLandingReporting({
      origin: dashboardOrigin,
      authority: retainedAuthority,
      preparations: [landing],
      settledAt: "2026-09-20T12:00:00.000Z",
    })
    .markedDone()
    .please();
  const attempt = makeMe.anAcceptedAttempt
    .adHoc({ instruction: "Converted Done launch" })
    .withId(reporting.reference)
    .reportingTo(dashboardOrigin)
    .capturingLanding({
      reporting,
      landingRepository: retainedAuthority,
      landingPreparations: [landing],
      landing,
    })
    .launched(record.session)
    .please();
  const input = {
    origin: dashboardOrigin,
    records: [record],
    report: submission,
    receiptId: "44444444-4444-4444-8444-444444444444",
    receivedAt: "2026-11-20T12:00:00.000Z",
  };
  await expect(
    decideLanding({ ...input, operation: "prepare", attempts: [attempt] }),
  ).resolves.toEqual({ state: "prepared", landing, isNew: false });
  await expect(
    decideLanding({ ...input, operation: "record", attempts: [] }),
  ).resolves.toEqual({ state: "recorded", landing, isNew: false });
  // Story conversion changes only membership. Even a report naming that
  // story cannot change the original accepted landing.
  await expect(
    decideLanding({
      ...input,
      operation: "record",
      attempts: [attempt],
      report: { ...submission, identity: storyIdentity },
    }),
  ).rejects.toMatchObject({
    status: 409,
    message: "This is not the established launch's authorized landing.",
  });
});
