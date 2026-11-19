// One review read: the reviewed subject and, when it names more, which
// comparison. The page builds its review query from this shape and the
// boundary parses the query back into it.
import {
  reviewedWorkQuery,
  type ReviewedWorkSubject,
} from "./reviewedWorkSubject.ts";

export interface StoryReviewRead {
  readonly subject: ReviewedWorkSubject;
  // A retained run key: a story's landed run or a session's kept comparison.
  readonly run?: string;
  // A story launch's reporting reference.
  readonly reference?: string;
  // Delegate the story's default to its authoritative completion.
  readonly completed?: boolean;
  // Read the completed story's published historical comparison.
  readonly historical?: boolean;
}

export function storyReviewQuery(
  read: StoryReviewRead,
): Record<string, string> {
  return {
    ...reviewedWorkQuery(read.subject),
    ...(read.reference === undefined ? {} : { reference: read.reference }),
    ...(read.run === undefined ? {} : { run: read.run }),
    ...(read.completed === true ? { completed: "true" } : {}),
    ...(read.historical === true ? { historical: "true" } : {}),
  };
}
