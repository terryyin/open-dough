import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { landingReceiptSchema } from "../../src/launchLanding.ts";
import { completionReceiptSchema } from "../../src/completionReport.ts";
import { acceptanceSchema } from "../../src/launchOutcome.ts";
import {
  keptAttempts,
  settledOutcome,
} from "../../test-support/acceptedAttempts.ts";
import { accept } from "../../test-support/agentLaunchBoundary.ts";
import {
  adHocReview,
  launchIsolatedReview,
  markAdHocDone,
} from "../../test-support/support/adHocReview.ts";
import {
  declareThroughLaunchInput,
  declaredLandingReference,
} from "../../test-support/support/declaredSessionLanding.ts";
import { reportingChild } from "../../test-support/support/completionRecovery.ts";
import { commit, git } from "../../test-support/support/launchLanding.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { rawRequest } from "../../test-support/support/rawHttp.ts";
import { launched } from "../../test-support/support/startSessionLandingCapture.ts";

test.use({ serverMode: "boundary" });

test("Done leaves the installed publisher's prepared receipt recoverable after acceptance", async ({
  dashboard,
  origin,
  request,
}) => {
  const { record, sent } = await launched(dashboard, {
    instruction: "Deliver the draft from my branch",
  });
  const branch = "prepared-draft";
  const workspace = path.join(origin.machine, branch);
  git(origin.project, "worktree", "add", "--quiet", "-b", branch, workspace);
  const handoff = await declareThroughLaunchInput(sent, workspace);
  const reference = declaredLandingReference(handoff.landingContext);
  const base = handoff.branchEntry.committedTip;
  const revision = commit(workspace, "draft.txt");
  const payload = makeMe.aLandingSubmission
    .forLaunch({ host: "claude", reference })
    .comparing({ base, revision })
    .please();
  const post = (suffix = "") =>
    rawRequest({
      url: `${dashboard.origin}/__agent-launch/landing${suffix}`,
      method: "POST",
      headers: { Origin: dashboard.origin, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  const prepared = await post("/prepare");
  expect(prepared.status, prepared.body).toBe(200);
  const receipt = landingReceiptSchema.parse(JSON.parse(prepared.body));
  git(workspace, "push", "--quiet", "origin", "HEAD:refs/heads/main");

  const { sessionId } = record.session;
  await markAdHocDone(dashboard, sessionId);

  const recorded = await post();
  expect(recorded.status, recorded.body).toBe(200);
  expect(landingReceiptSchema.parse(JSON.parse(recorded.body))).toEqual({
    ...receipt,
    state: "recorded",
  });
  expect(await adHocReview(request, dashboard, sessionId)).toMatchObject({
    kind: "landed",
    baseline: base,
    tree: revision,
  });
});

test("an unrelated accepted change leaves the saved branch available", async ({
  dashboard,
  origin,
  request,
}) => {
  const { workspace, session } = await launchIsolatedReview(
    dashboard,
    "Keep a separate draft",
  );
  const tip = commit(workspace, "draft.txt");
  await origin.publishRevision({
    files: { "other-change.txt": "Another delivery\n" },
  });

  await markAdHocDone(dashboard, session);

  expect(await adHocReview(request, dashboard, session)).toMatchObject({
    kind: "branch-result",
    tree: tip,
    files: [{ path: "draft.txt" }],
    deliveryGap: expect.stringContaining("Delivery to trunk is unverified"),
  });
});

test("an early quiet Done keeps its verified manual pair when the native session binds", async ({
  dashboard,
  request,
}) => {
  dashboard.claudeScenario("held");
  const launched = await accept(
    dashboard,
    makeMe.aLaunchRequest
      .adHoc({ instruction: "Keep the branch draft" })
      .withPolicy({ workspace: "isolated", landing: "review" })
      .please(),
  );
  expect(launched.status, launched.body).toBe(200);
  const accepted = acceptanceSchema.parse(JSON.parse(launched.body));
  if (accepted.kind !== "accepted") throw new Error("Missing launch attempt.");
  const current = () =>
    keptAttempts(dashboard).find(
      (attempt) => attempt.id === accepted.attempt.id,
    );
  await expect.poll(() => current()?.landingRepository).toBeDefined();
  await expect.poll(() => dashboard.claudeLaunchCalls().length).toBe(1);
  const attempt = current();
  const workspace = attempt?.landingRepository?.workspace;
  const command = attempt?.reporting?.command;
  if (workspace === undefined || command === undefined)
    throw new Error("Missing isolated launch workspace and reporting command.");
  const base = git(workspace, "rev-parse", "HEAD");
  const revision = commit(workspace, "early.txt");
  git(workspace, "push", "--quiet", "origin", "HEAD:refs/heads/main");
  const reported = await reportingChild(
    `${command} --outcome completed`,
    workspace,
  );
  expect(reported.ok, reported.stderr).toBe(true);
  expect(completionReceiptSchema.parse(JSON.parse(reported.stdout)).state).toBe(
    "pending-native-session",
  );

  dashboard.releaseHeldClaude();
  const outcome = await settledOutcome(dashboard, accepted.attempt.id);
  if (outcome.kind !== "launched") throw new Error("No bound session.");

  expect(
    await adHocReview(request, dashboard, outcome.session.sessionId),
  ).toMatchObject({
    kind: "landed",
    baseline: base,
    tree: revision,
  });
});
