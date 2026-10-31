// The pinned banner in each of its page-column layouts (../src/banner.css,
// ../src/project-select.css): one row on a column wider than 900 CSS pixels,
// Sessions (Open Dough mark as its visual), perspective, project choices, and
// System settings; two rows up to 900, with project choices on the second; and
// at or under 400, one row with the compact title select. One journey per
// layout walks the keyboard back up a long page: the banner stays pinned and
// short, the mark-as-Sessions toggle leads it, nothing is cut short, and no
// focused control is hidden under it. Wider layouts also check each choice
// reads on one line. A project switch in the banner is a later test: the mark
// stays Open Dough's while the project selector and Board become the newly
// selected project's. Phone-width compact journeys live in
// dashboard-header-compact.spec.ts.

import { expect, test } from "./dashboardTest.ts";
import {
  largeBacklog,
  queuedCount,
  queuedTitle,
  revision,
} from "./accessibleBoard.ts";
import { zoomedWindow } from "./accessibleReading.ts";
import {
  parts,
  expectCompactProjectSelect,
  expectMembership,
  expectProjectChoice,
  expectSettledPage,
} from "./dashboardPage.ts";
import { expectFrameIconControl } from "./frameIconControl.ts";
import { publishMovingOrigin } from "./publishedOrigin.ts";
import {
  box,
  compactProjectSelectCut,
  expectNoSidewaysScrollAndWholeText,
  expectSideBySideInOrder,
} from "./pageLayout.ts";
import { sessionsSidebarParts } from "./sessionsSidebarPage.ts";
import { settings } from "./support/systemSettingsPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";

const layouts = [
  { width: 1280, height: 800, rows: 1, compact: false },
  { width: 700, height: 720, rows: 2, compact: false },
  { ...zoomedWindow, rows: 1, fontFamily: "Verdana", compact: true },
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
    const { banner, project, projectCompact, backlog, perspective } =
      parts(page);
    const sessions = sessionsSidebarParts(page).button;
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
    const titleControl = viewport.compact ? projectCompact : project;
    await expect(titleControl).toBeInViewport({ ratio: 1 });
    for (const control of [
      viewport.compact ? projectCompact : project,
      perspective,
      settings(page),
    ]) {
      await expect(control).toBeInViewport({ ratio: 1 });
    }
    // Configured banner: mark is Sessions, not a passive product image; no
    // separate panel icon and no level-1 project title.
    await expect(
      banner.getByRole("img", { name: "Open Dough", exact: true }),
    ).toHaveCount(0);
    await expect(banner.getByRole("heading", { level: 1 })).toHaveCount(0);
    await expect(banner.locator("svg.lucide-panel-left")).toHaveCount(0);
    await expect(
      banner.getByRole("button", { name: /^(Refresh|Retry)$/ }),
    ).toHaveCount(0);
    const pinned = await box(banner);
    expect(pinned.y).toBe(0);
    expect(pinned.height).toBeLessThan(viewport.height / 2);
    if (viewport.compact) {
      await expectCompactProjectSelect(page, "Open Dough");
    } else {
      expect(
        await project.locator(".project-choice span").evaluateAll((choices) =>
          choices.map((choice) => {
            const text = document.createRange();
            text.selectNodeContents(choice);
            return text.getClientRects().length;
          }),
        ),
      ).toEqual([1, 1, 1, 1]);
      await expectProjectChoice(page, "Open Dough");
    }
    await expectFrameIconControl(sessions, "Sessions", "Sessions (⌘B)");
    await expectFrameIconControl(settings(page), "System settings");
    await expectNoSidewaysScrollAndWholeText(
      page,
      viewport.compact ? [...compactProjectSelectCut] : [],
    );

    if (viewport.rows === 1) {
      await test.step("the column lays the banner in one row, from Sessions to System settings", async () => {
        const gear = settings(page);
        const projectName = viewport.compact ? projectCompact : project;
        const inOrder = [sessions, perspective, projectName, gear];
        await expectSideBySideInOrder(inOrder);
        const middles = (await Promise.all(inOrder.map(box))).map(
          ({ y, height }) => y + height / 2,
        );
        for (const middle of middles)
          expect(middle).toBeCloseTo(middles[0] ?? 0, 0);
        const controls = banner
          .locator(
            "button, input, select, textarea, summary, a[href], [tabindex]",
          )
          .filter({ visible: true });
        await expect(controls.last()).toHaveAccessibleName("System settings");
        // Sessions (mark) leads the banner as the first keyboard stop.
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

    if (viewport.rows === 2) {
      await test.step("Sessions and perspective share the first row; project choices the second", async () => {
        const middle = ({ y, height }: { y: number; height: number }) =>
          y + height / 2;
        const choices = await box(perspective);
        const sessionsBox = await box(sessions);
        const projectBox = await box(project);
        await expectSideBySideInOrder([sessions, perspective, settings(page)]);
        expect(middle(choices)).toBeCloseTo(middle(sessionsBox), 0);
        expect(projectBox.y).toBeGreaterThanOrEqual(choices.y + choices.height);
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
  const { banner, project } = parts(page);
  await expectProjectChoice(page, "Open Dough");
  await expect(banner.getByRole("heading", { level: 1 })).toHaveCount(0);
  await expectFrameIconControl(
    sessionsSidebarParts(page).button,
    "Sessions",
    "Sessions (⌘B)",
  );
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
  // Open Dough stays the product mark on Sessions; the selector names the project.
  await expectFrameIconControl(
    sessionsSidebarParts(page).button,
    "Sessions",
    "Sessions (⌘B)",
  );
  await expectProjectChoice(page, "Doughnut");
  expect(openDough.requests).toHaveLength(2);
  expect(doughnut.requests).toHaveLength(2);
});
