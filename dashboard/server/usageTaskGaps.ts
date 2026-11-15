// Which gaps show usage missing from a dashboard task, for its per-task
// summary (./usageTaskSummary.ts), in the coverage vocabulary of
// `../src/usageTokenIndex.ts`: a response it may own that no one task could
// be given, a response of its own missing token counts, no attributable
// response at all, and the recorded gaps that are the task's. A recorded gap
// is a task's when it names the task, or else when it names one of the
// task's sessions (its root's or one its responses ran in) or lies in one of
// their rollouts, as a worker gap lies at its spawn (./codexUsageLineage.ts
// `codexCoverage`). A session or rollout shared by several tasks gives its
// gaps to each of them. Each gap is kept once per task.
import {
  isUsageCoverageGap,
  usageCoverageGaps,
  type UsageCoverageGap,
} from "../src/usageTokenIndex.ts";
import { containingCodexThread } from "./codexUsageLineage.ts";
import type {
  UsageAssociation,
  UsageGap,
  UsageObservation,
  UsageTask,
} from "./usageRecords.ts";

export class TaskGaps {
  // Each dashboard task's gaps.
  readonly #gaps = new Map<string, Set<UsageCoverageGap>>();
  // The tasks each session's responses belong to.
  readonly #sessions = new Map<string, Set<string>>();
  // The tasks with a response of their own.
  readonly #answered = new Set<string>();

  #add(taskId: string, code: UsageCoverageGap): void {
    this.#gaps.get(taskId)?.add(code);
  }

  #session(sessionId: string, taskId: string): void {
    const tasks = this.#sessions.get(sessionId) ?? new Set();
    this.#sessions.set(sessionId, tasks.add(taskId));
  }

  task({ id, sessionId }: UsageTask): void {
    this.#gaps.set(id, new Set());
    this.#session(sessionId, id);
  }

  association({ taskId, candidates }: UsageAssociation): void {
    if (taskId === null)
      for (const candidate of candidates)
        this.#add(candidate, "unresolved-task-association");
  }

  response(taskId: string, response: UsageObservation): void {
    this.#answered.add(taskId);
    this.#session(response.sessionId, taskId);
    if (response.coverage !== "measured")
      this.#add(taskId, "missing-token-components");
  }

  record(gap: UsageGap): void {
    const { code } = gap;
    if (!isUsageCoverageGap(code)) return;
    if (gap.taskId !== undefined) {
      this.#add(gap.taskId, code);
      return;
    }
    const sessions = [
      gap.sessionId,
      gap.source?.kind === "native"
        ? containingCodexThread(gap.source.file)
        : undefined,
    ];
    for (const sessionId of sessions)
      for (const taskId of this.#sessions.get(sessionId ?? "") ?? [])
        this.#add(taskId, code);
  }

  of(taskId: string): UsageCoverageGap[] {
    const gaps = new Set(this.#gaps.get(taskId));
    if (!this.#answered.has(taskId)) gaps.add("no-attributable-response-usage");
    return usageCoverageGaps.filter((code) => gaps.has(code));
  }
}
