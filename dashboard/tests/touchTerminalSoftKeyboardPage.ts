// Soft-keyboard stand-in and observation for the Side panel terminal: shrink
// visualViewport relative to the layout viewport, locate Hide keyboard, and
// assert chrome stays in the visible area.
import type { Locator, Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";

// Soft-keyboard stand-in: shrink visualViewport relative to the layout
// viewport and notify listeners via window resize (the fit hook re-reads
// window.visualViewport on that signal).
export async function simulateSoftKeyboardViewport(
  page: Page,
  visibleHeight: number,
  offsetTop = 0,
) {
  await page.evaluate(
    ({ height, offsetTop: top }) => {
      const real =
        (Reflect.get(window, "__doughRealVisualViewport") as
          VisualViewport | null | undefined) ?? window.visualViewport;
      Reflect.set(window, "__doughRealVisualViewport", real);
      const state = {
        height,
        offsetTop: top,
      };
      Reflect.set(window, "__doughSoftKeyboardViewport", state);
      if (Reflect.get(window, "__doughSoftKeyboardViewportPatched") !== true) {
        const fake = {
          get width() {
            return real?.width ?? innerWidth;
          },
          get height() {
            return state.height;
          },
          get offsetTop() {
            return state.offsetTop;
          },
          get offsetLeft() {
            return 0;
          },
          get pageTop() {
            return state.offsetTop;
          },
          get pageLeft() {
            return 0;
          },
          get scale() {
            return real?.scale ?? 1;
          },
          addEventListener(
            type: string,
            listener: EventListenerOrEventListenerObject,
            options?: boolean | AddEventListenerOptions,
          ) {
            real?.addEventListener(type, listener, options);
          },
          removeEventListener(
            type: string,
            listener: EventListenerOrEventListenerObject,
            options?: boolean | EventListenerOptions,
          ) {
            real?.removeEventListener(type, listener, options);
          },
          dispatchEvent(event: Event) {
            return real?.dispatchEvent(event) ?? true;
          },
        };
        Object.defineProperty(window, "visualViewport", {
          configurable: true,
          get() {
            return fake;
          },
        });
        Reflect.set(window, "__doughSoftKeyboardViewportPatched", true);
      }
      window.dispatchEvent(new Event("resize"));
    },
    { height: visibleHeight, offsetTop },
  );
}

export async function clearSoftKeyboardViewport(page: Page) {
  await page.evaluate(() => {
    const real = Reflect.get(window, "__doughRealVisualViewport") as
      VisualViewport | null | undefined;
    if (Reflect.get(window, "__doughSoftKeyboardViewportPatched") === true) {
      Object.defineProperty(window, "visualViewport", {
        configurable: true,
        get() {
          return real ?? null;
        },
      });
      Reflect.deleteProperty(window, "__doughSoftKeyboardViewportPatched");
      Reflect.deleteProperty(window, "__doughSoftKeyboardViewport");
    }
    window.dispatchEvent(new Event("resize"));
  });
}

export function hideKeyboardControl(panel: Locator) {
  return panel.getByRole("button", { name: "Hide keyboard", exact: true });
}

export async function expectControlInVisualViewport(control: Locator) {
  expect(
    await control.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const visible = window.visualViewport;
      const top = visible?.offsetTop ?? 0;
      const bottom = top + (visible?.height ?? innerHeight);
      return (
        box.top >= top - 1 &&
        box.bottom <= bottom + 1 &&
        box.left >= -1 &&
        box.right <= (visible?.width ?? innerWidth) + 1
      );
    }),
  ).toBe(true);
}
