// Intent `syntax` hint for a story-review file diff when the path names no
// grammar: locations at the review's pinned settings revision
// (`./authenticatedIntentRead.ts`), then the shared path hint
// (`./intentSelectionCoverage.ts`). Missing or failed locations leave the
// hint unset so language stays path-only / plain.

import { useEffect, useState } from "react";
import {
  keptIntentLocationsAt,
  readIntentLocationsAt,
  type IntentLocations,
} from "./authenticatedIntentRead.ts";
import { syntaxHintOfRepositoryPath } from "./intentSelectionCoverage.ts";
import { useIntentReads } from "./pageReads.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import type { StoryReview } from "./storyReviewContract.ts";

// Settings revision that pins Intent locations for language fallback.
export function reviewIntentSettingsRevision(
  review: StoryReview | undefined,
): string | undefined {
  if (review?.kind === "published") return review.completion;
  if (review?.kind === "published-taken") return review.head;
  if (review?.kind === "landed") return review.landing.revision;
  return undefined;
}

export function useReviewDiffSyntaxHint(
  source: PublishedSource | undefined,
  revision: string | undefined,
  path: string,
): string | undefined {
  const kept =
    source !== undefined && revision !== undefined
      ? keptIntentLocationsAt(source, revision)
      : undefined;
  const { readLocations } = useIntentReads();
  const [read, setRead] = useState<IntentLocations | undefined>(kept);
  useEffect(() => {
    if (source === undefined || revision === undefined) {
      setRead(undefined);
      return;
    }
    const already = keptIntentLocationsAt(source, revision);
    if (already !== undefined) {
      setRead(already);
      return;
    }
    const controller = new AbortController();
    setRead(undefined);
    void readIntentLocationsAt(
      source,
      revision,
      controller.signal,
      readLocations,
    )
      .then((answer) => {
        if (!controller.signal.aborted) setRead(answer);
      })
      .catch(() => {
        if (!controller.signal.aborted) setRead(undefined);
      });
    return () => {
      controller.abort();
    };
  }, [source, revision, readLocations]);
  const intent = kept ?? read;
  if (intent === undefined || intent.status !== "configured") return undefined;
  return syntaxHintOfRepositoryPath(path, intent.locations);
}
