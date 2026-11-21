// Selection and inspection are separate on active and Recently done cards:
// empty-area clicks toggle the selected story's highlight without opening or
// closing detail. Inspect story opens and closes only its card's detail and
// leaves the selection alone; a disabled Start and a session entry do not
// select or launch; selection survives Intent without a "Selected story only"
// toggle. Showing an ad hoc session clears the selection in
// ../intent/intent-ci-status-side-panel.spec.ts; several open details and
// dependency references in ../../../e2e/stories/story-card-inspection.spec.ts.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import { parts } from "../../test-support/dashboardPage.ts";
import {
  executed,
  queuedTitle,
} from "../../test-support/recentlyDoneRecords.ts";
import { openFrontendStoryCardSessions } from "../../test-support/support/frontendRecentlyDoneStoryCards.ts";
import { recordHostRequests } from "../../test-support/support/frontendHostRequests.ts";
import {
  emptyArea,
  expectInspected,
  expectSelected,
  storyDetail,
} from "../../test-support/storyCardSelection.ts";
import {
  expectActionGlyph,
  hideDetail,
  inspectionToggle,
  storyCard,
} from "../../test-support/storyCardControls.ts";

test("empty-area clicks toggle the selected story on active and Recently done cards without opening or closing detail, and nested controls do not select", async ({
  page,
  frontendServices,
}) => {
  await openFrontendStoryCardSessions(page, frontendServices);
  const hostRequests = recordHostRequests(page);
  const {
    backlog,
    recentlyDone: recent,
    development,
    intentChoice,
    intent,
  } = parts(page);
  const active = storyCard(backlog, queuedTitle);
  const done = storyCard(recent, executed.title);
  const activeEmptyArea = emptyArea(active);
  const inspect = inspectionToggle(active);
  const chevron = inspect.locator("svg.lucide-chevron-right");

  await test.step("empty-area click selects and clears an active card without opening detail", async () => {
    await activeEmptyArea.click();
    await expectSelected(active, true);
    await expectInspected(active, false);
    await activeEmptyArea.click();
    await expectSelected(active, false);
    await expectInspected(active, false);
  });

  await test.step("Given Inspect story points right on the closed detail", async () => {
    await expectActionGlyph(inspect, "Inspect story", "chevron-right");
    await expect(chevron).toHaveCSS("transform", "none");
  });

  await test.step("When Inspect story opens detail without selecting the card", async () => {
    await inspect.click();
    await expectInspected(active, true);
    await expectSelected(active, false);
  });

  await test.step("Then Hide detail points down on the open detail", async () => {
    await expectActionGlyph(inspect, "Hide detail", "chevron-right");
    await expect(chevron).toHaveCSS(
      "transform",
      /^matrix\((?:-?0|[\d.]+e-\d+), 1, -1, /,
    );
  });

  await test.step("When clicking the open detail leaves the card unselected", async () => {
    await storyDetail(active).click();
    await expectSelected(active, false);
  });

  await test.step("When selecting the card leaves its detail open", async () => {
    await activeEmptyArea.click();
    await expectSelected(active, true);
    await expectInspected(active, true);
  });

  await test.step("When clearing selection leaves the detail open", async () => {
    await activeEmptyArea.click();
    await expectSelected(active, false);
    await expectInspected(active, true);
  });

  await test.step("When Hide detail closes the detail and turns Inspect story right", async () => {
    await hideDetail(active);
    await expect(chevron).toHaveCSS("transform", "none");
    await expectInspected(active, false);
  });

  await test.step("Then the card remains unselected", async () => {
    await expectSelected(active, false);
  });

  await test.step("disabled Start does not change selection or launch", async () => {
    await activeEmptyArea.click();
    await expectSelected(active, true);
    // Disabled Start must not select via event fall-through.
    const start = active.getByRole("button", { name: "Start execution" });
    await expect(start).toBeDisabled();
    await start.click({ force: true });
    await expectSelected(active, true);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    expect(hostRequests()).toEqual([]);
  });

  await test.step("a Recently done card takes the one selection without opening detail; its session entry does not toggle or attach", async () => {
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
    expect(hostRequests()).toEqual([]);
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
