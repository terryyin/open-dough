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
import { keepLaunchRecords } from "../support/storyLaunchRecord.ts";
import {
  at,
  executed,
  placed,
  publishedFiles,
  queuedTitle,
  removedQueued,
  repository,
  revision,
  doneRecordFiles,
} from "../recentlyDoneRecords.ts";
import {
  adHocEntry,
  expectEntries,
  sessionsOutsideDoneStories,
} from "../recentlyDoneColumn.ts";
import { openSessionsSidebar } from "../sessionsSidebarPage.ts";
import { recentlyDoneParts } from "../recentlyDoneSessionsSidebarPage.ts";
import {
  expectInspected,
  expectSelected,
  selectStory,
  storyDetail,
} from "../storyCardSelection.ts";

test("Select story and empty-area clicks toggle the selected story on active and Recently done cards without opening or closing detail, and nested controls do not select", async ({
  page,
  dashboard,
}) => {
  const now = Date.now();
  // Done ad-hoc + this card's session only, so backlog Start stays clickable.
  await keepLaunchRecords(dashboard, [
    ...sessionsOutsideDoneStories(dashboard, now, { adHoc: true }).filter(
      (record) => record.request.workflow === "ad-hoc",
    ),
    {
      request: {
        source: "open-dough",
        workflow: "execution" as const,
        host: "claude" as const,
        ...executed,
      },
      session: {
        host: "claude" as const,
        sessionId: "0e5c2d7a-done-session-of-card-shows-avatar",
        shortId: "0e5c2d7a",
        name: executed.title,
      },
      launchedAt: at(now, placed.executedDoneSessionLaunched),
      doneAt: at(now, placed.executedDoneSessionMarked),
    },
  ]);
  await publishFiles(page, {
    repository,
    revision,
    files: publishedFiles(doneRecordFiles(now)),
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
  const active = backlog.getByRole("article", {
    name: queuedTitle,
    exact: true,
  });
  const done = recent.getByRole("article", {
    name: executed.title,
    exact: true,
  });
  await expectEntries(recent, [
    adHocEntry,
    executed.title,
    removedQueued.title,
  ]);

  const detail = active.getByRole("region", {
    name: `Detail for ${queuedTitle}`,
  });
  const heading = active.getByRole("heading", { level: 3 });

  await test.step("empty-area click selects and clears an active card without opening detail", async () => {
    await heading.click();
    await expectSelected(active, true);
    await expectInspected(active, false);
    await heading.click();
    await expectSelected(active, false);
    await expectInspected(active, false);
  });

  await test.step("Inspect story opens and closes only detail; selection toggles without closing it", async () => {
    await active.getByRole("button", { name: "Inspect story" }).click();
    await expectInspected(active, true);
    await expectSelected(active, false);
    await detail.click();
    await expectSelected(active, false);
    await heading.click();
    await expectSelected(active, true);
    await expectInspected(active, true);
    await heading.click();
    await expectSelected(active, false);
    await expectInspected(active, true);
    await active.getByRole("button", { name: "Hide detail" }).click();
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
    await heading.click();
    await expectSelected(active, true);
    // Disabled Start must not select via event fall-through.
    const start = active.getByRole("button", { name: "Start execution" });
    await expect(start).toBeDisabled();
    await start.click({ force: true });
    await expectSelected(active, true);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  await test.step("showing a session attached to no story clears the selection", async () => {
    await openSessionsSidebar(page);
    const shown = recentlyDoneParts(page);
    if ((await shown.header.getAttribute("aria-expanded")) !== "true") {
      await shown.header.click();
    }
    await shown.entry("Open Dough session").click();
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
    await done.locator(":scope > h3").click();
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
    await done.locator(":scope > h3").click();
    await expectSelected(done, false);
    await intentChoice.click();
    await expect(intent).not.toHaveAttribute("data-selected-story");
    await expect(intent.getByText("Selected story only")).toHaveCount(0);
    await development.click();
  });
});
