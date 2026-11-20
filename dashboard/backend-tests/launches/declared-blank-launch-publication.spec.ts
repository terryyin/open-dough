// A blank Default main launch that declared its worktree keeps its installed
// landing, exact retry and landing pins after retirement and Done, until its
// record is deleted.
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { deleteRecord, keptRecords } from "../../server/launchRecordStore.ts";
import {
  landingPins,
  retireAdHocBranch,
} from "../../test-support/support/adHocBranchRefs.ts";
import {
  aDeclaredPublisherBranch,
  contextReference,
} from "../support/declaredPublisherBranch.ts";
import {
  inWorktree,
  keptRecordOf,
  minutesAgo,
  source,
  work,
} from "../support/doneCaptureCase.ts";
import {
  review,
  keptAsDoneAfterRetirement,
} from "../support/doneCaptureReview.ts";
import {
  publishInstalled,
  retryInstalledLanding,
} from "../support/installedPublisher.ts";

test("a blank Default main launch keeps its declared landing until record deletion", async () => {
  const branch = "blank-draft";
  const { checkout, workspace, record, context } =
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
    async () => (await keptRecordOf(session))?.landingReporting?.preparations,
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

  await keptAsDoneAfterRetirement(record);
  expect(await retryInstalledLanding(context)).toEqual(landing.receipt);
  expect((await keptRecordOf(session))?.request.reporting).toBeUndefined();
  expect(await review(await keptRecords(source), record)).toMatchObject({
    kind: "landed",
    baseline: base,
    tree: candidate,
    landing: { reference },
    files: [{ kind: "added", path: "blank-landing.txt" }],
  });
  const pins = landingPins(checkout.integration);
  expect(pins.length).toBeGreaterThan(0);
  expect(
    pins.every((pin) =>
      pin.startsWith(`refs/open-dough/one-shot/${reference}/`),
    ),
  ).toBe(true);
  const pinned = await Promise.all(
    pins.map(async (pin) =>
      (await git(checkout.integration, "rev-parse", pin)).stdout.trim(),
    ),
  );
  expect(pinned).toContain(candidate);

  expect(await deleteRecord(source, record.session)).toBe(true);
  expect(landingPins(checkout.integration)).toEqual([]);
});
