import { expect, test } from "./dashboardTest.ts";
import {
  largeBacklog,
  queuedCount,
  queuedTitle,
  revision,
} from "./accessibleOverview.ts";
import { expectReadableContrast, zoomedWindow } from "./accessibleReading.ts";
import { parts, expectMembership } from "./dashboardPage.ts";
import { publishMovingOrigin } from "./publishedOrigin.ts";
import { box, expectNoSidewaysScrollAndWholeText } from "./pageLayout.ts";

for (const viewport of [
  { width: 1280, height: 800 },
  { width: 700, height: 720 },
  zoomedWindow,
  { ...zoomedWindow, fontFamily: "Verdana" },
]) {
  const fontFamily = "fontFamily" in viewport ? viewport.fontFamily : undefined;
  test(`selected project banner remains reachable and evidence readable at ${viewport.width} CSS pixels${fontFamily ? ` in ${fontFamily}` : ""}`, async ({
    page,
  }) => {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    const origin = await publishMovingOrigin(page);
    origin.push(revision, largeBacklog);
    await page.goto("/");
    // A wider installed font reproduces the Linux first-row wrapping; the
    // same geometry, text, disclosure and keyboard promises must still hold.
    if (fontFamily) {
      await page.addStyleTag({
        content: `.banner { font-family: ${fontFamily}, sans-serif; }`,
      });
    }
    const { banner, project, sourceEvidence, source, refresh, backlog } =
      parts(page);
    const last = backlog
      .getByRole("article", { name: queuedTitle(queuedCount) })
      .getByRole("link", { name: /^Canonical record/ });
    await expect(last).toBeVisible();
    // Preparation facts arrive after membership and reflow the cards, which
    // can carry a focused control past the window's edge; measure a settled
    // page. Its 41 reads took about 3.5 seconds on CI.
    await expect(page.getByText("Reading preparation…")).toHaveCount(0, {
      timeout: 15_000,
    });
    await last.scrollIntoViewIfNeeded();
    await expect(last).toBeInViewport({ ratio: 1 });
    await expect(
      banner.getByRole("heading", { level: 1, name: "Open Dough" }),
    ).toBeInViewport({ ratio: 1 });
    for (const control of [
      project,
      banner.getByRole("button", { name: "System settings", exact: true }),
      sourceEvidence,
      refresh,
    ]) {
      await expect(control).toBeInViewport({ ratio: 1 });
    }
    const [selectionBox, refreshBox] = await Promise.all([
      box(project),
      box(refresh),
    ]);
    expect(
      selectionBox.x + selectionBox.width <= refreshBox.x ||
        selectionBox.y >= refreshBox.y + refreshBox.height,
    ).toBe(true);
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
    await expect(sourceEvidence).toContainText("Open Dough");
    await expect(refresh).toHaveAccessibleName("Refresh");
    await expect(refresh.locator("svg")).toHaveAttribute("aria-hidden", "true");
    await expectReadableContrast(refresh.locator("svg"), 3);
    await expectNoSidewaysScrollAndWholeText(page);

    await sourceEvidence.click();
    await expect(source).toContainText("terryyin/open-dough");
    await expect(source.getByText(revision, { exact: true })).toBeVisible();
    await source.locator("time").scrollIntoViewIfNeeded();
    await expect(source.locator("time")).toBeInViewport({ ratio: 1 });
    const warning = source.getByText(/Retrieval time is when/);
    await warning.scrollIntoViewIfNeeded();
    await expect(warning).toBeInViewport({ ratio: 1 });
    await expect(warning).toContainText("not commit time");
    await expect(refresh).toBeInViewport({ ratio: 1 });
    await expect(sourceEvidence).toBeInViewport({ ratio: 1 });
    await expectNoSidewaysScrollAndWholeText(page);
    await sourceEvidence.click();
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

test("banner project selection and icon refresh read the selected project's actual published work", async ({
  page,
}) => {
  await page.setViewportSize(zoomedWindow);
  const openDough = await publishMovingOrigin(page);
  openDough.push(revision, largeBacklog);
  const doughnut = await publishMovingOrigin(page, "nerds-odd-e/doughnut");
  const doughnutRevision = "d".repeat(40);
  const nextRevision = "e".repeat(40);
  const backlog = (title: string) =>
    `# Product backlog\n\n## Taken\n\n## Backlog list\n\n- [${title}](seeds/SEED-001.md#story) — SEED-001#story\n`;
  doughnut.push(doughnutRevision, backlog("Doughnut's next story"));
  await page.goto("/");
  const { project, source, sourceEvidence, refresh } = parts(page);
  await expect(source).toContainText(revision);
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
  await expect(sourceEvidence).toContainText("Doughnut");
  await sourceEvidence.click();
  await expect(source).toContainText("nerds-odd-e/doughnut");
  await expect(source).toContainText("main");
  await sourceEvidence.click();
  await expect(source).toContainText(doughnutRevision);
  doughnut.push(nextRevision, backlog("Doughnut's refreshed story"));
  await refresh.click();
  await expectMembership(page, {
    taken: [],
    backlog: ["Doughnut's refreshed story"],
  });
  await expect(source).toContainText(nextRevision);
  expect(openDough.requests).toHaveLength(2);
  expect(doughnut.requests).toHaveLength(4);
});
