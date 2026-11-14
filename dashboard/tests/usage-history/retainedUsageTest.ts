// Shared launch setup and isolated home for the actual usage-import command.
// Each case keeps its native counter values and independent assertions visible.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test as base } from "../support/pageTest.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { at } from "./importHarness.ts";

export { expect } from "../support/pageTest.ts";
export const test = base.extend<{ home: string; root: string }>({
  // eslint-disable-next-line no-empty-pattern
  home: async ({}, use) => {
    const home = mkdtempSync(path.join(tmpdir(), "dough-usage-"));
    try {
      await use(home);
    } finally {
      rmSync(home, { recursive: true, force: true });
    }
  },
  root: async ({ home }, use) => {
    await use(path.join(home, "native"));
  },
});

export const launch = (session: string, turn: string) =>
  makeMe.aLaunchRecord
    .executing({
      identity: "SEED-358#reconstruct-codex-and-claude-code-usage-history",
      title: "Usage recovery",
    })
    .inCodexSession({ sessionId: session })
    .launchedAt(at)
    .requestingModel("requested-model")
    .requestingEffort("high")
    .withFirstInput({ state: "confirmed", turnId: turn })
    .please();
export const meta = (id: string) => ({ type: "session_meta", payload: { id } });
export const context = (turn: string, model: string, effort: string) => ({
  type: "turn_context",
  payload: { turn_id: turn, model, effort },
});
export const response = (
  session: string,
  turn: string,
  id: string,
  usage: object,
) => ({
  type: "token_usage_record",
  timestamp: at,
  payload: {
    thread_id: session,
    turn_id: turn,
    root_turn_id: turn,
    response_id: id,
    usage,
  },
});
