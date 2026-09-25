// When both the backlog and the story-state associate a plan, they must name
// the same repository file. Disagreement is reported rather than preferred; an
// older backlog plan alone never invents readiness.

import type { WorkEntry } from "./publishedWork.ts";
import { snapshotRepositoryPath } from "./sourceLink.ts";
import { peekRecordedApproach } from "./storyPreparation.ts";

export function planAssociationConflict(
  entry: WorkEntry,
  backlogPath: string,
  // The story-state plan's repository path (`recordedPlanPathFor`).
  recordedResolved: string | undefined,
  peek: ReturnType<typeof peekRecordedApproach>,
): string | undefined {
  const backlogPlan = entry.plan;
  if (backlogPlan === undefined || peek.status !== "recorded") {
    return undefined;
  }
  if (peek.approach.kind === "unselected") {
    return undefined;
  }
  if (peek.approach.kind === "planless") {
    return (
      `The backlog plan link and the recorded story-state approach disagree. ` +
      `Backlog names “${backlogPlan.recorded}”; story-state records planless. ` +
      `This dashboard does not choose between them.`
    );
  }
  const recordedRelative = peek.approach.plan;
  if (backlogPlan.kind !== "snapshot") {
    return (
      `The backlog plan link and the recorded story-state plan disagree. ` +
      `Backlog names “${backlogPlan.recorded}”; story-state associates ` +
      `“${recordedRelative}”. This dashboard does not choose between them.`
    );
  }
  const backlogResolved = snapshotRepositoryPath(backlogPlan, backlogPath);
  if (
    backlogResolved === undefined ||
    recordedResolved === undefined ||
    backlogResolved !== recordedResolved
  ) {
    return (
      `The backlog plan link and the recorded story-state plan disagree. ` +
      `Backlog resolves to ` +
      `${backlogResolved ?? `“${backlogPlan.recorded}”`}; story-state ` +
      `associates ${recordedResolved ?? `“${recordedRelative}”`}. ` +
      `This dashboard does not choose between them.`
    );
  }
  return undefined;
}
