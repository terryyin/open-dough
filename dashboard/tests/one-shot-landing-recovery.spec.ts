// Accepted reconciled publication survives real response, write and acknowledgment loss.
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { test, expect, stored } from "./support/codexStart.ts";
import { launch } from "./agentLaunchBoundary.ts";
import { requestFor, oneShot } from "./support/oneShotLaunch.ts";
import { context, commit, git } from "./support/oneShotLanding.ts";
import { retireReviewRun } from "./support/oneShotReview.ts";
import { keptAttempts } from "./acceptedAttempts.ts";
import {
  builtDashboardDir,
  startDashboardServer,
} from "./support/dashboardServer.ts";
import {
  reportingChild,
  recordOperation,
  completionWriteFault,
  completionProxy,
} from "./support/completionRecovery.ts";
import {
  publishLanding,
  resumeLanding,
  retainedLanding,
  landingGitFault,
} from "./support/oneShotLandingRecovery.ts";
import { landingReceiptSchema } from "../src/oneShotLanding.ts";
import { storyReviewMarkEndpoint } from "../src/storyReview.ts";
import { observeLandingRecoveryIntent } from "./support/landingRecoveryIntent.ts";

test("a lost reconciled push result and record write recover the exact original launch once after retirement", async ({
  page,
  dashboard,
  origin,
  codexProtocol: native,
}) => {
  test.setTimeout(150000);
  if (native === undefined) throw new Error("No native fixture");
  await launch(dashboard, {
    ...requestFor("refinement", oneShot("isolated", "auto-land")),
    host: "codex",
  });
  const original = stored(dashboard.home)[0];
  if (original === undefined) throw new Error("No real launch");
  const { established, reporting } = context(original);
  const tree = git(established.workspace, "rev-parse", "HEAD^{tree}");
  const mark = await page.request.post(
    `${dashboard.origin}${storyReviewMarkEndpoint}`,
    {
      headers: { Origin: dashboard.origin },
      data: {
        source: "open-dough",
        identity: established.identity,
        tree,
        baseline: established.startingRevision,
      },
    },
  );
  expect(await mark.json()).toMatchObject({ kind: "marked" });
  const marksFile = path.join(
    dashboard.home,
    ".open-dough/dashboard/review-marks.json",
  );
  const markBefore = readFileSync(marksFile, "utf8");
  const refsBefore = git(
    origin.project,
    "for-each-ref",
    "refs/open-dough/reviewed",
    "--format=%(refname) %(objectname)",
  );
  commit(established.workspace, "own-1.txt");
  const originalTip = commit(established.workspace, "own-2.txt");
  const anotherWriter = commit(origin.project, "another-writer.txt");
  git(origin.project, "push", "origin", "main");
  const gitFault = landingGitFault(origin.machine);
  gitFault.losePush();
  const lost = await publishLanding(original, origin.machine, gitFault.env, [
    "own-1.txt",
    "own-2.txt",
  ]);
  expect(lost.ok).toBe(false);
  expect(lost.stderr).toContain("Accepted push response lost");
  const input = retainedLanding(original);
  const retainedInputBytes = readFileSync(input.pending, "utf8");
  expect(input.submission["base"]).toBe(anotherWriter);
  expect(input.submission["revision"]).not.toBe(originalTip);
  expect(await origin.originGit("rev-parse", "main")).toContain(
    input.submission["revision"],
  );
  expect(
    git(
      established.workspace,
      "diff",
      "--name-only",
      input.submission["base"] ?? "",
      input.submission["revision"] ?? "",
    ).split("\n"),
  ).toEqual(["own-1.txt", "own-2.txt"]);
  expect(stored(dashboard.home)[0]?.landing).toBeUndefined();
  expect(gitFault.pushes()).toBe(1);
  git(origin.project, "fetch", "origin");
  git(origin.project, "reset", "--hard", "origin/main");
  const newerTrunk = commit(origin.project, "newer-trunk.txt");
  git(origin.project, "push", "origin", "main");
  await dashboard.close();
  const fault = completionWriteFault(origin.machine);
  const receiver = await startDashboardServer({
    mode: "preview",
    prebuilt: builtDashboardDir,
    machine: origin.machine,
    projectFolders: ["open-dough"],
    codexProtocol: native,
    extraEnv: fault.env,
  });
  const proxy = await completionProxy(
    dashboard.origin,
    receiver.origin,
    "/__agent-launch/landing",
  );
  try {
    fault.arm();
    const resume = await resumeLanding(original, origin.machine, gitFault.env);
    expect(resume.ok, resume.stderr).toBe(true);
    expect(JSON.parse(resume.stdout)).toMatchObject({
      publication: "accepted",
      pushCount: 0,
      suffixBase: anotherWriter,
      receipt: { sha: input.submission["revision"] },
      landing: { state: "unacknowledged" },
    });
    const failed = z
      .looseObject({ landing: z.object({ error: z.string() }) })
      .parse(JSON.parse(resume.stdout));
    const retry = /^Retry reporting only: (.+)$/m.exec(
      failed.landing.error,
    )?.[1];
    if (retry === undefined) throw new Error("No printed reporting-only retry");
    expect(retry).toContain(path.dirname(reporting.landingContext ?? ""));
    expect(retry).not.toContain(established.workspace);
    expect(await origin.originGit("rev-parse", "main")).toContain(newerTrunk);
    expect(stored(receiver.home)[0]?.landing).toBeUndefined();
    const reserved = keptAttempts(receiver).find(
      (entry) => entry.id === reporting.reference,
    )?.landing;
    expect(reserved).toMatchObject({
      base: anotherWriter,
      revision: input.submission["revision"],
      delivery: input.submission["delivery"],
    });
    const repository = retireReviewRun(
      { record: original, established, reporting },
      origin,
      input.submission["revision"] ?? "",
    );
    expect(existsSync(established.workspace)).toBe(false);
    const stale = {
      ...original,
      firstInput: {
        ...original.firstInput,
        state: "confirmed" as const,
        explanation: "Later native input evidence",
      },
    };
    await Promise.all([
      recordOperation(receiver, "bindRecord", ["open-dough", stale]),
      recordOperation(receiver, "updateRecord", ["open-dough", stale]),
    ]);
    expect(stored(receiver.home)[0]?.landing).toEqual(reserved);
    proxy.dropNext();
    const ackLost = await reportingChild(retry, origin.machine, gitFault.env);
    expect(ackLost.ok).toBe(false);
    expect(ackLost.stdout).toBe("");
    expect(proxy.lost()).toBe(1);
    const first = landingReceiptSchema.parse(
      JSON.parse(
        (await reportingChild(retry, origin.machine, gitFault.env)).stdout,
      ),
    );
    expect(first).toMatchObject({
      reference: reporting.reference,
      delivery: input.submission["delivery"],
      base: anotherWriter,
      revision: input.submission["revision"],
      state: "recorded",
    });
    expect(first.receipt).toBe(reserved?.receipt);
    const duplicates = await Promise.all([
      reportingChild(retry, origin.machine, gitFault.env),
      reportingChild(retry, origin.machine, gitFault.env),
    ]);
    for (const duplicate of duplicates)
      expect(JSON.parse(duplicate.stdout)).toEqual(first);
    await observeLandingRecoveryIntent({
      receiver,
      original,
      stale,
      native,
      cwd: origin.machine,
      retry,
      first,
      reserved,
      env: gitFault.env,
    });
    expect(readFileSync(input.pending, "utf8")).toBe(retainedInputBytes);
    expect(gitFault.pushes()).toBe(1);
    expect(readFileSync(marksFile, "utf8")).toBe(markBefore);
    expect(
      git(
        repository,
        "for-each-ref",
        "refs/open-dough/reviewed",
        "--format=%(refname) %(objectname)",
      ),
    ).toBe(refsBefore);
  } finally {
    await proxy.close();
    await receiver.close();
  }
});
