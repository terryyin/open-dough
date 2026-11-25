import { expect, vi } from "vitest";
import { page, userEvent, type Locator } from "vitest/browser";

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
  return {
    toggle,
    tabBar: () => box(bar()),
    reading: () => box(reading()),
    browser: () => box(browser()),
    readerVisible: () => reading()?.checkVisibility() ?? false,
    shown: () => toggle.element().getAttribute("aria-expanded") === "true",
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
  focus(after);
  await userEvent.keyboard("{Tab}");
  await expect.element(files.toggle).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  await files.showsFiles(false);
  await expect.element(files.toggle).toHaveFocus();
}
