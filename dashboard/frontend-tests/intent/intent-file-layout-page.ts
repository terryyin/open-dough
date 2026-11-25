import { expect, vi } from "vitest";
import { page, userEvent, type Locator } from "vitest/browser";
import { sidebarPlacement } from "../../test-support/sidebarPlacement.ts";

export const intentPage = page.getByRole("main", {
  name: "Intent",
  exact: true,
});

const withinIntent = (selector: string) =>
  intentPage.element().querySelector<HTMLElement>(selector);

export const focus = (control: Locator) => {
  (control.element() as HTMLElement).focus();
};

export function projectView(name: "CI status" | "Optimization Candidates") {
  return intentPage
    .getByRole("tablist", { name: "Project Intent views" })
    .getByRole("tab", { name, exact: true });
}

export function fileLayout() {
  const toggle = intentPage.getByRole("button", {
    name: /^(Hide|Show) files$/,
  });
  const column = () => withinIntent(".intent-locations");
  const reading = () => withinIntent(".intent-reading");
  const browser = () => withinIntent(".intent-browser");
  const bar = () => withinIntent(".intent-page-tabbar");
  const box = (element: HTMLElement | null | undefined) => {
    if (!element) throw new Error("Intent layout part is missing");
    return element.getBoundingClientRect();
  };
  const shown = () => toggle.element().getAttribute("aria-expanded") === "true";
  const placement = () => {
    const control = toggle.query();
    return control === null ? "pending" : sidebarPlacement(control);
  };
  const settledPlacement = async () => {
    await expect.poll(placement).not.toBe("pending");
    return placement();
  };
  return {
    toggle,
    tabBar: () => box(bar()),
    reading: () => box(reading()),
    browser: () => box(browser()),
    readerVisible: () => reading()?.checkVisibility() ?? false,
    shown,
    async showsFiles(shown: boolean) {
      await expect
        .element(toggle)
        .toHaveAccessibleName(shown ? "Hide files" : "Show files");
      await expect
        .element(toggle)
        .toHaveAttribute("aria-expanded", String(shown));
      expect(column()?.id).toBe(toggle.element().getAttribute("aria-controls"));
      expect(column()?.checkVisibility()).toBe(shown);
    },
    // Files shown, whether it starts docked or as a closed drawer.
    async showFiles() {
      if ((await settledPlacement()) === "hidden") await toggle.click();
      await this.showsFiles(true);
    },
    // The reader uncovered: an open Files drawer closes, docked Files stays.
    async uncoverReader() {
      if ((await settledPlacement()) !== "drawer") return;
      await toggle.click();
      await this.showsFiles(false);
    },
    async showsFullReader() {
      await expect
        .poll(() => {
          const pane = box(reading());
          const frame = box(browser());
          return Math.max(
            Math.abs(pane.width - frame.width),
            Math.abs(pane.left - frame.left),
            Math.abs(pane.bottom - frame.bottom),
            Math.abs(pane.top - frame.top),
          );
        })
        .toBeLessThanOrEqual(1);
    },
    async scrollFilesHalfway() {
      const list = column();
      if (!list) throw new Error("Intent shows no files column");
      list.scrollTop = Math.floor((list.scrollHeight - list.clientHeight) / 2);
      await vi.waitUntil(() => list.scrollTop > 20);
      return list.scrollTop;
    },
    fileScroll: () => column()?.scrollTop ?? 0,
  };
}

export async function controlsFit(...controls: Locator[]) {
  for (const control of controls) {
    await expect.element(control).toBeVisible();
    const bounds = control.element().getBoundingClientRect();
    expect(bounds.left).toBeGreaterThanOrEqual(0);
    expect(bounds.right).toBeLessThanOrEqual(
      document.documentElement.clientWidth,
    );
  }
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
    window.innerWidth,
  );
}

export async function toggleFilesFromKeyboard(after: Locator) {
  const files = fileLayout();
  await expect.element(after).toBeVisible();
  const shown = files.shown();
  focus(after);
  await userEvent.keyboard("{Tab}");
  await expect.element(files.toggle).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  await files.showsFiles(!shown);
  await expect.element(files.toggle).toHaveFocus();
}
