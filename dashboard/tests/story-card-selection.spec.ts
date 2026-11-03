// Example 7: empty-area and keyboard selection for active and Recently done
// cards; nested controls do not select; selection survives Intent without a
// "Selected story only" toggle while deselected.

import { expect, test } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import { publishFiles } from "./publishedOrigin.ts";
import { keepLaunchRecords } from "./support/storyLaunchRecord.ts";
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
} from "./recentlyDoneRecords.ts";
import {
  adHocEntry,
  expectEntries,
  sessionsOutsideDoneStories,
} from "./recentlyDoneColumn.ts";
import { openSessionsSidebar } from "./sessionsSidebarPage.ts";
import { recentlyDoneParts } from "./recentlyDoneSessionsSidebarPage.ts";
import { expectSelected } from "./storyCardSelection.ts";

test.setTimeout(120_000);

test("empty-area and keyboard selection work for active and Recently done cards without nested controls selecting", async ({
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

  await test.step("empty-area click selects an active card with detail and a selected mark", async () => {
    await active.getByRole("heading", { level: 3 }).click();
    await expectSelected(active, true);
    await expect(
      active.getByRole("region", { name: `Detail for ${queuedTitle}` }),
    ).toBeVisible();
    await expect(
      active.getByRole("button", { name: "Hide detail" }),
    ).toBeVisible();
  });

  await test.step("clicks inside open detail do not deselect", async () => {
    const detail = active.getByRole("region", {
      name: `Detail for ${queuedTitle}`,
    });
    await detail.click();
    await expectSelected(active, true);
    await expect(detail).toBeVisible();
  });

  await test.step("Hide detail deselects and restores Inspect story", async () => {
    await active.getByRole("button", { name: "Hide detail" }).click();
    await expectSelected(active, false);
    await expect(
      active.getByRole("region", { name: `Detail for ${queuedTitle}` }),
    ).toHaveCount(0);
    await expect(
      active.getByRole("button", { name: "Inspect story" }),
    ).toBeVisible();
  });

  await test.step("Start does not change selection; second empty-area click deselects", async () => {
    await active.getByRole("heading", { level: 3 }).click();
    await expectSelected(active, true);
    // Disabled Start must not select via event fall-through.
    const start = active.getByRole("button", { name: "Start execution" });
    await expect(start).toBeDisabled();
    await start.click({ force: true });
    await expectSelected(active, true);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await active.getByRole("heading", { level: 3 }).click();
    await expectSelected(active, false);
    await expect(
      active.getByRole("button", { name: "Inspect story" }),
    ).toBeVisible();
  });

  await test.step("Inspect selects; Sessions sidebar open does not change selection", async () => {
    await active.getByRole("button", { name: "Inspect story" }).click();
    await expectSelected(active, true);
    await openSessionsSidebar(page);
    const shown = recentlyDoneParts(page);
    if ((await shown.header.getAttribute("aria-expanded")) !== "true") {
      await shown.header.click();
    }
    // Sidebar ad-hoc session may open the Side panel; selection must stay.
    await shown.entry("Open Dough session").click();
    await expect(
      page.getByRole("region", { name: /Terminal|Final report/ }),
    ).toBeVisible();
    await expectSelected(active, true);
    await expect(
      active.getByRole("button", { name: "Hide detail" }),
    ).toBeVisible();
    await shown.button.click();
  });

  await test.step("a Recently done card takes the one selection without opening detail; its session entry does not toggle", async () => {
    await done.locator(":scope > h3").click();
    await expectSelected(done, true);
    await expectSelected(active, false);
    await expect(
      active.getByRole("button", { name: "Inspect story" }),
    ).toBeVisible();
    await expect(
      done.getByRole("region", { name: /^Detail for / }),
    ).toHaveCount(0);
    const session = done
      .getByRole("list", { name: "Sessions" })
      .getByRole("article")
      .first();
    await expect(session).toBeVisible();
    await session.click();
    await expectSelected(done, true);
    await expect(
      done.getByRole("region", { name: /^Detail for / }),
    ).toHaveCount(0);
  });

  await test.step("Recently done Select story toggles once by pointer and keyboard", async () => {
    const select = done.getByRole("button", { name: "Select story" });
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
