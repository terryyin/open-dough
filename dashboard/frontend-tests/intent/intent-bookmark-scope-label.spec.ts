import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { DoneRecordReadSource } from "../../src/doneRecordReadSource.ts";
import {
  portrait,
  tapWhereShown,
  useTouchScreen,
} from "../navigation/board-touch-page.ts";
import {
  banner,
  expectBannerRow,
  projectChoices,
} from "../navigation/dashboard-header-reading.ts";
import {
  recent as bookmark,
  recentChoice,
} from "../navigation/recent-stories-frame.ts";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";
import {
  failingStory,
  fullSha,
  heldRead,
  inertCiReads,
  openDoughSource,
  unconfiguredIntentReads,
} from "./intent-ci-status-fixtures.ts";
import {
  chooseWholeProject,
  intentRecentStories,
  showsIntentBookmark,
} from "./intent-recent-stories-page.ts";

const recent = intentRecentStories(openDoughSource);
const visibleScope = (title: string) =>
  bookmark.getByText(title, { exact: true });
const activePerspective = () =>
  banner
    .getByRole("radio", { name: "Intent", exact: true })
    .element()
    .parentElement?.querySelector(".perspective-name");
const longStory = {
  ...failingStory,
  title:
    "Distinguish a selected story’s published changes from the whole project when reviewing a long comparison title",
};

async function mountStoryScope(viewport = { width: 1280, height: 800 }) {
  await mountIntentCiPage({
    work: makeMe.aPublishedWork
      .of(openDoughSource)
      .at(fullSha("62ead"))
      .taking(longStory)
      .please(),
    viewport,
    reads: { intent: unconfiguredIntentReads, ci: inertCiReads() },
    recentStories: [
      { project: openDoughSource.id, identity: longStory.identity },
    ],
  });
}

test("the desktop banner names Intent and bounds the active story title beside it", async () => {
  await mountStoryScope();
  await showsIntentBookmark();
  expect(activePerspective()?.checkVisibility()).toBe(true);
  expect(activePerspective()?.textContent).toBe("Intent");
  await expect.element(visibleScope("Whole project")).toBeVisible();

  await recent.chooseRow(longStory.identity);
  await showsIntentBookmark(longStory.title);
  await expect.element(visibleScope(longStory.title)).toBeVisible();
  const scope = visibleScope(longStory.title).element();
  expect(scope.scrollWidth).toBeGreaterThan(scope.clientWidth);
  expect(getComputedStyle(scope).textOverflow).toBe("ellipsis");
  await expectBannerRow(projectChoices);

  await chooseWholeProject();
  await expect.element(visibleScope("Whole project")).toBeVisible();
  await showsIntentBookmark();
});

test("on a narrow coarse-pointer banner the bookmark keeps an accessible scope and a full touch target", async () => {
  await useTouchScreen();
  await mountStoryScope(portrait);
  await showsIntentBookmark();
  await tapWhereShown(bookmark.element());
  const row = recentChoice(openDoughSource.label, longStory.identity);
  await expect.element(row).toBeVisible();
  await tapWhereShown(row.element());

  await showsIntentBookmark(longStory.title);
  await expect.element(visibleScope(longStory.title)).not.toBeVisible();
  expect(activePerspective()?.checkVisibility()).toBe(false);
  expect(bookmark.element().querySelector("svg")?.checkVisibility()).toBe(true);
  const { width, height } = bookmark.element().getBoundingClientRect();
  expect(width).toBeGreaterThanOrEqual(44);
  expect(height).toBeGreaterThanOrEqual(44);
});

test("the bookmark replaces a Done identity with the title from the already-requested record", async () => {
  const completed = makeMe.aDoneRecord
    .completed({
      identity: "SEED-DONE#scope",
      title: "Investigate scope on a Done review",
      completedAt: new Date().toISOString(),
    })
    .please();
  const { done, doneReads } = makeMe.aDoneCatalog.holding([completed]).please();
  const projectWork = makeMe.aPublishedWork
    .of(openDoughSource)
    .at(done.revision)
    .please();
  const response =
    heldRead<Awaited<ReturnType<DoneRecordReadSource["readBodies"]>>>();
  const reads: Parameters<DoneRecordReadSource["readBodies"]>[] = [];
  await mountIntentCiPage({
    work: makeMe.aPublishedWork.with({ ...projectWork, done }).please(),
    reads: {
      intent: unconfiguredIntentReads,
      ci: inertCiReads(),
      done: {
        readBodies: (...args) => {
          reads.push(args);
          return reads.length === 1
            ? doneReads.readBodies(...args)
            : response.ask();
        },
      },
    },
    recentStories: [
      { project: openDoughSource.id, identity: completed.identity },
    ],
  });

  await expect.poll(() => reads.length).toBe(1);
  await recent.chooseRow(completed.identity);
  await expect.poll(response.asked).toBe(true);
  await showsIntentBookmark(completed.identity);
  await expect.element(visibleScope(completed.identity)).toBeVisible();
  const request = reads[1];
  if (request === undefined) throw new Error("Expected the Done record read.");
  response.resolve(await doneReads.readBodies(...request));

  await showsIntentBookmark(completed.title);
  await expect.element(visibleScope(completed.title)).toBeVisible();
  expect(reads).toHaveLength(2);
});
