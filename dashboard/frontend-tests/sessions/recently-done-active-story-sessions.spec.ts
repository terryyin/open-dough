// Active story membership owns its open session even with a matching done card.
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { columnPagingControl, rem } from "../../test-support/boardPage.ts";
import {
  expectMembership,
  parts,
  sessionEntriesIn,
  sessionEntryShowing,
  sessionStateOf,
} from "../../test-support/dashboardPage.ts";
import {
  adHocEntry,
  expectEntries,
} from "../../test-support/recentlyDoneColumn.ts";
import { queuedTitle } from "../../test-support/recentlyDoneRecords.ts";
import { openFrontendActiveStorySessions } from "../../test-support/support/frontendRecentlyDoneStoryCards.ts";

test("an active story owns its open session even with a matching done card, whose closed session is nested once and whose Column paging count uses the rendered entries", async ({
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
  const active = sessionEntriesIn(backlog);
  const doneCard = recent.getByRole("article", {
    name: queuedTitle,
    exact: true,
  });
  const closed = sessionEntriesIn(doneCard);
  await expect(active).toHaveAttribute("data-shows-session", openKey);
  await expect(sessionStateOf(active)).toHaveText("Working");
  await expect(sessionEntryShowing(recent, openKey)).toHaveCount(0);
  await expect(closed).toHaveAttribute("data-shows-session", closedKey);
  await expect(sessionStateOf(closed)).toHaveText("Done");
  for (const key of [openKey, closedKey]) {
    await expect(sessionEntryShowing(board, key)).toHaveCount(1);
  }
  await expectEntries(recent, [adHocEntry, queuedTitle]);
  await expect(columnPagingControl(page, "Recently done")).toHaveText(
    "Recently done 2 entries",
  );
});
