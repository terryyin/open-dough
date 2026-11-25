import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { scopeName, scopeToggle } from "./intent-browser-page.ts";
import {
  deepFile,
  openIntentFileLayout,
} from "./intent-file-layout-fixture.ts";
import {
  fileLayout,
  intentPage,
  projectView,
  toggleFilesFromKeyboard,
} from "./intent-file-layout-page.ts";
import { developmentCard } from "./intent-ci-development-card-page.ts";
import {
  locationHeader,
  locationHeaderLook,
} from "./intent-scope-tree-page.ts";
import {
  chooseWholeProject,
  intentRecentStories,
} from "./intent-recent-stories-page.ts";
import { openDoughSource } from "./intent-ci-status-fixtures.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";

const proof = intentPage.getByRole("region", { name: "Proof", exact: true });
const proofTab = intentPage
  .getByRole("tablist", { name: "Purpose and Proof", exact: true })
  .getByRole("tab", { name: "Proof", exact: true });
const ciStatus = intentPage.getByRole("region", {
  name: "CI status",
  exact: true,
});

test("Hide files gives the reading pane the width under the story's header; after the other views, Show files returns the column, test and Proof as they were", async () => {
  await openIntentFileLayout({
    viewport: { width: 1280, height: 560 },
  });
  const files = fileLayout();
  const story = intentStoryCompare();
  await story.chooseTab("Changes");
  await story.onlyChangedFiles.click();
  const selected = story.file(deepFile);
  await selected.click();
  await expect.poll(story.diffName).toBe(deepFile);
  await story.chooseProof();
  await expect.element(proof).toBeVisible();
  const offset = await files.scrollFilesHalfway();
  const before = files.reading();
  await expect.element(projectView("CI status")).not.toBeInTheDocument();

  await files.toggle.click();
  await files.showsFiles(false);
  await files.showsFullReader();
  expect(files.reading().width).toBeGreaterThan(before.width);
  expect(files.reading().top).toBeGreaterThanOrEqual(
    story.header.element().getBoundingClientRect().bottom,
  );
  await expect.element(proof).toBeVisible();

  for (const view of ["Intent coverage", "CI comparison"] as const) {
    await story.chooseTab(view);
    await expect.element(files.toggle).not.toBeInTheDocument();
    await expect.poll(files.readerVisible).toBe(false);
    await story.chooseTab("Changes");
    await files.showsFiles(false);
    await expect.element(proof).toBeVisible();
  }

  await files.toggle.click();
  await files.showsFiles(true);
  await expect.element(story.onlyChangedFiles).toBeChecked();
  await expect.element(selected).toHaveAttribute("aria-pressed", "true");
  for (const name of ["boundary", "deep"])
    await expect
      .element(scopeToggle(name))
      .toHaveAttribute("aria-expanded", "true");
  await expect.poll(files.fileScroll).toBe(offset);
  await expect.element(proofTab).toHaveAttribute("aria-selected", "true");
});

test("changed locations keep their own full-width header and change mark when selected", async () => {
  const mounted = await openIntentFileLayout({
    viewport: { width: 1280, height: 800 },
  });
  await intentStoryCompare().chooseTab("Changes");
  const folder = scopeToggle("boundary");
  await expect.element(folder).toBeVisible();
  const markedFolder = folder.element().closest(".story-review-folder-row");
  if (!markedFolder)
    throw new Error("Expected the changed boundary folder row");
  expect(
    markedFolder.parentElement?.getAttribute("data-contains-changes"),
  ).toBe("true");
  const folderBackground = getComputedStyle(markedFolder).backgroundColor;
  const transparent = "rgba(0, 0, 0, 0)";
  expect(folderBackground).not.toBe(transparent);

  const changed = "dashboard/tests";
  const otherLocation = "tests";
  for (const path of [changed, otherLocation]) {
    await expect.element(scopeToggle(path)).toBeVisible();
    await expect.element(scopeName(path)).toBeVisible();
    expect(
      locationHeader(path)
        .closest("li[data-folder-path]")
        ?.getAttribute("data-contains-changes"),
    ).toBe("true");
    const marked = locationHeaderLook(path);
    expect(marked.background).not.toBe(transparent);
    expect(marked.background).not.toBe(folderBackground);
    expect(marked.mark).not.toBe("none");
    expect(marked.labelWeight).toBeGreaterThanOrEqual(600);
    expect(marked).toMatchObject({ fullWidth: true, controlsShowHeader: true });
  }
  const marked = locationHeaderLook(changed);
  await scopeName(changed).click();
  await expect
    .element(scopeName(changed))
    .toHaveAttribute("aria-pressed", "true");
  await expect
    .element(scopeToggle(changed))
    .toHaveAttribute("aria-expanded", "true");
  const selectedHeader = locationHeaderLook(changed);
  expect(selectedHeader.background).not.toBe(marked.background);
  expect(selectedHeader.background).not.toBe(folderBackground);
  expect(selectedHeader).toMatchObject({
    mark: marked.mark,
    fullWidth: true,
    controlsShowHeader: true,
  });

  await mounted.showDevelopment();
  await developmentCard("Story A").toggle();
  await mounted.showIntent();
  await expect
    .element(
      intentPage.getByRole("heading", {
        name: "No story selected",
        exact: true,
      }),
    )
    .toBeVisible();
  await expect.element(scopeName(otherLocation)).toBeVisible();
  expect(locationHeaderLook(otherLocation)).toMatchObject({
    mark: "none",
    background: marked.background,
  });
});

test("the hidden column stays hidden across scopes and Development, with its own choice in Whole project, and a project change shows it", async () => {
  const mounted = await openIntentFileLayout({
    viewport: { width: 1280, height: 800 },
  });
  const files = fileLayout();
  const story = intentStoryCompare();
  await story.chooseTab("Changes");
  await files.toggle.click();
  await files.showsFiles(false);

  await chooseWholeProject();
  await files.showsFiles(true);
  await projectView("Optimization Candidates").click();
  await expect.element(files.toggle).not.toBeInTheDocument();
  await intentRecentStories(openDoughSource).chooseRow("SEED-A#a");
  await story.chooseTab("Changes");
  await files.showsFiles(false);

  await mounted.showDevelopment();
  await expect.element(intentPage).not.toBeInTheDocument();
  await mounted.showIntent();
  await files.showsFiles(false);

  await mounted.showOtherProject();
  await expect
    .poll(() => intentPage.query()?.textContent)
    .toContain("No Intent locations are configured for Doughnut.");
  await expect.element(files.toggle).not.toBeInTheDocument();
  await mounted.showFirstProject();
  await expect
    .element(
      story.header.getByRole("heading", { name: "Story A", exact: true }),
    )
    .toBeVisible();
  await story.chooseTab("Changes");
  await files.showsFiles(true);
});

test("with no story, the toggle is reached by Tab after the tabs, works with Enter and Space, and CI status takes the width", async () => {
  await openIntentFileLayout({
    viewport: { width: 1280, height: 800 },
    selected: false,
  });
  const files = fileLayout();
  await toggleFilesFromKeyboard(projectView("CI status"));
  await expect
    .element(intentPage.getByRole("tablist", { name: "Project Intent views" }))
    .toHaveTextContent("CI statusOptimization Candidates");
  await expect.element(ciStatus).toBeVisible();
  await files.showsFullReader();
  await userEvent.keyboard(" ");
  await files.showsFiles(true);
});

test("narrow, the hidden column gives the reading pane the height under the strip", async () => {
  await openIntentFileLayout({
    viewport: { width: 640, height: 720 },
    selected: false,
  });
  const files = fileLayout();
  await files.showsFiles(true);
  const before = files.reading();
  expect(before.height).toBeLessThan(files.browser().height - 40);

  await files.toggle.click();
  await files.showsFiles(false);
  await files.showsFullReader();
  expect(files.reading().height).toBeGreaterThan(before.height);
  expect(files.reading().top).toBeGreaterThanOrEqual(files.tabBar().bottom);
});
