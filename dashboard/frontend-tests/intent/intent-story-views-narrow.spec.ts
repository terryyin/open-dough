import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { emulateMedia } from "../review/browser-session.ts";
import { openIntentFileLayout } from "./intent-file-layout-fixture.ts";
import {
  controlsFit,
  fileLayout,
  focus,
  intentPage,
  projectView,
  toggleFilesFromKeyboard,
} from "./intent-file-layout-page.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";

test("narrow, a selected story's views and Hide files stay reachable by keyboard without widening the page", async () => {
  await openIntentFileLayout({ viewport: { width: 390, height: 760 } });
  const story = intentStoryCompare();
  const files = fileLayout();
  await story.chooseTab("Changes");
  await controlsFit(
    story.viewTab("CI comparison"),
    story.viewTab("Changes"),
    story.viewTab("Intent coverage"),
    files.toggle,
  );

  await toggleFilesFromKeyboard(story.viewTab("Changes"));
  await userEvent.keyboard(" ");
  await files.showsFiles(true);
  focus(story.viewTab("Changes"));
  await userEvent.keyboard("{Home}");
  await expect
    .element(story.viewTab("CI comparison"))
    .toHaveAttribute("aria-selected", "true");
  await expect.element(story.viewTab("CI comparison")).toHaveFocus();
  await userEvent.keyboard("{End}");
  await expect
    .element(story.viewTab("Intent coverage"))
    .toHaveAttribute("aria-selected", "true");
  await files.showsFiles(true);
});

test("without a story the shared header, project views and reader fit narrow and short reading with keyboard controls", async () => {
  await emulateMedia([{ name: "prefers-color-scheme", value: "dark" }]);
  await openIntentFileLayout({
    viewport: { width: 390, height: 560 },
    selected: false,
  });
  const files = fileLayout();
  const status = projectView("CI status");
  const candidates = projectView("Optimization Candidates");
  const ciStatus = intentPage.getByRole("region", {
    name: "CI status",
    exact: true,
  });
  // A 1280px desktop at 200% and 400% zoom has 640px and 320px of layout width.
  for (const [width, height] of [
    [390, 560],
    [720, 460],
    [640, 450],
    [320, 256],
  ] as const) {
    await page.viewport(width, height);
    await expect
      .element(
        intentPage.getByRole("heading", {
          name: "No story selected",
          exact: true,
        }),
      )
      .toBeVisible();
    expect(
      intentPage
        .element()
        .querySelector(".intent-page-frame")
        ?.getAttribute("data-intent-context"),
    ).toBe("project");
    await expect
      .element(
        intentPage.getByRole("tablist", { name: "Selected story views" }),
      )
      .not.toBeInTheDocument();
    await controlsFit(
      intentPage.getByLabelText("Test browser revision", { exact: true }),
      status,
      candidates,
      files.toggle,
    );
    await toggleFilesFromKeyboard(status);
    await expect.element(ciStatus).toBeVisible();
    expect(files.reading().height).toBeGreaterThan(height <= 256 ? 30 : 100);
    await userEvent.keyboard(" ");
    await files.showsFiles(true);
    focus(status);
    await userEvent.keyboard("{End}");
    await expect.element(candidates).toHaveFocus();
    await expect.element(files.toggle).not.toBeInTheDocument();
    await userEvent.keyboard("{Home}");
    await expect.element(status).toHaveFocus();
    await expect.element(ciStatus).toBeVisible();
  }
});
