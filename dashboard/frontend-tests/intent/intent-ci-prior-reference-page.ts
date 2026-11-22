// The compact prior-build readout every timing history shares
// (../../src/IntentCiPriorBuildReference.tsx) within a history REGION, as a
// reader meets it: the selected timing or its status, the prior-build
// average with its count, the signed change shown only when both are usable,
// and the cue colour painting the change figure.
import type { Locator } from "vitest/browser";
import { tokenColour } from "../configuration/system-settings-reading.ts";
import { visibleText } from "./intent-ci-comparison-page.ts";

const textOf = (node: Element | null | undefined) =>
  node === null || node === undefined ? undefined : visibleText(node);

export function priorReferenceIn(region: Locator) {
  const readout = () =>
    region.element().querySelector(".intent-ci-prior-reference");
  const line = (index: number) => () =>
    textOf(readout()?.querySelectorAll(":scope > p")[index]);
  return {
    selected: line(0),
    average: line(1),
    change: () => textOf(readout()?.querySelector(".intent-ci-prior-change")),
    // Which cue colour paints the change figure.
    changeCue: () => {
      const figure = readout()?.querySelector(".intent-ci-prior-change strong");
      if (figure === null || figure === undefined) return undefined;
      const { color } = getComputedStyle(figure);
      return (
        (["slower", "faster"] as const).find(
          (direction) =>
            color === tokenColour(region.element(), `--ci-cue-${direction}`),
        ) ?? "uncued"
      );
    },
  };
}
