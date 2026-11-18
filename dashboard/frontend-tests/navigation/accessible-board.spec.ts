import { expect, test } from "../../test-support/support/frontendApp.ts";
import { putFrontendBacklog } from "../../test-support/support/frontendServiceState.ts";
import {
  longAddress,
  longBacklog,
  longIdentity,
  longPlan,
  longTitle,
  revision,
  unusableTarget,
} from "../../test-support/accessibleBoard.ts";
import {
  shortRevision,
  openDirection,
  parts,
} from "../../test-support/dashboardPage.ts";
import { showColumn } from "../../test-support/boardPage.ts";
import { inspectedDetail } from "../../test-support/storyCardControls.ts";
import { describedBacklog } from "../../test-support/describedRevisions.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { zoomedWindow } from "../../test-support/accessibleReading.ts";
import {
  box,
  compactProjectSelectCut,
  expectInside,
  expectNoSidewaysScrollAndWholeText,
  expectSideBySideInOrder,
  expectStackedInOrder,
} from "../../test-support/pageLayout.ts";
import { openUntilRead } from "../../test-support/pageRequestNotes.ts";

const narrowWindow = { width: 360, height: 740 };

test("accessible Board reflows long published work for a narrow window and page zoom", async ({
  page,
  frontendServices,
}, testInfo) => {
  putFrontendBacklog(frontendServices, { revision, backlog: longBacklog });
  await openUntilRead(page);
  const { backlog, taken, recentlyDone, direction, directionToggle } =
    parts(page);
  const longCard = taken.getByRole("article", { name: longTitle });
  await expect(longCard).toBeVisible();

  await test.step("a wide window reads the long work whole, three columns side by side", async () => {
    await expectNoSidewaysScrollAndWholeText(page);
    const columns = [backlog, taken, recentlyDone];
    await expectSideBySideInOrder(columns);
    // Nothing stands between the columns: only the frame's gap separates them.
    const boxes = await Promise.all(columns.map(box));
    boxes.slice(1).forEach((to, index) => {
      const from = boxes[index];
      expect(to.x - ((from?.x ?? 0) + (from?.width ?? 0))).toBeLessThanOrEqual(
        24,
      );
    });
    await page.screenshot({
      path: testInfo.outputPath("long-work-wide.png"),
      fullPage: true,
    });
  });

  await page.setViewportSize(zoomedWindow);

  await test.step("nothing widens the page or is cut short", async () => {
    await expectNoSidewaysScrollAndWholeText(page, compactProjectSelectCut);
  });

  await test.step("the page reads direction, then Backlog alone, and its column paging control brings Taken", async () => {
    await expectStackedInOrder([directionToggle, backlog]);
    await showColumn(page, "Taken");
    await expectStackedInOrder([directionToggle, taken]);
    await expectNoSidewaysScrollAndWholeText(page, compactProjectSelectCut);
  });

  await test.step("long titles, identities, and recorded targets stay inside their card", async () => {
    await expectInside(longCard.getByText(longTitle), longCard);
    const external = backlog.getByRole("article", {
      name: "Read the hosting provider's note",
    });
    const unusable = backlog.getByRole("article", {
      name: "Keep a target that is not offered as a link readable",
    });
    // Identities and recorded targets are read in each story's detail.
    for (const [column, card, texts] of [
      ["Taken", longCard, [longIdentity, longPlan]],
      ["Backlog", external, [longAddress]],
      ["Backlog", unusable, [unusableTarget]],
    ] as const) {
      await showColumn(page, column);
      const detail = await inspectedDetail(card);
      for (const text of texts) {
        await expectInside(detail.getByText(text), card);
      }
      await expectNoSidewaysScrollAndWholeText(page, compactProjectSelectCut);
    }
    // Shown again, Taken holds the long card whole.
    await showColumn(page, "Taken");
    await expectInside(longCard, taken);
  });

  await test.step("direction stays reachable", async () => {
    await expect(parts(page).readRevision).toContainText(
      shortRevision(revision),
    );
    await openDirection(page);
    await expect(direction).toContainText("Derive it solely from Git state");
  });

  await test.step("browser zoom is left to the reader", async () => {
    const viewport =
      (await page.locator("meta[name='viewport']").getAttribute("content")) ??
      "";
    expect(viewport).toContain("width=device-width");
    expect(viewport).not.toMatch(/user-scalable|maximum-scale|minimum-scale/);
  });

  await page.setViewportSize(narrowWindow);
  await page.screenshot({
    path: testInfo.outputPath("long-work-narrow.png"),
    fullPage: true,
  });
});

test("accessible Board keeps empty groups readable in a narrow window", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize(narrowWindow);
  putFrontendBacklog(frontendServices, {
    revision,
    backlog: describedBacklog(makeMe.aRepository.please()),
  });
  await openUntilRead(page);
  const { backlog, taken, direction, directionText } = parts(page);

  await expect(
    backlog.getByText("No Backlog entries are recorded."),
  ).toBeVisible();
  await openDirection(page);
  await expectStackedInOrder([directionText, backlog]);
  await showColumn(page, "Taken");
  await expectStackedInOrder([directionText, taken]);
  await expect(taken.getByText("No Taken entries are recorded.")).toBeVisible();
  await expect(
    direction.getByText("No near-future direction is recorded."),
  ).toBeVisible();
  await expect(parts(page).readRevision).toContainText(shortRevision(revision));
  await expectNoSidewaysScrollAndWholeText(page, compactProjectSelectCut);
});
