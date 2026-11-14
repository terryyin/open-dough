import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// These are direct per-response records, never cumulative token snapshots.
export function responseAccounting(text, threadId) {
  const responses = new Map();
  const lines = text.split("\n");
  let partialLastRecord = false;
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (!line) continue;
    let record;
    try {
      record = JSON.parse(line);
    } catch (error) {
      if (index !== lines.length - 1 || text.endsWith("\n")) throw error;
      partialLastRecord = true;
      continue;
    }
    const value = record.payload;
    if (
      record.type === "token_usage_record" &&
      value.thread_id === threadId &&
      value.response_id
    )
      responses.set(value.response_id, {
        ...value,
        recordedAt: record.timestamp,
      });
  }
  if (!responses.size)
    return { available: false, requests: null, usage: null, partialLastRecord };
  const usage = {};
  for (const value of responses.values())
    for (const [key, count] of Object.entries(value.usage))
      usage[key] = (usage[key] ?? 0) + count;
  return {
    available: true,
    requests: responses.size,
    usage,
    partialLastRecord,
    records: [...responses.values()],
  };
}

// Capture every admitted thread; absent usage remains unknown.
export function captureInvoiceAccounting({
  root,
  ancestry,
  threads: rollouts,
  historyLimits,
}) {
  const threads = {};
  for (const id of ancestry.keys()) {
    const path = rollouts.get(id);
    threads[id] =
      path && existsSync(path)
        ? responseAccounting(readFileSync(path, "utf8"), id)
        : { available: false, requests: null, usage: null };
  }
  const known = Object.values(threads).filter((value) => value.available);
  const complete =
    known.length === ancestry.size &&
    known.length > 0 &&
    known.every((value) => !value.partialLastRecord);
  const observedRequests = known.reduce((n, value) => n + value.requests, 0);
  const result = {
    threads,
    ancestry: Object.fromEntries(ancestry),
    historyLimits: Object.fromEntries(historyLimits),
    requests: complete ? observedRequests : null,
    observedRequests,
    observedTotalTokens: known.reduce(
      (n, value) => n + (value.usage.total_tokens ?? 0),
      0,
    ),
    observedOutputTokens: known.reduce(
      (n, value) => n + (value.usage.output_tokens ?? 0),
      0,
    ),
    complete,
  };
  writeFileSync(
    join(root, "accounting.json"),
    `${JSON.stringify(result, null, 2)}\n`,
  );
  return result;
}
