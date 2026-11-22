import {
  composeBackgrounds,
  contrastRatio,
  painted,
} from "../../test-support/composedColours.ts";

// Playwright evaluates this probe in the page. Mounted cases call it directly.
export function clippedSettingContent(
  element: Element,
  contents: "control" | "text",
): string[] {
  let left = 0;
  let top = 0;
  let right = innerWidth;
  let bottom = innerHeight;
  for (
    let at: Element | null =
      contents === "control" ? element.parentElement : element;
    at;
    at = at.matches(":modal") ? null : at.parentElement
  ) {
    const style = getComputedStyle(at);
    const bounds = at.getBoundingClientRect();
    if (style.overflowX !== "visible") {
      left = Math.max(left, bounds.left + at.clientLeft);
      right = Math.min(right, bounds.left + at.clientLeft + at.clientWidth);
    }
    if (style.overflowY !== "visible") {
      top = Math.max(top, bounds.top + at.clientTop);
      bottom = Math.min(bottom, bounds.top + at.clientTop + at.clientHeight);
    }
  }
  const clipped = (rect: DOMRect, tolerance = 0) =>
    rect.left < left - tolerance ||
    rect.right > right + tolerance ||
    rect.top < top - tolerance ||
    rect.bottom > bottom + tolerance;
  if (contents === "control") {
    const label = element.getAttribute("aria-label") ?? element.textContent;
    return clipped(element.getBoundingClientRect(), 1) ? [label] : [];
  }

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const cut: string[] = [];
  for (let text = walker.nextNode(); text; text = walker.nextNode()) {
    if (!text.textContent?.trim()) continue;
    const range = document.createRange();
    range.selectNodeContents(text);
    for (const rect of range.getClientRects()) {
      if (clipped(rect)) cut.push(text.textContent);
    }
  }
  return cut;
}

function backgroundBehind(element: Element) {
  const backgrounds: string[] = [];
  for (
    let ancestor = element.parentElement;
    ancestor;
    ancestor = ancestor.parentElement
  )
    backgrounds.push(getComputedStyle(ancestor).backgroundColor);
  return composeBackgrounds(backgrounds);
}

export function paintContrast(element: Element, colours: readonly string[]) {
  const background = backgroundBehind(element);
  return Math.max(
    ...colours
      .filter(painted)
      .map((colour) => contrastRatio(colour, background)),
  );
}

export function tokenColour(root: Element, token: string) {
  const probe = root.appendChild(document.createElement("span"));
  probe.style.color = `var(${token})`;
  const colour = getComputedStyle(probe).color;
  probe.remove();
  return colour;
}
