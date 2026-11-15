// The stores earlier dashboards wrote, as literal wire shapes for the cases
// that start from one: the whole-document v1 history and the paged store (a
// manifest in `usage.json` naming page files under `usage.json.pages`), each
// with a row per response and per task association.
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { usageHistoryFile } from "../../server/usageHistory.ts";
import type { LegacyUsageHistory } from "../../server/usageEarlierStore.ts";
import type { ImportedHistory } from "./importHarness.ts";

const sha = (text: string) => createHash("sha256").update(text).digest("hex");

/** The v1 document holding the history's tasks and gaps with these responses. */
export const legacyHistory = ({
  tasks,
  observations,
  associations,
  gaps,
}: ImportedHistory): LegacyUsageHistory => ({
  version: 1,
  tasks,
  observations,
  associations,
  gaps,
});

export function writeLegacyStore(home: string, history: LegacyUsageHistory) {
  const file = usageHistoryFile(home);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(history));
}

/** Writes the history as pages, one per collection and key partition. */
export function writePagedStore(home: string, history: LegacyUsageHistory) {
  const file = usageHistoryFile(home);
  const pages = `${file}.pages`;
  mkdirSync(pages, { recursive: true });
  const manifest = {
    format: "usage-pages-v1",
    version: 1,
    next: {} as Record<string, number>,
    pages: {} as Record<string, string[]>,
  };
  const collections = {
    tasks: Object.entries(history.tasks),
    observations: Object.entries(history.observations),
    associations: Object.entries(history.associations),
    gaps: history.gaps.map((gap) => [JSON.stringify(gap), gap] as const),
  };
  for (const [kind, entries] of Object.entries(collections)) {
    const partitions = new Map<string, unknown[]>();
    entries.forEach(([key, value], order) => {
      const partition = sha(key).slice(0, 2);
      partitions.set(partition, [
        ...(partitions.get(partition) ?? []),
        [key, value, order],
      ]);
    });
    manifest.next[kind] = entries.length;
    for (const [partition, rows] of partitions) {
      const text = JSON.stringify(rows);
      const name = `${sha(text)}.json`;
      writeFileSync(path.join(pages, name), text);
      manifest.pages[`${kind}:${partition}`] = [name];
    }
  }
  writeFileSync(file, `${JSON.stringify(manifest)}\n`);
}
