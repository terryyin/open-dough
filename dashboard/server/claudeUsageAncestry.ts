// Walk retained parent links once per response, without recursive path copies.
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
    if (node.boundary) {
      const parts: unknown = JSON.parse(next.key);
      if (Array.isArray(parts) && typeof parts[2] === "string")
        roots.push({ uuid: parts[2], references: node.references });
      continue;
    }
    if (node.parents.length) {
      for (const parent of node.parents)
        pending.push({ key: parent, exiting: false });
    } else if (agent) {
      const worker = lineage.workers.get(claudeWorkerKey(session, agent));
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
    unresolved,
  };
}
