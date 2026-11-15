// When this machine's Codex rollouts and Claude Code transcripts were last
// checked for usage: the small check record beside the usage store that a
// Refresh (./usageRefresh.ts) writes once its evidence is in the store. A
// Refresh records the time it began, so a file written while it read is read
// again by the next one.
// Checked shows a later offline import's document modification time, otherwise
// Refresh's recorded start. The record's mtime distinguishes Refresh's own
// history write from a later import. With neither history nor record, never.
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { replaceDurableJson } from "./durableJsonReplacement.ts";

export function usageCheckFile(store: string): string {
  return path.join(
    path.dirname(store),
    `${path.basename(store, ".json")}-check.json`,
  );
}

async function recordedCheck(store: string): Promise<string | undefined> {
  try {
    const { checkedAt } = JSON.parse(
      await readFile(usageCheckFile(store), "utf8"),
    ) as { checkedAt?: unknown };
    return typeof checkedAt === "string" &&
      Number.isFinite(Date.parse(checkedAt))
      ? checkedAt
      : undefined;
  } catch {
    return undefined;
  }
}

async function fileWrittenAt(file: string): Promise<Date | undefined> {
  try {
    return (await stat(file)).mtime;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

// The latest publication: a later import's write, or Refresh's own check.
export async function lastUsageCheck(store: string): Promise<string | null> {
  const recorded = await recordedCheck(store);
  const written = await fileWrittenAt(store);
  if (recorded !== undefined) {
    const recordedAt = await fileWrittenAt(usageCheckFile(store));
    if (
      written === undefined ||
      recordedAt === undefined ||
      written <= recordedAt
    )
      return recorded;
  }
  return written?.toISOString() ?? null;
}

// A coarse file system records a modification up to two seconds early.
const timestampGranularityMs = 2_000;
// An import reads for minutes (440 s for the whole corpus) before it
// writes, so a rollout it read early may have changed before the store's
// write; a day covers that comfortably.
const importDurationMs = 24 * 60 * 60 * 1_000;

// The earliest rollout modification a Refresh reads again: its last check,
// or, before any Refresh, a day before the importer's last write. Undefined
// when nothing was imported yet: the offline import supplies history first.
export async function refreshCutoff(
  store: string,
): Promise<number | undefined> {
  const recorded = await recordedCheck(store);
  if (recorded !== undefined)
    return Date.parse(recorded) - timestampGranularityMs;
  const written = await fileWrittenAt(store);
  return written === undefined
    ? undefined
    : written.getTime() - importDurationMs;
}

export async function recordUsageCheck(
  store: string,
  checkedAt: string,
): Promise<void> {
  const file = usageCheckFile(store);
  await replaceDurableJson(
    `${file}.${String(process.pid)}.tmp`,
    file,
    `${JSON.stringify({ checkedAt })}\n`,
  );
}
