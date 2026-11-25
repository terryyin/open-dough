import { closeSidePanel } from "../../dashboard/test-support/sidePanelFrame.ts";
// What keeps Recently done's requested range and what starts it again at
// ten. A refresh's old revision answering late changes nothing it shows.
// Opening and closing the terminal and the sidebar, resizing the panel, and
// narrowing the window keep the range, reading nothing; a reload and another
// project start again at ten, and that project's late answer changes
// nothing. A Running Cursor sessions row chosen from another project still
// reveals its done entry through 27:
// ./recently-done-progressive-navigation-cursor.spec.ts. Publications and
// refreshes: ../recentlyDoneRefresh.ts; the `gh` calls reaching the fake
// GitHub show which records were read, and at which revision.

import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  shownProjectControl,
  chooseProject,
  parts,
  sessionEntriesIn,
} from "../../dashboard/test-support/dashboardPage.ts";
import { rem, showColumn } from "../../dashboard/test-support/boardPage.ts";
import {
  expectEntries,
  revealAction,
  showLatestAction,
} from "../../dashboard/test-support/recentlyDoneColumn.ts";
import {
  openTerminalControl,
  terminalScreenParts,
} from "../../dashboard/test-support/terminalScreenPage.ts";
import { progressiveStories } from "../../dashboard/test-support/recentlyDoneProgressive.ts";
import {
  isRecord,
  opened,
  recordsAsked,
  terminalOf,
  untilPageRests,
} from "../../dashboard/test-support/recentlyDoneProgressivePage.ts";
import { heldPlace } from "../../dashboard/test-support/recentlyDoneProgressiveJourney.ts";
import {
  namesOf,
  recordsAskedAt,
  refreshedTo,
  retitled,
} from "../../dashboard/test-support/recentlyDoneRefresh.ts";
import {
  focusDivider,
  pressDividerKey,
} from "../../dashboard/test-support/sidePanelWidthPage.ts";
import { sessionsSidebarParts } from "../../dashboard/test-support/sessionsSidebarPage.ts";
import {
  holding,
  holdingAnswer,
} from "../../dashboard/test-support/support/heldGitHubAnswer.ts";
import { storyCard } from "../../dashboard/test-support/storyCardControls.ts";
import { reloadUntilRead } from "../../dashboard/test-support/pageRequestNotes.ts";
import { publishOnePygardonStory } from "../../dashboard/test-support/pygardonProject.ts";

test.use({ projectFolders: ["open-dough"] });

const entries = progressiveStories(35);
const storiesThrough = (count: number) =>
  entries.slice(0, count).map(({ path }) => path);

test("an old revision's late record answer changes nothing; the terminal, panel width, sidebar, and a narrow window keep twenty; a reload starts again at ten", async ({
  page,
  dashboard,
  afterGitHubStops,
}) => {
  await page.setViewportSize({ width: 80 * rem, height: 900 });
  await page.clock.install();
  const terminalPlace = 4;
  const terminalStory = entries[terminalPlace - 1];
  const held = entries[12];
  if (!held || !terminalStory) throw new Error("Missing a published story.");
  const changed = retitled(held);
  const atB = entries.map((entry) => (entry.place === 13 ? changed : entry));
  let release: () => void = () => undefined;
  const view = await opened(page, dashboard, entries, {
    nestedIn: terminalPlace,
    history: { afterGitHubStops, later: { B: atB } },
    answering: (published, revisionA) => {
      const hold = holding(
        published,
        ({ request }) =>
          isRecord(held.path)(request) &&
          "revision" in request &&
          request.revision === revisionA,
      );
      release = hold.release;
      return hold.answer;
    },
  });
  const { github, recent, main } = view;
  if (main === undefined) throw new Error("No progressive publication history");
  const { firstRevision: revisionA } = main;
  const twenty = namesOf(atB, 20);

  await revealAction(recent).click();
  await expect(
    recent.getByRole("article", { name: held.identity }),
  ).toContainText("Reading done story…");
  await expect
    .poll(() => recordsAskedAt(github, revisionA).toSorted())
    .toEqual(storiesThrough(20).toSorted());

  await test.step("the new revision reads the changed record there, and the old revision's answer released afterwards changes nothing", async () => {
    const revisionB = main.publish("B");
    await refreshedTo(page, revisionB);
    await expectEntries(recent, twenty);
    expect(recordsAskedAt(github, revisionB)).toEqual([held.path]);
    release();
    await untilPageRests(page);
    await expectEntries(recent, twenty);
    expect(recordsAsked(github)).toHaveLength(storiesThrough(20).length + 1);
  });
  const asked = recordsAsked(github).length;

  await test.step("opening a terminal, resizing its panel, closing it, opening and closing the sidebar, and a narrow window keep twenty, reading nothing", async () => {
    const terminal = terminalOf(page);
    await openTerminalControl(
      sessionEntriesIn(storyCard(recent, terminalStory.title)).first(),
    ).click();
    await expect(terminalScreenParts(terminal).rows).toContainText("attached");
    await expectEntries(recent, twenty);
    await focusDivider(page);
    await pressDividerKey(page, "ArrowLeft", 2);
    await expectEntries(recent, twenty);
    await closeSidePanel(terminal, { using: "mouse" });
    await expect(terminal).toHaveCount(0);
    await expectEntries(recent, twenty);
    const { button } = sessionsSidebarParts(page);
    await button.click();
    await button.click();
    await expectEntries(recent, twenty);
    await page.setViewportSize({ width: 40 * rem, height: 900 });
    await showColumn(page, "Recently done");
    await expectEntries(recent, twenty);
    await page.setViewportSize({ width: 80 * rem, height: 900 });
    await expectEntries(recent, twenty);
    await untilPageRests(page);
    expect(recordsAsked(github)).toHaveLength(asked);
  });

  await test.step("a reload shows the latest ten again", async () => {
    await reloadUntilRead(page);
    await expectEntries(recent, namesOf(atB, 10));
    await expect(revealAction(recent)).toHaveText(
      "Show 10 of 25 older entries",
    );
    const tail = new Set(storiesThrough(35).slice(storiesThrough(10).length));
    expect(
      recordsAsked(github)
        .slice(asked)
        .filter((path) => tail.has(path)),
    ).toEqual([]);
  });
});

test("Show latest 10 restores the first ten published Done stories without reading them again", async ({
  page,
  dashboard,
  afterGitHubStops,
}) => {
  const { github, recent, main } =
    await test.step("Given the Board opens over a published Done catalog", async () => {
      await page.setViewportSize({ width: 80 * rem, height: 900 });
      return opened(page, dashboard, entries, {
        history: { afterGitHubStops, later: {} },
      });
    });
  await test.step("And the developer shows ten older entries", () =>
    revealAction(recent).click());
  const { revision, asked } =
    await test.step("And the Board has read the twenty visible stories", async () => {
      if (!main) throw new Error("No progressive publication history");
      await expectEntries(recent, namesOf(entries, 20));
      return {
        revision: main.firstRevision,
        asked: recordsAskedAt(github, main.firstRevision),
      };
    });

  await test.step("When the developer chooses Show latest 10", () =>
    showLatestAction(recent).click());
  await test.step("Then only the latest ten stories are visible", () =>
    expectEntries(recent, namesOf(entries, 10)));
  await test.step("And the Board does not read those stories again", async () => {
    await untilPageRests(page);
    expect(recordsAskedAt(github, revision)).toEqual(asked);
  });
});

test("choosing another project while a revealed batch is read shows that project, which the late answer leaves alone, and Open Dough starts again at ten", async ({
  afterGitHubStops,
  page,
  dashboard,
}) => {
  await page.setViewportSize({ width: 80 * rem, height: 900 });
  await publishOnePygardonStory(page, afterGitHubStops);
  const held = entries[heldPlace - 1];
  if (!held) throw new Error("Missing the held Done story.");
  let release = () => {};
  const { github, recent } = await opened(page, dashboard, entries, {
    answering: (published) => {
      const read = holdingAnswer(published, isRecord(held.path));
      release = read.release;
      return read.answer;
    },
  });
  const { backlog } = parts(page);
  await revealAction(recent).click();
  await expectEntries(recent, namesOf(entries, 20));
  await revealAction(recent).click();
  await expect(storyCard(recent, held.identity)).toContainText(
    "Reading done story…",
  );
  // Every demanded record has been asked for, the held one unanswered;
  // leaving Open Dough abandons the read.
  await expect
    .poll(() => recordsAsked(github).toSorted())
    .toEqual(storiesThrough(30).toSorted());
  await chooseProject(page, "Pygardon");
  await expect(backlog).toContainText("A Pygardon story");
  release();
  await untilPageRests(page);
  await expect(shownProjectControl(page)).toBeFocused();
  await expect(recent).not.toContainText("progressive story");
  await chooseProject(page, "Open Dough");
  await expectEntries(recent, namesOf(entries, 10));
  await expect(revealAction(recent)).toHaveText("Show 10 of 25 older entries");
  expect(recordsAsked(github).toSorted()).toEqual(
    storiesThrough(30).toSorted(),
  );
});
