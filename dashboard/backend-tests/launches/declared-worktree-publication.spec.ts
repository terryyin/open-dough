// An instructed launch that declared its worktree publishes only for itself,
// keeps its prepared pair before push and its exact receipt after retirement.
import { expect, onTestFinished, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { branchLandingContext } from "../../server/branchLandingContext.ts";
import { handleLanding } from "../../server/launchLandingReporting.ts";
import { retireAdHocBranch } from "../../test-support/support/adHocBranchRefs.ts";
import { composedLandingStores } from "../support/composedLandingStores.ts";
import { source } from "../support/doneCaptureCase.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";
import {
  installPublisher,
  publishInstalled,
  retryInstalledLanding,
} from "../support/installedPublisher.ts";
import { dashboardOrigin } from "../support/publisherDashboardOrigin.ts";

const reference = "11111111-0000-4000-8000-000000000714";
const otherReference = "11111111-0000-4000-8000-000000000715";
const reportingAs = (reference: string) => ({
  origin: dashboardOrigin,
  reference,
  command: "report",
});

// The launch attempt the dashboard accepted for an instructed launch, whose
// session reports through `reference`.
const anAcceptedLaunch = (
  reference: string,
  sessionId: string,
  acceptedAt: string,
) =>
  makeMe.anAcceptedAttempt
    .withId(reference)
    .adHoc()
    .acceptedAt(acceptedAt)
    .reportingTo(dashboardOrigin)
    .launched({ host: "claude", sessionId })
    .capturingLanding({ reporting: reportingAs(reference) })
    .please();

test("the declared worktree's installed landing and exact retry stay with the original launch", async () => {
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
      launch.reportingThrough(reportingAs(reference)),
    )
    .withDefaultMainLaunch("other-launch", { launched: 60 }, (launch) =>
      launch.reportingThrough(reportingAs(otherReference)),
    )
    .kept()
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
  const { record, file: context } = answered;
  const entry = record.branchEntry;
  const stores = composedLandingStores({
    records: { [source]: [record, other] },
  });
  await stores.replaceAttempts(() => ({
    [source]: [
      anAcceptedLaunch(reference, record.session.sessionId, at(60)),
      anAcceptedLaunch(otherReference, "other-launch", at(60)),
    ],
  }));
  const trunk = async () =>
    (
      await git(checkout.integration, "ls-remote", "origin", "main")
    ).stdout.split("\t")[0];

  const base = checkout.base;
  expect(
    (JSON.parse(readFileSync(context, "utf8")) as { reference: string })
      .reference,
  ).toBe(reference);
  expect(entry).toMatchObject({
    branch,
    repository: checkout.gitDirectory,
    committedTip: base,
    trunk: { remote: "origin", target: "refs/heads/main" },
  });
  expect(stores.recordOf(record.session.sessionId)?.branchEntry).toEqual(entry);

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
  const originalBefore = stores.recordOf(record.session.sessionId);
  const otherBefore = stores.recordOf("other-launch");
  await expect(
    handleLanding(
      makeMe.aLandingSubmission
        .forLaunch({ host: "claude", reference: otherReference })
        .comparing({ base, revision: candidate })
        .please(),
      dashboardOrigin,
      "record",
      stores,
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
      stores,
    ),
  ).rejects.toMatchObject({ status: 409 });
  expect(stores.recordOf(record.session.sessionId)).toEqual(originalBefore);
  expect(stores.recordOf("other-launch")).toEqual(otherBefore);
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
    () =>
      Promise.resolve(
        stores.recordOf(record.session.sessionId)?.landingReporting
          ?.preparations,
      ),
    stores,
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
    base,
    revision: candidate,
    remote: "origin",
    target: "refs/heads/main",
  });
  retireAdHocBranch(checkout.integration, workspace, branch);
  expect(await retryInstalledLanding(context, stores)).toEqual(landing.receipt);
  expect(await trunk()).toBe(candidate);
  expect(stores.recordOf(record.session.sessionId)?.landing).toMatchObject({
    reference,
    base,
    revision: candidate,
    delivery: landing.receipt.delivery,
    receipt: landing.receipt.receipt,
  });
  expect(stores.recordOf("other-launch")).toEqual(otherBefore);
});
