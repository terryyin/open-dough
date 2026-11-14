// Selection and inspection are separate on active and Recently done cards:
// Select story (pointer or keyboard) and empty-area clicks toggle the selected
// story's highlight without opening or closing detail; Inspect story opens and
// closes only its card's detail and leaves the selection alone; nested
// controls do not select; showing an ad hoc session clears the selection;
// selection survives Intent without a "Selected story only" toggle. Several
// open details and dependency references: ../stories/story-card-inspection.spec.ts.

import { expect, test } from "../dashboardTest.ts";
import { expectMembership, parts } from "../dashboardPage.ts";
import { publishFiles } from "../publishedOrigin.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keepLaunchRecords } from "../support/launchStore.ts";
import {
  at,
  executed,
  placed,
  publishedFiles,
  queuedTitle,
  removedQueued,
  repository,
  revision,
  doneRecordFacts,
} from "../recentlyDoneRecords.ts";
import {
  adHocEntry,
  expectEntries,
  sessionsOutsideDoneStories,
} from "../recentlyDoneColumn.ts";
import { showRecentlyDone } from "../recentlyDoneSessionsSidebarPage.ts";
import {
  emptyArea,
  expectInspected,
  expectSelected,
  selectStory,
  storyDetail,
} from "../storyCardSelection.ts";
import { hideDetail, storyCard } from "../storyCardControls.ts";

test("Select story and empty-area clicks toggle the selected story on active and Recently done cards without opening or closing detail, and nested controls do not select", async ({
  page,
  dashboard,
}) => {
  const now = Date.now();
  // Done ad-hoc + this card's session only, so backlog Start stays clickable.
  keepLaunchRecords(dashboard, [
    ...sessionsOutsideDoneStories(dashboard, now, { adHoc: true }).filter(
      (record) => record.request.workflow === "ad-hoc",
    ),
    makeMe.aLaunchRecord
      .executing(executed)
      .inClaudeSession({
        sessionId: "0e5c2d7a-done-session-of-card-shows-avatar",
      })
      .launchedAt(at(now, placed.executedDoneSessionLaunched))
      .markedDoneAt(at(now, placed.executedDoneSessionMarked))
      .please(),
  ]);
  await publishFiles(page, {
    repository,
    revision,
    files: publishedFiles(doneRecordFacts(now)),
  });
  await page.goto("/");
  await expectMembership(page, { taken: [], backlog: [queuedTitle] });
  const {
    backlog,
    recentlyDone: recent,
    development,
    intentChoice,
    intent,
  } = parts(page);
  const active = storyCard(backlog, queuedTitle);
  const done = storyCard(recent, executed.title);
  await expectEntries(recent, [
    adHocEntry,
    executed.title,
    removedQueued.title,
  ]);

  const detail = active.getByRole("region", {
    name: `Detail for ${queuedTitle}`,
  });
  const activeEmptyArea = emptyArea(active);

  await test.step("empty-area click selects and clears an active card without opening detail", async () => {
    await activeEmptyArea.click();
    await expectSelected(active, true);
    await expectInspected(active, false);
    await activeEmptyArea.click();
    await expectSelected(active, false);
    await expectInspected(active, false);
  });

  await test.step("Inspect story opens and closes only detail; selection toggles without closing it", async () => {
    await active.getByRole("button", { name: "Inspect story" }).click();
    await expectInspected(active, true);
    await expectSelected(active, false);
    await detail.click();
    await expectSelected(active, false);
    await activeEmptyArea.click();
    await expectSelected(active, true);
    await expectInspected(active, true);
    await activeEmptyArea.click();
    await expectSelected(active, false);
    await expectInspected(active, true);
    await hideDetail(active);
    await expectInspected(active, false);
    await expectSelected(active, false);
  });

  await test.step("Enter and Space on Select story toggle a Backlog card without detail", async () => {
    await selectStory(active).focus();
    await page.keyboard.press("Enter");
    await expectSelected(active, true);
    await expectInspected(active, false);
    await page.keyboard.press("Space");
    await expectSelected(active, false);
    await expectInspected(active, false);
  });

  await test.step("disabled Start does not change selection", async () => {
    await activeEmptyArea.click();
    await expectSelected(active, true);
    // Disabled Start must not select via event fall-through.
    const start = active.getByRole("button", { name: "Start execution" });
    await expect(start).toBeDisabled();
    await start.click({ force: true });
    await expectSelected(active, true);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  await test.step("showing a session attached to no story clears the selection", async () => {
    const shown = await showRecentlyDone(page);
    await shown.open("Open Dough session").click();
    await expect(
      page.getByRole("region", { name: /Terminal|Final report/ }),
    ).toBeVisible();
    await expectSelected(active, false);
    await expectInspected(active, false);
    await intentChoice.click();
    await expect(intent).not.toHaveAttribute("data-selected-story");
    await development.click();
    await shown.button.click();
  });

  await test.step("a Recently done card takes the one selection without opening detail; its session entry does not toggle", async () => {
    await emptyArea(done).click();
    await expectSelected(done, true);
    await expectSelected(active, false);
    await expectInspected(active, false);
    await expect(storyDetail(done)).toHaveCount(0);
    const session = done
      .getByRole("list", { name: "Sessions" })
      .getByRole("article")
      .first();
    await expect(session).toBeVisible();
    await session.click();
    await expectSelected(done, true);
    await expect(storyDetail(done)).toHaveCount(0);
  });

  await test.step("Recently done Select story toggles once by pointer and keyboard", async () => {
    const select = selectStory(done);
    await expect(select).toHaveAttribute("aria-pressed", "true");
    await select.click();
    await expectSelected(done, false);
    await expect(select).toHaveAttribute("aria-pressed", "false");
    await select.focus();
    await page.keyboard.press("Enter");
    await expectSelected(done, true);
    await expect(select).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Space");
    await expectSelected(done, false);
    await expect(select).toHaveAttribute("aria-pressed", "false");
    await select.click();
    await expectSelected(done, true);
  });

  await test.step("selection survives Intent and clears with no Selected story only toggle", async () => {
    await intentChoice.click();
    await expect(intent).toBeVisible();
    await expect(intent).toHaveAttribute(
      "data-selected-story",
      executed.identity,
    );
    await expect(
      intent.getByRole("checkbox", { name: "Selected story only" }),
    ).toHaveCount(0);
    await expect(intent.getByText("Selected story only")).toHaveCount(0);
    await development.click();
    await expectSelected(done, true);
    await emptyArea(done).click();
    await expectSelected(done, false);
    await intentChoice.click();
    await expect(intent).not.toHaveAttribute("data-selected-story");
    await expect(intent.getByText("Selected story only")).toHaveCount(0);
    await development.click();
  });
});
