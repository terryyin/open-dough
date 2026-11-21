// An instructed launch that declared its worktree publishes only for itself,
// keeps its prepared pair before push and its exact receipt after retirement.
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keepAttempt } from "../../server/launchAttemptStore.ts";
import { keptSession } from "../../server/launchRecordStore.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { keepMoreLaunchRecords } from "../../test-support/support/launchStore.ts";
import { retireAdHocBranch } from "../../test-support/support/adHocBranchRefs.ts";
import {
  aDeclaredPublisherBranch,
  contextReference,
  dashboardOrigin,
  recordLanding,
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

const reference = "11111111-0000-4000-8000-000000000714";
const otherReference = "11111111-0000-4000-8000-000000000715";
const reportingAs = (reference: string) => ({
  origin: dashboardOrigin,
  reference,
  command: "report",
});

test("the declared worktree's installed landing and exact retry stay with the original launch", async () => {
  const branch = "draft";
  const { checkout, workspace, record, entry, context, home } =
    await aDeclaredPublisherBranch(branch, reportingAs(reference));
  const other = makeMe.aLaunchRecord
    .startedOnMainOf(checkout)
    .inClaudeSession({ sessionId: "other-launch" })
    .adHoc({ title: "Review a different change" })
    .reportingThrough(reportingAs(otherReference))
    .please();
  keepMoreLaunchRecords(home, [other]);
  for (const launch of [record, other])
    await keepAttempt(makeMe.anAcceptedAttempt.reportingFor(launch).please());
  const kept = (launch: LaunchRecord) => keptSession(source, launch.session);
  const trunk = async () =>
    (
      await git(checkout.integration, "ls-remote", "origin", "main")
    ).stdout.split("\t")[0];

  const base = checkout.base;
  expect(contextReference(context)).toBe(reference);
  expect(entry).toMatchObject({
    branch,
    repository: checkout.gitDirectory,
    committedTip: base,
    trunk: { remote: "origin", target: "refs/heads/main" },
  });
  expect((await kept(record))?.branchEntry).toEqual(entry);

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
  const originalBefore = await kept(record);
  const otherBefore = await kept(other);
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
