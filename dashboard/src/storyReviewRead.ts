// One review read: the reviewed subject and, when it names more, which
// comparison. The page builds its review query from this shape and the
// boundary parses the query back into it. Session handler inputs use the
// published session read names the owning story and the selected range.
import {
  reviewedWorkQuery,
  type ReviewedPublishedSessionSubject,
  type ReviewedWorkSubject,
} from "./reviewedWorkSubject.ts";

export interface StoryReviewRead {
  readonly subject: ReviewedWorkSubject;
  // A retained run key: a story's landed run or a session's kept comparison.
  readonly run?: string;
  // A story launch's reporting reference.
  readonly reference?: string;
  // Resolve a story selected from the published Taken list.
  readonly taken?: boolean;
  // Delegate the story's default to its authoritative completion.
  readonly completed?: boolean;
  // Read the completed story's published historical comparison.
  readonly historical?: boolean;
  // The story pane can follow an owned sync, then resume its exact read.
  readonly initialSync?: true | string;
}

// What a published session review reads: its subject and, for a record of
// several ranges, the selected range's position.
export interface PublishedSessionReviewRead {
  readonly subject: ReviewedPublishedSessionSubject;
  readonly run?: string;
}

export function storyReviewQuery(
  read: StoryReviewRead,
): Record<string, string> {
  return {
    ...reviewedWorkQuery(read.subject),
    ...(read.reference === undefined ? {} : { reference: read.reference }),
    ...(read.run === undefined ? {} : { run: read.run }),
    ...(read.taken === true ? { taken: "true" } : {}),
    ...(read.completed === true ? { completed: "true" } : {}),
    ...(read.historical === true ? { historical: "true" } : {}),
    ...(read.initialSync === undefined
      ? {}
      : { initialSync: String(read.initialSync) }),
  };
}
