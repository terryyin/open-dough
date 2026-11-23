import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { emulateMedia } from "../review/browser-session.ts";
import { openIntentFileLayout } from "./intent-file-layout-fixture.ts";
import { intentPage } from "./intent-file-layout-page.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";

test("a long story title shows once in full above the story's views, whichever is chosen", async () => {
  const long =
    "Story A reads frontend tests in both projects and keeps every location's source beside the published revision";
  const { comparison } = await openIntentFileLayout({
    viewport: { width: 900, height: 720 },
    title: long,
  });
  const story = intentStoryCompare();
  await story.chooseTab("Changes");
  const title = story.header.getByRole("heading", { name: long, exact: true });
  await expect.element(title).toBeVisible();
  expect(intentPage.getByText(long, { exact: true }).all()).toHaveLength(1);
  const titleFits = () => {
    const heading = title.element();
    expect(heading.textContent).toBe(long);
    expect(heading.scrollWidth).toBeLessThanOrEqual(heading.clientWidth);
    const lines =
      heading.getBoundingClientRect().height /
      parseFloat(getComputedStyle(heading).lineHeight);
    expect(Math.round(lines)).toBeGreaterThan(1);
  };
  titleFits();

  await expect
    .element(story.header.getByText("SEED-A#a", { exact: true }))
    .toBeVisible();
  if (comparison.kind !== "snapshot")
    throw new Error("Expected a worktree comparison");
  await expect
    .element(story.workspaceContext)
    .toHaveAccessibleName(
      `Branch ${comparison.branch} Baseline ${comparison.baseline} where ${comparison.branch} meets origin/main Worktree ${comparison.workspace}`,
    );

  for (const view of ["CI comparison", "Intent coverage", "Changes"] as const) {
    await story.chooseTab(view);
    expect(title.element().getBoundingClientRect().bottom).toBeLessThan(
      story.viewTab(view).element().getBoundingClientRect().top,
    );
  }
  await story.chooseTab("Intent coverage");
  const coverage = intentPage.getByRole("region", { name: "Intent coverage" });
  await expect
    .poll(() => coverage.query()?.querySelector("p")?.textContent)
    .toBe(
      "If an Intent Coverage assessment is saved during feature story wrap-up, it appears here once this story is completed.",
    );

  await emulateMedia([{ name: "prefers-color-scheme", value: "dark" }]);
  await page.viewport(390, 760);
  await expect.element(title).toBeVisible();
  titleFits();
});
