// An instructed launch that declared its worktree publishes only for itself,
// keeps its prepared pair before push and its exact receipt after retirement.
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { retireAdHocBranch } from "../../test-support/support/adHocBranchRefs.ts";
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
  minutesAgo,
  source,
  work,
} from "../support/doneCaptureCase.ts";
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
  const { checkout, workspace, record, entry, context, stores } =
    await aDeclaredPublisherBranch(branch, {
      reporting: reportingAs(reference),
      others: other,
    });
  await stores.replaceAttempts(() => ({
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
  expect(stores.recordOf(record.session.sessionId)?.branchEntry).toEqual(entry);

  const { draft: candidate } = await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork.committing("draft", {
      at: minutesAgo(30),
      files: { "draft.txt": "draft.txt\n" },
    }),
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
    recordLanding(
      makeMe.aLandingSubmission
        .forLaunch({ host: "claude", reference: otherReference })
        .comparing({ base, revision: candidate })
        .please(),
      stores,
    ),
  ).rejects.toMatchObject({ status: 409 });
  await expect(
    recordLanding(
      makeMe.aLandingSubmission
        .forLaunch({ host: "claude", reference })
        .comparing({ base, revision: wrongTip })
        .please(),
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
