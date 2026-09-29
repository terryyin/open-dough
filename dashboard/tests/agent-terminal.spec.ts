// A session launched from this dashboard opens in the page's one terminal,
// on a committed origin the production commands publish (./launchJourney.ts):
// a card's Started or a Recent sessions entry offers Open terminal, the page
// splits with the terminal on the right, and what is typed there reaches the
// session and its answer shows. Opening another session detaches the first,
// which keeps running; Close detaches only; an entry whose story is in no list
// still opens; and no page text offers `claude attach`. Origin alone still
// places every story. The page's own dashboard server attaches the synthetic
// `claude` (./fixtures/fake-claude), which echoes what is typed; the real one
// is never reached.

import type { Locator } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import {
  expectMembership,
  parts,
  recentSessionName,
  sessionNamedBy,
} from "./dashboardPage.ts";
import { recordsOf } from "./agentLaunchBoundary.ts";
import {
  notRefinedStory,
  publishSettlementJourney,
  readyStory,
  takenStory,
  type SettlementJourney,
} from "./launchJourney.ts";
import { openSettlementJourney } from "./settlementPage.ts";
import { processRunning } from "./support/processGroup.ts";

test.use({ projectFolders: ["open-dough"] });

const shortId = (sessionId: string) => sessionId.slice(0, 8);

// The terminal size the fake last reported, as `<cols>x<rows>`.
async function reportedSize(rows: Locator): Promise<string | undefined> {
  const text = (await rows.textContent()) ?? "";
  return [...text.matchAll(/(?:attached \S+|resized) (\d+x\d+)/g)].at(-1)?.[1];
}

test.describe("the terminal beside the page", () => {
  let settlement: SettlementJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    settlement = await publishSettlementJourney();
  });
  test.afterAll(() => (settlement as SettlementJourney | undefined)?.cleanup());

  test("a card or Recent sessions entry opens its session in the right-hand terminal, one at a time, and Close leaves it running", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { card, settled, show, launch } = await openSettlementJourney(
      page,
      settlement,
    );
    const { recentSessions: recent, stages } = parts(page);
    const panel = page.getByRole("region", { name: "Terminal" });
    const rows = panel.locator(".xterm-rows");
    const started = (title: string) =>
      card(title).getByRole("region", { name: "Execution started" });
    const entry = (title: string) =>
      recent.getByRole("article", {
        name: recentSessionName("Execution", title),
      });
    const openIn = (place: Locator) =>
      place.getByRole("button", { name: "Open terminal" });
    const attachesEnded = (sessionId: string) =>
      dashboard
        .claudeAttaches()
        .filter((attach) => attach.id === shortId(sessionId))
        .every(
          (attach) =>
            attach.endedBy !== undefined && !processRunning(attach.pid),
        );
    const stillListed = async (sessionId: string) => {
      expect(await recordsOf(dashboard, "open-dough")).toContainEqual(
        expect.objectContaining({
          session: expect.objectContaining({ sessionId }),
          sessionState: expect.objectContaining({ kind: "listed" }),
        }),
      );
    };
    const queued = {
      taken: [],
      backlog: [takenStory, readyStory, notRefinedStory],
    };
    await expectMembership(page, queued);
    await settled();

    await launch(notRefinedStory, "Execution");
    await launch(readyStory, "Execution");
    const first = await sessionNamedBy(started(notRefinedStory));
    const second = await sessionNamedBy(started(readyStory));
    await expect(openIn(entry(notRefinedStory))).toBeVisible();
    await expect(panel).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText("claude attach");
    await expect(page.getByRole("button", { name: /copy/i })).toHaveCount(0);

    await test.step("a card's Started opens its session to the right of the page, and an answer typed there reaches it", async () => {
      await openIn(started(notRefinedStory)).click();
      await expect(panel.getByRole("heading", { level: 2 })).toHaveText(
        notRefinedStory,
      );
      await expect(panel).toContainText(`Execution session ${first}`);
      await expect(panel.getByRole("button", { name: "Close" })).toBeVisible();
      await expect(rows).toContainText(`attached ${shortId(first)}`);
      // The page stays on the left, and the terminal is to its right.
      const left = await stages.boundingBox();
      const right = await panel.boundingBox();
      expect(right?.x).toBeGreaterThanOrEqual(
        (left?.x ?? 0) + (left?.width ?? 0),
      );

      await page.keyboard.type("yes, go on");
      await page.keyboard.press("Enter");
      await expect(rows).toContainText("echo yes, go on");
      await expectMembership(page, queued);
    });

    await test.step("the terminal's size follows the panel", async () => {
      const rendered = rows.locator(":scope > div");
      const size = async () => {
        const reported = await reportedSize(rows);
        return reported?.split("x")[1] === String(await rendered.count())
          ? reported
          : undefined;
      };
      await expect.poll(size).toMatch(/^\d+x\d+$/);
      const before = await size();
      await page.setViewportSize({ width: 1000, height: 560 });
      await expect
        .poll(async () => {
          const after = await size();
          return after !== undefined && after !== before;
        })
        .toBe(true);
      await expect(rows).toContainText(`resized ${String(await size())}`);
    });

    await test.step("opening another session from Recent sessions detaches the first, which keeps running, and shows the second in its place", async () => {
      await openIn(entry(readyStory)).click();
      await expect(panel).toHaveCount(1);
      await expect(panel.getByRole("heading", { level: 2 })).toHaveText(
        readyStory,
      );
      await expect(panel).toContainText(`Execution session ${second}`);
      await expect(rows).toContainText(`attached ${shortId(second)}`);
      await expect(rows).not.toContainText("echo yes, go on");
      await expect.poll(() => attachesEnded(first)).toBe(true);
      await stillListed(first);
      await expect(openIn(started(notRefinedStory))).toBeVisible();
    });

    await test.step("Close ends the panel and detaches only, and the card offers Open terminal again", async () => {
      await panel.getByRole("button", { name: "Close" }).click();
      await expect(panel).toHaveCount(0);
      await expect(openIn(entry(readyStory))).toBeFocused();
      await expect.poll(() => attachesEnded(second)).toBe(true);
      await stillListed(second);
      await expect(openIn(started(readyStory))).toBeVisible();
      await expect(openIn(started(notRefinedStory))).toBeVisible();
      await expectMembership(page, queued);
    });

    await test.step("an entry whose story is in no list still opens its session", async () => {
      await show(settlement.completed);
      await expectMembership(page, {
        taken: [readyStory],
        backlog: [takenStory],
      });
      await openIn(entry(notRefinedStory)).click();
      await expect(panel.getByRole("heading", { level: 2 })).toHaveText(
        notRefinedStory,
      );
      await expect(rows).toContainText(`attached ${shortId(first)}`);
      await page.keyboard.type("carry on");
      await page.keyboard.press("Enter");
      await expect(rows).toContainText("echo carry on");
      await expect(page.locator("body")).not.toContainText("claude attach");
      await expectMembership(page, {
        taken: [readyStory],
        backlog: [takenStory],
      });
    });

    // Every attach the page opened was to a session it launched.
    expect(
      new Set(dashboard.claudeAttaches().map((attach) => attach.id)),
    ).toEqual(new Set([shortId(first), shortId(second)]));
  });
});
