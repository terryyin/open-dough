// Native identity evidence is independent of file discovery order. Only explicit
// containing-thread metadata and parent links establish a worker's ancestry.
import path from "node:path";
import { objectOf, stringOf } from "./nativeUsageFiles.ts";
import { uniqueFacts } from "./usageReconciliation.ts";
import type {
  UsageSource,
  UsageGap,
  UsageObservation,
  UsageTask,
  UsageAssociation,
} from "./usageRecords.ts";

export type CodexSessionEvidence = {
  parents: string[];
  sources: UsageSource[];
  agentPaths: string[];
  responses: number;
  legacyCounters: UsageSource[];
};
export type CodexWorkerEvidence = {
  sessionId?: string;
  agentPath?: string;
  source: UsageSource;
};
export type CodexLineage = {
  sessions: Map<string, CodexSessionEvidence>;
  workers: CodexWorkerEvidence[];
};
export const codexLineage = (): CodexLineage => ({
  sessions: new Map(),
  workers: [],
});

export function containingCodexThread(file: string): string {
  const name = path.basename(file).replace(/\.jsonl(?:\.zst)?$/, "");
  return (
    name.match(/([0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12})$/i)?.[1] ?? name
  );
}

export function recordCodexSession(
  lineage: CodexLineage,
  sessionId: string,
  payload: Record<string, unknown>,
  source: UsageSource,
): CodexSessionEvidence {
  const spawn = objectOf(
    objectOf(objectOf(payload["source"])["subagent"])["thread_spawn"],
  );
  const previous = lineage.sessions.get(sessionId);
  const result = {
    parents: uniqueFacts(
      [
        ...(previous?.parents ?? []),
        stringOf(payload["parent_thread_id"]),
        stringOf(spawn["parent_thread_id"]),
      ].filter((id) => id !== undefined),
    ),
    sources: uniqueFacts([...(previous?.sources ?? []), source]),
    agentPaths: uniqueFacts(
      [
        ...(previous?.agentPaths ?? []),
        stringOf(payload["agent_path"]),
        stringOf(spawn["agent_path"]),
      ].filter((id) => id !== undefined),
    ),
    responses: previous?.responses ?? 0,
    legacyCounters: previous?.legacyCounters ?? [],
  };
  lineage.sessions.set(sessionId, result);
  return result;
}

function ancestry(
  sessionId: string,
  lineage: CodexLineage,
): { sessions: string[]; sources: UsageSource[]; contradictory: boolean } {
  const sessions: string[] = [];
  const sources: UsageSource[] = [];
  let current: string | undefined = sessionId;
  while (current !== undefined) {
    if (sessions.includes(current))
      return { sessions, sources, contradictory: true };
    sessions.push(current);
    const evidence = lineage.sessions.get(current);
    if (!evidence) break;
    sources.push(...evidence.sources);
    if (evidence.parents.length > 1)
      return { sessions, sources, contradictory: true };
    current = evidence.parents[0];
  }
  return { sessions, sources, contradictory: false };
}

export function codexAssociation(
  observation: UsageObservation,
  tasks: UsageTask[],
  lineage: CodexLineage,
): UsageAssociation {
  const chain = ancestry(observation.sessionId, lineage);
  if (
    chain.contradictory &&
    !observation.gaps.includes("contradictory-lineage")
  )
    observation.gaps.push("contradictory-lineage");
  const candidates = observation.gaps.includes("contradictory-lineage")
    ? []
    : tasks.filter(
        (task) =>
          task.host === "codex" &&
          !task.gaps.includes("contradictory-project-evidence") &&
          !task.gaps.includes("contradictory-task-field:project") &&
          chain.sessions.includes(task.sessionId) &&
          task.rootTurnId !== undefined &&
          [task.rootTurnId, ...(task.nativeTurns ?? [])].some(
            (turn) =>
              turn === observation.rootTurnId || turn === observation.turnId,
          ),
      );
  return {
    observationId: observation.id,
    taskId: candidates.length === 1 ? (candidates[0]?.id ?? null) : null,
    candidates: candidates.map((task) => task.id),
    sources: uniqueFacts([
      ...chain.sources,
      ...candidates.flatMap((task) => task.sources),
    ]),
    gaps: candidates.length === 1 ? [] : ["unresolved-task-association"],
  };
}

export function codexCoverage(lineage: CodexLineage): UsageGap[] {
  const gaps: UsageGap[] = [];
  for (const [sessionId, session] of lineage.sessions) {
    if (session.responses === 0)
      gaps.push({
        code:
          session.legacyCounters.length > 0
            ? "unsupported-response-counters"
            : "no-response-usage-evidence",
        host: "codex",
        sessionId,
        source: session.legacyCounters[0] ?? session.sources[0],
      });
    if (session.parents.length > 0 && session.responses === 0)
      gaps.push({
        code: "incomplete-worker-evidence",
        host: "codex",
        sessionId,
        source: session.sources[0],
      });
    for (const parent of session.parents) {
      if (!lineage.sessions.has(parent))
        gaps.push({
          code: "missing-parent-evidence",
          host: "codex",
          sessionId: parent,
          source: session.sources[0],
        });
    }
  }
  for (const worker of lineage.workers) {
    const matches = worker.sessionId
      ? [lineage.sessions.get(worker.sessionId)].filter(
          (value) => value !== undefined,
        )
      : [...lineage.sessions.values()].filter(
          (session) =>
            worker.agentPath !== undefined &&
            session.agentPaths.includes(worker.agentPath),
        );
    const code =
      matches.length > 1
        ? "ambiguous-worker-evidence"
        : matches.length === 1 && matches[0]?.responses === 0
          ? "incomplete-worker-evidence"
          : matches.length === 0
            ? worker.sessionId || worker.agentPath
              ? "missing-worker-evidence"
              : "unresolved-worker-evidence"
            : undefined;
    if (code)
      gaps.push({
        code,
        host: "codex",
        ...(worker.sessionId ? { sessionId: worker.sessionId } : {}),
        source: worker.source,
      });
  }
  return gaps;
}
