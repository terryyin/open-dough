// The separate process (./usageProcess.ts) that derives the per-task usage
// summary (./usageTaskSummary.ts), so the dashboard server's event loop never
// scans the usage store: node usageTaskSummaryMain.ts <store> <summary file>.
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { replaceDurableJson } from "./durableJsonReplacement.ts";
import { usageProcessMain } from "./usageProcess.ts";
import { deriveUsageTaskSummary } from "./usageTaskSummary.ts";

await usageProcessMain(async ([store, file]) => {
  if (store === undefined || file === undefined)
    throw new Error("Name the usage store and the summary file.");
  const summary = await deriveUsageTaskSummary(store);
  await mkdir(path.dirname(file), { recursive: true });
  await replaceDurableJson(
    `${file}.${String(process.pid)}.tmp`,
    file,
    `${JSON.stringify(summary)}\n`,
  );
  return undefined;
});
