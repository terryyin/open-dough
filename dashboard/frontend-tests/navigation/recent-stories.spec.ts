import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { recentStoriesKey } from "../../src/recentStories.ts";
import { withFramePreference } from "../../test-support/component-mount/framePreferences.ts";
import { mountBoardFrame } from "./board-frame-mount.ts";
import { boardReading, storyCard } from "./board-reading-page.ts";
import {
  answerTerminal,
  closeTerminal,
  openRecord,
  readingTop,
  scroller,
  terminal,
} from "./board-session-view.ts";
import { boardWork, longBacklog, story } from "./board-work.ts";
import {
  banner,
  expectBannerRow,
  projectChoices,
} from "./dashboard-header-reading.ts";
import { projectRadio, route } from "./project-navigation-frame.ts";
import {
  activate,
  chooseRecent,
  dismissWithEscape,
  popover,
  recent,
  roster,
  selectCard,
  showsBookmark,
  showsEmptyHistory,
  showsHistory,
  showsRevealed,
} from "./recent-stories-frame.ts";
import { withWidthStorage } from "./side-panel-width-view.ts";
import { controlDestinationCueTime } from "./story-destination-cue.ts";

const viewport = { width: 1280, height: 800 };
const openDough = "Open Dough";
const queued = story("Read the queued execution", 901);
const taken = story("Inspect the running execution", 902);
const doughnutTaken = story("Read Doughnut's running story", 903);
const doughnut = boardWork([], {
  id: "doughnut",
  label: "Doughnut",
  taken: [doughnutTaken],
});

test("the Recent stories bookmark tracks card and Side panel selections, order, clearing and dismissal", async () => {
  withFramePreference(recentStoriesKey, null);
  withWidthStorage();
  answerTerminal();
  const answer = makeMe.aMachineAnswer
    .observingOpen(openRecord(taken))
    .please();
  await mountBoardFrame(
    boardWork([queued], { taken: [taken] }),
    viewport,
    "stories",
    { answer },
  );
  await showsBookmark();
  await expectBannerRow(projectChoices);
  await activate(recent);
  await showsEmptyHistory();
  await dismissWithEscape();

  await selectCard(queued.title);
  const running = storyCard(taken.title);
  await running
    .getByRole("button", { name: "Open terminal", exact: true })
    .click();
  await expect
    .element(terminal.getByRole("heading", { name: taken.title, exact: true }))
    .toBeVisible();
  await boardReading.expectStoryHighlight(running);
  await closeTerminal();
  await selectCard(queued.title);
  await showsBookmark(queued.identity);
  await activate(recent);
  await showsHistory([
    [openDough, queued.identity, true],
    [openDough, taken.identity, false],
  ]);
  await dismissWithEscape();

  await selectCard(queued.title, false);
  await showsBookmark();
  await activate(recent);
  await showsHistory([
    [openDough, queued.identity, false],
    [openDough, taken.identity, false],
  ]);
  await dismissWithEscape();
  await selectCard(queued.title);
  await activate(recent);
  await dismissWithEscape();
  await boardReading.expectStoryHighlight(storyCard(queued.title));
  await showsBookmark(queued.identity);
  await activate(recent);
  await banner.click({ position: { x: 4, y: 4 } });
  await expect.element(popover).not.toBeInTheDocument();
  await boardReading.expectStoryHighlight(storyCard(queued.title));
});

test("choosing Recent stories rows returns from the roster to another project's story and reports an unavailable identity", async () => {
  const gone = "GONE-1#nope";
  withFramePreference(recentStoriesKey, null);
  controlDestinationCueTime();
  const frame = await mountBoardFrame(
    boardWork([queued], { taken: [taken] }),
    viewport,
    "stories",
    {},
    { otherWork: [doughnut] },
  );
  await selectCard(taken.title);
  await activate(projectRadio("Doughnut"));
  await selectCard(doughnutTaken.title);
  await selectCard(doughnutTaken.title, false);
  await activate(projectRadio(openDough));

  const address = new URL(location.href);
  address.searchParams.set("project", "open-dough");
  address.searchParams.set("view", "roster");
  history.pushState(null, "", address);
  window.dispatchEvent(new PopStateEvent("popstate"));
  await expect.element(roster).toBeVisible();
  await expect.element(projectRadio(openDough)).toBeChecked();
  expect(route().get("project")).toBe("open-dough");
  expect(route().get("view")).toBe("roster");

  await activate(recent);
  await chooseRecent("Doughnut", doughnutTaken.identity);
  await expect.element(roster).not.toBeInTheDocument();
  await expect.element(projectRadio("Doughnut")).toBeChecked();
  expect(route().get("project")).toBe("doughnut");
  expect(route().get("view")).toBeNull();
  await showsRevealed(storyCard(doughnutTaken.title));
  await showsBookmark(doughnutTaken.identity);
  await activate(recent);
  await showsHistory([
    ["Doughnut", doughnutTaken.identity, true],
    [openDough, taken.identity, false],
  ]);
  await dismissWithEscape();

  localStorage.setItem(
    recentStoriesKey,
    JSON.stringify([
      { project: "doughnut", identity: gone },
      { project: "doughnut", identity: doughnutTaken.identity },
      { project: "open-dough", identity: taken.identity },
    ]),
  );
  frame.remount();
  await showsBookmark();
  await expect.element(projectRadio("Doughnut")).toBeChecked();
  await activate(recent);
  await chooseRecent("Doughnut", gone);
  const referenceNotice = page.getByRole("status", {
    name: "Story reference navigation",
  });
  await expect
    .element(
      referenceNotice.getByText(
        `${gone} is unavailable in Doughnut's dashboard.`,
        { exact: true },
      ),
    )
    .toBeVisible();
  await showsBookmark(gone);
});

test("the bookmark reveals a selected card before opening the list and returns across projects", async () => {
  withFramePreference(recentStoriesKey, null);
  controlDestinationCueTime();
  const target = story("Return target story", 850);
  await mountBoardFrame(
    boardWork([...longBacklog, target], { taken: [taken] }),
    viewport,
    "stories",
    {},
    { otherWork: [doughnut] },
  );
  const card = storyCard(target.title);
  await selectCard(target.title);
  await showsBookmark(target.identity);
  const scroll = scroller(card.element());
  scroll.scrollTop = 0;
  await expect
    .poll(() => card.element().getBoundingClientRect().top)
    .toBeGreaterThan(boardReading.room().bottom);
  await activate(recent);
  await expect.element(popover).not.toBeInTheDocument();
  await showsRevealed(card);
  await activate(recent);
  await showsHistory([[openDough, target.identity, true]]);
  await dismissWithEscape();

  const longCard = card.element();
  if (!(longCard instanceof HTMLElement))
    throw new Error("Expected a story card.");
  longCard.style.minHeight = "200vh";
  await readingTop(longCard);
  expect(longCard.getBoundingClientRect().bottom).toBeGreaterThan(
    boardReading.room().bottom,
  );
  await activate(recent);
  await showsHistory([[openDough, target.identity, true]]);
  await dismissWithEscape();

  await selectCard(taken.title);
  await activate(projectRadio("Doughnut"));
  await selectCard(doughnutTaken.title);
  await activate(projectRadio(openDough));
  await showsBookmark(doughnutTaken.identity);
  await activate(recent);
  await expect.element(projectRadio("Doughnut")).toBeChecked();
  await showsRevealed(storyCard(doughnutTaken.title));
  await expect.element(popover).not.toBeInTheDocument();
});
