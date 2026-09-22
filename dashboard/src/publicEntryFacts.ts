// Interprets purpose and plan-slice facts for one public published-work entry
// once its canonical and plan texts are already loaded. Preparation readiness
// and slice reading share one associated-plan resolution. Backlog plan links
// remain navigation/claim data; when both a backlog plan and a recorded
// story-state plan exist they must resolve to the same path, and disagreement
// is reported rather than preferred.

import type { WorkEntry } from "./publishedWork";
import { planAssociationConflict } from "./planAssociation";
import { resolveBesideFile } from "./repositoryPath";
import {
  interpretStoryState,
  peekRecordedApproach,
  type WorkPreparation,
} from "./storyPreparation";
import { interpretPlanSlices, type WorkPlanSlices } from "./storyPlan";
import { interpretStoryPurpose, type WorkPurpose } from "./storyPurpose";

export { planAssociationConflict } from "./planAssociation";

function recordedWithAssessment(
  peek: Extract<WorkPreparation, { readonly status: "recorded" }>,
  assessment: Extract<
    WorkPreparation,
    { readonly status: "recorded" }
  >["assessment"],
): WorkPreparation {
  return {
    status: "recorded",
    refinement: peek.refinement,
    approach: peek.approach,
    assessment,
  };
}

type AssociatedPlanSource =
  | { readonly status: "unavailable"; readonly problem: string }
  | {
      readonly status: "ready";
      readonly source: string;
      readonly planIsCanonical: boolean;
    };

function associatedPlanSource(
  path: string | undefined,
  planRelative: string,
  canonicalText: ReadonlyMap<string, string>,
  planText: ReadonlyMap<string, string>,
  planProblems: ReadonlyMap<string, string>,
): AssociatedPlanSource {
  if (path === undefined) {
    return {
      status: "unavailable",
      problem: "The associated plan path could not be resolved.",
    };
  }
  const resolved = resolveBesideFile(path, planRelative);
  if (resolved === undefined) {
    return {
      status: "unavailable",
      problem:
        "The recorded plan path does not resolve to a file inside the observed repository.",
    };
  }
  if (resolved === path) {
    const text = canonicalText.get(path);
    if (text === undefined) {
      return {
        status: "unavailable",
        problem: "The canonical plan record could not be read.",
      };
    }
    return { status: "ready", source: text, planIsCanonical: true };
  }
  const planProblem = planProblems.get(resolved);
  if (planProblem !== undefined) {
    return { status: "unavailable", problem: planProblem };
  }
  const source = planText.get(resolved);
  if (source === undefined) {
    return {
      status: "unavailable",
      problem: "The associated plan could not be read.",
    };
  }
  return { status: "ready", source, planIsCanonical: false };
}

export function purposeFor(
  path: string | undefined,
  entry: WorkEntry,
  canonicalText: ReadonlyMap<string, string>,
  canonicalProblems: ReadonlyMap<string, string>,
): WorkPurpose {
  if (path === undefined) {
    return {
      status: "unavailable",
      problem:
        "This entry does not name a file in the observed repository that can be read for purpose.",
    };
  }
  const problem = canonicalProblems.get(path);
  if (problem !== undefined) {
    return { status: "unavailable", problem };
  }
  const text = canonicalText.get(path);
  if (text === undefined) {
    return {
      status: "unavailable",
      problem: "The canonical record could not be read.",
    };
  }
  try {
    return interpretStoryPurpose(text, entry.canonical.recorded);
  } catch (error) {
    const reported = error instanceof Error ? error.message : String(error);
    return { status: "unavailable", problem: reported };
  }
}

export function planSlicesFor(
  preparation: WorkPreparation,
  path: string | undefined,
  planText: ReadonlyMap<string, string>,
  planProblems: ReadonlyMap<string, string>,
  canonicalText: ReadonlyMap<string, string>,
): WorkPlanSlices {
  if (preparation.status !== "recorded") {
    return { status: "absent" };
  }
  if (preparation.approach.kind !== "planned") {
    return { status: "absent" };
  }
  if (preparation.assessment.status === "plan-association-conflict") {
    return {
      status: "unavailable",
      problem: preparation.assessment.problem,
    };
  }
  const associated = associatedPlanSource(
    path,
    preparation.approach.plan,
    canonicalText,
    planText,
    planProblems,
  );
  if (associated.status === "unavailable") {
    return { status: "unavailable", problem: associated.problem };
  }
  return interpretPlanSlices(associated.source);
}

export function preparationForPeek(
  entry: WorkEntry,
  path: string | undefined,
  peek: ReturnType<typeof peekRecordedApproach>,
  canonicalText: ReadonlyMap<string, string>,
  planText: ReadonlyMap<string, string>,
  planProblems: ReadonlyMap<string, string>,
  backlogPath: string,
): WorkPreparation {
  if (peek.status !== "recorded") {
    return peek;
  }
  const href = entry.canonical.recorded;
  const text = path === undefined ? undefined : canonicalText.get(path);
  if (path === undefined || text === undefined) {
    return {
      status: "unavailable",
      problem: "The canonical record could not be read.",
    };
  }
  const associationConflict = planAssociationConflict(
    entry,
    backlogPath,
    path,
    peek,
  );
  if (associationConflict !== undefined) {
    return recordedWithAssessment(peek, {
      status: "plan-association-conflict",
      problem: associationConflict,
    });
  }
  if (peek.approach.kind !== "planned") {
    return interpretStoryState(text, href);
  }
  const associated = associatedPlanSource(
    path,
    peek.approach.plan,
    canonicalText,
    planText,
    planProblems,
  );
  if (associated.status === "unavailable") {
    return recordedWithAssessment(peek, {
      status: "unavailable",
      problem: associated.problem,
    });
  }
  if (associated.planIsCanonical) {
    return interpretStoryState(text, href, { planIsCanonical: true });
  }
  return interpretStoryState(text, href, { planSource: associated.source });
}
