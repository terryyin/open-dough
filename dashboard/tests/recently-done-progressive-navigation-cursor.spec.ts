// A Running Cursor sessions row the runner still holds, for a session whose
// record is marked done and placed 27th in Recently done, chosen from another
// project: Open Dough's stories show, Recently done extends exactly through
// the entry, reading only the records before it, and the entry is brought
// into view -- at once, as reduced motion asks -- only once they are read.
// Closing its terminal with the row hidden returns the keyboard to that
// entry. The terminal's connection is held, so attaching does not reopen the
// session meanwhile. The runner and cursor-agent are the fixture
// ./cursor-runner-sessions.spec.ts uses; the publication and the other
// sessions are ./recentlyDoneProgressiveJourney.ts's.

import { agentTerminalEndpoint } from "../src/agentTerminal.ts";
import { launch } from "./agentLaunchBoundary.ts";
import { parts, standaloneSessionName } from "./dashboardPage.ts";
import { rem } from "./dashboardColumnsPage.ts";
import { publishMovingOrigin } from "./publishedOrigin.ts";
import { placedAt } from "./recentlyDoneProgressive.ts";
import { recordsAsked } from "./recentlyDoneProgressivePage.ts";
import {
  destination,
  names,
  openedWithHeldStory,
  storiesThrough,
} from "./recentlyDoneProgressiveJourney.ts";
import {
  expectRevealsSince,
  recordReveals,
  revealsOf,
} from "./sessionNavigationJourney.ts";
import { sidebarParts } from "./sessionSidebarPage.ts";
import { expect, keptRecord, test } from "./support/cursorStart.ts";

const instruction = "hold this done session";
const entryName = standaloneSessionName("Ad hoc", instruction);

test.use({
  projectFolders: ["open-dough", "pygardon"],
  cursorScreen: "working",
});

test("choosing a Running Cursor sessions row from Pygardon reveals its done entry 27 once entries 1 to 27 are read, and closing its terminal returns the keyboard there", async ({
  page,
  dashboard,
  cursor,
}) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 80 * rem, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const launched = await launch(dashboard, {
    source: "open-dough",
    workflow: "ad-hoc",
    host: "cursor",
    instruction,
  });
  expect(JSON.parse(launched.body)).toMatchObject({ kind: "launched" });
  await expect.poll(() => cursor.attaches()).toHaveLength(1);
  const held = keptRecord(dashboard.home);
  // The terminal never connects, so the session stays done.
  await page.routeWebSocket(new RegExp(agentTerminalEndpoint), () => {});
  const pygardon = await publishMovingOrigin(page, "terryyin/pygardon");
  pygardon.push(
    "e6".repeat(20),
    "# Product backlog\n\n## Taken\n\n## Backlog list\n\n- [A Pygardon story](seeds/SEED-301.md#s) — SEED-301#s\n",
  );
  await recordReveals(page);
  const view = await openedWithHeldStory(page, dashboard, {
    open: [],
    elsewhere: true,
    also: (now) => [
      {
        ...held,
        launchedAt: placedAt(now, destination),
        doneAt: new Date(now - 10 * 60_000).toISOString(),
      },
    ],
  });
  const { github, recent } = view;
  const { project, backlog } = parts(page);
  const entry = recent.getByRole("article", { name: entryName });
  await expect(entry).toHaveCount(0);
  await project.getByRole("radio", { name: "Pygardon" }).check();
  await expect(backlog).toContainText("A Pygardon story");

  const { sidebar, button } = sidebarParts(page);
  await button.click();
  const region = sidebar.getByRole("region", {
    name: "Running Cursor sessions",
  });
  await region.getByRole("button", { name: "Running Cursor sessions" }).click();
  const row = region.getByRole("button", { name: /Open Dough/ });
  await expect(row).toContainText("Ad hoc");
  const before = (await revealsOf(page)).length;
  await row.click();

  await test.step("Open Dough's Recently done lists entries through 27 at once, asking only for their records, and brings none into view while the held one is read", async () => {
    await expect(
      project.getByRole("radio", { name: "Open Dough", exact: true }),
    ).toBeChecked();
    await expect(view.heldCard).toContainText("Reading done story…");
    await expect(entry).toBeVisible();
    await expect(recent.locator(":scope > ol > li > article")).toHaveCount(
      destination,
    );
    await expect
      .poll(() => recordsAsked(github).toSorted())
      .toEqual(storiesThrough(destination).toSorted());
    expect((await revealsOf(page)).slice(before)).toEqual([]);
  });

  await test.step("once it is read, the entry is brought into view at once, and nothing older is read", async () => {
    view.release();
    await expect
      .poll(async () => (await revealsOf(page)).length)
      .toBeGreaterThan(before);
    await expectRevealsSince(page, before, entryName, "auto");
    await expect(entry).toBeInViewport();
    await expect(recent.locator(":scope > ol > li > article")).toHaveCount(
      destination,
    );
    await expect(
      recent.locator(":scope > ol > li > article").nth(destination - 2),
    ).toHaveAccessibleName(names(destination - 1).at(-1) ?? "");
    expect(recordsAsked(github).toSorted()).toEqual(
      storiesThrough(destination).toSorted(),
    );
  });

  await test.step("with the row hidden, closing its terminal returns the keyboard to the entry", async () => {
    await button.click();
    await expect(row).toHaveCount(0);
    const terminal = page.getByRole("region", { name: "Terminal" });
    await terminal.getByRole("button", { name: "Close" }).click();
    await expect(terminal).toHaveCount(0);
    await expect(entry).toBeFocused();
  });
});
