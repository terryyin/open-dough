// Placement of the terminal agent portrait preview within its panel and window.

import { useLayoutEffect, type RefObject } from "react";

// Only the terminal's preview uses the intersection of its panel and viewport.
// Leave roster and card portrait placement intact, including gesture layers.
export function usePortraitPreview(identity: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const target = identity.current;
    if (!target) return;
    const place = () => {
      const portrait = target.querySelector<HTMLElement>(
        ".agent-portrait:hover",
      );
      const panel = target.closest(".side-panel");
      if (!portrait || !panel) return;
      const anchor = portrait.getBoundingClientRect();
      const bounds = panel.getBoundingClientRect();
      const margin = 8;
      const left = Math.max(0, bounds.left) + margin;
      const right =
        Math.min(document.documentElement.clientWidth, bounds.right) - margin;
      const top = Math.max(0, bounds.top) + margin;
      const bottom = Math.min(window.innerHeight, bounds.bottom) - margin;
      const size = Math.max(
        0,
        Math.min(anchor.width * 3, right - left, bottom - top),
      );
      const x = Math.max(
        left,
        Math.min(anchor.left + (anchor.width - size) / 2, right - size),
      );
      const preferredY =
        anchor.top - margin - size >= top
          ? anchor.top - margin - size
          : anchor.bottom + margin;
      const y = Math.max(top, Math.min(preferredY, bottom - size));
      portrait.style.setProperty(
        "--terminal-preview-left",
        `${x - anchor.left - portrait.clientLeft}px`,
      );
      portrait.style.setProperty(
        "--terminal-preview-top",
        `${y - anchor.top - portrait.clientTop}px`,
      );
      portrait.style.setProperty("--terminal-preview-size", `${size}px`);
    };
    target.addEventListener("pointerover", place);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      target.removeEventListener("pointerover", place);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [identity]);
}
