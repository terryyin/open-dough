// Keep only identifiers and source locations while walking native parent links.
// A directory is not a worker join; only native agent-result evidence joins it.
import { objectOf, stringOf } from "./nativeUsageFiles.ts";
import { uniqueFacts } from "./usageReconciliation.ts";
import type {
  UsageAssociation,
  UsageGap,
  UsageObservation,
  UsageSource,
  UsageTask,
} from "./usageRecords.ts";

type Node = {
  parents: string[];
  boundary: boolean;
  references: string[];
  sources: UsageSource[];
};
export type ClaudeLineage = {
  nodes: Map<string, Node>;
  workers: Map<string, { parents: string[]; sources: UsageSource[] }>;
  sessions: Set<string>;
  responses: Set<string>;
  transcripts: Set<string>;
};
export const claudeLineage = (): ClaudeLineage => ({
  nodes: new Map(),
  workers: new Map(),
  sessions: new Set(),
  responses: new Set(),
  transcripts: new Set(),
});
const workerKey = (session: string, agent: string) =>
  JSON.stringify([session, agent]);
const nodeKey = (session: string, agent: string | undefined, uuid: string) =>
  JSON.stringify([session, agent ?? "", uuid]);

export function recordClaudeNode(
  lineage: ClaudeLineage,
  session: string,
  agent: string | undefined,
  row: Record<string, unknown>,
  source: UsageSource,
) {
  lineage.sessions.add(session);
  lineage.transcripts.add(workerKey(session, agent ?? ""));
  const uuid = stringOf(row["uuid"]);
  if (!uuid) return;
  const parent = stringOf(row["parentUuid"]);
  const content = objectOf(row["message"])["content"];
  const origin = stringOf(objectOf(row["origin"])["kind"]);
  const text =
    typeof content === "string"
      ? content
      : Array.isArray(content)
        ? content
            .map((item: unknown) => objectOf(item)["text"])
            .filter((item) => typeof item === "string")
            .join("\n")
        : "";
  const human =
    row["type"] === "user" &&
    !agent &&
    row["isMeta"] !== true &&
    (origin === "human" || (!origin && text.length > 0));
  const reference = human
    ? /(?:^|\n)Dashboard reporting context:\n- project: ([^\n]+)\n- host: claude\n- launch reference: ([0-9a-f-]{36})(?:\n|$)/i.exec(
        text,
      )
    : null;
  const key = nodeKey(session, agent, uuid);
  const old = lineage.nodes.get(key);
  lineage.nodes.set(key, {
    parents: uniqueFacts([
      ...(old?.parents ?? []),
      ...(parent ? [nodeKey(session, agent, parent)] : []),
    ]),
    boundary: old?.boundary === true || human,
    references: uniqueFacts([
      ...(old?.references ?? []),
      ...(reference ? [JSON.stringify([reference[1], reference[2]])] : []),
    ]),
    sources: uniqueFacts([...(old?.sources ?? []), source]),
  });
  const worker = stringOf(objectOf(row["toolUseResult"])["agentId"]);
  if (worker) {
    const workerId = workerKey(session, worker);
    const previous = lineage.workers.get(workerId);
    lineage.workers.set(workerId, {
      parents: uniqueFacts([...(previous?.parents ?? []), key]),
      sources: uniqueFacts([...(previous?.sources ?? []), source]),
    });
  }
}

function resolve(
  lineage: ClaudeLineage,
  session: string,
  agent: string | undefined,
  uuid: string,
) {
  const sources: UsageSource[] = [];
  const roots: { uuid: string; references: string[] }[] = [];
  let unresolved = false;
  const visit = (key: string, seen: Set<string>) => {
    if (seen.has(key)) {
      unresolved = true;
      return;
    }
    const nextSeen = new Set(seen).add(key);
    const node = lineage.nodes.get(key);
    if (!node) {
      unresolved = true;
      return;
    }
    sources.push(...node.sources);
    if (node.boundary) {
      const parts: unknown = JSON.parse(key);
      if (Array.isArray(parts) && typeof parts[2] === "string")
        roots.push({ uuid: parts[2], references: node.references });
      return;
    }
    if (node.parents.length > 0) {
      for (const parent of node.parents) visit(parent, nextSeen);
    } else if (agent) {
      const worker = lineage.workers.get(workerKey(session, agent));
      if (!worker) {
        unresolved = true;
        return;
      }
      sources.push(...worker.sources);
      for (const parent of worker.parents) visit(parent, nextSeen);
    } else unresolved = true;
  };
  visit(nodeKey(session, agent, uuid), new Set());
  return {
    roots: uniqueFacts(roots),
    sources: uniqueFacts(sources),
    unresolved,
  };
}

export function claudeAssociation(
  observation: UsageObservation,
  tasks: UsageTask[],
  lineage: ClaudeLineage,
): { observation: UsageObservation; association: UsageAssociation } {
  const enriched = structuredClone(observation);
  const candidates: string[] = [];
  const sources: UsageSource[] = [];
  const roots: string[] = [];
  let unresolved = false;
  for (const measurement of enriched.measurements) {
    if (!measurement.nativeRowId) {
      unresolved = true;
      continue;
    }
    const chain = resolve(
      lineage,
      observation.sessionId,
      measurement.agentId,
      measurement.nativeRowId,
    );
    sources.push(...chain.sources);
    unresolved ||= chain.unresolved;
    for (const root of chain.roots) {
      roots.push(root.uuid);
      if (chain.roots.length === 1) measurement.rootTurnId = root.uuid;
      const matches = tasks.filter(
        (task) =>
          task.host === "claude" &&
          task.sessionId === observation.sessionId &&
          (task.rootTurnId === root.uuid ||
            (task.launchReference !== undefined &&
              root.references.includes(
                JSON.stringify([task.project, task.launchReference]),
              ))),
      );
      if (matches.length === 0) unresolved = true;
      candidates.push(...matches.map((task) => task.id));
      sources.push(...matches.flatMap((task) => task.sources));
    }
  }
  const unique = uniqueFacts(candidates);
  const rootIds = uniqueFacts(roots);
  if (rootIds.length === 1) enriched.rootTurnId = rootIds[0];
  // Different input UUIDs can explicitly continue the same retained launch.
  if (unique.length > 1) enriched.gaps.push("contradictory-lineage");
  if (unresolved) enriched.gaps.push("unresolved-native-task-lineage");
  return {
    observation: enriched,
    association: {
      observationId: observation.id,
      taskId: !unresolved && unique.length === 1 ? (unique[0] ?? null) : null,
      candidates: unresolved ? [] : unique,
      sources: uniqueFacts(sources),
      gaps:
        unresolved || unique.length !== 1
          ? ["unresolved-task-association"]
          : [],
    },
  };
}

export function claudeCoverage(lineage: ClaudeLineage): UsageGap[] {
  const gaps: UsageGap[] = [];
  for (const [key, worker] of lineage.workers) {
    if (!lineage.responses.has(key))
      gaps.push({
        code: lineage.transcripts.has(key)
          ? "incomplete-worker-evidence"
          : "missing-worker-evidence",
        host: "claude",
        source: worker.sources[0],
      });
  }
  for (const key of lineage.transcripts) {
    const ids: unknown = JSON.parse(key);
    if (Array.isArray(ids) && ids[1] !== "" && !lineage.workers.has(key))
      gaps.push({ code: "unjoined-worker-evidence", host: "claude" });
  }
  for (const sessionId of lineage.sessions) {
    gaps.push({
      code: "auxiliary-usage-not-covered",
      host: "claude",
      sessionId,
    });
    if (!lineage.responses.has(workerKey(sessionId, "")))
      gaps.push({
        code: "missing-root-transcript-usage",
        host: "claude",
        sessionId,
      });
  }
  return gaps;
}
export function recordClaudeResponse(
  lineage: ClaudeLineage,
  session: string,
  agent: string | undefined,
) {
  lineage.responses.add(workerKey(session, agent ?? ""));
}
