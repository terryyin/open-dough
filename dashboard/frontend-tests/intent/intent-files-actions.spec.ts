// The Files sidebar's first row at phone width: the supplied actions keep
// Home and the Intent only and Changes only filters in order in one row
// inside the sidebar, even with wider text, and each stays an operable
// touch target. Whole-project scope has no
// Changes only. On the story page the Files toggle opens the live row.
import { createElement } from "react";
import { describe, expect, test, vi } from "vitest";
import { page, userEvent, type Locator } from "vitest/browser";
import {
  FilesSidebarActionsRow,
  type FilesSidebarActions,
} from "../../src/FilesSidebarActions.tsx";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import {
  deepFile,
  openIntentFileLayout,
} from "./intent-file-layout-fixture.ts";
import { expectOneRow } from "./intent-file-layout-page.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";

// The phone drawer's Files column at 320 CSS px.
const sidebarWidth = 282;

async function mountRow(actions: FilesSidebarActions, fontSize = "100%") {
  await mountComponent(
    createElement(
      "div",
      {
        className: "intent-locations",
        "data-testid": "files-sidebar",
        style: { width: `${sidebarWidth}px`, fontSize },
      },
      createElement(FilesSidebarActionsRow, { actions }),
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

// Home and the named filters share one row in order, inside the sidebar,
// each a touch target of at least 44 px.
function expectOneRowInside(
  { row, sidebar }: { readonly row: Locator; readonly sidebar: Locator },
  ...filters: string[]
) {
  const room = sidebar.element().getBoundingClientRect();
  const boxes = expectOneRow(
    row.getByRole("button", { name: "Home", exact: true }),
    ...filters.map((label) => row.getByText(label, { exact: true })),
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

describe("the Files sidebar's first row at 320 px", () => {
  test("story scope keeps Home, Intent only and Changes only in one row", async () => {
    const shown = await mountRow({
      scope: "story",
      onHome: vi.fn<() => void>(),
      intentOnly: filter("Intent only"),
      changesOnly: filter("Changes only"),
    });

    expect(rowNames(shown.row)).toEqual([
      "Home",
      "Intent only",
      "Changes only",
    ]);
    expectOneRowInside(shown, "Intent only", "Changes only");
  });

  test("story scope keeps its row inside the sidebar with wider text", async () => {
    const shown = await mountRow(
      {
        scope: "story",
        onHome: vi.fn<() => void>(),
        intentOnly: filter("Intent only"),
        changesOnly: filter("Changes only"),
      },
      "115%",
    );

    expectOneRowInside(shown, "Intent only", "Changes only");
  });

  test("whole-project scope keeps Home and Intent only in one row without Changes only", async () => {
    const shown = await mountRow({
      scope: "project",
      onHome: vi.fn<() => void>(),
      intentOnly: filter("Intent only"),
    });

    expect(rowNames(shown.row)).toEqual(["Home", "Intent only"]);
    expectOneRowInside(shown, "Intent only");
  });

  test("each supplied action answers a tap or the keyboard", async () => {
    const onHome = vi.fn<() => void>();
    const intentOnly = filter("Intent only");
    const changesOnly = filter("Changes only");
    await mountRow({ scope: "story", onHome, intentOnly, changesOnly });

    await page.getByRole("button", { name: "Home" }).click();
    await page.getByRole("checkbox", { name: "Intent only" }).click();
    await userEvent.keyboard("{Tab} ");
    expect(onHome).toHaveBeenCalledOnce();
    expect(intentOnly.onToggle).toHaveBeenCalledWith(true);
    expect(changesOnly.onToggle).toHaveBeenCalledWith(true);
  });

  test("the story page's Files toggle opens the live row, whose Home reads Story Home", async () => {
    await openIntentFileLayout({ viewport: { width: 320, height: 640 } });
    const story = intentStoryCompare();
    await story.browseFiles();
    await story.file(deepFile).click();
    await story.browseFiles();
    const row = story.sidebar.getByRole("group", { name: "Files actions" });

    await expect.element(row).toBeVisible();
    expectOneRowInside({ row, sidebar: story.sidebar });

    await row.getByRole("button", { name: "Home", exact: true }).click();
    await expect
      .element(story.viewTab("CI comparison"))
      .toHaveAttribute("aria-selected", "true");
    await expect.element(story.homeReading).toBeVisible();
  });
});
