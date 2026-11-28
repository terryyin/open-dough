// Once the configured ref names a new commit B, B's backlog alone decides its
// cards: with GitHub's account of what changed since A still unanswered, the
// page shows B's membership under B while the details that account decides
// are still read, a card shown at A keeping A's details meanwhile. The fake GitHub only holds the comparison
// (../../dashboard/test-support/publishedFiles.ts); the local read boundary and the page decide what is
// shown.

import { remoteBranchHead } from "../../dashboard/server/gitTargetFetch.ts";
import { gitHubRepositoryUrl } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";
import type { Page } from "@playwright/test";
import {
  expect,
  pausePageClockAt,
  test,
} from "../../dashboard/test-support/dashboardTest.ts";
import {
  expectMembership,
  shortRevision,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import { publishCommittedFileHistory } from "../../dashboard/test-support/committedFiles.ts";
import { readsBesideChecks } from "../../dashboard/test-support/originObservation.ts";
import { passTimeUntilChecked } from "../../dashboard/test-support/autoRefreshJourney.ts";
import {
  addedTitle,
  backlogPath,
  expectSettledAt,
  opened,
  productCodeChange,
  refreshHistory,
  refreshDetails,
  queuedTitle,
  recordsReadAt,
  repository,
  seedPath,
  takenTitle,
} from "../../dashboard/test-support/unchangedRecordsRefresh.ts";

// Membership at B never waits on GitHub's account of what changed: with the
// comparison held, B's cards show at once, under B; only a card new at B
// reads its preparation, while the others keep what they showed at A.
async function expectCardsBeforeDetailsAt(
  page: Page,
  revision: string,
  titles: { readonly taken: string[]; readonly backlog: string[] },
  reading: readonly string[] = [],
) {
  await expect(parts(page).readRevision).toContainText(shortRevision(revision));
  await expectMembership(page, titles);
  const cards = parts(page).board.locator("[data-story-card]");
  await expect(
    cards.filter({ hasText: "Reading preparation…" }).locator("fieldset > h3"),
  ).toHaveText([...reading]);
}

const routedTrunk = (home: string) =>
  remoteBranchHead(gitHubRepositoryUrl(repository), "refs/heads/main", {
    cwd: home,
    env: { HOME: home },
    maxBuffer: 4096,
  });

test("while the comparison is held, B's cards show under B keeping the details shown at A, and released, the details are A's as B's own", async ({
  page,
  dashboard,
  afterGitHubStops,
}) => {
  await pausePageClockAt(page, opened);
  const origin = await publishCommittedFileHistory(page, refreshHistory(), {
    repository,
    trunk: "A",
    details: refreshDetails,
    afterGitHubStops,
  });
  const { A: revisionA, B: revisionB } = origin.revisions;
  expect(await routedTrunk(dashboard.home)).toBe(revisionA);
  await page.goto("/");
  await expectSettledAt(page, revisionA);

  const before = origin.requests.length;
  const release = origin.holdComparisons();
  origin.moveTrunk(origin.published.B, [
    { ...productCodeChange, sha: revisionB },
  ]);
  expect(await routedTrunk(dashboard.home)).toBe(revisionB);
  await passTimeUntilChecked(page);
  await expectCardsBeforeDetailsAt(page, revisionB, {
    taken: [takenTitle],
    backlog: [queuedTitle],
  });

  release();
  await expectSettledAt(page, revisionB);
  const asked = readsBesideChecks(origin.requests.slice(before));
  expect(recordsReadAt(asked, revisionB)).toEqual([]);
  expect(asked.filter((call) => call.startsWith("commit "))).toEqual([
    `commit ${revisionB}`,
  ]);
});

test("while the comparison is held, B's changed backlog shows its new membership at once, and released, only what B changed is read", async ({
  page,
  dashboard,
  afterGitHubStops,
}) => {
  await pausePageClockAt(page, opened);
  const origin = await publishCommittedFileHistory(page, refreshHistory(true), {
    repository,
    trunk: "A",
    details: refreshDetails,
    afterGitHubStops,
  });
  const { A: revisionA, B: revisionB } = origin.revisions;
  expect(await routedTrunk(dashboard.home)).toBe(revisionA);
  await page.goto("/");
  await expectSettledAt(page, revisionA);

  const before = origin.requests.length;
  const release = origin.holdComparisons();
  origin.moveTrunk(origin.published.B, [
    {
      ...productCodeChange,
      sha: revisionB,
      files: [
        { filename: backlogPath, status: "modified" },
        { filename: seedPath, status: "modified" },
      ],
    },
  ]);
  expect(await routedTrunk(dashboard.home)).toBe(revisionB);
  await passTimeUntilChecked(page);
  await expectCardsBeforeDetailsAt(
    page,
    revisionB,
    { taken: [takenTitle], backlog: [queuedTitle, addedTitle] },
    [addedTitle],
  );

  release();
  await expectSettledAt(page, revisionB, [queuedTitle, addedTitle]);
  expect(
    recordsReadAt(readsBesideChecks(origin.requests.slice(before)), revisionB),
  ).toEqual([`content ${seedPath}@${revisionB}`]);
});
