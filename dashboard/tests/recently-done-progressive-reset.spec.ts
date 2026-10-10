// What keeps Recently done's requested range and what starts it again at
// ten. A refresh's old revision answering late changes nothing it shows.
// Opening and closing the terminal and the sidebar, resizing the panel, and
// narrowing the window keep the range, reading nothing; a reload and another
// project start again at ten, and that project's late answer changes
// nothing. A Running Cursor sessions row chosen from another project still
// reveals its done entry through 27:
// ./recently-done-progressive-navigation-cursor.spec.ts. Publications and
// refreshes: ./recentlyDoneRefresh.ts; the `gh` calls reaching the fake
// GitHub show which records were read, and at which revision.

import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { rem, showColumn } from "./dashboardColumnsPage.ts";
import { publishMovingOrigin } from "./publishedOrigin.ts";
import { expectEntries } from "./recentlyDoneColumn.ts";
import { entryName, revision as revisionA } from "./recentlyDoneProgressive.ts";
import {
  isRecord,
  opened,
  recordsAsked,
  revealAction,
  settle,
  terminalOf,
} from "./recentlyDoneProgressivePage.ts";
import {
  destination,
  entries,
  entryAt,
  names,
  openedWithHeldStory,
  storiesThrough,
} from "./recentlyDoneProgressiveJourney.ts";
import {
  movingMain,
  namesOf,
  recordsAskedAt,
  refreshedTo,
  retitled,
} from "./recentlyDoneRefresh.ts";
import { resizeEdge } from "./sidePanelWidthPage.ts";
import { sidebarParts } from "./sessionSidebarPage.ts";
import { holding } from "./support/heldGitHubAnswer.ts";
import { reloadUntilRead } from "./pageRequestNotes.ts";

test.use({ projectFolders: ["open-dough", "pygardon"] });

test("an old revision's late record answer changes nothing; the terminal, panel width, sidebar, and a narrow window keep twenty; a reload starts again at ten", async ({
  page,
  dashboard,
}) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 80 * rem, height: 900 });
  await page.clock.install();
  const main = movingMain();
  const held = entryAt(13);
  if (held.kind !== "story") throw new Error("Entry 13 is no story.");
  let release: () => void = () => undefined;
  const view = await opened(page, dashboard, entries, {
    open: [destination],
    answering: (published) => {
      const hold = holding(
        main.answering(published),
        ({ request }) =>
          isRecord(held.path)(request) &&
          "revision" in request &&
          request.revision === revisionA,
      );
      release = hold.release;
      return hold.answer;
    },
  });
  const { github, recent, now } = view;
  const changed = retitled(held);
  const atB = entries.map((entry) => (entry.place === 13 ? changed : entry));
  const twenty = namesOf(atB, 20);

  await revealAction(recent).click();
  await expect(
    recent.getByRole("article", { name: held.identity }),
  ).toContainText("Reading done story…");
  await expect
    .poll(() => recordsAskedAt(github, revisionA).toSorted())
    .toEqual(storiesThrough(20).toSorted());

  await test.step("the new revision reads the changed record there, and the old revision's answer released afterwards changes nothing", async () => {
    const revisionB = main.publish(now, atB);
    await refreshedTo(page, revisionB);
    await expectEntries(recent, twenty);
    expect(recordsAskedAt(github, revisionB)).toEqual([held.path]);
    release();
    await settle(page);
    await expectEntries(recent, twenty);
    expect(recordsAsked(github)).toHaveLength(storiesThrough(20).length + 1);
  });
  const asked = recordsAsked(github).length;

  await test.step("opening a terminal, resizing its panel, closing it, opening and closing the sidebar, and a narrow window keep twenty, reading nothing", async () => {
    const terminal = terminalOf(page);
    await parts(page)
      .taken.getByRole("article", { name: entryName(entryAt(destination)) })
      .getByRole("button", { name: "Open terminal" })
      .click();
    await expect(terminal.locator(".xterm-rows")).toContainText("attached");
    await expectEntries(recent, twenty);
    await resizeEdge(page).focus();
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expectEntries(recent, twenty);
    await terminal.getByRole("button", { name: "Close" }).click();
    await expect(terminal).toHaveCount(0);
    await expectEntries(recent, twenty);
    const { button } = sidebarParts(page);
    await button.click();
    await button.click();
    await expectEntries(recent, twenty);
    await page.setViewportSize({ width: 40 * rem, height: 900 });
    await showColumn(page, "Recently done");
    await expectEntries(recent, twenty);
    await page.setViewportSize({ width: 80 * rem, height: 900 });
    await expectEntries(recent, twenty);
    await settle(page);
    expect(recordsAsked(github)).toHaveLength(asked);
  });

  await test.step("a reload shows the latest ten again", async () => {
    await reloadUntilRead(page);
    await expectEntries(recent, namesOf(atB, 10));
    await expect(revealAction(recent)).toHaveText(
      "Show 10 of 24 older entries",
    );
    const tail = new Set(storiesThrough(35).slice(storiesThrough(10).length));
    expect(
      recordsAsked(github)
        .slice(asked)
        .filter((path) => tail.has(path)),
    ).toEqual([]);
  });
});

test("choosing another project while a revealed batch is read shows that project, which the late answer leaves alone, and Open Dough starts again at ten", async ({
  page,
  dashboard,
}) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 80 * rem, height: 900 });
  const pygardon = await publishMovingOrigin(page, "terryyin/pygardon");
  pygardon.push(
    "e6".repeat(20),
    "# Product backlog\n\n## Taken\n\n## Backlog list\n\n- [A Pygardon story](seeds/SEED-301.md#s) — SEED-301#s\n",
  );
  const view = await openedWithHeldStory(page, dashboard, { open: [] });
  const { github, recent } = view;
  const { project, backlog } = parts(page);
  await revealAction(recent).click();
  await expectEntries(recent, names(20));
  await revealAction(recent).click();
  await expect(view.heldCard).toContainText("Reading done story…");
  // Every demanded record has been asked for, the held one unanswered;
  // leaving Open Dough abandons the read.
  await expect
    .poll(() => recordsAsked(github).toSorted())
    .toEqual(storiesThrough(30).toSorted());
  const pygardonChoice = project.getByRole("radio", { name: "Pygardon" });
  await pygardonChoice.check();
  await expect(backlog).toContainText("A Pygardon story");
  view.release();
  await settle(page);
  await expect(pygardonChoice).toBeFocused();
  await expect(recent).not.toContainText("progressive story");
  await project.getByRole("radio", { name: "Open Dough", exact: true }).check();
  await expectEntries(recent, names(10));
  await expect(revealAction(recent)).toHaveText("Show 10 of 25 older entries");
  expect(recordsAsked(github).toSorted()).toEqual(
    storiesThrough(30).toSorted(),
  );
});
