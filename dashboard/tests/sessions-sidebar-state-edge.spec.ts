// A Sessions sidebar Session entry shows its session's state by its left border, its
// style, thickness, and colour all differing: needing input, solid thick red;
// ready for review, solid thick green; failed or stopped, dashed red; working,
// thin blue; an unlisted, unknown, or unrecognized state, dotted grey. Each
// entry also carries its state's label for assistive technology, hidden from
// sight, while its state words still show. A session marked done leaves the
// sidebar, so a done entry's thin grey border is not seen here. The page's own
// dashboard server launches the synthetic `claude` (./fixtures/fake-claude).

import { expect, pausePageClockAt, test } from "./dashboardTest.ts";
import { launched } from "./agentTerminalBoundary.ts";
import {
  publishStoryColumnsJourney,
  type StoryColumnsJourney,
} from "./launchJourney.ts";
import { watchRecordReads } from "./sessionStatePace.ts";
import {
  expectSessionsSidebarSessionEntryShown,
  sessionsSidebarSessionEntryEdges,
  sessionsSidebarParts,
} from "./sessionsSidebarPage.ts";
import { openStoryColumnsJourney } from "./storyColumnsPage.ts";
import type { ClaudeSessionChange } from "./support/fakeClaude.ts";

test.use({ projectFolders: ["open-dough", "doughnut"] });

test.describe("the Sessions sidebar's state edge", () => {
  let columnsJourney: StoryColumnsJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    columnsJourney = await publishStoryColumnsJourney();
  });
  test.afterAll(() =>
    (columnsJourney as StoryColumnsJourney | undefined)?.cleanup(),
  );

  test("each state has its own border style, thickness, and colour, and its hidden label", async ({
    page,
    dashboard,
  }) => {
    await pausePageClockAt(page, new Date());
    const { passOnePace } = await watchRecordReads(page);
    const states = [
      ["working", "Working", "working"],
      ["blocked", "Needs input", "needs-input"],
      ["done-live", "Ready for review", "ready"],
      ["failed", "Session failed", "halted"],
      ["stopped", "Session stopped", "halted"],
      ["forgotten", "Session unavailable", "unsettled"],
      [
        "unrecognized",
        "State not recognized: Claude Code lists it as napping",
        "unsettled",
      ],
    ] as const satisfies readonly (readonly [
      ClaudeSessionChange,
      string,
      keyof typeof sessionsSidebarSessionEntryEdges,
    ])[];
    const titles: string[] = [];
    for (const [index, [change]] of states.entries()) {
      const title = `Edge story ${index}`;
      titles.push(title);
      const { sessionId } = await launched(dashboard, "doughnut", {
        identity: `SEED-901#edge-${index}`,
        title,
      });
      dashboard.claudeSessionBecomes(sessionId, change);
    }
    const { settled } = await openStoryColumnsJourney(page, columnsJourney);
    const {
      button,
      entries,
      entry: entryControl,
      sidebar,
    } = sessionsSidebarParts(page);
    await settled();
    await button.click();
    await expect(entries).toHaveCount(states.length);
    await passOnePace();

    for (const [index, [, words, tone]] of states.entries()) {
      const title = titles[index] ?? "?";
      const row = sidebar.getByRole("listitem").filter({ hasText: title });
      await expectSessionsSidebarSessionEntryShown(row, words, tone);
      await expect(entryControl(title)).toHaveCount(1);
    }

    // The thick borders are thicker than the thin ones, as drawn.
    const widthOf = (title: string) =>
      sidebar
        .getByRole("listitem")
        .filter({ hasText: title })
        .evaluate((row) => parseFloat(getComputedStyle(row).borderLeftWidth));
    const thick = await widthOf(titles[1] ?? "?");
    expect(await widthOf(titles[2] ?? "?")).toBe(thick);
    expect(thick).toBeGreaterThan(await widthOf(titles[0] ?? "?"));
  });
});
