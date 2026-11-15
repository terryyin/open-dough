// The latest per-task usage summary (./usageTaskSummary.ts) for the running
// dashboard. A request reads only the summary file beside the store and the
// store's small manifest, to tell whether the summary still derives from it.
// When it is missing, unreadable, of another format or derived from another
// store document, a separate process (./usageTaskSummaryMain.ts) rebuilds it
// off this server's event loop; concurrent requests share that rebuild.
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import {
  storeBytes,
  storeDigest,
  summaryFormat,
  usageTaskSummaryFile,
  type UsageTaskSummary,
} from "./usageTaskSummary.ts";

const derivation = fileURLToPath(
  new URL("./usageTaskSummaryMain.ts", import.meta.url),
);
const runFile = promisify(execFile);
const rebuilds = new Map<string, Promise<UsageTaskSummary>>();

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

async function derive(store: string, file: string): Promise<void> {
  try {
    await runFile(process.execPath, [derivation, store, file]);
  } catch (error) {
    const { stderr, message } = error as { stderr?: string; message: string };
    throw new Error(
      `Usage could not be derived: ${stderr?.trim() || message}`,
      { cause: error },
    );
  }
}

function rebuild(store: string, file: string): Promise<UsageTaskSummary> {
  const running = rebuilds.get(file);
  if (running !== undefined) return running;
  const next = derive(store, file)
    .then(() => storedSummary(file))
    .then((summary) => {
      if (summary === undefined)
        throw new Error("Usage could not be derived: no summary was written.");
      return summary;
    })
    .finally(() => {
      rebuilds.delete(file);
    });
  rebuilds.set(file, next);
  return next;
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
    : rebuild(store, file);
}
