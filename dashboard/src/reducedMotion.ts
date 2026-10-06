// Whether the developer asked for reduced motion, where the page moves at
// once instead of scrolling or sliding there.
export const prefersReducedMotion = (): boolean =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
