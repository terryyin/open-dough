import { expect, test } from "vitest";
import { userEvent, type Locator } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { contrastRatio } from "../../test-support/composedColours.ts";
import { emulateMedia } from "../review/browser-session.ts";
import { launchDialog } from "./ad-hoc-launch-page.ts";
import {
  box,
  noSidewaysScroll,
  resizeLaunchViewport,
  splitWords,
  twiceZoomedDialog,
  useTwiceZoomedDevice,
} from "./launch-layout-page.ts";
import { mountStoryLaunches } from "./story-card-launch-page.ts";

const notReady = "Not assessed as ready";

function expectDesktopHover() {
  expect(matchMedia("(hover: hover) and (pointer: fine)").matches).toBe(true);
}

test("Backlog offers execution then refinement with an assessment note when needed, and Taken offers neither", async () => {
  expectDesktopHover();
  const ready = makeMe.aWorkEntry
    .with({
      identity: "SEED-B#b",
      title: "Ready story",
      preparation: {
        status: "recorded",
        refinement: "refined",
        approach: { kind: "planless" },
        assessment: { status: "ready", changedSinceReview: false, reasons: [] },
      },
    })
    .please();
  const unassessed = makeMe.aWorkEntry
    .with({ identity: "SEED-A#a", title: "Story without a readiness review" })
    .please();
  const { group, execution, refinement, show } =
    await mountStoryLaunches(ready);

  const offered = async (description: string) => {
    await expect.element(execution).toBeEnabled();
    await expect.element(refinement).toBeEnabled();
    await expect.element(execution).toHaveAccessibleDescription(description);
    await expect.element(refinement).toHaveAccessibleDescription("");
    expect(
      [...group.element().querySelectorAll("button")].map(
        (button) => button.textContent,
      ),
    ).toEqual(["Start execution", "Start refinement"]);
  };
  await offered("");
  expectGlyph(execution, "play");
  expectGlyph(refinement, "pencil-line");
  expect(box(execution).top).toBeCloseTo(box(refinement).top, 0);
  await userEvent.hover(execution);
  expect(group.element().querySelector(".frame-tooltip")).toBeNull();
  await userEvent.unhover(execution);

  show(unassessed);
  await offered(notReady);
  await expect
    .element(group.getByText(notReady, { exact: true }))
    .not.toBeVisible();
  show(unassessed, false);
  await expect.element(group).not.toBeInTheDocument();
});

function expectGlyph(action: Locator, glyph: string) {
  const control = action.element();
  const icon = control.querySelector(`svg.lucide-${glyph}`);
  if (icon === null) throw new Error(`${glyph} glyph missing`);
  expect(control.firstChild).toBe(icon);
  expect(icon.getAttribute("aria-hidden")).toBe("true");
  if (!control.matches(":disabled")) {
    expect(
      contrastRatio(
        getComputedStyle(icon).color,
        getComputedStyle(control).backgroundColor,
      ),
    ).toBeGreaterThanOrEqual(3);
  }
}

test("story Starts keep their reading order and visible keyboard focus at narrow and zoomed widths", async () => {
  expectDesktopHover();
  const story = makeMe.aWorkEntry
    .with({ identity: "SEED-A#a", title: "A queued story" })
    .please();
  const { group, execution, refinement, start } =
    await mountStoryLaunches(story);
  await expect.element(execution).toBeEnabled();
  await expect.element(refinement).toBeEnabled();
  expectGlyph(execution, "play");
  expectGlyph(refinement, "pencil-line");
  expect(box(execution).top).toBeCloseTo(box(refinement).top, 0);

  const followKeyboard = async () => {
    noSidewaysScroll(group);
    expect(splitWords(group)).toEqual([]);
    const first = box(execution);
    const second = box(refinement);
    expect(second.top >= first.bottom || second.left >= first.right).toBe(true);
    await expect
      .element(group.getByText(notReady, { exact: true }))
      .not.toBeVisible();
    execution.element().focus();
    await userEvent.tab();
    await expect.element(refinement).toHaveFocus();
    expect(refinement.element().matches(":focus-visible")).toBe(true);
    const focusStyle = getComputedStyle(refinement.element());
    expect(focusStyle.outlineStyle).not.toBe("none");
    expect(Number.parseFloat(focusStyle.outlineWidth)).toBeGreaterThanOrEqual(
      2,
    );

    await userEvent.keyboard("{Enter}");
    const { dialog } = launchDialog("Start refinement in Claude Code");
    await expect.element(dialog).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect.element(dialog).not.toBeInTheDocument();
    await expect.element(refinement).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect.element(execution).toHaveFocus();
    execution.element().blur();
  };
  await resizeLaunchViewport({ width: 420, height: 900 });
  await followKeyboard();
  await useTwiceZoomedDevice();
  await resizeLaunchViewport(twiceZoomedDialog);
  await followKeyboard();
  expect(start).not.toHaveBeenCalled();
});

test("noted execution and preparing refinement stay readable and distinct from unavailable Starts in both schemes", async () => {
  expectDesktopHover();
  const story = makeMe.aWorkEntry
    .with({
      identity: "SEED-A#a",
      title: "Story being prepared",
      preparing: {
        status: "recorded",
        assignments: [
          {
            profilePath: ".planning/agents/helper.json",
            name: "helper",
            agent: "Helper",
            host: "claude",
            model: undefined,
            human: { status: "loading" },
          },
        ],
      },
    })
    .please();
  const { group, execution, refinement, show, readingLaunches } =
    await mountStoryLaunches(story);
  const noted = [
    {
      action: execution,
      name: "Start execution",
      note: notReady,
      sentence: "This story is not assessed as ready.",
      glyph: "play",
    },
    {
      action: refinement,
      name: "Start refinement",
      note: "Being prepared",
      sentence: "This story is being prepared.",
      glyph: "pencil-line",
    },
  ];
  for (const { action, name, note, sentence, glyph } of noted) {
    await expect.element(action).toBeEnabled();
    await expect.element(action).toHaveAccessibleName(name);
    await expect.element(action).toHaveAccessibleDescription(note);
    const text = group.getByText(note, { exact: true });
    await expect.element(text).not.toBeVisible();
    await userEvent.hover(action);
    await expect.element(text).toBeVisible();
    await expect.element(text).toBeInViewport({ ratio: 1 });
    const tooltip = text.element().parentElement;
    expect(tooltip?.classList.contains("frame-tooltip")).toBe(true);
    expect(tooltip?.getAttribute("aria-hidden")).toBe("true");
    await userEvent.unhover(action);
    await expect.element(text).not.toBeVisible();
    action.element().focus();
    await userEvent.tab({ shift: true });
    await userEvent.tab();
    await expect.element(action).toHaveFocus();
    await expect.element(text).toBeVisible();
    action.element().blur();
    await expect.element(text).not.toBeVisible();
    expectGlyph(action, glyph);

    await action.click();
    const { dialog } = launchDialog(`${name} in Claude Code`);
    await expect
      .element(dialog.getByText(sentence, { exact: true }))
      .toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect.element(dialog).not.toBeInTheDocument();
    action.element().blur();
    await userEvent.unhover(action);
  }

  for (const scheme of ["light", "dark"]) {
    await emulateMedia([{ name: "prefers-color-scheme", value: scheme }]);
    await expect
      .poll(() => matchMedia(`(prefers-color-scheme: ${scheme})`).matches)
      .toBe(true);
    const enabledPaint = noted.map(({ action, glyph }) => {
      expectGlyph(action, glyph);
      const { color, borderColor } = getComputedStyle(action.element());
      return { color, borderColor };
    });
    readingLaunches();
    await expect.element(execution).toBeDisabled();
    expectGlyph(execution, "play");
    const disabledPaint = getComputedStyle(execution.element());
    for (const paint of enabledPaint) {
      expect(paint.color).not.toBe(disabledPaint.color);
      expect(paint.borderColor).not.toBe(disabledPaint.borderColor);
    }
    show(story);
    for (const { action, note } of noted) {
      await expect.element(action).toBeEnabled();
      await expect.element(action).toHaveAccessibleDescription(note);
      await expect
        .element(group.getByText(note, { exact: true }))
        .not.toBeVisible();
    }
  }
});
