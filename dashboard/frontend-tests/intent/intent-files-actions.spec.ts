// Intent's Files sidebar first row at phone width: a story's Home and the
// Intent only and Changes only filters stay in order in one row inside the
// sidebar, even with wider text, each a touch target. Whole-project Intent
// has only Intent only. On the story page the Files toggle opens the live row.
import { createElement, type ComponentProps } from "react";
import { describe, expect, test, vi } from "vitest";
import { page, type Locator } from "vitest/browser";
import { IntentFilesActions } from "../../src/FilesSidebarActions.tsx";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import {
  deepFile,
  openIntentFileLayout,
} from "./intent-file-layout-fixture.ts";
import { expectOneRow } from "./intent-file-layout-page.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";

// The phone drawer's Files column at 320 CSS px.
const sidebarWidth = 282;

async function mountRow(
  actions: ComponentProps<typeof IntentFilesActions>,
  fontSize = "100%",
) {
  await mountComponent(
    createElement(
      "div",
      {
        className: "intent-locations",
        "data-testid": "files-sidebar",
        style: { width: `${sidebarWidth}px`, fontSize },
      },
      createElement(IntentFilesActions, actions),
    ),
    { viewport: { width: 320, height: 640 } },
  );
  const row = page.getByRole("group", { name: "Files actions" });
  await expect.element(row).toBeVisible();
  return { row, sidebar: page.getByTestId("files-sidebar") };
}

// The row's controls by accessible name, in document order.
function rowNames(row: Locator) {
  return [...row.element().querySelectorAll("button, input")].map(
    (control) =>
      control.getAttribute("aria-label") ??
      control.closest("label")?.textContent.trim(),
  );
}

// The named controls share one row in order, inside the sidebar, each a
// touch target of at least 44 px.
function expectOneRowInside(
  { row, sidebar }: { readonly row: Locator; readonly sidebar: Locator },
  ...names: string[]
) {
  const room = sidebar.element().getBoundingClientRect();
  const boxes = expectOneRow(
    ...names.map((name) =>
      name === "Home"
        ? row.getByRole("button", { name, exact: true })
        : row.getByText(name, { exact: true }),
    ),
  );
  for (const box of boxes) {
    expect(box.left).toBeGreaterThanOrEqual(room.left);
    expect(box.right).toBeLessThanOrEqual(room.right);
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
}

const filter = (label: string) => ({
  label,
  checked: false,
  onToggle: vi.fn<(checked: boolean) => void>(),
});

const storyPath = { id: "story-path", hidden: false, onHome: vi.fn() };

describe("the Files sidebar's first row at 320 px", () => {
  test("a story keeps Home, Intent only and Changes only in one row inside the sidebar with wider text", async () => {
    const shown = await mountRow(
      {
        path: storyPath,
        intentOnly: filter("Intent only"),
        changesOnly: filter("Changes only"),
      },
      "115%",
    );

    expect(rowNames(shown.row)).toEqual([
      "Home",
      "Intent only",
      "Changes only",
    ]);
    expectOneRowInside(shown, "Home", "Intent only", "Changes only");
  });

  test("whole-project Intent offers only Intent only", async () => {
    const shown = await mountRow({
      path: undefined,
      intentOnly: filter("Intent only"),
      changesOnly: undefined,
    });

    expect(rowNames(shown.row)).toEqual(["Intent only"]);
  });

  test("the story page's Files toggle opens the live row, whose Home reads Story Home", async () => {
    await openIntentFileLayout({ viewport: { width: 320, height: 640 } });
    const story = intentStoryCompare();
    await story.browseFiles();
    await story.file(deepFile).click();
    await story.browseFiles();
    const row = story.sidebar.getByRole("group", { name: "Files actions" });

    await expect.element(row).toBeVisible();
    expectOneRowInside({ row, sidebar: story.sidebar }, "Home");

    await row.getByRole("button", { name: "Home", exact: true }).click();
    await expect
      .element(story.viewTab("CI comparison"))
      .toHaveAttribute("aria-selected", "true");
    await expect.element(story.homeReading).toBeVisible();
  });
});
