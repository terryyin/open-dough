// A blank Default main launch that declared its worktree keeps its installed
// landing, exact retry and landing pins after retirement, until its
// record is deleted.
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { heldLandingPins } from "../../server/launchLandingGit.ts";
import { deleteRecord } from "../../server/launchRecordStore.ts";
import { retireAdHocBranch } from "../../test-support/support/adHocBranchRefs.ts";
import {
  aDeclaredPublisherBranch,
  contextReference,
} from "../support/declaredPublisherBranch.ts";
import {
  inWorktree,
  minutesAgo,
  source,
  work,
} from "../support/doneCaptureCase.ts";
import {
  publishInstalled,
  retryInstalledLanding,
} from "../support/installedPublisher.ts";

test("a blank Default main launch keeps its declared landing until record deletion", async () => {
  const branch = "blank-draft";
  const { checkout, workspace, record, context, stores } =
    await aDeclaredPublisherBranch(branch);
  const session = record.session.sessionId;
  expect(record.request.reporting).toBeUndefined();
  const reference = contextReference(context);
  const base = checkout.base;
  const { blank: candidate } = await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork.committing("blank", {
      at: minutesAgo(30),
      files: { "blank-landing.txt": "blank-landing.txt\n" },
    }),
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

  // Record deletion stays on the machine record store.
  expect(await deleteRecord(source, record.session)).toBe(true);
  expect(await heldLandingPins(checkout.integration)).toEqual([]);
});
