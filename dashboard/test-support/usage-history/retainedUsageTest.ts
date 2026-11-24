// Shared launch setup and isolated home for usage-history cases.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test as base } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

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
export const launch = (session: string, turn: string, launchedAt?: string) => {
  const record = makeMe.aLaunchRecord
    .executing({
      identity: "SEED-358#reconstruct-codex-and-claude-code-usage-history",
      title: "Usage recovery",
    })
    .inCodexSession({ sessionId: session })
    .requestingModel("requested-model")
    .requestingEffort("high")
    .withFirstInput({ state: "confirmed", turnId: turn });
  if (launchedAt !== undefined) record.launchedAt(launchedAt);
  return record.please();
};
