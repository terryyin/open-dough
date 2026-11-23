import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import {
  doneCard,
  openRecentlyDone,
  storyActions,
} from "../../dashboard/test-support/doneStoryReviewPage.ts";
import {
  closePublishedSession,
  launchSharingCheckout,
  trunkAdvancedWith,
} from "../../dashboard/test-support/originatingMachine.ts";
import { publishedSessionEntry } from "../../dashboard/test-support/recentlyDoneColumn.ts";
import {
  openIntentReviewChanges,
  openReviewChanges,
} from "../../dashboard/test-support/reviewChangesPage.ts";
import {
  openRecentStories,
  recentStoriesRow,
} from "../../dashboard/test-support/recentStoriesPage.ts";
import { keepLaunchStore } from "../../dashboard/test-support/support/launchStore.ts";
import type { StartOrigin } from "../../dashboard/test-support/support/startOrigin.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import type { Page } from "@playwright/test";

test.use({ preparationHost: "codex", projectFolders: ["open-dough"] });

const originating = "54c3b36b-14dd-42c3-bb7a-f48c7159d58d";
const historical = "c8411249-cbfa-44ef-b75b-afed04b63a59";
const identity = `ad-hoc#${originating}`;
const title = "Improve the run notes";
const file = "run-notes.txt";
const historicalFile = "older-session.txt";
const laterFile = "unrelated-trunk.txt";

async function publishLaterTrunk(page: Page, origin: StartOrigin) {
  trunkAdvancedWith(origin, file, "changed after completion\n");
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: trunkAdvancedWith(origin, laterFile),
    repository: "terryyin/open-dough",
    follows: true,
  });
}

test("a Done story opens the originating comparison on another clone after trunk advances", async ({
  page,
  origin,
}) => {
  await test.step("Given another machine Landed a titled ad hoc session from a shared checkout", async () =>
    closePublishedSession(origin, originating, file, {
      title,
      landingContext: await launchSharingCheckout(
        origin,
        page,
        originating,
        new Date(Date.now() - 60_000),
      ),
    }));
  await test.step("And a historical standalone close remains published", () =>
    closePublishedSession(origin, historical, historicalFile));
  await test.step("And trunk later edits the same file and adds unrelated work", () =>
    publishLaterTrunk(page, origin));
  await test.step("When another clone opens Recently done", async () => {
    await page.setViewportSize({ width: 1600, height: 900 });
    await openRecentlyDone(page);
  });
  const review =
    await test.step("And it opens the Done story's Review changes", () =>
      openIntentReviewChanges(page, storyActions(doneCard(page, title))));
  await test.step("Then Intent keeps the story selected and shows the shared checkout context", async () => {
    await review.expectStory(title);
    await review.expectText("the comparison may include that session's work.");
    await review.files.expectNotShown(`Added ${laterFile}`);
  });
  await test.step("When it reads the changed file", () =>
    review.files.choose(`Added ${file}`));
  await test.step("Then its diff shows only the original edit", () =>
    review.diffs.expectChangedLines(`Added ${file}`, {
      added: ["+published by another machine"],
      removed: [],
    }));
  await test.step("And Recent stories still selects that identity", async () => {
    await openRecentStories(page);
    await expect(
      recentStoriesRow(page, { project: "Open Dough", identity }),
    ).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Escape");
  });
  const legacy =
    await test.step("When it returns to the Board and opens the standalone session's review", async () => {
      await review.returnToDevelopment();
      const recent = await openRecentlyDone(page);
      return openReviewChanges(page, publishedSessionEntry(recent, historical));
    });
  await test.step("Then the standalone row still reads its own comparison", async () => {
    await legacy.files.chooseShown(`Added ${historicalFile}`);
    await legacy.diffs.expectShows(
      `Added ${historicalFile}`,
      "published by another machine",
    );
    await legacy.expectNoText(file);
  });
});

test("Intent explains when a local Done story has no published comparison", async ({
  page,
  dashboard,
  origin,
}) => {
  await test.step("Given the machine keeps a locally Done ad hoc story", () => {
    const completedAt = new Date().toISOString();
    keepLaunchStore(dashboard, {
      "open-dough": [
        makeMe.aLaunchRecord
          .adHoc({ title })
          .reportingThrough({
            origin: dashboard.origin,
            reference: originating,
            command: "report",
          })
          .markedDoneAt(completedAt)
          .originatedDoneStory({ identity, title, completedAt })
          .please(),
      ],
    });
  });
  await test.step("And the published project has no close for that story", async () =>
    publishCommittedOrigin(page, {
      repoDir: origin.origin,
      revision: await origin.originGit("rev-parse", "main"),
      repository: "terryyin/open-dough",
      follows: true,
    }));
  await test.step("When it opens Recently done", async () => {
    await page.setViewportSize({ width: 1600, height: 900 });
    await openRecentlyDone(page);
  });
  const review =
    await test.step("And it opens that story's Review changes", () =>
      openIntentReviewChanges(page, storyActions(doneCard(page, title))));
  await test.step("Then the selected story explains the missing comparison", async () => {
    await review.expectStory(identity);
    await review.expectText(
      "No published comparison is available for this story.",
    );
  });
});
