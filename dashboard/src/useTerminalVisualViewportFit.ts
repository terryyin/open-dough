// Fits the Side panel terminal to the browser visual viewport so a soft
// keyboard open/close or orientation change keeps the screen, toolbar, and
// composer in the visible area without detaching. Coarse-pointer only; fine
// pointer keeps the ordinary 100dvh panel height (ADR 0008 presentation).

import { useLayoutEffect, type RefObject } from "react";

const coarsePointer = "(any-pointer: coarse)";

function syncTerminalPanelToVisualViewport(panel: HTMLElement) {
  const visible = window.visualViewport;
  if (visible === null || !window.matchMedia(coarsePointer).matches) {
    panel.style.removeProperty("--side-panel-height");
    panel.style.removeProperty("top");
    return;
  }
  panel.style.setProperty(
    "--side-panel-height",
    `${Math.round(visible.height)}px`,
  );
  panel.style.setProperty("top", `${Math.round(visible.offsetTop)}px`);
}

export function useTerminalVisualViewportFit(
  panel: RefObject<HTMLElement | null>,
) {
  useLayoutEffect(() => {
    const element = panel.current;
    if (element === null) return;
    const sync = () => {
      syncTerminalPanelToVisualViewport(element);
    };
    sync();
    const visible = window.visualViewport;
    visible?.addEventListener("resize", sync);
    visible?.addEventListener("scroll", sync);
    window.addEventListener("resize", sync);
    const media = window.matchMedia(coarsePointer);
    media.addEventListener("change", sync);
    return () => {
      visible?.removeEventListener("resize", sync);
      visible?.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      media.removeEventListener("change", sync);
      element.style.removeProperty("--side-panel-height");
      element.style.removeProperty("top");
    };
  }, [panel]);
}
