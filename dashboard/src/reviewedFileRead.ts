// One file diff or file text read: the reviewed subject, the historical
// comparison it names when any, and the file within its pair. The page builds
// its file queries from this shape and the boundary parses them back into it.
// Session handler inputs use the narrower SessionFileRead; the page query still
// emits from ReviewedFileRead.
import {
  reviewedWorkQuery,
  type ReviewedPublishedSessionSubject,
  type ReviewedSessionSubject,
  type ReviewedWorkSubject,
} from "./reviewedWorkSubject.ts";

// The reviewed work a file read names: a story or ad hoc session, with the
// retained pair a historical comparison names.
export interface ReviewedWork {
  readonly subject: ReviewedWorkSubject;
  // A landed run's launch reference.
  readonly reference?: string;
  // A story's Published completion.
  readonly completion?: string;
  // A Taken story branch head pinned by its published comparison.
  readonly publishedHead?: string;
}

// One file within a retained pair: the trees the comparison reads between.
export interface ReviewedPairFile {
  // The tree the comparison reads from.
  readonly baseline: string;
  readonly tree: string;
  readonly path: string;
  // The path the file had at the baseline, for a rename.
  readonly oldPath?: string;
}

export interface ReviewedFileRead extends ReviewedWork, ReviewedPairFile {}

// What a session file handler reads: the session subject, optional landing
// reference, and the file within its pair — never a Published completion.
export interface SessionFileRead extends ReviewedPairFile {
  readonly subject: ReviewedSessionSubject;
  readonly reference?: string;
}

// A published session's file read: its subject and one recorded pair's file.
export interface PublishedSessionFileRead extends ReviewedPairFile {
  readonly subject: ReviewedPublishedSessionSubject;
}

export function reviewedFileQuery(
  read: ReviewedFileRead,
): Record<string, string> {
  return {
    ...reviewedWorkQuery(read.subject),
    ...(read.reference === undefined ? {} : { reference: read.reference }),
    ...(read.completion === undefined ? {} : { completion: read.completion }),
    ...(read.publishedHead === undefined
      ? {}
      : { publishedHead: read.publishedHead }),
    baseline: read.baseline,
    tree: read.tree,
    path: read.path,
    ...(read.oldPath === undefined ? {} : { oldPath: read.oldPath }),
  };
}
