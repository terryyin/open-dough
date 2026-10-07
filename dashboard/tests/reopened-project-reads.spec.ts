// Reopening a project asks GitHub only what could have changed. Once a
// project was read at the revision its configured ref still names, a reload
// or a return to it asks which commit that ref names and which head its
// recorded story branch names; the backlog and every record this dashboard
// process already read at those commits are not asked again, while a record
// GitHub answered as missing there is. After a new commit is published, the
// same reload reads only the records GitHub's account of that commit says it
// changed. The fake GitHub only publishes the commits (./publishedFiles.ts);
// the local read boundary, its memo, and the page decide what is asked.

import type { Page } from "@playwright/test";
import { expect, pausePageClockAt, test } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import { publishMovingFiles, type MovingFiles } from "./publishedFiles.ts";
import { readsBesideChecks } from "./originObservation.ts";
import {
  doughnutBacklog,
  doughnutRecords,
  doughnutRepository,
  doughnutSharedTitle,
  revisionDoughnut,
} from "./doughnutProject.ts";
import {
  atA,
  atB,
  backlogPath,
  branch,
  branchHead,
  madeB,
  missingSeedPath,
  onBranch,
  opened,
  planPath,
  queuedAgainTitle,
  queuedTitle,
  repository,
  revisionA,
  revisionB,
  seedPath,
  takenTitle,
} from "./reopenedProject.ts";

// What Open Dough's repository was asked since its `before`th observed call,
// revision checks aside: they keep their own pace.
const askedSince = (origin: MovingFiles, before: number) =>
  readsBesideChecks(origin.requests.slice(before)).sort();

// What a reopen at revision A asks: which commit the ref and the branch name,
// and the records GitHub answered as missing there. Nothing it read is asked
// again.
const reopenedAtA = [
  `ref main`,
  `branch ${branch}`,
  `content .planning/open-dough.json@${revisionA}`,
  `content ${missingSeedPath}@${revisionA}`,
].sort();

// The page once the project's membership and every fact its cards wait on are
// read.
async function expectSettled(
  page: Page,
  { revision, queued }: { revision: string; queued: string },
) {
  const { source, taken } = parts(page);
  await expectMembership(page, { taken: [takenTitle], backlog: [queued] });
  await expect(source).toContainText(revision);
  const card = taken.getByRole("article", { name: takenTitle });
  const progress = card.locator(".card-progress");
  await expect(progress).toContainText("From story branch; not in trunk.");
  await expect(
    progress.getByRole("img", { name: "6 of 8 slices recorded complete" }),
  ).toBeVisible();
  await expect(progress).toContainText("Current slice started 7 min ago");
  await expect(card).toContainText("Akiho");
  await expect(page.getByText("Reading preparation…")).toHaveCount(0);
  await expect(page.getByText("Reading plan slices…")).toHaveCount(0);
  await expect(page.getByText("Reading current slice time…")).toHaveCount(0);
}

// The canonical record link a card's detail gives.
async function canonicalLinkOf(page: Page, title: string) {
  const card = page.getByRole("article", { name: title });
  await card.getByRole("button", { name: "Inspect story" }).click();
  return card.getByRole("link", { name: /^Canonical record/ });
}

test("reopening an unchanged project asks only which commits its ref and story branch name and what was missing, and a new commit reads only what it changed", async ({
  page,
}) => {
  await pausePageClockAt(page, opened);
  const origin = publishMovingFiles(page, {
    repository,
    ...atA,
    branches: { [branch]: onBranch },
  });
  publishMovingFiles(page, {
    repository: doughnutRepository,
    revision: revisionDoughnut,
    files: {
      ".planning/PRODUCT-BACKLOG.md": doughnutBacklog,
      ...doughnutRecords,
    },
  });
  const { project, source } = parts(page);

  await page.goto("/");
  await expectSettled(page, { revision: revisionA, queued: queuedTitle });
  const firstRead = askedSince(origin, 0);
  expect(firstRead).toEqual(
    expect.arrayContaining([
      `content ${backlogPath}@${revisionA}`,
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
    await project.getByRole("radio", { name: "Doughnut", exact: true }).check();
    await expectMembership(page, { taken: [], backlog: [doughnutSharedTitle] });
    await expect(source).toContainText(revisionDoughnut);
    await expect(page.getByText("Reading preparation…")).toHaveCount(0);
    const before = origin.requests.length;
    await project
      .getByRole("radio", { name: "Open Dough", exact: true })
      .check();
    await expectSettled(page, { revision: revisionA, queued: queuedTitle });
    expect(askedSince(origin, before)).toEqual(reopenedAtA);
  });

  await test.step("after a new commit is published, a reload reads that commit's changed backlog and record, reuses the unchanged seed, and shows them", async () => {
    origin.moveTrunk(atB, [madeB]);
    const before = origin.requests.length;
    await page.reload();
    await expectSettled(page, {
      revision: revisionB,
      queued: queuedAgainTitle,
    });
    await expect(page.locator("body")).not.toContainText(queuedTitle);
    await expect(page.locator("body")).not.toContainText(revisionA.slice(0, 7));
    const asked = askedSince(origin, before);
    expect(asked).toEqual(
      expect.arrayContaining([
        "ref main",
        `branch ${branch}`,
        "compare",
        `commit ${madeB.sha}`,
        `content ${backlogPath}@${revisionB}`,
        `content ${missingSeedPath}@${revisionB}`,
      ]),
    );
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
