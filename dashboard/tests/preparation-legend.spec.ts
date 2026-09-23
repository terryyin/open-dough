import { expect, test } from "./dashboardTest";
import {
  expectFocusedAndIndicated,
  expectImmediateMotion,
  expectReadableContrast,
  zoomedWindow,
} from "./accessibleReading";
import { publishCommittedOrigin } from "./committedOrigin";
import { parts } from "./dashboardPage";
import { publishMovingOrigin } from "./publishedOrigin";
import { box, expectNoSidewaysScrollAndWholeText } from "./pageLayout";
import {
  buildOpenDoughReadinessRepo,
  plannedReady,
  plannedBlocked,
  unrefined,
} from "./storyReadinessFixture";

for (const viewport of [
  { name: "desktop", size: { width: 1280, height: 720 } },
  { name: "320px / 400% zoom with reduced motion", size: zoomedWindow },
]) {
  test(`preparation legend is modal help with preserved reading context at ${viewport.name}`, async ({
    page,
  }) => {
    const cleanups: Array<() => void> = [];
    try {
      const repo = buildOpenDoughReadinessRepo((cleanup) =>
        cleanups.push(cleanup),
      );
      const origin = await publishCommittedOrigin(page, {
        repoDir: repo.directory,
        revision: repo.revision,
        repository: "terryyin/open-dough",
      });
      await page.setViewportSize(viewport.size);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");
      const { taken, project } = parts(page);
      const ready = taken.getByRole("article", { name: plannedReady.title });
      await expect(
        ready.getByText("Ready for execution", { exact: true }),
      ).toBeVisible();
      await expect(
        page
          .getByRole("article", { name: unrefined.title })
          .getByText("Not refined", { exact: true }),
      ).toBeVisible();
      await expect(
        page
          .getByRole("article", { name: plannedBlocked.title })
          .getByText("Not ready", { exact: true }),
      ).toBeVisible();
      const badges = page.locator(".card .badge");
      const originalBadges = await badges.allTextContents();
      const reads = origin.requests.length;
      const launcher = parts(page).preparationHelp;
      const dialog = page.getByRole("dialog", { name: "Preparation badges" });
      await expect(dialog).not.toBeVisible();
      await expect(
        page.getByRole("region", { name: "Preparation badges" }),
      ).not.toBeVisible();
      await expect(launcher).toHaveText("?");
      const target = await box(launcher);
      expect(target.width).toBeGreaterThanOrEqual(44);
      expect(target.height).toBeGreaterThanOrEqual(44);
      await expectReadableContrast(launcher);

      await launcher.scrollIntoViewIfNeeded();
      const scroll = await page.evaluate(() => window.scrollY);
      await launcher.click();
      await expect(dialog).toBeVisible();
      await expect(
        dialog.getByRole("heading", { name: "Preparation badges" }),
      ).toBeVisible();
      const close = dialog.getByRole("button", { name: "Close", exact: true });
      await expect(close).toBeFocused();
      await expect(close).toBeInViewport({ ratio: 1 });
      for (const label of [
        "Not refined",
        "Refined",
        "Slice planned",
        "Ready for execution",
      ]) {
        const badge = dialog.getByText(label, { exact: true });
        await badge.scrollIntoViewIfNeeded();
        await expect(badge).toBeInViewport({ ratio: 1 });
        await expectReadableContrast(badge);
      }
      const explanation = dialog.getByText(
        "Text carries every color meaning.",
        { exact: false },
      );
      await explanation.scrollIntoViewIfNeeded();
      await expect(explanation).toBeInViewport({ ratio: 1 });
      await expect(close).toBeInViewport({ ratio: 1 });
      await expectNoSidewaysScrollAndWholeText(page);
      await expectImmediateMotion(dialog);

      await page.keyboard.press("Tab");
      const content = dialog.getByRole("region", {
        name: "Badge explanations",
      });
      await expectFocusedAndIndicated(page, content);
      await page.keyboard.press("Home");
      await expect(
        dialog.getByRole("heading", { name: "Preparation badges" }),
      ).toBeInViewport({ ratio: 1 });
      await page.keyboard.press("End");
      await expect(explanation).toBeInViewport({ ratio: 1 });
      await page.keyboard.press("Tab");
      await expectFocusedAndIndicated(page, close);
      await page.keyboard.press("Shift+Tab");
      await expect(content).toBeFocused();
      await page.keyboard.press("Shift+Tab");
      await expect(close).toBeFocused();
      // Native modal inertness blocks even an explicit attempt to focus the
      // background. A pointer at the selector likewise cannot interact with it.
      await project
        .getByRole("radio", { checked: true })
        .evaluate((element) => {
          (element as HTMLElement).focus();
        });
      await expect(close).toBeFocused();
      const projectBox = await box(project);
      await page.mouse.click(
        projectBox.x + 4,
        projectBox.y + projectBox.height / 2,
      );
      await expect(
        project.getByRole("radio", { checked: true }),
      ).not.toBeFocused();
      await expect(dialog).toBeVisible();
      expect(origin.requests.length).toBe(reads);
      // Hit-testing inside the dialog reaches its content, even where its
      // viewport rectangle overlaps the pinned banner in the zoomed window.
      expect(
        await close.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          return element.contains(
            document.elementFromPoint(
              rect.x + rect.width / 2,
              rect.y + rect.height / 2,
            ),
          );
        }),
      ).toBe(true);

      await close.click();
      await expect(dialog).not.toBeVisible();
      await expect(launcher).toBeFocused();
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(scroll);
      await page.keyboard.press("Enter");
      await expect(dialog).toBeVisible();
      await expect(close).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();
      await expectFocusedAndIndicated(page, launcher);
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(scroll);
      expect(await badges.allTextContents()).toEqual(originalBadges);
      expect(origin.requests.length).toBe(reads);
    } finally {
      for (const cleanup of cleanups.reverse()) cleanup();
    }
  });
}

test("preparation help is absent when there are no preparation facts", async ({
  page,
}) => {
  const origin = await publishMovingOrigin(page);
  origin.push(
    "e1".repeat(20),
    "# Product backlog\n\n## Taken\n\n## Backlog list\n",
  );
  await page.goto("/");
  await expect(parts(page).backlog).toContainText(
    "No Backlog entries are recorded.",
  );
  await expect(parts(page).preparationHelp).toHaveCount(0);
});
