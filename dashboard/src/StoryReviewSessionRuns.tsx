// A session's kept runs of commits as the review's Comparison switch
// (`./StoryReviewComparison.tsx`): one choice per run, oldest first, named by
// its commit count, last commit's subject and time. Runs are chosen by
// position, spelled as the selection's run key
// (`./useStoryReviewSelection.ts`). A published session of several recorded
// ranges is offered the same way, one choice per range in recorded order.
import { ComparisonChoices } from "./StoryReviewComparison.tsx";
import type { StoryReview } from "./storyReviewContract.ts";
import type { SessionRunChoice } from "./sessionCommits.ts";
import {
  branchResultName,
  deliveredChangesName,
  sessionBranchRun,
  sessionDeliveryRun,
  type SessionComparisonKey,
} from "./sessionReviewComparisons.ts";

// The run keys an answer offers, and the one it answered.
export const sessionRunKeys = (answer: StoryReview | undefined) =>
  answer?.sessionComparisonKeys ??
  (answer?.kind === "session-commits"
    ? Array.from(answer.commitRuns.keys(), String)
    : answer?.kind === "published-session"
      ? Array.from(Array(answer.ranges ?? 1).keys(), String)
      : []);
export const answeredRunKey = (answer: StoryReview | undefined) =>
  answer?.selectedRun ??
  (answer?.kind === "session-commits" ? String(answer.commitRun) : undefined);

export const sessionRunsOf = (
  answer: StoryReview | undefined,
): readonly SessionRunChoice[] =>
  answer?.kind === "session-commits" ? answer.commitRuns : [];

// The mixed review offers one choice for each kind of saved comparison.
const sessionComparisonNames: Readonly<Record<string, string>> = {
  [sessionBranchRun]: branchResultName,
  [sessionDeliveryRun]: deliveredChangesName,
  "0": "Default main commits",
};

const comparisonOfRun = (run: string) => (/^\d+$/.test(run) ? "0" : run);

export function sessionComparisonName(run: string | undefined) {
  return run === undefined
    ? undefined
    : sessionComparisonNames[comparisonOfRun(run)];
}

export function SessionComparisonSwitch({
  keys,
  selected,
  onSelect,
}: {
  readonly keys: readonly SessionComparisonKey[];
  readonly selected: string | undefined;
  readonly onSelect: (key: string) => void;
}) {
  return (
    <ComparisonChoices
      choices={Array.from(new Set(keys.map(comparisonOfRun)), (key) => ({
        key,
        label: sessionComparisonName(key),
      }))}
      shown={selected === undefined ? undefined : comparisonOfRun(selected)}
      onChoose={onSelect}
    />
  );
}

export function SessionRunSwitch({
  runs,
  selected,
  onSelect,
  label,
}: {
  readonly runs: readonly SessionRunChoice[];
  readonly label?: string | undefined;
  readonly selected: string | undefined;
  readonly onSelect: (key: string) => void;
}) {
  return (
    <ComparisonChoices
      {...(label === undefined ? {} : { label })}
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

// The ranges a published close record names, chosen by position.
export function PublishedRangeSwitch({
  ranges,
  selected,
  onSelect,
}: {
  readonly ranges: number;
  readonly selected: string | undefined;
  readonly onSelect: (key: string) => void;
}) {
  return (
    <ComparisonChoices
      label="Published ranges"
      choices={Array.from(Array(ranges).keys(), (position) => ({
        key: String(position),
        label: `Published range ${String(position + 1)} of ${String(ranges)}`,
      }))}
      shown={selected}
      onChoose={onSelect}
    />
  );
}
