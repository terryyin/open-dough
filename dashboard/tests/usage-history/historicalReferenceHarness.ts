// Historical Codex rows via aCodexRollout; directives and unsupported wire
// examples stay visible in their cases.
import assert from "node:assert/strict";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { UsageHistory } from "../../server/usageHistory.ts";
import { writeCodexSession } from "./importHarness.ts";

export function recoveredTask(history: UsageHistory, turn: string) {
  const found = Object.values(history.tasks).find(
    (item) => item.rootTurnId === turn,
  );
  assert(found, `missing recovered task ${turn}`);
  return found;
}

/** Codex rows for one historical task at a recorded revision and cwd. */
export function historicalCodexTaskRows(
  cwd: string,
  revision: string,
  turn: string,
  text: string,
) {
  return makeMe.aCodexRollout
    .forSession(turn)
    .withCwd(cwd)
    .withGit({
      commit_hash: revision,
      repository_url: "git@github.com:example/historic.git",
    })
    .withTurnContext(turn)
    .withRow({
      type: "response_item",
      payload: {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text }],
      },
    })
    .withResponse(turn, `answer-${turn}`, { output_tokens: 7 })
    .please();
}

export function recordHistoricalTask(
  root: string,
  cwd: string,
  revision: string,
  turn: string,
  text: string,
) {
  return writeCodexSession(
    root,
    historicalCodexTaskRows(cwd, revision, turn, text),
  );
}
