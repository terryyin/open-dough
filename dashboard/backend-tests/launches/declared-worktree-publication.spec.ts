// An instructed launch that declared its worktree publishes only for itself,
// keeps its prepared pair before push and its exact receipt after retirement.
import { expect, onTestFinished, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { branchLandingContext } from "../../server/branchLandingContext.ts";
import { keepAttempt } from "../../server/launchAttemptStore.ts";
import { handleLanding } from "../../server/launchLandingReporting.ts";
import { keptSession } from "../../server/launchRecordStore.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { retireAdHocBranch } from "../../test-support/support/adHocBranchRefs.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";
import { keep, source } from "../support/doneCaptureCase.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";
import {
  installPublisher,
  publishInstalled,
  retryInstalledLanding,
} from "../support/installedPublisher.ts";
import { dashboardOrigin } from "../support/publisherDashboardOrigin.ts";

const reference = "11111111-0000-4000-8000-000000000714";
const otherReference = "11111111-0000-4000-8000-000000000715";
const identity = "SEED-439#declared-follow-up";
const reportingAs = (reference: string) => ({
  origin: dashboardOrigin,
  reference,
  command: "report",
});

test("a retained story-linked branch handoff lands and retries through the installed publisher", async () => {
  const branch = "draft";
  const {
    checkout,
    worktrees,
    records: { "default-launch": declared, "other-launch": other },
    performWork,
    at,
  } = await aDoneCaptureCase()
    .withOrigin()
    .withWorkspace(branch)
    .withDeclaringLaunch("default-launch", { launched: 60 }, branch, (launch) =>
      launch
        .adHoc({
          title: "Follow up the declared change",
          storyIdentity: identity,
          followUp: { session: { host: "claude", sessionId: "source" } },
        })
        .reportingThrough(reportingAs(reference)),
    )
    .withCheckoutLaunch("other-launch", { launched: 60 }, (launch) =>
      launch.reportingThrough(reportingAs(otherReference)),
    )
    .please();
  const workspace = worktrees[branch];
  installPublisher(checkout.integration, workspace);
  const directory = mkdtempSync(path.join(tmpdir(), "dough-branch-landing-"));
  onTestFinished(() => {
    rmSync(directory, { recursive: true, force: true });
  });
  const answered = await branchLandingContext(directory, declared, {
    origin: dashboardOrigin,
    source,
  });
  if (answered === undefined) throw new Error("Missing the landing context.");
  const { record: prepared, file: context } = answered;
  // The retained open v0.3.113 declaration already named its story.
  const payload: unknown = JSON.parse(readFileSync(context, "utf8"));
  const record = {
    ...prepared,
    landingReporting: {
      ...prepared.landingReporting,
      authority: { ...prepared.landingReporting.authority, identity },
    },
  };
  writeFileSync(context, JSON.stringify({ ...(payload as object), identity }));
  const home = keep(record, other);
  for (const launch of [record, other])
    await keepAttempt(makeMe.anAcceptedAttempt.reportingFor(launch).please());
  const kept = (launch: LaunchRecord) => keptSession(source, launch.session);
  const trunk = async () =>
    (
      await git(checkout.integration, "ls-remote", "origin", "main")
    ).stdout.split("\t")[0];

  const base = checkout.base;
  expect(
    (JSON.parse(readFileSync(context, "utf8")) as { reference: string })
      .reference,
  ).toBe(reference);

  const { draft: candidate } = await performWork(
    makeMe.aCheckoutWork.committing("draft", {
      at: at(30),
      files: { "draft.txt": "draft.txt\n" },
    }),
    { in: branch },
  );
  const wrongTip = (
    await git(
      workspace,
      "commit-tree",
      `${candidate}^{tree}`,
      "-p",
      base,
      "-m",
      "Unaccepted comparison",
    )
  ).stdout.trim();
  const originalBefore = await kept(record);
  const otherBefore = await kept(other);
  const submission = {
    ...makeMe.aLandingSubmission
      .forLaunch({ host: "claude", reference })
      .comparing({ base, revision: candidate })
      .please(),
    identity,
  };
  for (const mismatch of [
    { ...submission, identity: "SEED-439#other-story" },
    { ...submission, host: "codex" as const },
    { ...submission, remote: "foreign" },
    { ...submission, target: "refs/heads/foreign" },
    { ...submission, revision: wrongTip },
  ]) {
    await expect(
      handleLanding(mismatch, dashboardOrigin, "prepare"),
    ).rejects.toMatchObject({ status: 409 });
    expect(await trunk()).toBe(base);
  }
  const { landingReporting } = record;
  for (const mismatch of [
    { ...landingReporting.authority, repository: checkout.integration },
    { ...landingReporting.authority, workspace: checkout.integration },
    { ...landingReporting.authority, branch: "foreign" },
  ]) {
    keepLaunchStore(home, {
      [source]: [
        {
          ...record,
          landingReporting: { ...landingReporting, authority: mismatch },
        },
        other,
      ],
    });
    await expect(
      handleLanding(submission, dashboardOrigin, "prepare"),
    ).rejects.toMatchObject({ status: 409 });
    expect(await trunk()).toBe(base);
  }
  const entry = record.branchEntry;
  if (entry?.trunk === undefined) throw new Error("Missing declared trunk.");
  keepLaunchStore(home, {
    [source]: [
      {
        ...record,
        branchEntry: {
          ...entry,
          trunk: { ...entry.trunk, revision: wrongTip },
        },
      },
      other,
    ],
  });
  await expect(
    handleLanding(submission, dashboardOrigin, "prepare"),
  ).rejects.toMatchObject({ status: 409 });
  expect(await trunk()).toBe(base);
  keepLaunchStore(home, { [source]: [{ ...record, doneAt: at(10) }, other] });
  await expect(
    handleLanding(submission, dashboardOrigin, "prepare"),
  ).rejects.toMatchObject({ status: 409 });
  expect(await trunk()).toBe(base);
  keepLaunchStore(home, { [source]: [record, other] });
  await expect(
    handleLanding(
      makeMe.aLandingSubmission
        .forLaunch({ host: "claude", reference: otherReference })
        .comparing({ base, revision: candidate })
        .please(),
      dashboardOrigin,
      "record",
    ),
  ).rejects.toMatchObject({ status: 409 });
  await expect(
    handleLanding(
      makeMe.aLandingSubmission
        .forLaunch({ host: "claude", reference })
        .comparing({ base, revision: wrongTip })
        .please(),
      dashboardOrigin,
      "record",
    ),
  ).rejects.toMatchObject({ status: 409 });
  expect(await kept(record)).toEqual(originalBefore);
  expect(await kept(other)).toEqual(otherBefore);
  expect(originalBefore?.landingReporting?.preparations).toEqual([]);
  expect(otherBefore?.landing).toBeUndefined();

  const { landing, beforePush, ...published } = await publishInstalled(
    {
      workspace,
      branch,
      previouslyPublishedBase: base,
      remote: "origin",
      targetRef: "refs/heads/main",
      landingContext: context,
    },
    async () => (await kept(record))?.landingReporting?.preparations,
  );
  expect(beforePush.trunk).toBe(base);
  expect(beforePush.prepared).toMatchObject([{ base, revision: candidate }]);
  expect({ ...published, landing }).toMatchObject({
    ok: true,
    publication: "accepted",
    receipt: { sha: candidate },
    landing: { state: "recorded" },
  });
  expect(landing.receipt).toMatchObject({
    reference,
    identity,
    base,
    revision: candidate,
    remote: "origin",
    target: "refs/heads/main",
  });
  retireAdHocBranch(checkout.integration, workspace, branch);
  expect(await retryInstalledLanding(context)).toEqual(landing.receipt);
  expect(await trunk()).toBe(candidate);
  expect((await kept(record))?.landing).toMatchObject({
    reference,
    base,
    revision: candidate,
    delivery: landing.receipt.delivery,
    receipt: landing.receipt.receipt,
  });
  expect(await kept(other)).toEqual(otherBefore);
});
