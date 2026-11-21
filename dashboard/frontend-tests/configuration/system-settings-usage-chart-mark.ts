// Read the geometry and paint of the real Usage chart's SVG marks.
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
