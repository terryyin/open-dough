// Destinations from Recently done sessions: Board reveal beyond the first ten
// and a Codex final-report panel.
import { agentTerminalEndpoint } from "../src/agentTerminal.ts";
import { standaloneSessionName, parts } from "./dashboardPage.ts";
import { launch } from "./agentLaunchBoundary.ts";
import { authenticatedReadEndpoint } from "../src/authenticatedReadRules.ts";
import { recentlyDoneParts } from "./recentlyDoneSessionsSidebarPage.ts";
import {
  destination,
  names,
  openedWithHeldStory,
  storiesThrough,
} from "./recentlyDoneProgressiveJourney.ts";
import { expectEntries, shownEntries } from "./recentlyDoneColumn.ts";
import { recordsAsked } from "./recentlyDoneProgressivePage.ts";
import { placedAt } from "./recentlyDoneProgressive.ts";
import { publishMovingOrigin } from "./publishedOrigin.ts";
import {
  expectRevealsSince,
  recordReveals,
  revealsOf,
} from "./sessionNavigationJourney.ts";
import { rem } from "./boardPage.ts";
import {
  notRefinedStory,
  publishStoryColumnsJourney,
  type StoryColumnsJourney,
} from "./launchJourney.ts";
import { openStoryColumnsJourney } from "./storyColumnsPage.ts";
import {
  test as codexTest,
  expect as codexExpect,
} from "./support/codexLaunch.ts";
import { expect, keptRecord, test } from "./support/cursorStart.ts";
import { retained, report, save } from "./support/retainedReport.ts";

test.use({
  projectFolders: ["open-dough", "doughnut", "pygardon"],
  cursorScreen: "working",
});

test("choosing a Done session beyond Board's first ten from Pygardon reveals its Board entry", async ({
  page,
  dashboard,
  cursor,
}) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 80 * rem, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const instruction = "sidebar done beyond board ten";
  const entryName = standaloneSessionName("Ad hoc", instruction);
  const launched = await launch(dashboard, {
    source: "open-dough",
    workflow: "ad-hoc",
    host: "cursor",
    instruction,
  });
  expect(JSON.parse(launched.body)).toMatchObject({ kind: "launched" });
  await expect.poll(() => cursor.attaches()).toHaveLength(1);
  const held = keptRecord(dashboard.home);
  await page.routeWebSocket(new RegExp(agentTerminalEndpoint), () => {});
  const pygardon = await publishMovingOrigin(page, "terryyin/pygardon");
  pygardon.push(
    "e6".repeat(20),
    "# Product backlog\n\n## Taken\n\n## Backlog list\n\n- [A Pygardon story](seeds/SEED-301.md#s) — SEED-301#s\n",
  );
  await recordReveals(page);
  let releaseCatalog: () => void = () => undefined;
  const catalogHeld = new Promise<void>((resolve) => {
    releaseCatalog = resolve;
  });
  await page.route(
    (url) =>
      url.pathname === authenticatedReadEndpoint &&
      url.searchParams.get("done") === "catalog",
    async (route) => {
      await catalogHeld;
      await route.fallback();
    },
  );
  let release: () => void = releaseCatalog;
  try {
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
    release = () => {
      releaseCatalog();
      view.release();
    };
    releaseCatalog();
    const { github, recent } = view;
    const { project, backlog } = parts(page);
    const boardEntry = recent.getByRole("article", { name: entryName });
    await expect(boardEntry).toHaveCount(0);
    await expectEntries(recent, names(10));
    expect(recordsAsked(github).toSorted()).toEqual(
      storiesThrough(10).toSorted(),
    );
    await project.getByRole("radio", { name: "Pygardon" }).check();
    await expect(backlog).toContainText("A Pygardon story");

    const shown = recentlyDoneParts(page);
    await shown.button.click();
    await shown.header.click();
    await expect(shown.entry(instruction)).toHaveCount(1);
    const before = (await revealsOf(page)).length;
    await shown.entry(instruction).click();

    await test.step("Open Dough's Board Recently done extends through entry 27 while the held story reads", async () => {
      await expect(
        project.getByRole("radio", { name: "Open Dough", exact: true }),
      ).toBeChecked();
      await expect(view.heldCard).toContainText("Reading done story…");
      await expect(boardEntry).toBeVisible();
      await expect(shownEntries(recent)).toHaveCount(destination);
      await expect
        .poll(() => recordsAsked(github).toSorted())
        .toEqual(storiesThrough(destination).toSorted());
      expect((await revealsOf(page)).slice(before)).toEqual([]);
    });

    await test.step("once read, the Board entry is brought into view", async () => {
      view.release();
      await expect
        .poll(async () => (await revealsOf(page)).length)
        .toBeGreaterThan(before);
      await expectRevealsSince(page, before, entryName, "auto");
      await expect(boardEntry).toBeInViewport();
    });
  } finally {
    release();
  }
});

codexTest.describe("Recently done final-report destination", () => {
  codexTest.use({ projectFolders: ["open-dough"] });
  let journey: StoryColumnsJourney;
  codexTest.beforeAll(async () => {
    codexTest.setTimeout(120_000);
    journey = await publishStoryColumnsJourney();
  });
  codexTest.afterAll(() =>
    (journey as StoryColumnsJourney | undefined)?.cleanup(),
  );

  codexTest(
    "opening a Done entry whose destination is a final report reaches Final report",
    async ({ page, dashboard, codexProtocol: native }) => {
      codexTest.setTimeout(120_000);
      if (native === undefined) throw new Error("Missing protocol fixture");
      const { record } = await retained(dashboard, native);
      save(dashboard.home, [
        {
          ...record,
          doneAt: new Date(Date.now() - 60_000).toISOString(),
        },
      ]);
      const { settled } = await openStoryColumnsJourney(page, journey);
      await settled();
      const shown = recentlyDoneParts(page);
      await shown.button.click();
      await shown.header.click();
      await expect(shown.entry(notRefinedStory)).toHaveCount(1);
      await shown.entry(notRefinedStory).click();
      const panel = page.getByRole("region", { name: "Final report" });
      await codexExpect(panel.locator(".final-report-text")).toHaveText(report);
      await codexExpect(
        page.getByRole("region", { name: "Terminal" }),
      ).toHaveCount(0);
    },
  );
});
