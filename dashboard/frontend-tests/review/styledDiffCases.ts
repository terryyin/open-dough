import type { ReviewedFileText } from "../../src/storyReviewContract.ts";

export function printedDiff(
  path: string,
  lines: readonly string[],
  oldPath = path,
) {
  return [
    `diff --git a/${oldPath} b/${path}`,
    ...(oldPath === path
      ? []
      : [`rename from ${oldPath}`, `rename to ${path}`]),
    `--- a/${oldPath}`,
    `+++ b/${path}`,
    ...lines,
    "",
  ].join("\n");
}

export function addedLineDiff(path: string, code: string, oldPath?: string) {
  const text = {
    kind: "text",
    baseline: oldPath === undefined ? null : "",
    tree: `${code}\n`,
  } as const satisfies ReviewedFileText;
  return {
    path,
    printed: printedDiff(path, ["@@ -0,0 +1 @@", `+${code}`], oldPath),
    text,
  };
}
