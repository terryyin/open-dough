// The latest per-task usage summary (./usageTaskSummary.ts) for the running
// dashboard. A request reads only the summary file beside the store and the
// store document's bytes, to tell whether the summary still derives from it.
// When it is missing, unreadable, of another format or derived from another
// store document, a separate process (./usageTaskSummaryMain.ts) rebuilds it
// off this server's event loop (./usageProcess.ts); concurrent requests share
// that rebuild.
import { readFile } from "node:fs/promises";
import { runUsageProcess, sharedRuns } from "./usageProcess.ts";
import {
  storeBytes,
  storeDigest,
  summaryFormat,
  usageTaskSummaryFile,
  type UsageTaskSummary,
} from "./usageTaskSummary.ts";

const derivation = new URL("./usageTaskSummaryMain.ts", import.meta.url);
const shared = sharedRuns<UsageTaskSummary>();

async function storedSummary(
  file: string,
): Promise<UsageTaskSummary | undefined> {
  try {
    const summary = JSON.parse(
      await readFile(file, "utf8"),
    ) as Partial<UsageTaskSummary>;
    return summary.format === summaryFormat
      ? (summary as UsageTaskSummary)
      : undefined;
  } catch {
    return undefined;
  }
}

async function rebuild(store: string, file: string): Promise<UsageTaskSummary> {
  await runUsageProcess(
    derivation,
    [store, file],
    "Usage could not be derived",
  );
  const summary = await storedSummary(file);
  if (summary === undefined)
    throw new Error("Usage could not be derived: no summary was written.");
  return summary;
}

export async function currentUsageTaskSummary(
  store: string,
): Promise<UsageTaskSummary> {
  const file = usageTaskSummaryFile(store);
  const [summary, bytes] = await Promise.all([
    storedSummary(file),
    storeBytes(store),
  ]);
  return summary !== undefined && summary.store === storeDigest(bytes)
    ? summary
    : shared(file, () => rebuild(store, file));
}
