// Resolves and reads one Taken entry's plan on its recorded story branch:
// the branch head at the shown revision (or a head a revision check already
// found), then the associated plan file at that head. Interprets the plan the
// same way as trunk (`./storyPlan.ts`). Nothing earlier read on the branch is
// kept. Projection of the resulting progress source, and which branches are
// watched, stay with `./progressSource.ts`.

import { type BranchHead } from "./authenticatedBranchRead.ts";
import {
  settleMissing,
  shouldAsk,
  trackSettledAsk,
  type ObservationOutcomes,
} from "./observationOutcomes.ts";
import type { PublishedObservationReadSource } from "./publishedObservationReadSource.ts";
import type { PublishedWork, WorkEntry } from "./publishedWork.ts";
import { ReadProblem } from "./readProblem.ts";
import type { Route } from "./progressRoute.ts";
import { gapCauseOf, unavailableGap } from "./readWaitBound.ts";
import { interpretPlanSlices } from "./storyPlan.ts";

export type BranchPlanReads = Pick<
  PublishedObservationReadSource,
  "readBranchHead" | "readFileOnBranch"
>;

// The branch's plan at its head: the head read now, or, when a revision
// check already found it (`known`), that head, undefined when the branch is
// no longer published.
export async function readBranchPlanForEntry(
  work: PublishedWork,
  entry: WorkEntry,
  { branch, planPath, profilePath }: Extract<Route, { kind: "branch" }>,
  signal: AbortSignal,
  outcomes: ObservationOutcomes,
  bound: AbortSignal,
  reads: BranchPlanReads,
  known?: { readonly head: string | undefined },
): Promise<WorkEntry> {
  const { source, revision } = work;
  const unsourced: { -readonly [K in keyof WorkEntry]: WorkEntry[K] } = {
    ...entry,
  };
  delete unsourced.progressSource;
  delete unsourced.sliceClock;
  const headQuestion = {
    sourceId: source.id,
    revision,
    operation: "branch-head" as const,
    path: branch,
  };
  const unreadable = `The plan on branch ${branch} could not be read.`;
  const priorHead = outcomes.of(headQuestion);
  if (
    known === undefined &&
    !shouldAsk(outcomes, headQuestion) &&
    priorHead !== undefined &&
    priorHead.kind !== "answered"
  ) {
    // Missing or terminal/bound head failure: keep this entry's shown gap.
    return entry;
  }
  try {
    const head =
      known === undefined
        ? await trackSettledAsk(
            outcomes,
            reads.readBranchHead(source, revision, branch, signal),
            {
              question: headQuestion,
              of: (resolved) =>
                resolved === undefined
                  ? "missing"
                  : {
                      kind: "answered",
                      question: { ...headQuestion, head: resolved },
                    },
              untilEither: signal,
              bound,
              reading: `branch ${branch}`,
              unreadable,
            },
          )
        : known.head;
    if (head === undefined) {
      if (known !== undefined) {
        settleMissing(outcomes, headQuestion);
      }
      return {
        ...unsourced,
        planSlices: unavailableGap({
          problem: `The recorded branch ${branch} is no longer published, so its slice progress cannot be read. Trunk's copy is not its progress.`,
        }),
      };
    }
    const onBranch: BranchHead = { branch, head };
    const fileQuestion = {
      sourceId: source.id,
      revision,
      head,
      operation: "branch-file" as const,
      path: planPath,
    };
    const priorFile = outcomes.of(fileQuestion);
    if (
      !shouldAsk(outcomes, fileQuestion) &&
      priorFile !== undefined &&
      priorFile.kind !== "answered"
    ) {
      return entry;
    }
    const text = await trackSettledAsk(
      outcomes,
      reads.readFileOnBranch(source, planPath, revision, onBranch, signal),
      {
        question: fileQuestion,
        of: (found) => (found === undefined ? "missing" : "answered"),
        untilEither: signal,
        bound,
        reading: planPath,
        unreadable,
      },
    );
    return {
      ...unsourced,
      progressSource: { kind: "branch", ...onBranch, profilePath },
      planSlices:
        text === undefined
          ? unavailableGap({
              problem: `The associated plan ${planPath} is missing on this branch.`,
            })
          : interpretPlanSlices(text),
    };
  } catch (error) {
    return {
      ...unsourced,
      planSlices: unavailableGap(
        gapCauseOf(
          error,
          signal,
          bound,
          `branch ${branch}`,
          error instanceof ReadProblem ? error.message : unreadable,
        ),
      ),
    };
  }
}
