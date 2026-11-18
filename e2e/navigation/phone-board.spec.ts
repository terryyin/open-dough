import { materializeRepository } from "../../Distribution/tests/support/repository-fixture.mjs";
import {
  largeBacklogRepository,
  queuedTitles,
} from "../../dashboard/tests/accessibleBoard.ts";
import { boardView } from "../../dashboard/tests/boardView.ts";
import { publishCommittedOrigin } from "../../dashboard/tests/committedOrigin.ts";
import { expectSettledPage } from "../../dashboard/tests/dashboardPage.ts";
import { expect, test } from "../../dashboard/tests/dashboardTest.ts";

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  reducedMotion: "reduce",
});

test("touch pages a published phone Board and leaves its Backlog vertically readable", async ({
  page,
  afterGitHubStops,
}) => {
  const { origin, trunkSha, cleanup } = await materializeRepository(
    largeBacklogRepository(),
  );
  afterGitHubStops(cleanup);
  await publishCommittedOrigin(page, {
    repoDir: origin,
    revision: trunkSha,
    repository: "terryyin/open-dough",
  });
  await page.goto("/");
  await expectSettledPage(page, {
    taken: ["Repair the installer's update report"],
    backlog: queuedTitles,
  });
  const board = boardView(page);
  await board.showsPhoneColumn("Backlog", ["Taken 1 entry"]);

  const vertical = await board.touchStroke({
    from: { x: 200, y: 550 },
    to: { x: 200, y: 310 },
  });
  expect(await board.touchAction()).toMatch(/\bpan-y\b/);
  expect(vertical).toEqual({ moveAccepted: true, endAccepted: true });
  await board.wheelTo(240);
  await board.showsPhoneColumn("Backlog", ["Taken 1 entry"]);
  await board.wheelTo(0);

  await board.touchStroke({
    from: { x: 300, y: 250 },
    to: { x: 120, y: 250 },
  });
  await board.showsPhoneColumn("Taken", [
    "Backlog 16 entries",
    "Recently done 0 entries",
  ]);
  await board.tapIndicator("Backlog");
  await board.showsPhoneColumn("Backlog", ["Taken 1 entry"]);
});
