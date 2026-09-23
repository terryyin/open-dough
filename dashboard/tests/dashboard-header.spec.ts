import { expect, test } from "@playwright/test";
import {
  largeBacklog,
  queuedCount,
  queuedTitle,
  revision,
} from "./accessibleOverview";
import { expectReadableContrast, zoomedWindow } from "./accessibleReading";
import { parts, expectMembership } from "./dashboardPage";
import { publishMovingOrigin } from "./githubOrigin";
import { box, expectNoSidewaysScrollAndWholeText } from "./pageLayout";

for (const viewport of [{ width: 1280, height: 800 }, zoomedWindow]) {
  test(`Open Dough banner remains reachable and evidence readable at ${viewport.width} CSS pixels`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const origin = await publishMovingOrigin(page);
    origin.push(revision, largeBacklog);
    await page.goto("/");
    const { banner, project, sourceEvidence, source, refresh, backlog } =
      parts(page);
    const last = backlog
      .getByRole("article", { name: queuedTitle(queuedCount) })
      .getByRole("link", { name: /^Canonical record/ });
    await expect(last).toBeVisible();
    await last.scrollIntoViewIfNeeded();
    await expect(last).toBeInViewport({ ratio: 1 });
    await expect(
      banner.getByRole("paragraph").getByText("Open Dough", { exact: true }),
    ).toBeInViewport({ ratio: 1 });
    for (const control of [project, sourceEvidence, refresh]) {
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
    ).toEqual([1, 1, 1]);
    await expect(sourceEvidence).toContainText("terryyin/open-dough · main");
    await expect(refresh).toHaveAccessibleName("Refresh");
    await expect(refresh.locator("svg")).toHaveAttribute("aria-hidden", "true");
    await expectReadableContrast(refresh.locator("svg"), 3);
    await expectNoSidewaysScrollAndWholeText(page);

    await sourceEvidence.click();
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
  const { project, source, refresh } = parts(page);
  await expect(source).toContainText(revision);
  const openDoughChoice = project.getByRole("radio", {
    name: "Open Dough",
    exact: true,
  });
  const doughnutChoice = project.getByRole("radio", {
    name: "Doughnut",
    exact: true,
  });
  await expect(project.getByRole("radio")).toHaveCount(3);
  await expect(openDoughChoice).toBeChecked();
  await doughnutChoice.click();
  await expect(doughnutChoice).toBeChecked();
  await expect(openDoughChoice).not.toBeChecked();
  await expectMembership(page, {
    taken: [],
    backlog: ["Doughnut's next story"],
  });
  await expect(source).toContainText("nerds-odd-e/doughnut · main");
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
