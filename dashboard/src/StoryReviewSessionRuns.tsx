// A session's kept runs of commits as the review's Comparison switch
// (`./StoryReviewComparison.tsx`): one choice per run, oldest first, named by
// its commit count, last commit's subject and time. Runs are chosen by
// position, spelled as the selection's run key
// (`./useStoryReviewSelection.ts`).
import { ComparisonChoices } from "./StoryReviewComparison.tsx";
import type { StoryReview } from "./storyReviewContract.ts";
import type { SessionRunChoice } from "./sessionCommits.ts";

// The run keys an answer offers, and the one it answered.
export const sessionRunKeys = (answer: StoryReview | undefined) =>
  answer?.kind === "session-commits"
    ? Array.from(answer.commitRuns.keys(), String)
    : [];
export const answeredRunKey = (answer: StoryReview | undefined) =>
  answer?.kind === "session-commits"
    ? String(answer.commitRun)
    : answer?.selectedRun;

export const sessionRunsOf = (
  answer: StoryReview | undefined,
): readonly SessionRunChoice[] =>
  answer?.kind === "session-commits" ? answer.commitRuns : [];

export function SessionRunSwitch({
  runs,
  selected,
  onSelect,
}: {
  readonly runs: readonly SessionRunChoice[];
  readonly selected: string | undefined;
  readonly onSelect: (key: string) => void;
}) {
  return (
    <ComparisonChoices
      choices={runs.map((run, position) => ({
        key: String(position),
        label: (
          <>
            {run.commits === 1 ? "1 commit" : `${run.commits} commits`}
            {" — "}
            {run.subject}
            {" — "}
            {new Date(run.committedAt).toLocaleString()}
          </>
        ),
      }))}
      shown={selected}
      onChoose={onSelect}
    />
  );
}
