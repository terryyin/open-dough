// Shared launch setup and isolated home for the actual usage-import command.
// Cases build Codex rollouts and Claude transcripts through MakeMe; this helper
// supplies the isolated home/root fixture.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test as base } from "../support/pageTest.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

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
