// A blank Default main launch that declared its worktree keeps its installed
// landing, exact retry and landing pins after retirement, until its
// record is deleted.
import { expect, onTestFinished, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { heldLandingPins } from "../../server/launchLandingGit.ts";
import { deleteRecord } from "../../server/launchRecordStore.ts";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { branchLandingContext } from "../../server/branchLandingContext.ts";
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

test("a blank Default main launch keeps its declared landing until record deletion", async () => {
  const branch = "blank-draft";
  const {
    checkout,
    worktrees,
    records: { "default-launch": declared },
    performWork,
    at,
  } = await aDoneCaptureCase()
    .withOrigin()
    .withWorkspace(branch)
    .withDeclaringLaunch("default-launch", { launched: 60 }, branch)
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
  const stores = composedLandingStores({ records: { [source]: [record] } });
  const session = record.session.sessionId;
  expect(record.request.reporting).toBeUndefined();
  const reference = (
    JSON.parse(readFileSync(context, "utf8")) as { reference: string }
  ).reference;
  const base = checkout.base;
  const { blank: candidate } = await performWork(
    makeMe.aCheckoutWork.committing("blank", {
      at: at(30),
      files: { "blank-landing.txt": "blank-landing.txt\n" },
    }),
    { in: branch },
  );
  const trunk = async () =>
    (
      await git(checkout.integration, "ls-remote", "origin", "main")
    ).stdout.split("\t")[0];

  const { landing, beforePush } = await publishInstalled(
    {
      workspace,
      branch,
      previouslyPublishedBase: base,
      remote: "origin",
      targetRef: "refs/heads/main",
      landingContext: context,
    },
    () =>
      Promise.resolve(stores.recordOf(session)?.landingReporting?.preparations),
    stores,
  );
  expect(landing.receipt).toMatchObject({
    reference,
    base,
    revision: candidate,
  });
  expect(beforePush.trunk).toBe(base);
  expect(beforePush.prepared).toMatchObject([{ base, revision: candidate }]);
  expect(await trunk()).toBe(candidate);
  retireAdHocBranch(checkout.integration, workspace, branch);

  expect(await retryInstalledLanding(context, stores)).toEqual(landing.receipt);
  const saved = stores.recordOf(session);
  expect(saved?.request.reporting).toBeUndefined();
  expect(saved?.landing).toMatchObject({
    reference,
    base,
    revision: candidate,
    delivery: landing.receipt.delivery,
    receipt: landing.receipt.receipt,
  });
  const pinned = `refs/open-dough/one-shot/${reference}/${landing.receipt.delivery}`;
  expect(await heldLandingPins(checkout.integration)).toEqual([
    { ref: `${pinned}/base`, objectId: base },
    { ref: `${pinned}/revision`, objectId: candidate },
  ]);

  expect(await deleteRecord(source, record.session, stores)).toBe(true);
  expect(stores.recordOf(session)).toBeUndefined();
  expect(await heldLandingPins(checkout.integration)).toEqual([]);
});
