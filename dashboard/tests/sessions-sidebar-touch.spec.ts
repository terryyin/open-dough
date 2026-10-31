// Touch discovery reads the same session facts before choosing a session.
// Launches and attachments use the real local boundary and synthetic Claude.
import type { LaunchRecord } from "../src/agentLaunch.ts";
import { launch, launchRequest, recordsOf } from "./agentLaunchBoundary.ts";
import { launched } from "./agentTerminalBoundary.ts";
import { expect, test } from "./dashboardTest.ts";
import {
  publishStoryColumnsJourney,
  type StoryColumnsJourney,
} from "./launchJourney.ts";
import {
  expectNoSidewaysScrollAndWholeText,
  pageColumnProjectValue,
  tapWhereShown,
} from "./pageLayout.ts";
import { sessionsSidebarParts } from "./sessionsSidebarPage.ts";
import { openStoryColumnsJourney } from "./storyColumnsPage.ts";
import { phoneLaunchTouchViewport } from "./touchLaunchPage.ts";

test.use({ projectFolders: ["open-dough", "doughnut"] });
let journey: StoryColumnsJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishStoryColumnsJourney();
});
test.afterAll(() => (journey as StoryColumnsJourney | undefined)?.cleanup());

const intended = {
  identity: "SEED-901#intended-mobile-session",
  title:
    "Read the full intended session title and identify its project before continuing the work whose final words are important",
};
const inputNote = "Read the trust question before continuing this session.";

const { name, portrait, landscape } = phoneLaunchTouchViewport;

test.describe(`${name} session discovery`, () => {
  test.use({ viewport: portrait, hasTouch: true });
  test("reads full session context without hover, then chooses the exact session and project through rotation", async ({
    page,
    dashboard,
  }) => {
    await launched(dashboard, "open-dough", {
      identity: "SEED-901#ordinary",
      title: "An ordinary session in another project",
    });
    dashboard.claudeScenario("launched");
    await launch(dashboard, {
      ...launchRequest,
      ...intended,
      source: "doughnut",
      model: "opus",
    });
    const [record] = (await recordsOf(dashboard, "doughnut")) as LaunchRecord[];
    if (record === undefined) throw new Error("Missing intended session");
    dashboard.claudeSessionBecomes(
      record.session.sessionId,
      "blocked",
      inputNote,
    );
    const opened = await openStoryColumnsJourney(page, journey);
    await opened.settled();
    const { sidebar, button, badge, entries, entry } =
      sessionsSidebarParts(page);
    await tapWhereShown(button);
    await expect(entries).toHaveCount(2);
    const row = entries.filter({ hasText: intended.title });
    const disclosure = row.locator("summary", { hasText: "Session details" });
    await expect(disclosure).toBeVisible();
    await tapWhereShown(disclosure);
    const details = row.locator(".sessions-sidebar-session-entry-facts");
    const launchedAt = await row
      .locator("time")
      .evaluate((time) =>
        new Date(time.getAttribute("datetime") ?? "").toLocaleString(),
      );
    for (const text of [
      intended.title,
      intended.identity,
      `Needs input: ${inputNote}`,
      "Doughnut · Execution",
      "Model: Opus (requested)",
      `Launched ${launchedAt}`,
    ]) {
      const fact = details.getByText(text, { exact: true });
      await expect(fact).toBeVisible();
      await fact.scrollIntoViewIfNeeded();
      await expect(fact).toBeInViewport();
      expect(
        await fact.evaluate(
          (element) => element.scrollWidth <= element.clientWidth + 1,
        ),
      ).toBe(true);
    }
    await expect(badge).toHaveText("1");
    await expect(badge).toBeInViewport({ ratio: 1 });
    expect(
      await badge.evaluate(
        (element) =>
          element.scrollWidth <= element.clientWidth + 1 &&
          element.scrollHeight <= element.clientHeight + 1,
      ),
    ).toBe(true);
    // The fully readable count sits over the corner of its control, so
    // that parent's scrollWidth is not a text-clipping measurement.
    await expectNoSidewaysScrollAndWholeText(page, [
      ".sessions-sidebar-session-entry-title",
      ".sessions-toggle-group",
    ]);
    await page.setViewportSize(landscape);
    await expect(details).toBeVisible();
    await expect(details.getByText(intended.title, { exact: true })).toHaveText(
      intended.title,
    );
    await disclosure.scrollIntoViewIfNeeded();
    await tapWhereShown(disclosure);
    await expect(details).toBeHidden();
    // Ordinary list scrolling is explicit; activation itself cannot scroll.
    await entry(intended.title).scrollIntoViewIfNeeded();
    await tapWhereShown(entry(intended.title));
    const panel = page.getByRole("region", { name: "Terminal" });
    await panel.scrollIntoViewIfNeeded();
    await expect(panel.getByRole("heading", { level: 2 })).toHaveText(
      intended.title,
    );
    await expect(panel.locator(".side-panel-names p")).toHaveText(/ session$/);
    await expect(panel.locator(".side-panel-names code")).toHaveCount(0);
    await expect(panel.locator(".xterm-rows")).toContainText(
      `attached ${record.session.sessionId.slice(0, 8)}`,
    );
    // Covering (landscape with sidebar open) aria-hides the page column.
    await expect.poll(() => pageColumnProjectValue(page)).toBe("doughnut");
    await page.setViewportSize(portrait);
    // Selection at landscape width leaves the beside-page sidebar open;
    // rotation preserves that choice when it becomes an overlay.
    await expect(sidebar).toBeVisible();
    await expect(panel.locator(".side-panel-names p")).toHaveText(/ session$/);
    await expect(panel.locator(".side-panel-names code")).toHaveCount(0);
    // Finish the project read and rotation before navigating to its input.
    // Cross-project selection reveals the chosen entry with a native smooth
    // scroll; landscape input is exercised by agent-terminal-touch.spec.ts.
    await opened.settled();
    await button.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        dashboard
          .claudeAttaches()
          .filter(({ id }) => id === record.session.sessionId.slice(0, 8))
          .map(({ lines }) => lines),
      )
      .toEqual([["continue intended session"]]);
    expect(
      dashboard
        .claudeAttaches()
        .filter(({ id }) => id === record.session.sessionId.slice(0, 8)),
    ).toHaveLength(1);
    expect(dashboard.claudeStopCalls()).toEqual([]);
    expect(
      ((await recordsOf(dashboard, "doughnut")) as LaunchRecord[])[0]?.doneAt,
    ).toBeUndefined();
  });
});
