// An active story's sessions on the mounted Board, over typed machine answers
// and a published done catalog naming that story: the Backlog card owns both,
// the matching Done card holds none, and Recently done's paging count uses its
// rendered top-level entries.
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { minutesAgo } from "../../../Distribution/tests/support/testDataDefaults.mjs";
import { mountBoardFrame } from "../navigation/board-frame-mount.ts";
import { boardReading } from "../navigation/board-reading-page.ts";
import { boardWork, story } from "../navigation/board-work.ts";
import {
  doneCard,
  recentlyDone,
  standaloneEntry,
  topLevelEntries,
} from "./recently-done-column-page.ts";

test("an active story owns its open and Done sessions even with a matching done card, whose Column paging count uses the rendered top-level entries", async () => {
  const active = story("Prepare stories in a clear workspace", 301);
  const catalog = makeMe.aDoneCatalog
    .holding([
      makeMe.aDoneRecord
        .completed({
          identity: active.identity,
          title: active.title,
          completedAt: minutesAgo(60),
        })
        .please(),
    ])
    .please();
  const closed = makeMe.aLaunchRecord
    .refining(active)
    .inClaudeSession({ sessionId: "active-story-closed" })
    .launchedAt(minutesAgo(50))
    .markedDoneAt(minutesAgo(40))
    .please();
  const open = makeMe.aLaunchRecord
    .executing(active)
    .inClaudeSession({ sessionId: "active-story-open" })
    .launchedAt(minutesAgo(10))
    .please();
  const adHoc = makeMe.aLaunchRecord
    .adHoc({ title: "Open Dough session" })
    .inClaudeSession({ sessionId: "ad-hoc-done-active" })
    .launchedAt(minutesAgo(35))
    .markedDoneAt(minutesAgo(30))
    .please();
  await mountBoardFrame(
    boardWork([active], { done: catalog.done }),
    { width: 54 * 16, height: 900 },
    "stories",
    {
      answer: makeMe.aMachineAnswer
        .observingDone(closed)
        .observingOpen(open)
        .observingDone(adHoc)
        .please(),
    },
    { done: catalog.doneReads },
  );
  const card = boardReading
    .column("Backlog")
    .getByRole("article", { name: active.title, exact: true });
  // How many entries in `where` show the session `key`.
  const showing = (where: Element | null | undefined, key: string) =>
    where?.querySelectorAll(`[data-shows-session="${key}"]`).length;
  const openKey = "claude:active-story-open";
  const closedKey = "claude:active-story-closed";

  await expect.element(doneCard(active.title)).toBeVisible();
  await expect
    .element(card.getByText("Working", { exact: true }))
    .toBeVisible();
  expect(showing(card.element(), openKey)).toBe(1);
  expect(showing(recentlyDone().element(), openKey)).toBe(0);
  expect(showing(recentlyDone().element(), closedKey)).toBe(0);
  const disclosure = card.element().querySelector("details.story-card-done");
  expect(disclosure?.textContent).toContain("1");
  expect(showing(disclosure, closedKey)).toBe(1);
  const board = page.getByRole("region", { name: "Board", exact: true });
  for (const key of [openKey, closedKey])
    expect(showing(board.element(), key)).toBe(1);
  const topLevel = topLevelEntries();
  expect(topLevel).toHaveLength(2);
  expect(topLevel).toContain(doneCard(active.title).element());
  expect(topLevel).toContain(standaloneEntry("Open Dough session").element());
  await expect
    .element(page.getByRole("button", { name: "Recently done 2 entries" }))
    .toBeVisible();
});
