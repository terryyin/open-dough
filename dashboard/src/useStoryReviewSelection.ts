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
import { preferredReviewRun } from "./storyReviewLandedRun.ts";

export function useStoryReviewSelection({
  source,
  identity,
  round,
  completed = false,
  enabled = true,
  initial = "since",
  historical: historicalComparison = false,
}: {
  readonly source: string;
  readonly identity: string;
  readonly round: number;
  readonly completed?: boolean | undefined;
  // A disabled selection reads nothing.
  readonly enabled?: boolean;
  // The workspace choice it opens on.
  readonly initial?: ShownComparison | undefined;
  // Intent asks for a completed result rather than a retained workspace.
  readonly historical?: boolean | undefined;
}) {
  const workspaceRead = useReviewRead<StoryReview>(
    storyReviewEndpoint,
    {
      source,
      identity,
      ...(completed ? { completed: "true" } : {}),
      ...(historicalComparison ? { historical: "true" } : {}),
    },
    storyReviewSchema,
    { round, enabled },
  );
  const [selection, setSelection] = useState<{
    historical: boolean;
    of: StoryReview | undefined;
    run?: string;
    workspace: ShownComparison;
  }>({ historical: historicalComparison, of: undefined, workspace: initial });
  if (selection.historical !== historicalComparison)
    setSelection({
      historical: historicalComparison,
      of: undefined,
      workspace: initial,
    });
  const answer = workspaceRead.answer;
  const runs = answer?.runs ?? [];
  if (
    !workspaceRead.reading &&
    workspaceRead.problem !== undefined &&
    selection.run !== undefined
  )
    setSelection({
      historical: historicalComparison,
      of: undefined,
      workspace: selection.workspace,
    });
  if (
    answer !== undefined &&
    answer !== selection.of &&
    !workspaceRead.reading
  ) {
    const fallback = preferredReviewRun(runs, (run) => run.comparison);
    // A first answer, or a workspace choice whose workspace is gone, follows
    // the run the answer opened on.
    const run =
      selection.run === undefined
        ? answer.selectedRun
        : !runs.some((run) => run.key === selection.run)
          ? fallback?.key
          : selection.run;
    setSelection({
      historical: historicalComparison,
      of: answer,
      workspace: selection.workspace,
      ...(run === undefined ? {} : { run }),
    });
  }
  const selectedRun = runs.find((run) => run.key === selection.run);
  const historical = useReviewRead<StoryReview>(
    storyReviewEndpoint,
    { source, identity, run: selection.run ?? "" },
    storyReviewSchema,
    {
      round,
      enabled:
        enabled &&
        selection.run !== undefined &&
        answer?.selectedRun !== selection.run,
    },
  );
  const review =
    selection.run === undefined
      ? answer
      : historical.answer?.selectedRun === selection.run
        ? historical.answer
        : answer?.selectedRun === selection.run
          ? answer
          : undefined;
  return {
    review,
    runs,
    selectedRun,
    // The run the workspace answer itself shows: its landed fallback.
    answerRun: answer?.selectedRun,
    snapshot: answer?.kind === "snapshot" ? answer : undefined,
    published: answer?.kind === "published" ? answer : undefined,
    chosen: selection.workspace,
    reading: workspaceRead.reading || historical.reading,
    problem:
      selection.run === undefined
        ? workspaceRead.problem
        : historical.reading
          ? undefined
          : historical.problem,
    onWorkspace: (workspace: ShownComparison) => {
      setSelection({ historical: historicalComparison, of: answer, workspace });
    },
    onRun: (run: string) => {
      setSelection({
        historical: historicalComparison,
        of: answer,
        workspace: selection.workspace,
        run,
      });
    },
  };
}
