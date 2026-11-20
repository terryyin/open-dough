// Shows a file's printed hunks immediately. When both texts are available,
// they supply omitted context and syntax tokens for each side of the diff.

import type { ComponentProps } from "react";
import { textLines } from "./diffContextExpansion.ts";
import { useDiffLineTokens } from "./diffLineTokens.ts";
import type { ReviewedFileText } from "./storyReviewContract.ts";
import { DiffLines } from "./StoryReviewDiffLines.tsx";

type StyledFileDiffProps = Omit<
  ComponentProps<typeof DiffLines>,
  "sides" | "lineTokens"
> & {
  readonly path: string;
  readonly text?: Extract<ReviewedFileText, { kind: "text" }>;
  readonly syntaxHint?: string;
};

export function StyledFileDiff({
  path,
  text,
  syntaxHint,
  textProblem,
  ...lines
}: StyledFileDiffProps) {
  const sides =
    text === undefined
      ? undefined
      : { baseline: textLines(text.baseline), tree: textLines(text.tree) };
  const lineTokens = useDiffLineTokens(path, text, syntaxHint);

  return (
    <DiffLines
      {...lines}
      sides={sides}
      lineTokens={lineTokens}
      {...(text === undefined && textProblem !== undefined
        ? { textProblem }
        : {})}
    />
  );
}
