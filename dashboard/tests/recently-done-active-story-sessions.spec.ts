// Active story membership owns its open session even with a matching done card.
import { expect, test } from "./dashboardTest.ts";
import { renderDoneRecord } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { columnPagingControl, rem } from "./boardPage.ts";
import { expectMembership, parts, sessionStateOf } from "./dashboardPage.ts";
import { publishFiles } from "./publishedOrigin.ts";
import { keepLaunchRecords } from "./support/storyLaunchRecord.ts";
import {
  at,
  doneDirectory,
  doneRecordAt,
  placed,
  publishedFiles,
  queuedIdentity,
  queuedTitle,
  repository,
  revision,
} from "./recentlyDoneRecords.ts";
import {
  adHocEntry,
  expectEntries,
  sessionsOutsideDoneStories,
} from "./recentlyDoneColumn.ts";
import { withDoneCatalog } from "./doneCatalogAnswers.ts";
import { reloadUntilRead } from "./pageRequestNotes.ts";

test("an active story owns its open session even with a matching done card, whose closed session is nested once and whose Column paging count uses the rendered entries", async ({
  page,
  dashboard,
}) => {
  const now = Date.now();
  const records = sessionsOutsideDoneStories(dashboard, now, { adHoc: true });
  const open = records.find(
    (record) => record.request.workflow === "execution",
  );
  if (
    open?.request.workflow !== "execution" ||
    open.session.host !== "claude"
  ) {
    throw new Error("No queued Claude story session");
  }
  const closedId = "99999999-aaaa-bbbb-cccc-000000000009";
  await keepLaunchRecords(dashboard, [
    {
      ...open,
      request: { ...open.request, workflow: "refinement" },
      session: {
        ...open.session,
        sessionId: closedId,
        shortId: closedId.slice(0, 8),
      },
      launchedAt: at(now, placed.executedDoneSessionLaunched),
      doneAt: at(now, placed.executedDoneSessionMarked),
    },
    ...records,
  ]);
  await publishFiles(page, {
    repository,
    revision,
    files: publishedFiles(
      withDoneCatalog(
        {
          [doneRecordAt(queuedIdentity)]: renderDoneRecord({
            identity: queuedIdentity,
            title: queuedTitle,
            completedAt: at(now, placed.executedDone),
            developer: "Terry Yin",
          }),
        },
        doneDirectory,
      ),
    ),
  });
  await page.setViewportSize({ width: 54 * rem, height: 900 });
  await page.goto("/");
  await expectMembership(page, { taken: [], backlog: [queuedTitle] });
  const { backlog, recentlyDone: recent } = parts(page);
  const active = backlog.locator(".session-entry");
  const doneCard = recent.getByRole("article", {
    name: queuedTitle,
    exact: true,
  });
  const closed = doneCard.locator(".session-entry");
  const openKey = `claude:${open.session.sessionId}`;
  const closedKey = `claude:${closedId}`;
  const expectUnique = async () => {
    await expect(active).toHaveAttribute("data-shows-session", openKey);
    await expect(sessionStateOf(active)).toHaveText("Working");
    await expect(
      recent.locator(`[data-shows-session="${openKey}"]`),
    ).toHaveCount(0);
    await expect(closed).toHaveAttribute("data-shows-session", closedKey);
    await expect(sessionStateOf(closed)).toHaveText("Done");
    for (const key of [openKey, closedKey]) {
      await expect(
        page.locator(`.board [data-shows-session="${key}"]`),
      ).toHaveCount(1);
    }
    await expectEntries(recent, [adHocEntry, queuedTitle]);
    await expect(columnPagingControl(page, "Recently done")).toHaveText(
      "Recently done 2 entries",
    );
  };
  await expectUnique();
  await reloadUntilRead(page);
  await expectUnique();
});
