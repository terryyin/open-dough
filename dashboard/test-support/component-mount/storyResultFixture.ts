// Existing mounted Intent fixtures supply locations and source instead of a
// Git repository. Present those same fixture facts at the result boundary.
import type { PageReads } from "../../src/pageReads.tsx";
import type { PublishedWork } from "../../src/publishedWork.ts";
import type { StoryReviewResult } from "../../src/storyReviewResult.ts";

export function withStoryResultFixture<T extends Partial<PageReads>>(
  reads: T,
  workOf: () => PublishedWork,
): T {
  const { review, intent } = reads;
  if (
    reads.storyResult !== undefined ||
    review === undefined ||
    intent === undefined
  )
    return reads;
  const landed = new Map<string, string>();
  return {
    ...reads,
    review: {
      ...review,
      async review(...args: Parameters<typeof review.review>) {
        const answer = await review.review(...args);
        if (answer.kind === "landed")
          landed.set(answer.landing.reference, answer.landing.revision);
        return answer;
      },
    },
    async storyResult(
      query: Parameters<PageReads["storyResult"]>[0],
      signal: AbortSignal,
    ): Promise<StoryReviewResult> {
      const work = workOf();
      const { path, completion, publishedHead, reference } = query;
      const revision =
        completion ??
        publishedHead ??
        landed.get(reference ?? "") ??
        query.tree;
      if (revision === undefined)
        throw new Error("The fixture needs a result revision.");
      // These legacy Taken fixtures supply one set of published project
      // settings and text for a work snapshot. Their admitted comparison
      // is mocked separately and has no repository behind its head ID.
      const contentRevision =
        publishedHead === undefined ? revision : work.revision;
      if (path !== undefined)
        return {
          kind: "text",
          revision,
          path,
          text: await intent.readFile(
            work.source,
            path,
            contentRevision,
            signal,
          ),
        };
      const settings = await intent.readLocations(
        work.source,
        contentRevision,
        signal,
      );
      return {
        kind: "inventory",
        revision,
        paths:
          settings.status === "configured"
            ? settings.locations.flatMap(({ files }) => files)
            : [],
        locations:
          settings.status === "configured" ? [...settings.locations] : null,
        ...(settings.status === "settings-problem"
          ? { settingsProblem: settings.problem }
          : {}),
      };
    },
  };
}
