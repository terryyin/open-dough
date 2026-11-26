// Admit a story follow-up file using the historical or published-session
// comparison file read, then check that a named line exists
// on its side in that comparison's file text.
import { textLines } from "../src/diffContextExpansion.ts";
import type { FollowUpFile } from "../src/followUpRequest.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { admitPublishedSessionFile } from "./publishedSessionReview.ts";
import { lastSyncedPublishedSessionSource } from "./publishedSessionSource.ts";
import {
  admissionBound,
  admitHistoricalReviewedFile,
} from "./storyReviewHistoricalFileAdmission.ts";
import { textAtTree } from "./gitTreeFiles.ts";

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

// Validate the file against the pinned comparison and optional line.
export async function admitFollowUpFile(
  source: PublishedSource,
  identity: string,
  file: FollowUpFile,
): Promise<void> {
  const { completion, reference, published, baseline, tree, path, oldPath } =
    file;
  const fields = {
    baseline,
    tree,
    path,
    ...(oldPath === undefined ? {} : { oldPath }),
  };
  if (published !== undefined) {
    const project = await lastSyncedPublishedSessionSource(
      source,
      admissionBound(),
    );
    const admitted = await admitPublishedSessionFile(
      project,
      published,
      fields,
      new Date(),
      admissionBound(),
      identity,
    );
    return admitLineOnSide(admitted.repository, file);
  }
  const comparison =
    completion !== undefined
      ? { completion }
      : reference !== undefined
        ? { reference }
        : undefined;
  if (comparison === undefined)
    throw new RefusedRequest(400, "The follow-up file anchor is malformed.");
  const admitted = await admitHistoricalReviewedFile({
    ...fields,
    ...comparison,
    source,
    identity,
  });
  return admitLineOnSide(admitted.repository, file);
}
