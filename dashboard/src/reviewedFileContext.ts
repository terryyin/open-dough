// Facts shared by a reviewed file's reads, notes and historical Follow up.
// A workspace has no historical comparison id; notes still keep its shown facts.
import type { ReviewedFile } from "./storyReviewFiles.ts";
import type { ReviewedWork } from "./reviewedFileRead.ts";

export const reviewedFilePaths = (file: ReviewedFile) => ({
  path: file.path,
  ...(file.kind === "renamed" ? { oldPath: file.oldPath } : {}),
});

export const reviewedComparison = (reviewed: ReviewedWork) =>
  reviewed.completion !== undefined
    ? ({ kind: "published", id: reviewed.completion } as const)
    : reviewed.reference !== undefined
      ? ({ kind: "landed", id: reviewed.reference } as const)
      : undefined;
