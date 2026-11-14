// Source-specific assignment corrections share the task reconciliation owner.
// Missing sources never reject legacy boundaries; all evidence remains audit.
import { uniqueFacts } from "./usageReconciliation.ts";
import type { UsageTask, UsageAssociation } from "./usageRecords.ts";
export function hasUsageAssignment(task: UsageTask) {
  if (
    task.kind === "launch" ||
    Boolean(task.launchedAt) ||
    !task.assignmentEvidence?.some((item) => item.status === "rejected") ||
    task.assignmentEvidence.some((item) => item.status === "supported")
  )
    return true;
  // Legacy decoders could retain a genuine row while keeping the first wrong
  // clock. Its assignment-derived provenance remains support without a time;
  // generic session/project provenance cannot establish an assignment.
  return ["launchedAt", "workflow"].some((field) =>
    task.fieldSources?.[field]?.some(
      (source) =>
        source.kind === "native" &&
        !task.assignmentEvidence?.some(
          (item) =>
            item.status === "rejected" &&
            JSON.stringify(item.source) === JSON.stringify(source),
        ),
    ),
  );
}
export function reconcileTaskAssignment(
  task: UsageTask,
  old?: UsageTask,
): UsageTask {
  const evidence = uniqueFacts([
    ...(old?.assignmentEvidence ?? []),
    ...(task.assignmentEvidence ?? []),
  ]);
  if (!evidence.length) return task;
  const rejectedStart = (candidate: UsageTask) =>
    evidence.some(
      (item) =>
        item.status === "rejected" &&
        item.at === candidate.launchedAt &&
        (candidate.fieldSources?.["launchedAt"] ?? []).some(
          (source) => JSON.stringify(source) === JSON.stringify(item.source),
        ),
    );
  const launch =
    old?.kind === "launch" ? old : task.kind === "launch" ? task : undefined;
  const start =
    launch?.launchedAt ??
    (old?.launchedAt && !rejectedStart(old)
      ? old.launchedAt
      : task.launchedAt && !rejectedStart(task)
        ? task.launchedAt
        : (evidence
            .filter((item) => item.status === "supported")
            .map((item) => item.at)
            .filter((at) => at !== undefined)
            .sort()[0] ?? null));
  const result = { ...task, launchedAt: start, assignmentEvidence: evidence };
  result.gaps = uniqueFacts([
    ...result.gaps.filter(
      (gap) =>
        gap !== "unsupported-task-assignment" && gap !== "task-start-unknown",
    ),
    ...(!hasUsageAssignment(result) ? ["unsupported-task-assignment"] : []),
    ...(!start ? ["task-start-unknown"] : []),
  ]);
  return result;
}
export function eligibleUsageAssociation(
  association: UsageAssociation,
  eligible: ReadonlySet<string>,
): UsageAssociation {
  const auditCandidates = uniqueFacts([
    ...association.candidates,
    ...(association.taskId ? [association.taskId] : []),
  ]);
  const candidates = auditCandidates.filter((id) => eligible.has(id));
  const unsupported = candidates.length !== auditCandidates.length;
  return {
    ...association,
    candidates: auditCandidates,
    taskId: association.gaps.includes("contradictory-lineage")
      ? null
      : candidates.length === 1
        ? (candidates[0] ?? null)
        : null,
    gaps: uniqueFacts([
      ...association.gaps.filter(
        (gap) =>
          ![
            "unsupported-task-assignment",
            "ambiguous-task-association",
            "unresolved-task-association",
          ].includes(gap),
      ),
      ...(unsupported ? ["unsupported-task-assignment"] : []),
      ...(candidates.length > 1
        ? ["ambiguous-task-association"]
        : candidates.length === 0
          ? ["unresolved-task-association"]
          : []),
    ]),
  };
}
