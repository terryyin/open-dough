// Existing record retention owns reporting continuity; no history lifetime is extended.
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { test, expect, stored } from "./support/codexStart.ts";
import { launch } from "./agentLaunchBoundary.ts";
import { requestFor, oneShot } from "./support/oneShotLaunch.ts";
import { context, commit, git } from "./support/oneShotLanding.ts";
import { retireReviewRun } from "./support/oneShotReview.ts";
import {
  builtDashboardDir,
  startDashboardServer,
} from "./support/dashboardServer.ts";
import {
  reportingChild,
  recordOperation,
} from "./support/completionRecovery.ts";
import {
  publishLanding,
  retainedLanding,
  landingGitFault,
} from "./support/oneShotLandingRecovery.ts";
import {
  landingRetentionClock,
  dropExpiredAttempts,
} from "./support/landingRetentionClock.ts";
import { keptAttempts } from "./acceptedAttempts.ts";
import { landingReceiptSchema } from "../src/launchLanding.ts";
import { retainedLandingEvidence } from "./support/landingRetentionEvidence.ts";

test("an original kept bound launch first captures and retries after its actual attempt expiry, while premature loss and expired records refuse", async ({
  dashboard,
  origin,
  codexProtocol: native,
}) => {
  test.setTimeout(120000);
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
    const evidence = await retainedLandingEvidence(
      receiver,
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
    expect(stored(receiver.home)[0]?.completion).toEqual(evidence.completion);
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
    const beforeExpired = readFileSync(
      path.join(receiver.home, ".open-dough/dashboard/agent-launches.json"),
      "utf8",
    );
    expect((await reportingChild(input.retry, origin.machine)).ok).toBe(false);
    expect(
      readFileSync(
        path.join(receiver.home, ".open-dough/dashboard/agent-launches.json"),
        "utf8",
      ),
    ).toBe(beforeExpired);
    expect(
      git(repository, "for-each-ref", "--format=%(refname) %(objectname)"),
    ).toBe(beforeRefusal);
    expect(readFileSync(evidence.file, "utf8")).toBe(evidence.mark);
    expect(
      git(
        repository,
        "for-each-ref",
        "refs/open-dough/reviewed",
        "--format=%(refname) %(objectname)",
      ),
    ).toBe(evidence.markedRefs);
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
