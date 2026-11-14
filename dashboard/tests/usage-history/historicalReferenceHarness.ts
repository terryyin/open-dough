// Native wire and filesystem setup only; directives and historical files stay
// visible in their cases, including deliberately unsupported wire examples.
import assert from "node:assert/strict";
import type { UsageHistory } from "../../server/usageRecords.ts";
import { at, nativeFile } from "./importHarness.ts";
import { response } from "./retainedUsageTest.ts";

export function recoveredTask(history: UsageHistory, turn: string) {
  const found = Object.values(history.tasks).find(
    (item) => item.rootTurnId === turn,
  );
  assert(found, `missing recovered task ${turn}`);
  return found;
}
export function recordHistoricalTask(
  root: string,
  cwd: string,
  revision: string,
  turn: string,
  text: string,
) {
  return nativeFile(root, turn, [
    {
      type: "session_meta",
      payload: {
        id: turn,
        cwd,
        git: {
          commit_hash: revision,
          repository_url: "git@github.com:example/historic.git",
        },
      },
    },
    { type: "turn_context", payload: { turn_id: turn } },
    {
      type: "response_item",
      timestamp: at,
      payload: {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text }],
      },
    },
    response(turn, turn, `answer-${turn}`, { output_tokens: 7 }),
  ]);
}
