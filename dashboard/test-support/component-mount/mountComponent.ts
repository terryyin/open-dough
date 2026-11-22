// Mounts one production component in a Vitest browser-mode case, with the dashboard's styles, as the page would hold
// it: at an optional viewport size, and optionally filling that viewport as
// a column, as the page frame gives a perspective its space. `rerender` gives
// the same component new inputs. The case's end unmounts it and restores the
// viewport. What the component needs around it is the caller's element.
import type { ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { onTestFinished } from "vitest";
import { page } from "vitest/browser";
import "../../src/dashboardStyles.ts";

export async function mountComponent(
  element: ReactElement,
  options: {
    readonly viewport?: { readonly width: number; readonly height: number };
    readonly fillsViewport?: boolean;
  } = {},
) {
  const { viewport, fillsViewport = false } = options;
  const [width, height] = [window.innerWidth, window.innerHeight];
  if (viewport !== undefined)
    await page.viewport(viewport.width, viewport.height);
  const host = document.body.appendChild(document.createElement("div"));
  if (fillsViewport)
    Object.assign(host.style, {
      display: "flex",
      flexDirection: "column",
      height: "100dvh",
    });
  const root = createRoot(host);
  onTestFinished(async () => {
    root.unmount();
    host.remove();
    if (viewport !== undefined) await page.viewport(width, height);
  });
  root.render(element);
  return {
    rerender: (next: ReactElement) => {
      root.render(next);
    },
  };
}
