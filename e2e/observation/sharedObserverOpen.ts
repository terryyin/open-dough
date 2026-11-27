// One project's two tabs opened together while its verified Git trunk check
// is held at the origin's upload-pack, for ./shared-observer-reads.spec.ts:
// the published history, the held seed, and what the tabs show and ask.
import type { Page } from "@playwright/test";
import {
  expect,
  githubFor,
  pausePageClockAt,
} from "../../dashboard/test-support/dashboardTest.ts";
import {
  expectSettledPage,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  doughnutBacklog,
  doughnutRecords,
  doughnutRepository,
} from "../../dashboard/test-support/doughnutProject.ts";
import {
  readsOfRepository,
  restMembershipReads,
} from "../../dashboard/test-support/originObservation.ts";
import { publishes } from "../../dashboard/test-support/support/fakeGitHub.ts";
import { defaultRepository as repository } from "../../dashboard/test-support/publishedOrigin.ts";
import { publishMovingHistory } from "../../dashboard/test-support/publishedMovingOrigin.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { renderStorySection } from "../../Distribution/tests/support/published-seed.mjs";
import { holdingAnswer } from "../../dashboard/test-support/support/heldGitHubAnswer.ts";
import { holdTrunkTransfer } from "../../dashboard/test-support/heldTrunkTransfer.ts";

export const seedPath = ".planning/seeds/SEED-263-shared.md";
const title = "A story both tabs show";
const goal = "Both tabs show this goal, read from GitHub once.";
export const titles = { taken: [], backlog: [title] };
const story = makeMe.aBacklogEntry
  .with({
    identity: "SEED-263#shared",
    title,
    href: "seeds/SEED-263-shared.md#shared",
  })
  .please();
const history = makeMe.aRepository
  .withRevision("A", {
    backlog: { queued: [story] },
    files: {
      [seedPath]: `# Shared

${renderStorySection(story, { goal })}`,
      ".planning/open-dough.json": "{}\n",
    },
  })
  .withRevision("B", {
    files: { "product.txt": "Updated during a shared check\n" },
  })
  .please();

export const askedOfOpenDough = (page: Page) =>
  readsOfRepository(githubFor(page).calls, repository);

export async function expectGoalShown(page: Page) {
  await expectSettledPage(page, titles);
  const card = parts(page).backlog.getByRole("article", { name: title });
  await card.getByRole("button", { name: "Inspect story" }).click();
  await expect(card).toContainText(goal);
}

export async function openedTogether(
  page: Page,
  home: string,
  afterGitHubStops: (cleanup: () => Promise<void>) => void,
  holdListing = false,
) {
  await pausePageClockAt(page, new Date("2026-10-06T09:00:00.000Z"));
  let releaseListing: () => void = () => undefined;
  const origin = await publishMovingHistory(
    page,
    history,
    "A",
    afterGitHubStops,
    repository,
    (answer) => {
      const listing = holdingAnswer(
        answer,
        ({ kind }) => holdListing && kind === "matching-refs",
      );
      releaseListing = listing.release;
      return listing.answer;
    },
  );
  const transfer = holdTrunkTransfer(home, repository);
  const releaseSeed = origin.hold(seedPath);
  githubFor(page).serve(
    doughnutRepository,
    publishes({ backlog: doughnutBacklog, files: doughnutRecords }),
  );
  const other = await page.context().newPage();
  const tabs = [page, other];
  await Promise.all(tabs.map((tab) => tab.goto("/")));
  await transfer.held;
  expect(transfer.log()).toBe("call\ncall\nheld\n");
  expect(restMembershipReads(askedOfOpenDough(page))).toEqual([]);
  return {
    other,
    origin,
    releaseSeed,
    releaseListing,
    releaseGit: transfer.release,
    releaseGitIfHeld: transfer.releaseIfHeld,
  };
}
