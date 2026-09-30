// A Sessions sidebar entry shows its session's state by its left border, its
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
  publishStoryStagesJourney,
  type StoryStagesJourney,
} from "./launchJourney.ts";
import { watchRecordReads } from "./sessionStatePace.ts";
import {
  expectSidebarSessionShown,
  sidebarEdges,
  sidebarParts,
} from "./sessionSidebarPage.ts";
import { openStoryStagesJourney } from "./storyStagesPage.ts";
import type { ClaudeSessionChange } from "./support/fakeClaude.ts";

test.use({ projectFolders: ["open-dough", "doughnut"] });

test.describe("the Sessions sidebar's state edge", () => {
  let stagesJourney: StoryStagesJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    stagesJourney = await publishStoryStagesJourney();
  });
  test.afterAll(() =>
    (stagesJourney as StoryStagesJourney | undefined)?.cleanup(),
  );

  test("each state has its own border style, thickness, and colour, and its hidden label", async ({
    page,
    dashboard,
  }) => {
    await pausePageClockAt(page, new Date());
    const { passOnePace } = watchRecordReads(page);
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
      keyof typeof sidebarEdges,
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
    const { settled } = await openStoryStagesJourney(page, stagesJourney);
    const {
      button,
      entries,
      entry: entryControl,
      sidebar,
    } = sidebarParts(page);
    await settled();
    await button.click();
    await expect(entries).toHaveCount(states.length);
    await passOnePace();

    for (const [index, [, words, tone]] of states.entries()) {
      const title = titles[index] ?? "?";
      const row = sidebar.getByRole("listitem").filter({ hasText: title });
      await expectSidebarSessionShown(row, words, tone);
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
