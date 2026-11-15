// Shared launch setup and isolated home for the actual usage-import command.
// Each case keeps its native counter values and independent assertions visible.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test as base } from "../support/pageTest.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  codexTokenUsageRecord,
  codexTurnContext,
  usageHistoryDefaultAt,
} from "../../../Distribution/tests/support/codexRolloutTestData.mjs";

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

/** Launch for a Codex session/turn; incidental launch time is in-window. */
export const launch = (
  session: string,
  turn: string,
  launchedAt = usageHistoryDefaultAt,
) =>
  makeMe.aLaunchRecord
    .executing({
      identity: "SEED-358#reconstruct-codex-and-claude-code-usage-history",
      title: "Usage recovery",
    })
    .inCodexSession({ sessionId: session })
    .launchedAt(launchedAt)
    .requestingModel("requested-model")
    .requestingEffort("high")
    .withFirstInput({ state: "confirmed", turnId: turn })
    .please();

// Temporary row helpers for family specs not yet on `makeMe.aCodexRollout`.
// Wire shapes come from the Codex builder module; later slices retire these.
export const meta = (id: string) => ({ type: "session_meta", payload: { id } });
export const context = codexTurnContext;
export const response = (
  session: string,
  turn: string,
  id: string,
  usage: object,
) => codexTokenUsageRecord(session, turn, id, usage);
