// One active comparison. Refresh reconciles retained run identities; returning
// to the workspace keeps its comparison and Commits endpoints.
import { useState } from "react";
import {
  storyReviewEndpoint,
  storyReviewSchema,
  type StoryReview,
} from "./storyReview.ts";
import type { ShownComparison } from "./StoryReviewComparison.tsx";
import { useReviewRead } from "./useReviewRead.ts";
import { preferredReviewRun } from "./storyReviewLandedRun.ts";

export function useStoryReviewSelection(
  source: string,
  identity: string,
  round: number,
) {
  const workspaceRead = useReviewRead<StoryReview>(
    storyReviewEndpoint,
    { source, identity },
    storyReviewSchema,
    round,
  );
  const [selection, setSelection] = useState<{
    of: StoryReview | undefined;
    run?: string;
    workspace: ShownComparison;
  }>({ of: undefined, workspace: "since" });
  const answer = workspaceRead.answer;
  const runs = answer?.runs ?? [];
  if (
    !workspaceRead.reading &&
    workspaceRead.problem !== undefined &&
    selection.run !== undefined
  )
    setSelection({ of: undefined, workspace: selection.workspace });
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
    round,
    selection.run !== undefined && answer?.selectedRun !== selection.run,
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
    snapshot: answer?.kind === "snapshot" ? answer : undefined,
    chosen: selection.workspace,
    reading: workspaceRead.reading || historical.reading,
    problem:
      selection.run === undefined
        ? workspaceRead.problem
        : historical.reading
          ? undefined
          : historical.problem,
    onWorkspace: (workspace: ShownComparison) => {
      setSelection({ of: answer, workspace });
    },
    onRun: (run: string) => {
      setSelection({ of: answer, workspace: selection.workspace, run });
    },
  };
}
