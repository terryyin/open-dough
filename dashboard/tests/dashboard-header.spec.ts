// The pinned banner in each of its page-column layouts (../src/banner.css,
// ../src/project-select.css): one row on a column wider than 800 CSS pixels,
// ending with System settings; two rows up to 800, Sessions starting the
// second before the project choices; and, up to 400, the choices wrapped onto
// their own line, with the wider Verdana installed on the banner to reproduce
// the Linux first-row wrap. One journey per layout walks the keyboard back
// up a long page: the banner stays pinned and short, Open Dough's mark leads
// it whole and uncovered, each choice reads on one line, nothing is cut
// short, and no focused control is hidden under it. A project switch in the
// banner is the last test: the mark stays Open Dough's while the plain title
// and Board become the newly selected project's.

import { expect, test } from "./dashboardTest.ts";
import {
  largeBacklog,
  queuedCount,
  queuedTitle,
  revision,
} from "./accessibleBoard.ts";
import { zoomedWindow } from "./accessibleReading.ts";
import { parts, expectMembership, expectSettledPage } from "./dashboardPage.ts";
import { expectFrameIconControl } from "./frameIconControl.ts";
import { expectProductMark } from "./productMark.ts";
import { publishMovingOrigin } from "./publishedOrigin.ts";
import {
  box,
  expectNoSidewaysScrollAndWholeText,
  expectSideBySideInOrder,
} from "./pageLayout.ts";
import { sessionsSidebarParts } from "./sessionsSidebarPage.ts";
import { settings } from "./support/systemSettingsPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";

const layouts = [
  { width: 1280, height: 800, rows: 1 },
  { width: 700, height: 720, rows: 2 },
  { ...zoomedWindow, rows: 2, fontFamily: "Verdana" },
] as const;

for (const viewport of layouts) {
  const fontFamily = "fontFamily" in viewport ? viewport.fontFamily : undefined;
  test(`selected project banner remains reachable at ${viewport.width} CSS pixels${fontFamily ? ` in ${fontFamily}` : ""}`, async ({
    page,
  }) => {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    const origin = await publishMovingOrigin(page);
    origin.push(revision, largeBacklog);
    await openUntilRead(page);
    // A wider installed font reproduces the Linux first-row wrapping; the
    // same geometry, text and keyboard promises must still hold.
    if (fontFamily) {
      await page.addStyleTag({
        content: `.banner { font-family: ${fontFamily}, sans-serif; }`,
      });
    }
    const { banner, project, projectTitle, backlog } = parts(page);
    // The last card's last control.
    const last = backlog
      .getByRole("article", { name: queuedTitle(queuedCount) })
      .getByRole("button", { name: "Inspect story" });
    await expect(last).toBeVisible();
    // Preparation facts arrive after membership and reflow the cards, which
    // can carry a focused control past the window's edge; measure a settled
    // page. Its 41 reads took about 3.5 seconds on CI.
    await expectSettledPage(page, undefined, { timeout: 15_000 });
    await last.scrollIntoViewIfNeeded();
    await expect(last).toBeInViewport({ ratio: 1 });
    await expect(projectTitle).toBeInViewport({ ratio: 1 });
    for (const control of [project, settings(page)]) {
      await expect(control).toBeInViewport({ ratio: 1 });
    }
    await expectProductMark(banner);
    // The page keeps itself up to date; the banner offers no read control.
    await expect(
      banner.getByRole("button", { name: /^(Refresh|Retry)$/ }),
    ).toHaveCount(0);
    const pinned = await box(banner);
    expect(pinned.y).toBe(0);
    expect(pinned.height).toBeLessThan(viewport.height / 2);
    expect(
      await project.locator(".project-choice span").evaluateAll((choices) =>
        choices.map((choice) => {
          const text = document.createRange();
          text.selectNodeContents(choice);
          return text.getClientRects().length;
        }),
      ),
    ).toEqual([1, 1, 1, 1]);
    await expect(projectTitle).toHaveText("Open Dough");
    await expectFrameIconControl(
      sessionsSidebarParts(page).button,
      "Sessions",
      "Sessions (⌘B)",
    );
    await expectFrameIconControl(settings(page), "System settings");
    await expectNoSidewaysScrollAndWholeText(page);

    if (viewport.rows === 1) {
      await test.step("the wide column lays the banner out in one row, from Open Dough's mark to System settings", async () => {
        const gear = settings(page);
        const mark = banner.getByRole("img", { name: "Open Dough" });
        const inOrder = [
          mark,
          sessionsSidebarParts(page).button,
          projectTitle,
          project,
          gear,
        ];
        await expectSideBySideInOrder(inOrder);
        const middles = (await Promise.all(inOrder.map(box))).map(
          ({ y, height }) => y + height / 2,
        );
        for (const middle of middles)
          expect(middle).toBeCloseTo(middles[0] ?? 0, 0);
        const controls = banner.locator(
          "button, input, select, textarea, summary, a[href], [tabindex]",
        );
        await expect(controls.last()).toHaveAccessibleName("System settings");
        // The mark leads the banner but is no keyboard stop: going back
        // from the first control leaves the banner.
        await expect(controls.first()).toHaveAccessibleName("Sessions");
        await controls.first().focus();
        await page.keyboard.press("Shift+Tab");
        await expect(banner.locator(":focus")).toHaveCount(0);
        const gearBox = await box(gear);
        for (const right of await controls.evaluateAll((all) =>
          all.map((element) => element.getBoundingClientRect().right),
        )) {
          expect(right).toBeLessThanOrEqual(gearBox.x + gearBox.width + 0.5);
        }
      });
    }

    expect(origin.requests).toHaveLength(2);

    await last.focus();
    for (let index = 0; index < 10; index += 1) {
      await page.keyboard.press("Shift+Tab");
      const focused = page.locator(":focus");
      await expect(focused).toBeInViewport({ ratio: 1 });
      const [headerBox, focusBox] = await Promise.all([
        box(banner),
        box(focused),
      ]);
      expect(focusBox.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height);
    }
  });
}

test("banner project selection reads the selected project's actual published work", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const openDough = await publishMovingOrigin(page);
  openDough.push(revision, largeBacklog);
  const doughnut = await publishMovingOrigin(page, "nerds-odd-e/doughnut");
  const doughnutRevision = "d".repeat(40);
  const backlog = (title: string) =>
    `# Product backlog\n\n## Taken\n\n## Backlog list\n\n- [${title}](seeds/SEED-001.md#story) — SEED-001#story\n`;
  doughnut.push(doughnutRevision, backlog("Doughnut's next story"));
  await openUntilRead(page);
  const { banner, project, projectTitle } = parts(page);
  await expect(projectTitle).toHaveText("Open Dough");
  await expectProductMark(banner);
  const openDoughChoice = project.getByRole("radio", {
    name: "Open Dough",
    exact: true,
  });
  const doughnutChoice = project.getByRole("radio", {
    name: "Doughnut",
    exact: true,
  });
  await expect(project.getByRole("radio")).toHaveCount(4);
  await expect(openDoughChoice).toBeChecked();
  await doughnutChoice.click();
  await expect(doughnutChoice).toBeChecked();
  await expect(openDoughChoice).not.toBeChecked();
  await expectMembership(page, {
    taken: [],
    backlog: ["Doughnut's next story"],
  });
  // Open Dough stays the product; the heading names the selected project.
  await expectProductMark(banner);
  await expect(projectTitle).toHaveText("Doughnut");
  expect(openDough.requests).toHaveLength(2);
  expect(doughnut.requests).toHaveLength(2);
});
