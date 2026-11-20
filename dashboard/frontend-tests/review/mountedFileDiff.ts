import { createElement, type Attributes, type ComponentProps } from "react";
import { StyledFileDiff } from "../../src/StyledFileDiff.tsx";

type ReaderProps = ComponentProps<typeof StyledFileDiff>;

export function styledDiffReading(
  props: Omit<ReaderProps, "contextReading" | "onRetryText"> & Attributes,
) {
  return createElement(StyledFileDiff, {
    contextReading: false,
    onRetryText: () => {},
    ...props,
  });
}
