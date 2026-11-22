// Existing record retention owns reporting continuity; no history lifetime is extended.
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { launchStoreFile } from "../../test-support/support/launchStore.ts";
import path from "node:path";
import { test, expect, stored } from "../../test-support/support/codexStart.ts";
import { launch } from "../../test-support/agentLaunchBoundary.ts";
import { oneShot } from "../../test-support/support/oneShotLaunch.ts";
import { requestFor } from "../../test-support/support/launchDashboard.ts";
import { commit, git } from "../../test-support/support/launchLanding.ts";
import { landingGitFault } from "../../test-support/support/launchLandingFault.ts";
import { context } from "../../test-support/support/oneShotLanding.ts";
import { retireReviewRun } from "../../test-support/support/oneShotReview.ts";
import { startDashboardServer } from "../../test-support/support/dashboardServer.ts";
import {
  reportingChild,
  recordOperation,
} from "../../test-support/support/completionRecovery.ts";
import {
  publishLanding,
  retainedLanding,
} from "../../test-support/support/oneShotLandingRecovery.ts";
import {
  landingRetentionClock,
  dropExpiredAttempts,
} from "../../test-support/support/landingRetentionClock.ts";
import { keptAttempts } from "../../test-support/acceptedAttempts.ts";
import { landingReceiptSchema } from "../../src/launchLanding.ts";
import { retainedLandingEvidence } from "../../test-support/support/landingRetentionEvidence.ts";

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary" });

test("an original kept bound launch first captures and retries after its actual attempt expiry, while premature loss and expired records refuse", async ({
  dashboard,
  origin,
  codexProtocol: native,
}) => {
  if (native === undefined) throw new Error("No native fixture");
  await dashboard.close();
  const clock = landingRetentionClock(origin.machine);
  const receiver = await startDashboardServer({
    mode: "boundary",
    liveServer: "separate process",
    machine: origin.machine,
    projectFolders: ["open-dough"],
    codexProtocol: native,
    extraEnv: clock.env,
  });
  const env = { ...process.env, ...clock.env };
  try {
    await launch(receiver, {
      ...requestFor("refinement", oneShot("isolated", "auto-land")),
      host: "codex",
    });
    const original = stored(receiver.home)[0];
    if (original === undefined) throw new Error("No real bound launch");
    const { established, reporting } = context(original);
    expect(original.landingReporting?.settledAt).toBeDefined();
    expect(original.landingReporting?.authority).toEqual(
      keptAttempts(receiver)[0]?.landingRepository,
    );
    commit(established.workspace, "retained.txt");
    const fault = landingGitFault(origin.machine);
    fault.losePush();
    expect((await publishLanding(original, origin.machine, fault.env)).ok).toBe(
      false,
    );
    const input = retainedLanding(original);
    const completion = await retainedLandingEvidence(
      original,
      origin.machine,
      input.submission,
    );
    const prepared = stored(receiver.home)[0]?.landingReporting
      ?.preparations[0];
    expect(prepared?.delivery).toBe(input.submission["delivery"]);
    expect(stored(receiver.home)[0]?.landing).toBeUndefined();
    const attemptsFile = path.join(
      receiver.home,
      ".open-dough/dashboard/launch-attempts.json",
    );
    const attemptsBefore = readFileSync(attemptsFile, "utf8");
    for (const state of ["missing", "unreadable"]) {
      if (state === "missing") rmSync(attemptsFile);
      else writeFileSync(attemptsFile, "unreadable attempts\n");
      const refused = await reportingChild(input.retry, origin.machine);
      expect(refused.ok).toBe(false);
      expect(refused.stdout).toBe("");
      expect(stored(receiver.home)[0]?.landing).toBeUndefined();
      if (state === "unreadable")
        expect(readFileSync(attemptsFile, "utf8")).toBe(
          "unreadable attempts\n",
        );
      writeFileSync(attemptsFile, attemptsBefore);
    }
    clock.advanceDays(31);
    await dropExpiredAttempts(receiver.home, env);
    expect(keptAttempts(receiver)).toHaveLength(0);
    expect(stored(receiver.home)).toHaveLength(1);
    const captured = await reportingChild(input.retry, origin.machine);
    expect(captured.ok, captured.stderr).toBe(true);
    const receipt = landingReceiptSchema.parse(JSON.parse(captured.stdout));
    expect(receipt).toMatchObject({
      reference: reporting.reference,
      delivery: input.submission["delivery"],
      base: input.submission["base"],
      revision: input.submission["revision"],
      receipt: prepared?.receipt,
      receivedAt: prepared?.receivedAt,
      state: "recorded",
    });
    expect(stored(receiver.home)[0]?.completion).toEqual(completion);
    expect(keptAttempts(receiver)).toHaveLength(0);
    const repository = retireReviewRun(
      { record: original, established, reporting },
      origin,
      receipt.revision,
    );
    expect(existsSync(established.workspace)).toBe(false);
    expect(
      JSON.parse((await reportingChild(input.retry, origin.machine)).stdout),
    ).toEqual(receipt);
    expect(fault.pushes()).toBe(1);
    const current = stored(receiver.home)[0];
    if (current === undefined) throw new Error("No retained record");
    const stale = {
      ...original,
      landingReporting: undefined,
      landing: undefined,
    };
    await recordOperation(receiver, "updateRecord", ["open-dough", stale], env);
    const replacement = {
      ...stale,
      session: { ...original.session, sessionId: "replacement-conversation" },
    };
    await recordOperation(
      receiver,
      "replaceKeptSession",
      ["open-dough", original.session, replacement],
      env,
    );
    expect(stored(receiver.home)[0]?.landingReporting).toEqual(
      current.landingReporting,
    );
    expect(stored(receiver.home)[0]?.landing).toEqual(current.landing);
    expect(
      JSON.parse((await reportingChild(input.retry, origin.machine)).stdout),
    ).toEqual(receipt);
    await expect(
      recordOperation(receiver, "bindRecord", ["open-dough", replacement], env),
    ).rejects.toThrow("attempt evidence is unreadable or no longer retained");
    // A changed workflow no longer corresponds to the original established preparation.
    const replaced = stored(receiver.home)[0];
    if (replaced === undefined || replaced.request.workflow === "ad-hoc")
      throw new Error("No original story record");
    await recordOperation(
      receiver,
      "updateRecord",
      [
        "open-dough",
        {
          ...replaced,
          request: { ...replaced.request, workflow: "execution" },
        },
      ],
      env,
    );
    expect((await reportingChild(input.retry, origin.machine)).ok).toBe(false);
    await recordOperation(
      receiver,
      "updateRecord",
      ["open-dough", replaced],
      env,
    );
    await recordOperation(
      receiver,
      "setRecordDoneAt",
      [
        "open-dough",
        replacement.session,
        new Date(Date.now() + 31 * 86_400_000).toISOString(),
      ],
      env,
    );
    clock.advanceDays(62);
    const beforeRefusal = git(
      repository,
      "for-each-ref",
      "--format=%(refname) %(objectname)",
    );
    const beforeExpired = readFileSync(launchStoreFile(receiver.home), "utf8");
    expect((await reportingChild(input.retry, origin.machine)).ok).toBe(false);
    expect(readFileSync(launchStoreFile(receiver.home), "utf8")).toBe(
      beforeExpired,
    );
    expect(
      git(repository, "for-each-ref", "--format=%(refname) %(objectname)"),
    ).toBe(beforeRefusal);
    await recordOperation(
      receiver,
      "updateRecord",
      ["open-dough", replaced],
      env,
    );
    expect(stored(receiver.home)).toHaveLength(0);
    expect((await reportingChild(input.retry, origin.machine)).ok).toBe(false);
    expect(stored(receiver.home)).toHaveLength(0);
    expect(keptAttempts(receiver)).toHaveLength(0);
    expect(git(repository, "cat-file", "-t", receipt.base)).toBe("commit");
  } finally {
    await receiver.close();
  }
});
