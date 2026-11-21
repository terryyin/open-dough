// Read the geometry and paint of the real Usage chart's SVG marks.
import {
  composeBackgrounds,
  contrastRatio,
  painted,
} from "../../test-support/composedColours.ts";

export type TraceMarks = {
  readonly task: Element | undefined;
  readonly partial: Element | undefined;
  readonly median: Element | undefined;
};

export function centreOf(element: Element) {
  const { x, y, width, height } = element.getBoundingClientRect();
  return { x: x + width / 2, y: y + height / 2 };
}

export function shapeOf(mark: Element) {
  if (mark.tagName === "circle") return "circle";
  const outline = mark.getAttribute("points") ?? mark.getAttribute("d") ?? "";
  return (outline.match(/-?[\d.]+[ ,]-?[\d.]+/g) ?? []).length;
}

export function paintOf(mark: Element) {
  const { fill, stroke, strokeDasharray } = getComputedStyle(mark);
  return { fill, stroke, strokeDasharray };
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

export function markContrast(mark: Element, colours: readonly string[]) {
  const background = backgroundBehind(mark);
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
