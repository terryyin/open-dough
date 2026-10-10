// Existing record retention owns reporting continuity; no history lifetime is extended.
import { test, expect, stored } from "./support/codexStart.ts";
import { launch } from "./agentLaunchBoundary.ts";
import { requestFor, oneShot } from "./support/oneShotLaunch.ts";
import { context, commit, git } from "./support/oneShotLanding.ts";
import { captureReviewRun, retireReviewRun } from "./support/oneShotReview.ts";
import {
  builtDashboardDir,
  startDashboardServer,
} from "./support/dashboardServer.ts";
import {
  reportingChild,
  recordOperation,
} from "./support/completionRecovery.ts";
import {
  retainedLanding,
  landingGitFault,
} from "./support/oneShotLandingRecovery.ts";
import {
  landingRetentionClock,
  dropExpiredAttempts,
} from "./support/landingRetentionClock.ts";
import { otherQueuedIdentity } from "./support/startOrigin.ts";
import { keptAttempts } from "./acceptedAttempts.ts";

test("deletion after attempt expiry retains refusal and repository through a real pin cleanup failure, then removes only that launch", async ({
  dashboard,
  origin,
  codexProtocol,
}) => {
  test.setTimeout(120000);
  const native = codexProtocol;
  if (native === undefined) throw new Error("No native fixture");
  await dashboard.close();
  const clock = landingRetentionClock(origin.machine);
  const receiver = await startDashboardServer({
    mode: "preview",
    prebuilt: builtDashboardDir,
    machine: origin.machine,
    projectFolders: ["open-dough"],
    codexProtocol: native,
    port: Number(new URL(dashboard.origin).port),
    extraEnv: clock.env,
  });
  const fault = landingGitFault(origin.machine);
  const env = { ...fault.env, ...clock.env };
  try {
    await launch(receiver, {
      ...requestFor("execution", oneShot("isolated", "auto-land")),
      host: "codex",
    });
    const original = stored(receiver.home)[0];
    if (original === undefined) throw new Error("No real launch");
    const run = { record: original, ...context(original) };
    commit(run.established.workspace, "cleanup.txt");
    const receipt = captureReviewRun(run, origin);
    const input = retainedLanding(original);
    const repository = retireReviewRun(run, origin, receipt.revision);
    native.threadId = "another-retained-launch";
    await launch(receiver, {
      ...requestFor("refinement", oneShot("isolated", "auto-land")),
      identity: otherQueuedIdentity,
      title: "Story B",
      host: "codex",
    });
    const other = stored(receiver.home).find(
      (entry) => entry.session.sessionId === native.threadId,
    );
    if (other === undefined) throw new Error("No other retained launch");
    const otherRun = { record: other, ...context(other) };
    commit(otherRun.established.workspace, "another-retained-comparison.txt");
    const otherReceipt = captureReviewRun(otherRun, origin);
    const otherPins = git(
      repository,
      "for-each-ref",
      `refs/open-dough/one-shot/${otherReceipt.reference}`,
    );
    clock.advanceDays(31);
    await dropExpiredAttempts(receiver.home, env);
    expect(keptAttempts(receiver)).toHaveLength(0);
    fault.failCleanup();
    await expect(
      recordOperation(
        receiver,
        "deleteRecord",
        ["open-dough", original.session],
        env,
      ),
    ).rejects.toThrow("Injected pin cleanup EIO");
    expect(stored(receiver.home)[0]?.landingReporting?.deletedAt).toBeDefined();
    expect(
      git(
        repository,
        "for-each-ref",
        `refs/open-dough/one-shot/${receipt.reference}`,
      ),
    ).not.toBe("");
    const refused = await reportingChild(input.retry, origin.machine);
    expect(refused.ok).toBe(false);
    expect(refused.stderr).toContain("deleted");
    const stale = {
      ...original,
      landing: undefined,
      landingReporting: undefined,
    };
    await recordOperation(receiver, "updateRecord", ["open-dough", stale], env);
    await expect(
      recordOperation(receiver, "bindRecord", ["open-dough", stale], env),
    ).rejects.toThrow("attempt evidence is unreadable or no longer retained");
    expect(stored(receiver.home)[0]?.landingReporting?.deletedAt).toBeDefined();
    expect((await reportingChild(input.retry, origin.machine)).ok).toBe(false);
    expect(
      (
        await recordOperation(
          receiver,
          "deleteRecord",
          ["open-dough", original.session],
          env,
        )
      ).stdout.trim(),
    ).toBe("true");
    expect(
      git(
        repository,
        "for-each-ref",
        `refs/open-dough/one-shot/${receipt.reference}`,
      ),
    ).toBe("");
    expect(stored(receiver.home)).toHaveLength(1);
    expect(stored(receiver.home)[0]?.landing?.receipt).toBe(
      otherReceipt.receipt,
    );
    expect(
      git(
        repository,
        "for-each-ref",
        `refs/open-dough/one-shot/${otherReceipt.reference}`,
      ),
    ).toBe(otherPins);
    expect((await reportingChild(input.retry, origin.machine)).ok).toBe(false);
    expect(
      (
        await recordOperation(
          receiver,
          "updateRecord",
          ["open-dough", stale],
          env,
        )
      ).stdout.trim(),
    ).toBe("false");
    expect(stored(receiver.home)).toHaveLength(1);
  } finally {
    await receiver.close();
  }
});
