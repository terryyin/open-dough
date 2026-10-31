import { useEffect } from "react";

// The Board's scrolling viewport, below the banner. The agent roster and the
// Intent perspective use the same available room when they replace the Board.
export const boardScrollRegion = () =>
  document.querySelector<HTMLElement>(".board-scroll");

export function readingBounds(element: Element) {
  const region = element.closest<HTMLElement>(".board-scroll, .roster-scroll");
  const at = region?.getBoundingClientRect();
  const padding = getComputedStyle(region ?? document.documentElement);
  return {
    top: (at?.top ?? 0) + (Number.parseFloat(padding.scrollPaddingTop) || 0),
    bottom:
      (at?.bottom ?? innerHeight) -
      (Number.parseFloat(padding.scrollPaddingBottom) || 0),
    left: at?.left ?? 0,
    right: at?.right ?? innerWidth,
  };
}

// With no control focused, reading keys belong to the visible Board, roster
// or Intent perspective.
// Focus it before the browser's default action so native scrolling still
// owns the key, just as when focus already lies inside this region.
export function useBoardScrolling(suspended: boolean) {
  useEffect(() => {
    if (suspended) return;
    const read = (event: KeyboardEvent) => {
      // Hand native document-reading commands to the region. The browser
      // keeps its platform's default handling; no scrolling is synthesized.
      const command =
        !event.shiftKey &&
        ((event.metaKey &&
          !event.ctrlKey &&
          (event.key === "ArrowUp" || event.key === "ArrowDown")) ||
          (event.ctrlKey &&
            !event.metaKey &&
            (event.key === "Home" || event.key === "End")));
      if (
        event.target !== document.body ||
        event.defaultPrevented ||
        ((event.metaKey || event.ctrlKey) && !command) ||
        event.altKey ||
        ![
          "ArrowUp",
          "ArrowDown",
          "PageUp",
          "PageDown",
          "Home",
          "End",
          " ",
        ].includes(event.key) ||
        document.querySelector("dialog[open], .page-maximized")
      )
        return;
      document
        .querySelector<HTMLElement>(
          ".board-scroll .board, .roster-scroll h2, .intent-scroll h2",
        )
        ?.focus({ preventScroll: true });
    };
    window.addEventListener("keydown", read);
    return () => {
      window.removeEventListener("keydown", read);
    };
  }, [suspended]);
}
