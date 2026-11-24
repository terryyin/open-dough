// Read the default comparison and retain explicit recorded choices on refresh.
import { type StoryReview } from "./storyReviewContract.ts";
import type { ComparisonChoice } from "./StoryReviewComparison.tsx";
import { useReviewRead } from "./useReviewRead.ts";
import { useStateKeyedBy } from "./stateKeyedBy.ts";
import { preferredReviewRun } from "./storyReviewLandedRun.ts";
import { publishedRangeKeys } from "./StoryReviewSessionRuns.tsx";
import type { ReviewedWorkSubject } from "./reviewedWorkSubject.ts";
import { storyReviewQuery } from "./storyReviewRead.ts";
import { unreadReview } from "./StoryReviewFeedback.tsx";

export function useStoryReviewSelection({
  subject,
  round,
  completed = false,
  taken = false,
  enabled = true,
  historical: historicalComparison = false,
  keyedBy,
  followsDefault = false,
}: {
  readonly subject: ReviewedWorkSubject;
  readonly round: number;
  readonly completed?: boolean | undefined;
  readonly taken?: boolean;
  // A disabled selection reads nothing.
  readonly enabled?: boolean;
  // Retain explicit historical requests during the landing transition.
  readonly historical?: boolean | undefined;
  // A changed key drops the choice, so the selection opens on its default.
  readonly keyedBy?: string | undefined;
  // Until a run is chosen, each newer default answer's run is followed.
  readonly followsDefault?: boolean;
}) {
  const defaultRead = useReviewRead(
    "review",
    storyReviewQuery({
      subject,
      completed,
      taken,
      historical: historicalComparison,
    }),
    { round, enabled },
  );
  const {
    value: selection,
    set: setSelection,
    keyed,
  } = useStateKeyedBy<{
    of: StoryReview | undefined;
    run?: string;
    // Whether the developer chose the run.
    explicit?: boolean;
  }>({ of: undefined }, keyedBy);
  const answer = defaultRead.answer;
  const runs = answer?.runs ?? [];
  // A published session’s ranges are chosen by position, landed runs by key.
  const ranges =
    answer?.kind === "published-session" ? (answer.ranges ?? 1) : 0;
  const keys = [...runs.map((run) => run.key), ...publishedRangeKeys(ranges)];
  const answered = answer?.selectedRun;
  if (
    keyed &&
    !defaultRead.reading &&
    defaultRead.problem !== undefined &&
    selection.run !== undefined
  )
    setSelection({ of: undefined });
  if (
    keyed &&
    answer !== undefined &&
    answer !== selection.of &&
    !defaultRead.reading
  ) {
    const fallback = preferredReviewRun(runs, (run) => run.comparison);
    // Follow the default until a run is chosen.
    const run =
      selection.run === undefined || (followsDefault && !selection.explicit)
        ? answered
        : !keys.includes(selection.run)
          ? (fallback?.key ?? answered)
          : selection.run;
    setSelection({
      of: answer,
      ...(run === undefined ? {} : { run }),
      ...(selection.explicit === true ? { explicit: true } : {}),
    });
  }
  const selectedRun = runs.find((run) => run.key === selection.run);
  const readsSelectedRun =
    selection.run !== undefined && answered !== selection.run;
  const runRead = useReviewRead(
    "review",
    storyReviewQuery({ subject, run: selection.run ?? "" }),
    {
      round,
      enabled: enabled && readsSelectedRun,
    },
  );
  const review = !readsSelectedRun
    ? answer
    : runRead.answer?.selectedRun === selection.run
      ? runRead.answer
      : undefined;
  const onRun = (run: string) => {
    setSelection({
      of: answer,
      run,
      explicit: true,
    });
  };
  return {
    // The default answer, whatever run is chosen.
    defaultReview: answer,
    review,
    runs,
    selectedRun,
    runKey: selection.run,
    published: answer?.kind === "published" ? answer : undefined,
    reading: defaultRead.reading || runRead.reading,
    problem: !readsSelectedRun
      ? defaultRead.problem
      : runRead.reading
        ? undefined
        : runRead.problem,
    // Why a chosen run other than the default answer's own holds no
    // comparison, once its read settles.
    runUnread: readsSelectedRun ? unreadReview(runRead) : undefined,
    onRun,
    // The published completion returns to the default answer.
    onChoose: (choice: ComparisonChoice) => {
      if (choice === "published") setSelection({ of: answer });
      else {
        const newest = preferredReviewRun(runs, (run) => run.comparison);
        if (newest !== undefined) onRun(newest.key);
      }
    },
  };
}
