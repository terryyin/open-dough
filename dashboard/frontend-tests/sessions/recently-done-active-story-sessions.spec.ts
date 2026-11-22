// Active story membership owns its open and Done sessions even with a matching
// done card; the Done disclosure holds the closed session once.
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { columnPagingControl, rem } from "../../test-support/boardPage.ts";
import {
  expectMembership,
  expandStoryCardDoneHistory,
  parts,
  sessionEntryShowing,
  sessionStateOf,
  storyCardDoneDisclosure,
} from "../../test-support/dashboardPage.ts";
import {
  adHocEntry,
  expectEntries,
} from "../../test-support/recentlyDoneColumn.ts";
import { queuedTitle } from "../../test-support/recentlyDoneRecords.ts";
import { openFrontendActiveStorySessions } from "../../test-support/support/frontendRecentlyDoneStoryCards.ts";

test("an active story owns its open and Done sessions even with a matching done card, whose Column paging count uses the rendered top-level entries", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 54 * rem, height: 900 });
  const { openKey, closedKey } = await openFrontendActiveStorySessions(
    page,
    frontendServices,
  );
  await expectMembership(page, { taken: [], backlog: [queuedTitle] });
  const { board, backlog, recentlyDone: recent } = parts(page);
  const card = backlog.getByRole("article", {
    name: queuedTitle,
    exact: true,
  });
  const doneCard = recent.getByRole("article", {
    name: queuedTitle,
    exact: true,
  });
  const open = sessionEntryShowing(card, openKey);
  const closed = sessionEntryShowing(card, closedKey);
  await expect(open).toHaveAttribute("data-shows-session", openKey);
  await expect(sessionStateOf(open)).toHaveText("Working");
  await expect(sessionEntryShowing(recent, openKey)).toHaveCount(0);
  await expect(sessionEntryShowing(doneCard, closedKey)).toHaveCount(0);
  await expect(sessionEntryShowing(recent, closedKey)).toHaveCount(0);
  const disclosure = storyCardDoneDisclosure(card);
  await expect(disclosure).toContainText("1");
  await expandStoryCardDoneHistory(card);
  await expect(disclosure).toHaveAttribute("open", "");
  await expect(sessionStateOf(closed)).toHaveText("Done");
  for (const key of [openKey, closedKey]) {
    await expect(sessionEntryShowing(board, key)).toHaveCount(1);
  }
  await expectEntries(recent, [adHocEntry, queuedTitle]);
  await expect(columnPagingControl(page, "Recently done")).toHaveText(
    "Recently done 2 entries",
  );
});
