// An instructed launch that declared its worktree publishes only for itself,
// keeps the prepared pair before push, and after acceptance, retirement and
// Done its exact retained retry reads the same receipt and landed file.
import path from "node:path";
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { replaceAttempts } from "../../server/launchAttemptStore.ts";
import { retireAdHocBranch } from "../../test-support/support/adHocReview.ts";
import {
  aDeclaredPublisherBranch,
  contextReference,
  dashboardOrigin,
  recordLanding,
} from "../support/declaredPublisherBranch.ts";
import {
  aDefaultLaunch,
  canonicalGitDirectory,
  type Checkout,
  inWorktree,
  keptRecordOf,
  markDone,
  minutesAgo,
  source,
  work,
} from "../support/doneCaptureCase.ts";
import { fileText, review } from "../support/doneCaptureReview.ts";
import {
  publishInstalled,
  retryInstalledLanding,
} from "../support/installedPublisher.ts";

const reference = "11111111-0000-4000-8000-000000000714";
const otherReference = "11111111-0000-4000-8000-000000000715";
const reportingAs = (reference: string) => ({
  origin: dashboardOrigin,
  reference,
  command: "report",
});

// The launch attempt the dashboard accepted for an instructed launch, whose
// session reports through `reference`.
const anAcceptedLaunch = (reference: string, sessionId: string) =>
  makeMe.anAcceptedAttempt
    .withId(reference)
    .adHoc()
    .acceptedAt(minutesAgo(60))
    .reportingTo(dashboardOrigin)
    .launched({ host: "claude", sessionId })
    .capturingLanding({ reporting: reportingAs(reference) })
    .please();

test("the declared worktree's installed landing and exact retry stay with the original launch", async () => {
  const branch = "draft";
  const other = (checkout: Checkout) => [
    aDefaultLaunch(checkout, {
      sessionId: "other-launch",
      title: "Review a different change",
    })
      .reportingThrough(reportingAs(otherReference))
      .please(),
  ];
  const { checkout, workspace, record, entry, context } =
    await aDeclaredPublisherBranch(branch, {
      reporting: reportingAs(reference),
      others: other,
    });
  await replaceAttempts(() => ({
    [source]: [
      anAcceptedLaunch(reference, record.session.sessionId),
      anAcceptedLaunch(otherReference, "other-launch"),
    ],
  }));
  const trunk = async () =>
    (
      await git(checkout.integration, "ls-remote", "origin", "main")
    ).stdout.split("\t")[0];

  const base = checkout.base;
  expect(contextReference(context)).toBe(reference);
  expect(entry).toMatchObject({
    branch,
    repository: canonicalGitDirectory(checkout),
    committedTip: base,
    trunk: { remote: "origin", target: "refs/heads/main" },
  });
  expect((await keptRecordOf(record.session.sessionId))?.branchEntry).toEqual(
    entry,
  );

  const { draft: candidate } = await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork.committing("draft", {
      at: minutesAgo(30),
      files: { "draft.txt": "draft.txt\n" },
    }),
  );
  const undeclared = path.join(path.dirname(workspace), "undeclared");
  await git(
    checkout.integration,
    "worktree",
    "add",
    "--quiet",
    "-b",
    "unrelated",
    undeclared,
  );
  const { unrelated: wrongTip } = await work(
    inWorktree(checkout, undeclared),
    makeMe.aCheckoutWork.committing("unrelated", { at: minutesAgo(25) }),
  );
  const originalBefore = await keptRecordOf(record.session.sessionId);
  const otherBefore = await keptRecordOf("other-launch");
  await expect(
    recordLanding(
      makeMe.aLandingSubmission
        .forLaunch({ host: "claude", reference: otherReference })
        .comparing({ base, revision: candidate })
        .please(),
    ),
  ).rejects.toMatchObject({ status: 409 });
  await expect(
    recordLanding(
      makeMe.aLandingSubmission
        .forLaunch({ host: "claude", reference })
        .comparing({ base, revision: wrongTip })
        .please(),
    ),
  ).rejects.toMatchObject({ status: 409 });
  expect(await keptRecordOf(record.session.sessionId)).toEqual(originalBefore);
  expect(await keptRecordOf("other-launch")).toEqual(otherBefore);
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
    async () =>
      (await keptRecordOf(record.session.sessionId))?.landingReporting
        ?.preparations,
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
  expect(await trunk()).toBe(candidate);
  expect(
    (await keptRecordOf(record.session.sessionId))?.doneAt,
  ).toBeUndefined();

  retireAdHocBranch(checkout.integration, workspace, branch);
  await markDone(record);
  expect(await retryInstalledLanding(context)).toEqual(landing.receipt);
  expect(await trunk()).toBe(candidate);
  expect(await review(record)).toMatchObject({
    kind: "landed",
    baseline: base,
    tree: candidate,
    landing: { reference },
    files: [{ kind: "added", path: "draft.txt" }],
  });
  expect(
    await fileText(record, {
      path: "draft.txt",
      baseline: base,
      tree: candidate,
      reference,
    }),
  ).toMatchObject({ baseline: null, tree: "draft.txt\n" });
});
