import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { materializeRepository } from "../../Distribution/tests/support/repository-fixture.mjs";
import {
  largeBacklogRepository,
  queuedTitle,
} from "../../dashboard/test-support/accessibleBoard.ts";
import {
  expectDocumentStill,
  pressScrollbarTrack,
} from "../../dashboard/test-support/boardReading.ts";
import {
  boardView,
  classicBoardScrollbarLaunchOptions,
} from "../../dashboard/test-support/boardView.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import { sidePanelPages } from "../../dashboard/test-support/sidePanelPages.ts";
import { keepLaunchRecords } from "../../dashboard/test-support/support/launchStore.ts";

const title = queuedTitle(1);
const classicScrollbarWidth = 15;

test.use({
  projectFolders: ["open-dough"],
  viewport: { width: 1400, height: 420 },
  reducedMotion: "reduce",
  launchOptions: classicBoardScrollbarLaunchOptions,
});

test("the native Board scrollbar reads farther without moving the open Side panel", async ({
  page,
  dashboard,
  afterGitHubStops,
}) => {
  const board =
    await test.step("Given the browser shows the classic Board scrollbar", () =>
      boardView(page).useClassicScrollbar(classicScrollbarWidth));
  await test.step("And the project publishes a long Backlog", async () => {
    const { origin, trunkSha, cleanup } = await materializeRepository(
      largeBacklogRepository(),
    );
    afterGitHubStops(cleanup);
    await publishCommittedOrigin(page, {
      repoDir: origin,
      revision: trunkSha,
      repository: "terryyin/open-dough",
    });
  });
  const session =
    await test.step("And the first story has a working session", () => {
      const id = dashboard.claudeListsSession({
        name: title,
        cwd: dashboard.home,
        startedAt: Date.now(),
      });
      keepLaunchRecords(dashboard, [workingSession(id)]);
      return id.slice(0, 8);
    });
  const view = await test.step("When I open the published Board", async () => {
    await page.goto("/");
    return sidePanelPages(page);
  });
  await view.phase(
    "And I open the terminal beside the Board",
    ({ board: stories }) =>
      stories.storyCard(title).openTerminal().expectText(`attached ${session}`),
  );
  const before =
    await test.step("Then the Board has its own scrollbar in the split frame", async () => {
      await expect
        .poll(() => board.scrollbarWidth())
        .toBe(classicScrollbarWidth);
      return {
        split: await view.shownRoom(),
        boardRoom: await board.scrollRegion().boundingBox(),
        readFrom: await board.scrollY(),
      };
    });
  await test.step("When I press the Board scrollbar track", () =>
    pressScrollbarTrack(page));
  await test.step("Then the Board reads lower inside the same frame", async () => {
    await expect.poll(() => board.scrollY()).toBeGreaterThan(before.readFrom);
    expect(await board.scrollRegion().boundingBox()).toEqual(before.boardRoom);
    await expectDocumentStill(page);
  });
  await test.step("And the Side panel stays in place with the original attachment", async () => {
    expect(await view.shownRoom()).toEqual(before.split);
    expect(
      dashboard.claudeAttaches().filter(({ id }) => id === session),
    ).toHaveLength(1);
  });
});

function workingSession(sessionId: string) {
  return makeMe.aLaunchRecord
    .executing({ identity: "SEED-11#story", title })
    .inClaudeSession({ sessionId })
    .please();
}
