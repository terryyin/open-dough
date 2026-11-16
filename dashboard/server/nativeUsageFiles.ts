// Bounded-memory native file traversal and line reading. A damaged line is a gap,
// never permission to discard independently readable response evidence.
import { createReadStream } from "node:fs";
import { readdir } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { createZstdDecompress } from "node:zlib";
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
// The native usage files a traversal yields, and a file's name without that
// `.jsonl` or `.jsonl.zst` extension.
const nativeUsageExtension = /\.jsonl(?:\.zst)?$/;
export const nativeUsageFileName = (file: string) =>
  path.basename(file).replace(nativeUsageExtension, "");
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
    else if (entry.isFile() && nativeUsageExtension.test(entry.name))
      yield file;
  }
}
export async function* nativeUsageLines(file: string, gaps: UsageGap[]) {
  const source = createReadStream(file);
  const decoder = file.endsWith(".zst") ? createZstdDecompress() : undefined;
  const input = decoder ?? source;
  let unreadable = false;
  const decoding =
    decoder === undefined
      ? undefined
      : pipeline(source, decoder).catch(() => {
          unreadable = true;
        });
  let line = 0;
  try {
    for await (const text of jsonLines(input)) {
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
    unreadable = true;
  } finally {
    input.destroy();
    source.destroy();
    await decoding;
    if (unreadable)
      gaps.push({
        code: "native-source-unreadable",
        source: { kind: "native", file },
      });
  }
}
// JSON Lines rows end at "\n" alone; readline would also end them at a raw
// U+2028 or U+2029 inside row text. The 0x0A byte never occurs inside a UTF-8
// multi-byte sequence, so each frame decodes on its own.
async function* jsonLines(input: AsyncIterable<Buffer>) {
  let pending: Buffer[] = [];
  const frame = (tail: Buffer) => {
    const text = Buffer.concat([...pending, tail]).toString("utf8");
    pending = [];
    return text.endsWith("\r") ? text.slice(0, -1) : text;
  };
  for await (const chunk of input) {
    let start = 0;
    for (
      let end = chunk.indexOf(0x0a, start);
      end !== -1;
      end = chunk.indexOf(0x0a, start)
    ) {
      yield frame(chunk.subarray(start, end));
      start = end + 1;
    }
    if (start < chunk.length) pending.push(chunk.subarray(start));
  }
  if (pending.length > 0) yield frame(Buffer.alloc(0));
}
