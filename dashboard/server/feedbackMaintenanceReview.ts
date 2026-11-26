// Reads the feedback watch list at the revision named by the project's ref,
// using the authenticated GitHub boundary and its read diagnostics.
import {
  feedbackWatchListPath,
  readFeedbackReview,
  type FeedbackReview,
} from "../src/feedbackReview.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { isNotFound } from "./ghFailure.ts";
import { resolveRevisionViaGh } from "./ghRevision.ts";
import { PinnedTexts } from "./pinnedTexts.ts";
import { withReadDiagnosticContext } from "./readDiagnostics.ts";
import { RetainedAnswers } from "./retainedAnswers.ts";
import { RevisionMemo } from "./revisionMemo.ts";

// The watch list's review at a project's current revision, `unread` when a
// read failed.
export type ReviewRead = (
  source: PublishedSource,
  signal: AbortSignal,
) => Promise<FeedbackReview | { readonly kind: "unread" }>;

// Reads the review through `gh` at the ref's current revision, remembering
// the text read there.
export function publishedReview(): ReviewRead {
  const pinned = new PinnedTexts(new RevisionMemo(new RetainedAnswers()));
  return async (source, signal) => {
    let revision: string;
    try {
      ({ revision } = await withReadDiagnosticContext(
        { source: source.id, category: "ref" },
        () => resolveRevisionViaGh(source.repository, source.ref, signal),
      ));
    } catch {
      return { kind: "unread" };
    }
    try {
      return readFeedbackReview(
        await withReadDiagnosticContext(
          { source: source.id, category: "content", pin: revision },
          () =>
            pinned.namedRevisionText(
              source,
              revision,
              feedbackWatchListPath,
              signal,
            ),
        ),
      );
    } catch (error) {
      return isNotFound(error) ? { kind: "absent" } : { kind: "unread" };
    }
  };
}
