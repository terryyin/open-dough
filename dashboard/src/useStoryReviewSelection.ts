// One active comparison over the server's opening answer for a story, its
// default. Refresh reconciles retained run identities; returning to the
// workspace keeps its comparison and Commits endpoints, and whether all
// changes include the workspace's uncommitted changes.
import { type StoryReview } from "./storyReviewContract.ts";
import type {
  ComparisonChoice,
  ShownComparison,
} from "./StoryReviewComparison.tsx";
import { useReviewRead } from "./useReviewRead.ts";
import { useStateKeyedBy } from "./stateKeyedBy.ts";
import { preferredReviewRun } from "./storyReviewLandedRun.ts";
import {
  answeredRunKey,
  sessionRunKeys,
  sessionRunsOf,
} from "./StoryReviewSessionRuns.tsx";
import type { ReviewedWorkSubject } from "./reviewedWorkSubject.ts";
import { storyReviewQuery } from "./storyReviewRead.ts";
import { unreadReview } from "./StoryReviewFeedback.tsx";

export function useStoryReviewSelection({
  subject,
  round,
  completed = false,
  enabled = true,
  historical: historicalComparison = false,
  keyedBy,
  followsDefault = false,
}: {
  readonly subject: ReviewedWorkSubject;
  readonly round: number;
  readonly completed?: boolean | undefined;
  // A disabled selection reads nothing.
  readonly enabled?: boolean;
  // Historical Review asks for a completed result rather than a retained workspace.
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
    workspace: ShownComparison;
  }>({ of: undefined, workspace: "all" }, keyedBy);
  const answer = defaultRead.answer;
  const snapshot = answer?.kind === "snapshot" ? answer : undefined;
  const { value: includeUncommitted, set: setIncludeUncommitted } =
    useStateKeyedBy(true, keyedBy);
  // A snapshot without uncommitted changes offers no check; the next that
  // holds some offers it on.
  if (!includeUncommitted && snapshot !== undefined && !snapshot.committed)
    setIncludeUncommitted(true);
  const runs = answer?.runs ?? [];
  // A session's kept runs are chosen by position; landed runs by their key.
  const keys = [...runs.map((run) => run.key), ...sessionRunKeys(answer)];
  const answered = answeredRunKey(answer);
  if (
    keyed &&
    !defaultRead.reading &&
    defaultRead.problem !== undefined &&
    selection.run !== undefined
  )
    setSelection({ of: undefined, workspace: selection.workspace });
  if (
    keyed &&
    answer !== undefined &&
    answer !== selection.of &&
    !defaultRead.reading
  ) {
    const fallback = preferredReviewRun(runs, (run) => run.comparison);
    // A first answer, or a workspace choice whose workspace is gone, follows
    // the run the answer opened on.
    const run =
      selection.run === undefined || (followsDefault && !selection.explicit)
        ? answered
        : !keys.includes(selection.run)
          ? (fallback?.key ?? answered)
          : selection.run;
    setSelection({
      of: answer,
      workspace: selection.workspace,
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
    : answeredRunKey(runRead.answer) === selection.run
      ? runRead.answer
      : undefined;
  const onWorkspace = (workspace: ShownComparison) => {
    setSelection({ of: answer, workspace });
  };
  const onRun = (run: string) => {
    setSelection({
      of: answer,
      workspace: selection.workspace,
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
    sessionRuns: sessionRunsOf(review ?? answer),
    sessionComparisonKeys: answer?.sessionComparisonKeys,
    runKey: selection.run,
    snapshot,
    published: answer?.kind === "published" ? answer : undefined,
    chosen: selection.workspace,
    includeUncommitted,
    setIncludeUncommitted,
    reading: defaultRead.reading || runRead.reading,
    problem: !readsSelectedRun
      ? defaultRead.problem
      : runRead.reading
        ? undefined
        : runRead.problem,
    // Why a chosen run other than the default answer's own holds no
    // comparison, once its read settles.
    runUnread: readsSelectedRun ? unreadReview(runRead) : undefined,
    onWorkspace,
    onRun,
    // A comparison chosen in the switch: the published completion is the
    // answer the workspace choice returns to; Landed runs opens on the newest.
    onChoose: (choice: ComparisonChoice) => {
      if (choice === "published") onWorkspace("all");
      else if (choice !== "landed") onWorkspace(choice);
      else {
        const newest = preferredReviewRun(runs, (run) => run.comparison);
        if (newest !== undefined) onRun(newest.key);
      }
    },
  };
}
