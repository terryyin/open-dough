// A Default main session's kept commits (`../src/sessionCommits.ts`) answer
// as a landing's pair does: from the saved repository's objects alone.
import type { LaunchRecord } from "../src/launchRecord.ts";
import type { StoryReview } from "../src/storyReviewContract.ts";
import { retainedPairFiles } from "./storyReviewLanded.ts";

// One kept run of a done session: its pair, where it is kept, and the
// session's launch and Done times.
export interface KeptSessionRun {
  readonly repository: string;
  readonly base: string;
  readonly revision: string;
  readonly launchedAt: string;
  readonly doneAt: string;
}

// The kept run a done session's review answers, or undefined when the record
// keeps none.
export function keptSessionRun(
  record: LaunchRecord,
): KeptSessionRun | undefined {
  const { sessionCommits, launchedAt, doneAt } = record;
  const [run] = sessionCommits?.runs ?? [];
  if (sessionCommits === undefined || run === undefined || doneAt === undefined)
    return undefined;
  return { repository: sessionCommits.repository, ...run, launchedAt, doneAt };
}

export async function sessionCommitsReview(
  { launchedAt, doneAt, ...pair }: KeptSessionRun,
  signal: AbortSignal,
): Promise<StoryReview> {
  const read = await retainedPairFiles(pair, signal);
  if ("missing" in read)
    return {
      kind: "landing-unavailable",
      explanation: {
        repository:
          "The repository that kept this session's commits is missing or unreadable.",
        objects: "This session's kept commits are missing or unreadable.",
        changes: "This session's kept changes could not be read.",
      }[read.missing],
    };
  return {
    kind: "session-commits",
    session: { launchedAt, doneAt },
    baseline: pair.base,
    tree: pair.revision,
    files: read.files,
  };
}
