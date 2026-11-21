import { expect, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { ReviewSource } from "../../src/reviewSource.ts";
import type { WorkEntry } from "../../src/publishedWork.ts";
import {
  sidebarKey,
  withClosedSessionsSidebar,
  withFramePreference,
} from "../../test-support/component-mount/framePreferences.ts";
import { browserSession } from "../review/browser-session.ts";
import { reviewFiles } from "../review/story-review-files-view.ts";
import { reviewSourceAnswering } from "../review/story-review-panel-page.ts";
import { mountBoard } from "./board-mount.ts";
import { boardReading, center } from "./board-reading-page.ts";
import { boardWork, story } from "./board-work.ts";

export const wide = { width: 1440, height: 900 };
export const narrow = { width: 420, height: 900 };
export const minimum = 320;
export const keyStep = 32;
export const widthKey = "open-dough.sidePanel.width";
export { sidebarKey };

const reviewed = story("Inspect the chosen width", 59);

export const panel = page.getByRole("region", {
  name: "Story review",
  exact: true,
});
export const divider = panel.getByRole("separator", {
  name: "Panel divider",
  exact: true,
});
export const banner = page.getByRole("banner");
export const sidebar = page.getByRole("complementary", {
  name: "Sessions sidebar",
});
export const sessions = page.getByRole("button", { name: /^Sessions\b/ });
export const button = (name: string) =>
  panel.getByRole("button", { name, exact: true });
export const files = reviewFiles(panel);

export async function openReview() {
  const taken = boardReading.column("Taken");
  const action = taken.getByRole("button", {
    name: "Review changes",
    exact: true,
  });
  await expect.element(action).toBeInTheDocument();
  const control = action.element();
  if (!(control instanceof HTMLElement))
    throw new Error("Review changes is not focusable.");
  control.focus();
  await userEvent.keyboard("{Enter}");
  await expect
    .element(panel.getByRole("heading", { level: 2, name: reviewed.title }))
    .toBeVisible();
}

export async function mountWidthReview(
  viewport = wide,
  backlog: readonly WorkEntry[] = [],
) {
  const snapshot = makeMe.aStoryReview
    .adding("story.txt")
    .modifying("unstaged.txt")
    .please();
  const record = makeMe.aLaunchRecord
    .executing(reviewed)
    .onStoryBranch({ workspace: "/tmp/review-width", branch: "claude/width" })
    .inClaudeSession({ sessionId: "width-review", shortId: "width-rev" })
    .please();
  const { records } = makeMe.aMachineAnswer.observingOpen(record).please();
  const review = vi.fn<ReviewSource["review"]>().mockResolvedValue(snapshot);
  const fileDiff = vi
    .fn<ReviewSource["fileDiff"]>()
    .mockImplementation((query) => {
      const path = query.path ?? "story.txt";
      return Promise.resolve(
        makeMe.aReviewedFileDiff.adding(path, "more wide").please(),
      );
    });
  const frame = await mountBoard(
    [boardWork(backlog, { taken: [reviewed] })],
    viewport,
    { records, launched: records },
    {
      reviews: reviewSourceAnswering({ review, fileDiff }),
      sessionsSidebar: "kept",
    },
  );
  await expect
    .element(
      boardReading
        .column("Taken")
        .getByRole("article", { name: reviewed.title }),
    )
    .toBeInTheDocument();
  await openReview();
  return { ...frame, review, fileDiff, story: reviewed };
}

export function measured() {
  const area = document.querySelector(".page-column");
  if (area === null) throw new Error("The page has no reading column.");
  return {
    page: area.getBoundingClientRect(),
    panel: panel.element().getBoundingClientRect(),
  };
}

export async function widthIs(width: number) {
  await expect.poll(() => Math.round(measured().panel.width)).toBe(width);
  await expect.element(divider).toHaveAttribute("aria-valuenow", String(width));
  await expect
    .element(divider)
    .toHaveAttribute("aria-valuetext", `${String(width)} pixels wide`);
}

export async function covering() {
  await expect
    .poll(() => panel.element().closest(".page-covering"))
    .not.toBeNull();
  await expect.element(divider).not.toBeInTheDocument();
  await expect.element(button("Maximize")).not.toBeInTheDocument();
  await expect.element(button("Restore")).not.toBeInTheDocument();
  await expect.element(banner).not.toBeInTheDocument();
  await expect
    .element(page.getByRole("region", { name: "Board", exact: true }))
    .not.toBeInTheDocument();
}

export async function press(key: "ArrowLeft" | "ArrowRight", count = 1) {
  await userEvent.keyboard(`{${key}}`.repeat(count));
}

export function focusDivider() {
  const handle = divider.element();
  if (!(handle instanceof HTMLElement))
    throw new Error("The divider has no focusable handle.");
  handle.focus();
}

async function mouse(
  type: "mousePressed" | "mouseMoved" | "mouseReleased",
  at: { x: number; y: number },
  held: boolean,
) {
  const frame = window.frameElement?.getBoundingClientRect();
  const xScale = frame === undefined ? 1 : frame.width / innerWidth;
  const yScale = frame === undefined ? 1 : frame.height / innerHeight;
  await browserSession().send("Input.dispatchMouseEvent", {
    type,
    x: (frame?.left ?? 0) + at.x * xScale,
    y: (frame?.top ?? 0) + at.y * yScale,
    button: "left",
    buttons: held ? 1 : 0,
    clickCount: type === "mouseMoved" ? 0 : 1,
  });
}

export async function drag(by: number, cancel = false) {
  await expect.element(divider).toBeVisible();
  const handle = divider.element();
  const from = center(handle);
  expect(document.elementFromPoint(from.x, from.y)).toBe(handle);
  await mouse("mouseMoved", from, false);
  await mouse("mousePressed", from, true);
  if (cancel)
    handle.dispatchEvent(
      new PointerEvent("pointercancel", { bubbles: true, pointerId: 1 }),
    );
  const to = {
    x: Math.max(1, Math.min(innerWidth - 1, from.x + by)),
    y: from.y,
  };
  await mouse("mouseMoved", to, true);
  await mouse("mouseReleased", to, false);
  return to;
}

export async function movePointer(at: { x: number; y: number }) {
  await mouse("mouseMoved", at, false);
}

export function withWidthStorage() {
  withFramePreference(widthKey, null);
  withClosedSessionsSidebar();
}
