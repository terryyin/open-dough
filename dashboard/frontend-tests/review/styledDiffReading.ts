import { createElement, type Attributes, type ComponentProps } from "react";
import { PageReadsOnPage } from "../../src/pageReads.tsx";
import { StyledFileDiff } from "../../src/StyledFileDiff.tsx";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";

type ReaderProps = ComponentProps<typeof StyledFileDiff>;

// The styled diff on the page, highlighting through the page's highlighter.
export function styledDiffReading(
  props: Omit<ReaderProps, "contextReading" | "onRetryText"> & Attributes,
) {
  const { key, ...diff } = props;
  return createElement(
    PageReadsOnPage,
    { key, reads: pageReadsSupplying({}) },
    createElement(StyledFileDiff, {
      contextReading: false,
      onRetryText: () => {},
      ...diff,
    }),
  );
}
