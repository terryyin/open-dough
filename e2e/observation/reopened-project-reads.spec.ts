// Reopening a project asks GitHub only what could have changed. Once a
// project was read at the revision its configured ref still names, a reload
// or a return to it asks which commit that ref names and which head its
// recorded story branch names; the backlog and every record this dashboard
// process already read at those commits are not asked again, while a record
// GitHub answered as missing there is. After a new commit is published, the
// same reload reads only the records GitHub's account of that commit says it
// changed. The fake GitHub only publishes the commits (../../dashboard/test-support/publishedFiles.ts);
// the local read boundary, its memo, and the page decide what is asked.

import type { Page } from "@playwright/test";
import {
  expect,
  pausePageClockAt,
  test,
} from "../../dashboard/test-support/dashboardTest.ts";
import {
  shortRevision,
  expectSettledPage,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import type { MovingFiles } from "../../dashboard/test-support/publishedFiles.ts";
import {
  publishCommittedFileHistory,
  publishCommittedFiles,
} from "../../dashboard/test-support/committedFiles.ts";
import { remoteBranchHead } from "../../dashboard/server/gitTargetFetch.ts";
import { gitHubRepositoryUrl } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";
import { readsBesideChecks } from "../../dashboard/test-support/originObservation.ts";
import { projectTab } from "../../dashboard/test-support/projectChoice.ts";
import {
  canonicalRecord,
  inspectedDetail,
  storyCard,
} from "../../dashboard/test-support/storyCardControls.ts";
import {
  sliceBar,
  sliceProgress,
} from "../../dashboard/test-support/storyCardFacts.ts";
import {
  doughnutBacklog,
  doughnutRecords,
  doughnutRepository,
  doughnutSharedTitle,
} from "../../dashboard/test-support/doughnutProject.ts";
import {
  backlogPath,
  branch,
  missingSeedPath,
  opened,
  planPath,
  queuedAgainTitle,
  queuedTitle,
  repository,
  reopenedHistory,
  reopenedDetails,
  reopenedChange,
  seedPath,
  takenTitle,
} from "../../dashboard/test-support/reopenedProject.ts";

// What Open Dough's repository was asked since its `before`th observed call,
// revision checks aside: they keep their own pace.
const askedSince = (origin: MovingFiles, before: number) =>
  readsBesideChecks(origin.requests.slice(before))
    .filter((read) => read !== "ref main")
    .sort();

// The page once the project's membership and every fact its cards wait on are
// read: with every read answered, no card says it is still reading any of
// them, and the Taken card shows what they answered.
async function expectSettled(
  page: Page,
  { revision, queued }: { revision: string; queued: string },
) {
  const { taken, readRevision } = parts(page);
  await expectSettledPage(page, { taken: [takenTitle], backlog: [queued] });
  await expect(page.getByText("Reading plan slices…")).toHaveCount(0);
  await expect(page.getByText("Reading current slice time…")).toHaveCount(0);
  await expect(readRevision).toContainText(shortRevision(revision));
  const card = storyCard(taken, takenTitle);
  const progress = sliceProgress(card);
  await expect(progress).toContainText("From story branch; not in trunk.");
  await expect(
    sliceBar(progress, "6 of 8 slices recorded complete"),
  ).toBeVisible();
  await expect(progress).toContainText("Current slice started 7 min ago");
  await expect(card).toContainText("Akiho");
}

// The canonical record link a card's detail gives.
async function canonicalLinkOf(page: Page, title: string) {
  return canonicalRecord(
    await inspectedDetail(storyCard(parts(page).board, title)),
  );
}

test("reopening an unchanged project asks only which commits its ref and story branch name and what was missing, and a new commit reads only what it changed", async ({
  page,
  dashboard,
  afterGitHubStops,
}) => {
  await pausePageClockAt(page, opened);
  const origin = await publishCommittedFileHistory(page, reopenedHistory, {
    repository,
    trunk: "A",
    branches: { [branch]: "head" },
    details: reopenedDetails,
    afterGitHubStops,
  });
  const { A: revisionA, B: revisionB, head: branchHead } = origin.revisions;
  const reopenedAtA = [
    `content .planning/open-dough.json@${revisionA}`,
    `content ${missingSeedPath}@${revisionA}`,
  ].sort();
  const { revision: revisionDoughnut } = publishCommittedFiles(page, {
    repository: doughnutRepository,
    files: { [backlogPath]: doughnutBacklog, ...doughnutRecords },
  });
  const routed = (ref = "main") =>
    remoteBranchHead(gitHubRepositoryUrl(repository), `refs/heads/${ref}`, {
      cwd: dashboard.home,
      env: { HOME: dashboard.home },
      maxBuffer: 4096,
    });
  expect(await routed()).toBe(revisionA);
  expect(await routed(branch)).toBe(branchHead);
  const { readRevision } = parts(page);

  await page.goto("/");
  await expectSettled(page, { revision: revisionA, queued: queuedTitle });
  const firstRead = askedSince(origin, 0);
  expect(firstRead).toEqual(
    expect.arrayContaining([
      `content ${seedPath}@${revisionA}`,
      `content ${planPath}@${branchHead}`,
      ...reopenedAtA,
    ]),
  );

  await test.step("a reload asks only the ref, the branch head, and the missing records, and shows the same facts", async () => {
    const before = origin.requests.length;
    await page.reload();
    await expectSettled(page, { revision: revisionA, queued: queuedTitle });
    expect(askedSince(origin, before)).toEqual(reopenedAtA);
    await expect(await canonicalLinkOf(page, takenTitle)).toHaveAttribute(
      "href",
      `https://github.com/${repository}/blob/${revisionA}/${seedPath}#on-branch`,
    );
  });

  await test.step("returning from another project asks the same and nothing more", async () => {
    await projectTab(page, "Doughnut").check();
    await expectSettledPage(page, {
      taken: [],
      backlog: [doughnutSharedTitle],
    });
    await expect(readRevision).toContainText(shortRevision(revisionDoughnut));
    const before = origin.requests.length;
    await projectTab(page, "Open Dough").check();
    await expectSettled(page, { revision: revisionA, queued: queuedTitle });
    expect(askedSince(origin, before)).toEqual(reopenedAtA);
  });

  await test.step("after a new commit is published, a reload shows that commit's backlog from the trunk and reads only the record the commit changed", async () => {
    origin.moveTrunk(origin.published.B, [
      { ...reopenedChange, sha: revisionB },
    ]);
    expect(await routed()).toBe(revisionB);
    const before = origin.requests.length;
    await page.reload();
    await expectSettled(page, {
      revision: revisionB,
      queued: queuedAgainTitle,
    });
    await expect(page.locator("body")).not.toContainText(queuedTitle);
    await expect(page.locator("body")).not.toContainText(
      shortRevision(revisionA),
    );
    const asked = askedSince(origin, before);
    expect(asked).toEqual(
      expect.arrayContaining([
        "compare",
        `commit ${revisionB}`,
        `content ${missingSeedPath}@${revisionB}`,
      ]),
    );
    expect(asked).not.toContain(`content ${backlogPath}@${revisionB}`);
    const unchangedSeed = `content ${seedPath}@${revisionB}`;
    expect(
      asked.filter(
        (call) => call === unchangedSeed || call.includes(revisionA),
      ),
    ).toEqual([]);
    await expect(await canonicalLinkOf(page, queuedAgainTitle)).toHaveAttribute(
      "href",
      `https://github.com/${repository}/blob/${revisionB}/${missingSeedPath}#missing`,
    );
  });
});
