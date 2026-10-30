import { objectIdSchema } from "../src/storyReviewContract.ts";

// Drivers can print lines before Git's result tree. After that tree's NUL,
// conflict paths are NUL-separated because filenames may contain newlines.
export function mergeTreeOutput(stdout: string) {
  const fields = stdout.split("\0");
  for (const [index, field] of fields.entries()) {
    const tree = field
      .split("\n")
      .find((part) => objectIdSchema.safeParse(part).success);
    if (tree === undefined) continue;
    const paths = fields.slice(index + 1);
    const end = paths.indexOf("");
    return {
      tree,
      inseparable: new Set(end === -1 ? paths : paths.slice(0, end)),
    };
  }
  return undefined;
}
