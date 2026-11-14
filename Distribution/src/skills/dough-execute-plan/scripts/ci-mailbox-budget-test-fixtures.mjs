// Controlled-clock budget end and byte snapshot of an ended mailbox's evidence.
// Recovery and Codex lifecycle proofs share this; never wait on wall-clock time.
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { githubApi } from "./github-actions-api-test-fixtures.mjs";
import { runMailboxWorker } from "./ci-mailbox.mjs";
import { watchCiExecution } from "./watch-ci-execution.mjs";

export function snapshotMailboxRecords(directory) {
  const eventsDir = join(directory, "events");
  const events = readdirSync(eventsDir)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => `${name}:${readFileSync(join(eventsDir, name), "utf8")}`)
    .join("\n");
  const result = readFileSync(join(directory, "result.json"), "utf8");
  return {
    events,
    result,
    digest: createHash("sha256").update(events).update(result).digest("hex"),
  };
}

export async function runMailboxWorkerUntilBudget({
  directory,
  root,
  storage,
  observeRoot,
  maxDurationMs = 5_000,
}) {
  let elapsed = 0;
  await runMailboxWorker(directory, {
    root,
    storage,
    observe: (request) =>
      watchCiExecution({
        ...request,
        ...(observeRoot !== undefined ? { root: observeRoot } : {}),
        maxDurationMs,
        now: () => elapsed,
        pollMs: 10 * 60 * 1000,
        sleep: async () => undefined,
        gh: githubApi(() => {
          elapsed += 1_000;
          return [];
        }),
      }),
  });
}
