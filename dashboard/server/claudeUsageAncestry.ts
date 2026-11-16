// Walk retained parent links once per response, without recursive path copies.
// Each node key names its own transcript's agent, so a worker's first row joins
// through that worker's agent result, whether the root or another worker holds it.
// Intermediate evidence cites its containing files; exact response, task-boundary
// and worker-join rows remain separately traceable. No transcript bodies survive.
import { uniqueFacts } from "./usageReconciliation.ts";
import { claudeNodeKey, claudeWorkerKey } from "./claudeUsageKeys.ts";
import type { ClaudeLineage } from "./claudeUsageLineage.ts";
import type { UsageSource } from "./usageRecords.ts";

export function claudeAncestry(
  lineage: ClaudeLineage,
  session: string,
  agent: string | undefined,
  uuid: string,
) {
  const sources: UsageSource[] = [];
  const files = new Map<string, UsageSource>();
  const roots: { uuid: string; references: string[] }[] = [];
  // The agents whose transcripts the climb passes through; "" is the root's.
  const transcripts = new Set<string>();
  const active = new Set<string>();
  const visited = new Set<string>();
  const first = claudeNodeKey(session, agent, uuid);
  const pending = [{ key: first, exiting: false }];
  let unresolved = false;
  while (pending.length) {
    const next = pending.pop();
    if (!next) break;
    if (next.exiting) {
      active.delete(next.key);
      continue;
    }
    if (active.has(next.key)) {
      unresolved = true;
      continue;
    }
    if (visited.has(next.key)) continue;
    visited.add(next.key);
    active.add(next.key);
    pending.push({ key: next.key, exiting: true });
    const node = lineage.nodes.get(next.key);
    if (!node) {
      unresolved = true;
      continue;
    }
    for (const source of node.sources)
      files.set(JSON.stringify([source.kind, source.file]), {
        kind: source.kind,
        file: source.file,
      });
    if (next.key === first || node.boundary) sources.push(...node.sources);
    const parts: unknown = JSON.parse(next.key);
    if (!Array.isArray(parts)) {
      unresolved = true;
      continue;
    }
    const fields: unknown[] = parts;
    const [, transcriptAgent, nodeUuid] = fields;
    if (typeof transcriptAgent === "string") transcripts.add(transcriptAgent);
    if (node.boundary) {
      if (typeof nodeUuid === "string")
        roots.push({ uuid: nodeUuid, references: node.references });
      continue;
    }
    if (node.parents.length) {
      for (const parent of node.parents)
        pending.push({ key: parent, exiting: false });
    } else if (typeof transcriptAgent === "string" && transcriptAgent) {
      const worker = lineage.workers.get(
        claudeWorkerKey(session, transcriptAgent),
      );
      if (!worker) {
        unresolved = true;
        continue;
      }
      sources.push(...worker.sources);
      for (const parent of worker.parents)
        pending.push({ key: parent, exiting: false });
    } else unresolved = true;
  }
  return {
    roots: uniqueFacts(roots),
    sources: uniqueFacts([...files.values(), ...sources]),
    transcripts: [...transcripts],
    unresolved,
  };
}
