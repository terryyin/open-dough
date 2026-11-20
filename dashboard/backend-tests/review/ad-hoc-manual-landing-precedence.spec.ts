import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { completionReceiptSchema } from "../../src/completionReport.ts";
import { acceptanceSchema } from "../../src/launchOutcome.ts";
import {
  keptAttempts,
  settledOutcome,
} from "../../test-support/acceptedAttempts.ts";
import { accept } from "../../test-support/agentLaunchBoundary.ts";
import { adHocReview } from "../../test-support/support/adHocReview.ts";
import { reportingChild } from "../../test-support/support/completionRecovery.ts";
import { commit, git } from "../../test-support/support/launchLanding.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";

test.use({ serverMode: "boundary" });

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
