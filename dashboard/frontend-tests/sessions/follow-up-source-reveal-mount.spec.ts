// A Taken story follow-up names its source and reveals that Recently done
// card beyond the visible range through the page's story navigation, keeping
// the reader's selection and an open Side panel.
import { expect, test } from "vitest";
import { reducedBoardMotion } from "../navigation/board-mount.ts";
import { boardReading } from "../navigation/board-reading-page.ts";
import { answerTerminal, terminal } from "../navigation/board-session-view.ts";
import {
  latestDone,
  referenceNotice,
  showsReached,
} from "../navigation/story-reference-done-page.ts";
import {
  destination,
  followSource,
  openFollowUpSource,
  selectedCard,
  source,
  sourceLink,
  taken,
} from "./follow-up-source-page.ts";
import { recentlyDone } from "./recently-done-column-page.ts";

test("a Taken follow-up names its source by identity while its body is unread, and by title once read", async () => {
  const fixture = openFollowUpSource();
  const release = fixture.holdSource();
  await fixture.mount();

  await expect.element(sourceLink(source.identity)).toBeVisible();
  expect(sourceLink(source.title).all()).toHaveLength(0);

  release();
  await expect.element(sourceLink(source.title)).toBeVisible();
  expect(sourceLink(source.identity).all()).toHaveLength(0);
});

test("keyboard reveal of an older source beyond ten at a narrow reduced-motion viewport focuses its card, keeps the selected story, restores with Show latest 10 and reveals again", async () => {
  await reducedBoardMotion();
  const fixture = openFollowUpSource({
    viewport: { width: 390, height: 844 },
  });
  await fixture.mount();
  await expect.element(sourceLink(source.title)).toBeVisible();
  expect(destination().all()).toHaveLength(0);

  await selectedCard().click({ position: { x: 4, y: 4 } });
  await boardReading.expectStorySelection(selectedCard(), true);

  await followSource(source.title, "keyboard");
  await showsReached(destination());
  await expect
    .element(recentlyDone().getByText("Showing 12 of 12 entries."))
    .toBeVisible();
  await boardReading.expectStorySelection(selectedCard(), true);

  await latestDone.click();
  await expect.poll(() => destination().all()).toHaveLength(0);

  await followSource(source.title, "keyboard");
  await showsReached(destination());
  await boardReading.expectStorySelection(selectedCard(), true);
});

test("keyboard source reveal beyond ten keeps an open Side panel and leaves selection alone under reduced motion", async () => {
  await reducedBoardMotion();
  answerTerminal();
  const fixture = openFollowUpSource({ sourceHoursAgo: 11.5 });
  await fixture.mount();
  await expect.element(sourceLink(source.title)).toBeVisible();
  expect(destination().all()).toHaveLength(0);
  await boardReading.expectStorySelection(selectedCard(), false);

  await taken()
    .getByRole("button", { name: /^Open terminal/ })
    .click();
  await expect.element(terminal).toBeVisible();

  await followSource(source.title, "keyboard");
  await showsReached(destination());
  await boardReading.expectStorySelection(selectedCard(), false);
  await expect.element(terminal).toBeVisible();
});

test("a failed source body keeps the Taken entry naming the identity and still reveals the gap card", async () => {
  const fixture = openFollowUpSource();
  fixture.failSourceReads(2);
  await fixture.mount();
  await expect.element(sourceLink(source.identity)).toBeVisible();

  await followSource(source.identity);
  await expect.element(destination()).toHaveFocus();
  await expect
    .element(destination().getByText("This done story could not be read."))
    .toBeVisible();
  await expect.element(sourceLink(source.identity)).toBeVisible();
});

test("an absent source keeps the Taken entry accessible with honest unavailable feedback", async () => {
  const identity = "SEED-390#missing-source";
  const fixture = openFollowUpSource({
    listed: false,
    fillers: 3,
    identity,
  });
  await fixture.mount();
  await expect.element(sourceLink(identity)).toBeVisible();

  await followSource(identity);
  await expect
    .element(
      referenceNotice.getByText(
        `${identity} is unavailable in Open Dough's dashboard.`,
        { exact: true },
      ),
    )
    .toBeVisible();
  expect(destination(identity).all()).toHaveLength(0);
  await expect.element(taken()).toBeVisible();
});
