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
const settledAuthority = makeMe.aLandingAuthority
  .ofRepository("/repo")
  .inWorktree({ workspace: "/work", branch: "dough/decision" })
  .please();

type Refusal = {
  scenario: string;
  expected: { status: number; message: string };
  reportOrigin?: string;
  report?: LandingDecisionInput["report"];
  operation?: LandingDecisionInput["operation"];
  record?: LandingDecisionInput["records"][number];
  receivedAt?: string;
};

const authorizedRefusal = {
  status: 409,
  message: "This is not the established launch's authorized landing.",
};

const declaredStory = "SEED-9#declared-landing";
const declaredSubmission = () =>
  makeMe.aLandingSubmission
    .forLaunch({ identity: declaredStory })
    .comparing(comparison);
const declaredLanding = (
  facts: Parameters<typeof makeMe.aLaunchRecord.withDeclaredLanding>[0] = {},
) =>
  makeMe.aLaunchRecord
    .adHoc({ title: "Declared landing", storyIdentity: declaredStory })
    .inClaudeSession({ sessionId: "declared-decision-session" })
    .startingInExecutionCheckout({ workspace: "/work", repository: "/repo" })
    .withDeclaredLanding({
      identity: declaredStory,
      origin: dashboardOrigin,
      ...facts,
    });

test.each<Refusal>([
  {
    scenario: "a declared branch landing from another origin",
    reportOrigin: "http://127.0.0.1:9999",
    expected: branchRefusal,
  },
  {
    scenario: "a declared branch landing from another host",
    report: declaredSubmission().forLaunch({ host: "codex" }).please(),
    expected: branchRefusal,
  },
  {
    scenario: "a deleted declared landing",
    record: declaredLanding({ deletedAt: "2026-11-20T11:00:00.000Z" }).please(),
    expected: branchRefusal,
  },
  {
    // Positive control: the unaltered declaration passes every authority
    // check and reaches the comparison, which holds no prepared pair.
    scenario: "an authorized record that was never prepared",
    operation: "record",
    expected: {
      status: 409,
      message:
        "This comparison was not retained for this launch before publication.",
    },
  },
  {
    scenario: "a submission for another story",
    report: declaredSubmission()
      .forLaunch({ identity: "SEED-9#other-story" })
      .please(),
    expected: authorizedRefusal,
  },
  {
    scenario: "a submission to another remote",
    report: declaredSubmission().landingOnTrunk({ remote: "foreign" }).please(),
    expected: authorizedRefusal,
  },
  {
    scenario: "a submission to another target",
    report: declaredSubmission()
      .landingOnTrunk({ target: "refs/heads/foreign" })
      .please(),
    expected: authorizedRefusal,
  },
  {
    scenario: "a declared landing for another story",
    record: declaredLanding({
      retainedAuthority: { identity: "SEED-9#other-story" },
    }).please(),
    expected: branchRefusal,
  },
  {
    scenario: "a declared landing in another repository",
    record: declaredLanding({
      retainedAuthority: { repository: "/elsewhere" },
    }).please(),
    expected: branchRefusal,
  },
  {
    scenario: "a declared landing in another workspace",
    record: declaredLanding({
      retainedAuthority: { workspace: "/elsewhere" },
    }).please(),
    expected: branchRefusal,
  },
  {
    scenario: "a declared landing on another branch",
    record: declaredLanding({
      retainedAuthority: { branch: "foreign" },
    }).please(),
    expected: branchRefusal,
  },
  {
    scenario: "a declared landing to another remote",
    record: declaredLanding({
      retainedAuthority: { remote: "foreign" },
    }).please(),
    expected: branchRefusal,
  },
  {
    scenario: "a declared landing to another target",
    record: declaredLanding({
      retainedAuthority: { target: "refs/heads/foreign" },
    }).please(),
    expected: branchRefusal,
  },
  {
    scenario: "an unprepared landing after the session is done",
    record: declaredLanding().markedDoneAt("2026-11-20T11:30:00.000Z").please(),
    expected: branchRefusal,
  },
  {
    scenario: "a missing attempt inside retention at receipt time",
    operation: "record",
    receivedAt: "2000-11-21T12:00:00.000Z",
    record: makeMe.aLaunchRecord
      .adHoc({ title: "Settled retained landing" })
      .inClaudeSession({ sessionId: "settled-decision-session" })
      .inIsolatedWorkspace(settledAuthority)
      .reportingThrough({
        origin: dashboardOrigin,
        reference: submission.reference,
        command: "report",
      })
      .withLandingReporting({
        origin: dashboardOrigin,
        authority: settledAuthority,
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
    report = declaredSubmission().please(),
    operation = "prepare",
    record = declaredLanding().please(),
    receivedAt = "2026-11-20T12:00:00.000Z",
  }) => {
    const answer = decideLanding({
      report,
      origin: reportOrigin,
      operation,
      attempts: [],
      records: [record],
      receiptId: "44444444-4444-4444-8444-444444444444",
      receivedAt,
    });

    await expect(answer).rejects.toBeInstanceOf(RefusedRequest);
    await expect(answer).rejects.toMatchObject(expected);
  },
);
