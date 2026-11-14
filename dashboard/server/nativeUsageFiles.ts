// Bounded-memory native file traversal and line reading. A damaged line is a gap,
// never permission to discard independently readable response evidence.
import { createReadStream } from "node:fs";
import { readdir } from "node:fs/promises";
import { createInterface } from "node:readline";
import path from "node:path";
import type { UsageGap } from "./usageRecords.ts";
export const objectOf = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
export const stringOf = (value: unknown): string | undefined =>
  typeof value === "string" && value.length > 0 ? value : undefined;
export const timestampOf = (value: unknown): string | undefined => {
  const text = stringOf(value);
  return text !== undefined && Number.isFinite(Date.parse(text))
    ? new Date(text).toISOString()
    : undefined;
};
export async function* nativeUsageFiles(
  root: string,
  gaps: UsageGap[],
): AsyncGenerator<string> {
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch {
    gaps.push({
      code: "native-source-unavailable",
      source: { kind: "native", file: root },
    });
    return;
  }
  for (const entry of entries.toSorted((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    const file = path.join(root, entry.name);
    if (entry.isDirectory()) yield* nativeUsageFiles(file, gaps);
    else if (entry.isFile() && entry.name.endsWith(".jsonl")) yield file;
  }
}
export async function* nativeUsageLines(file: string, gaps: UsageGap[]) {
  const input = createReadStream(file);
  const lines = createInterface({ input, crlfDelay: Infinity });
  let line = 0;
  try {
    for await (const text of lines) {
      line++;
      if (!text.trim()) continue;
      try {
        yield { row: objectOf(JSON.parse(text)), line };
      } catch {
        gaps.push({
          code: "malformed-native-row",
          source: { kind: "native", file, line },
        });
      }
    }
  } catch {
    gaps.push({
      code: "native-source-unreadable",
      source: { kind: "native", file },
    });
  } finally {
    lines.close();
    input.destroy();
  }
}
