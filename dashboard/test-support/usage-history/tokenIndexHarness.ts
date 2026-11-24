// Usage-history launch, transcript, and persistence fixtures.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { usageCheckFile } from "../../server/usageCheck.ts";
import { usageHistoryFile } from "../../server/usageHistory.ts";
import { deriveUsageTaskSummary } from "../../server/usageTaskSummary.ts";
// A finished execution launch of story `SEED-7#<session>` in that Codex
// session, whose first turn is `<session>-turn`.
export const finished = (sessionId: string) =>
  makeMe.aLaunchRecord
    .executing({ identity: `SEED-7#${sessionId}`, title: `Story ${sessionId}` })
    .inCodexSession({ sessionId })
    .launchedAt("2026-11-14T09:00:00.000Z")
    .withFirstInput({ state: "confirmed", turnId: `${sessionId}-turn` })
    .completedWith({ message: "" })
    .please();
export const counters = (output: number) => ({
  input_tokens: 10_000,
  cached_input_tokens: 8_000,
  cache_write_input_tokens: 0,
  output_tokens: output,
});
export const sol = "gpt-6.1-sol";
// The session's rollout so far: its first turn with one response of `output`.
export const rootRollout = (session: string, output: number) =>
  makeMe.aCodexRollout
    .forSession(session)
    .withTurnContext(`${session}-turn`, sol, "xhigh")
    .withResponse(`${session}-turn`, `${session}-${output}`, counters(output));
// The rollout of `<parent>-worker`, the agent that session's first turn
// spawned, with its one response of 70 output tokens.
export const workerRollout = (parent: string) =>
  makeMe.aCodexRollout
    .forSession(`${parent}-worker`)
    .withParent(parent)
    .withTurnContext("worker-turn", sol, "xhigh")
    .withResponse("worker-turn", "worker-own", counters(70), {
      rootTurnId: `${parent}-turn`,
    });
// Each task's usage as the history in `home` sums it, by story.
export const storedUsage = async (home: string) =>
  new Map(
    (await deriveUsageTaskSummary(usageHistoryFile(home))).tasks.map(
      ({ identity, usage }) => [identity, usage] as const,
    ),
  );

// Every file kept beside the usage history in `home`, by name, as it is
// stored now (content, inode and modification time), without the check
// record: equal when nothing but a check time was written between two reads.
export function storedBesideCheck(home: string) {
  const store = usageHistoryFile(home);
  const directory = path.dirname(store);
  return Object.fromEntries(
    readdirSync(directory, { recursive: true, encoding: "utf8" })
      .map((name) => path.join(directory, name))
      .filter((file) => file !== usageCheckFile(store))
      .toSorted()
      .map((file) => {
        const { ino, mtimeNs } = statSync(file, { bigint: true });
        const content = statSync(file).isFile()
          ? createHash("sha256").update(readFileSync(file)).digest("hex")
          : "directory";
        return [file, [content, ino, mtimeNs]];
      }),
  );
}
