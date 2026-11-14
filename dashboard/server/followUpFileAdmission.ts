// Admit a done story's optional file anchor for follow-up: the historical
// comparison review file reads already check, then that a named line exists
// on its side in that comparison's file text.
import { textLines } from "../src/diffContextExpansion.ts";
import type { FollowUpFile } from "../src/followUpRequest.ts";
import type { FollowUpFileFacts } from "../src/followUpContext.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { admitHistoricalReviewedFile } from "./storyReviewHistoricalFileAdmission.ts";
import { textAtTree } from "./storyReviewFileText.ts";

const lineMissing = () =>
  new RefusedRequest(
    409,
    "The line or side does not belong to this comparison.",
  );

async function admitLineOnSide(
  repository: string,
  file: FollowUpFile,
): Promise<void> {
  if (file.line === undefined || file.side === undefined) return;
  const side =
    file.side === "old"
      ? await textAtTree(
          repository,
          file.baseline,
          file.oldPath ?? file.path,
          AbortSignal.timeout(30_000),
        )
      : await textAtTree(
          repository,
          file.tree,
          file.path,
          AbortSignal.timeout(30_000),
        );
  if (side.kind !== "text") throw lineMissing();
  if (file.line > textLines(side.text).length) throw lineMissing();
}

// Validate the file against the Done story's comparison and optional line.
export async function admitFollowUpFile(
  source: PublishedSource,
  identity: string,
  file: FollowUpFile,
): Promise<FollowUpFileFacts> {
  const fields = {
    source,
    identity,
    baseline: file.baseline,
    tree: file.tree,
    path: file.path,
    ...(file.oldPath === undefined ? {} : { oldPath: file.oldPath }),
  };
  const admitted =
    file.completion !== undefined
      ? await admitHistoricalReviewedFile({
          ...fields,
          completion: file.completion,
        })
      : file.reference !== undefined
        ? await admitHistoricalReviewedFile({
            ...fields,
            reference: file.reference,
          })
        : (() => {
            throw new RefusedRequest(
              400,
              "The follow-up file anchor is malformed.",
            );
          })();
  await admitLineOnSide(admitted.repository, file);
  return {
    path: file.path,
    ...(file.oldPath === undefined ? {} : { oldPath: file.oldPath }),
    kind: file.completion !== undefined ? "published" : "landed",
    baseline: file.baseline,
    tree: file.tree,
    ...(file.line === undefined || file.side === undefined
      ? {}
      : { line: file.line, side: file.side }),
  };
}
