// Keeps the CSS custom property `property` on `target` at `measured`'s
// rendered height, however it reflows, until `stop` removes it; `measure`
// reads the height again at once.
export function keepHeight(
  measured: Element,
  target: HTMLElement,
  property: string,
): { measure: () => void; stop: () => void } {
  const measure = () => {
    target.style.setProperty(
      property,
      `${measured.getBoundingClientRect().height}px`,
    );
  };
  measure();
  const observer = new ResizeObserver(measure);
  observer.observe(measured);
  return {
    measure,
    stop: () => {
      observer.disconnect();
      target.style.removeProperty(property);
    },
  };
}
