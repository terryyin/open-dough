import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { emulateMedia } from "../review/browser-session.ts";
import { scopeName, scopeToggle } from "./intent-browser-page.ts";
import { intentPage } from "./intent-file-layout-page.ts";
import {
  locationHeader,
  locationHeaderLook,
} from "./intent-scope-tree-page.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";
import {
  doneCompletion,
  openDoneStoryComparison,
} from "./intent-story-compare-stories.ts";

const location = "dashboard/tests";
const filePath = "dashboard/tests/folder/a.spec.ts";
const fileLabel = `Modified ${filePath}`;
const fileCounts = "1 → 2 test cases (+1) → 1 test case (0)";
const fileTiming = "+4.0 s";
const transparent = "rgba(0, 0, 0, 0)";

const cueState = (element: Element | null | undefined) => ({
  count: element?.getAttribute("data-ci-count-cue"),
  duration: element?.getAttribute("data-ci-duration-cue"),
  countReason: element?.getAttribute("data-ci-count-cue-reason"),
});
const unchangedSlower = {
  count: "none",
  duration: "slower-light",
  countReason: "unchanged",
};
const moreSlower = { count: "more-light", duration: "slower-strong" };

function selectionLook(element: Element) {
  const style = getComputedStyle(element);
  return { background: style.backgroundColor, border: style.borderColor };
}

test("tree file rows and location headers show shared CI cues with distinct selection and focus", async () => {
  const comparison = makeMe.aStoryReview
    .published(doneCompletion)
    .modifying(filePath)
    .adding("dashboard/tests/added.spec.ts")
    .deleting("dashboard/tests/gone.spec.ts")
    .renaming("tests/old.sh", "dashboard/tests/renamed.spec.ts")
    .please();
  const mounted = await openDoneStoryComparison({
    viewport: { width: 1280, height: 800 },
    review: () => Promise.resolve(comparison),
  });
  const story = intentStoryCompare();
  await story.browseFiles();
  const file = story.file(fileLabel);
  const folder = scopeToggle("folder");
  await expect.element(folder).toBeVisible();
  if (folder.element().getAttribute("aria-expanded") === "false")
    await folder.click();
  await expect.element(folder).toHaveAttribute("aria-expanded", "true");

  const name = story.sidebar.getByRole("button", {
    name: /^dashboard\/tests(?:,|$)/,
  });
  await expect
    .poll(() => cueState(locationHeader(location)))
    .toMatchObject(moreSlower);
  await expect
    .element(name)
    .toHaveAccessibleName(
      "dashboard/tests, typescript, **/*.spec.ts, 4 → 6 test cases (+2) → 5 test cases (+1), +6.5 s",
    );
  await expect
    .poll(() => cueState(file.query()))
    .toMatchObject(unchangedSlower);
  await expect
    .element(file)
    .toHaveAccessibleName(`${fileLabel}, ${fileCounts}, ${fileTiming}`);

  await file.click();
  await story.chooseProof();
  const proof = intentPage.getByRole("region", { name: "Proof", exact: true });
  const table = proof.getByRole("table", {
    name: `CI proof of ${filePath}`,
    exact: true,
  });
  const proofRow = () => table.query()?.querySelector("tbody tr");
  await expect.poll(() => cueState(proofRow())).toMatchObject(unchangedSlower);
  await expect
    .poll(() => proofRow()?.querySelectorAll("td")[0]?.textContent)
    .toBe(fileCounts);
  await expect
    .poll(() => proofRow()?.querySelectorAll("td")[3]?.textContent)
    .toBe(fileTiming);

  await file.click();
  await expect.element(file).toHaveAttribute("aria-pressed", "true");
  const selected = selectionLook(file.element());
  expect(selected.background).not.toBe(transparent);
  expect(selected.border).not.toBe(transparent);

  await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
  await userEvent.keyboard("{Tab}");
  await expect.element(file).toHaveFocus();
  const ring = getComputedStyle(file.element());
  expect(ring.outlineWidth).toBe("3px");
  expect(ring.outlineStyle).toBe("solid");
  expect(ring.outlineOffset).toBe("2px");
  expect(ring.outlineColor).toBe(selected.border);
  expect(selectionLook(file.element())).toEqual(selected);
  expect(cueState(file.element())).toMatchObject(unchangedSlower);

  const header = locationHeader(location);
  expect(
    header.closest(".intent-location")?.getAttribute("data-contains-changes"),
  ).toBe("true");
  const mark = locationHeaderLook(location);
  expect(mark.mark).toMatch(/rgb/);
  await name.click();
  await expect.element(name).toHaveAttribute("aria-pressed", "true");
  expect(cueState(header)).toMatchObject(moreSlower);
  const selectedHeader = locationHeaderLook(location);
  expect(selectedHeader).toMatchObject({
    fullWidth: true,
    controlsShowHeader: true,
  });
  // The change mark and count cue both occupy the leading inset.
  expect(
    selectedHeader.mark.split(/,(?![^(]*\))/).length,
  ).toBeGreaterThanOrEqual(2);
  const headerSelection = selectionLook(header);
  expect(headerSelection.background).not.toBe(transparent);
  expect(headerSelection.border).not.toBe(transparent);
  const folderRow = folder.element().closest(".story-review-folder-row");
  expect(folderRow).not.toBeNull();
  expect(folderRow?.closest("li")?.hasAttribute("data-ci-count-cue")).toBe(
    false,
  );
  expect(folderRow?.closest("li")?.hasAttribute("data-ci-duration-cue")).toBe(
    false,
  );
  expect(folderRow?.querySelector("[data-ci-count-cue]")).toBeNull();

  await file.click();
  for (const appearance of ["light", "dark"]) {
    await emulateMedia([{ name: "prefers-color-scheme", value: appearance }]);
    await expect
      .poll(() => matchMedia(`(prefers-color-scheme: ${appearance})`).matches)
      .toBe(true);
    for (const width of [1280, 390]) {
      await page.viewport(width, 844);
      await expect.element(name).toBeVisible();
      await expect.element(file).toBeVisible();
      expect(locationHeaderLook(location).fullWidth).toBe(true);
      expect(cueState(locationHeader(location))).toMatchObject(moreSlower);
      expect(cueState(file.element())).toMatchObject(unchangedSlower);
      expect(selectionLook(file.element()).background).not.toBe(transparent);
    }
  }

  await page.viewport(1280, 800);
  await mounted.selectStory(undefined);
  await expect
    .element(
      intentPage.getByRole("heading", {
        name: "No story selected",
        exact: true,
      }),
    )
    .toBeVisible();
  await expect.element(scopeName(location)).toBeVisible();
  expect(
    intentPage
      .element()
      .querySelectorAll(
        ".intent-locations [data-ci-count-cue], .intent-locations [data-ci-duration-cue]",
      ),
  ).toHaveLength(0);
});
