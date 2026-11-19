// One active comparison. Refresh reconciles retained run identities; returning
// to the workspace keeps its comparison and Commits endpoints.
import { useState } from "react";
import {
  storyReviewEndpoint,
  storyReviewSchema,
  type StoryReview,
} from "./storyReviewContract.ts";
import type { ShownComparison } from "./StoryReviewComparison.tsx";
import { useReviewRead } from "./useReviewRead.ts";
import { useDefaultStoryReview } from "./useDefaultStoryReview.ts";
import { preferredReviewRun } from "./storyReviewLandedRun.ts";
import {
  answeredRunKey,
  sessionRunKeys,
  sessionRunsOf,
} from "./StoryReviewSessionRuns.tsx";
import type { ReviewedWorkSubject } from "./reviewedWorkSubject.ts";
import { storyReviewQuery } from "./storyReviewRead.ts";

export function useStoryReviewSelection({
  subject,
  round,
  completed = false,
  enabled = true,
  initial = "all",
  historical: historicalComparison = false,
}: {
  readonly subject: ReviewedWorkSubject;
  readonly round: number;
  readonly completed?: boolean | undefined;
  // A disabled selection reads nothing.
  readonly enabled?: boolean;
  // The workspace choice it opens on.
  readonly initial?: ShownComparison | undefined;
  // Historical Review asks for a completed result rather than a retained workspace.
  readonly historical?: boolean | undefined;
}) {
  const defaultRead = useDefaultStoryReview({
    subject,
    round,
    completed,
    historical: historicalComparison,
    enabled,
  });
  const [selection, setSelection] = useState<{
    of: StoryReview | undefined;
    run?: string;
    workspace: ShownComparison;
  }>({ of: undefined, workspace: initial });
  const answer = defaultRead.answer;
  const runs = answer?.runs ?? [];
  // A session's kept runs are chosen by position; landed runs by their key.
  const keys = [...runs.map((run) => run.key), ...sessionRunKeys(answer)];
  const answered = answeredRunKey(answer);
  if (
    !defaultRead.reading &&
    defaultRead.problem !== undefined &&
    selection.run !== undefined
  )
    setSelection({
      of: undefined,
      workspace: selection.workspace,
    });
  if (answer !== undefined && answer !== selection.of && !defaultRead.reading) {
    const fallback = preferredReviewRun(runs, (run) => run.comparison);
    // A first answer, or a workspace choice whose workspace is gone, follows
    // the run the answer opened on.
    const run =
      selection.run === undefined
        ? answered
        : !keys.includes(selection.run)
          ? (fallback?.key ?? answered)
          : selection.run;
    setSelection({
      of: answer,
      workspace: selection.workspace,
      ...(run === undefined ? {} : { run }),
    });
  }
  const selectedRun = runs.find((run) => run.key === selection.run);
  const readsSelectedRun =
    selection.run !== undefined && answered !== selection.run;
  const runRead = useReviewRead<StoryReview>(
    storyReviewEndpoint,
    storyReviewQuery({ subject, run: selection.run ?? "" }),
    storyReviewSchema,
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
  return {
    review,
    runs,
    selectedRun,
    sessionRuns: sessionRunsOf(review ?? answer),
    sessionComparisonKeys: answer?.sessionComparisonKeys,
    runKey: selection.run,
    // The run the workspace answer itself shows: its landed fallback.
    answerRun: answer?.selectedRun,
    snapshot: answer?.kind === "snapshot" ? answer : undefined,
    published: answer?.kind === "published" ? answer : undefined,
    chosen: selection.workspace,
    reading: defaultRead.reading || runRead.reading,
    problem: !readsSelectedRun
      ? defaultRead.problem
      : runRead.reading
        ? undefined
        : runRead.problem,
    onWorkspace: (workspace: ShownComparison) => {
      setSelection({ of: answer, workspace });
    },
    onRun: (run: string) => {
      setSelection({
        of: answer,
        workspace: selection.workspace,
        run,
      });
    },
  };
}
