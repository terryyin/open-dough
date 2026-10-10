// Once the configured ref names a new commit B, B's backlog alone decides its
// cards: with GitHub's account of what changed since A still unanswered, the
// page shows B's membership under B while the details that account decides
// are still read, a card shown at A keeping A's details meanwhile. The fake GitHub only holds the comparison
// (./publishedFiles.ts); the local read boundary and the page decide what is
// shown.

import type { Page } from "@playwright/test";
import { expect, pausePageClockAt, test } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import {
  publishMovingFiles,
  type PublishedRevision,
} from "./publishedFiles.ts";
import { readsBesideChecks } from "./originObservation.ts";
import { passTimeUntilChecked } from "./autoRefreshJourney.ts";
import {
  atA,
  atB,
  backlog,
  backlogPath,
  expectSettledAt,
  files,
  opened,
  productCodeCommit,
  queuedTitle,
  recordsReadAt,
  repository,
  revisionA,
  revisionB,
  seed,
  seedPath,
  takenTitle,
} from "./unchangedRecordsRefresh.ts";

// Membership at B never waits on GitHub's account of what changed: with the
// comparison held, B's cards show at once, under B; only a card new at B
// reads its preparation, while the others keep what they showed at A.
async function expectCardsBeforeDetailsAt(
  page: Page,
  revision: string,
  titles: { readonly taken: string[]; readonly backlog: string[] },
  reading: readonly string[] = [],
) {
  await expect(parts(page).source).toContainText(revision);
  await expectMembership(page, titles);
  const cards = parts(page).stages.locator("[data-work]");
  await expect(
    cards.filter({ hasText: "Reading preparation…" }).locator("fieldset > h3"),
  ).toHaveText([...reading]);
}

test("while the comparison is held, B's cards show under B keeping the details shown at A, and released, the details are A's as B's own", async ({
  page,
}) => {
  await pausePageClockAt(page, opened);
  const origin = publishMovingFiles(page, { repository, ...atA });
  await page.goto("/");
  await expectSettledAt(page, revisionA);

  const before = origin.requests.length;
  const release = origin.holdComparisons();
  origin.moveTrunk(atB, [productCodeCommit]);
  await passTimeUntilChecked(page);
  await expectCardsBeforeDetailsAt(page, revisionB, {
    taken: [takenTitle],
    backlog: [queuedTitle],
  });

  release();
  await expectSettledAt(page, revisionB);
  const asked = readsBesideChecks(origin.requests.slice(before));
  expect(recordsReadAt(asked, revisionB)).toEqual([
    `content ${backlogPath}@${revisionB}`,
  ]);
  expect(asked.filter((call) => call.startsWith("commit "))).toEqual([
    `commit ${productCodeCommit.sha}`,
  ]);
});

test("while the comparison is held, B's changed backlog shows its new membership at once, and released, only what B changed is read", async ({
  page,
}) => {
  await pausePageClockAt(page, opened);
  const origin = publishMovingFiles(page, { repository, ...atA });
  await page.goto("/");
  await expectSettledAt(page, revisionA);

  const addedTitle = "Newly queued";
  const changedBacklog = `${backlog}- [${addedTitle}](seeds/SEED-271-refresh.md#added) — SEED-271#added\n`;
  const changedSeed = `${seed}\n<a id="added"></a>\n\n### ${addedTitle}\n\n**Identity:** SEED-271#added\n`;
  const atChanged: PublishedRevision = {
    ...atA,
    revision: revisionB,
    files: { ...files, [backlogPath]: changedBacklog, [seedPath]: changedSeed },
  };
  const before = origin.requests.length;
  const release = origin.holdComparisons();
  origin.moveTrunk(atChanged, [
    {
      ...productCodeCommit,
      files: [
        { filename: backlogPath, status: "modified" },
        { filename: seedPath, status: "modified" },
      ],
    },
  ]);
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
  ).toEqual([
    `content ${backlogPath}@${revisionB}`,
    `content ${seedPath}@${revisionB}`,
  ]);
});
