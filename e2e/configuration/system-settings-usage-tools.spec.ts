// Claude Code chosen over a store the offline import filled from native
// sessions, and Refresh bringing in a later Claude launch; tariff, model and
// pricing variants belong to frontend and backend token-index tests.
import path from "node:path";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { keepLaunchStore } from "../../dashboard/tests/support/launchStore.ts";
import { test } from "../../dashboard/tests/support/pageTest.ts";
import { systemSettingsMachine } from "../../dashboard/tests/support/systemSettingsMachine.ts";
import { visitUsage } from "../../dashboard/tests/support/systemSettingsUsagePage.ts";
import {
  runImport,
  writeClaudeSession,
} from "../../dashboard/tests/usage-history/importHarness.ts";

const day = (date: number) =>
  `2026-11-${String(date).padStart(2, "0")}T12:00:00.000Z`;
let fixture: ReturnType<typeof systemSettingsMachine>;
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date("2026-11-15T12:00:00.000Z") });
  fixture = systemSettingsMachine();
});
test.afterEach(async () => fixture.close());

// The finished Claude launch of story `SEED-9#<name>` in session
// `<name>-launch`, reporting through `reference`, ended on `date`.
const claudeLaunch = (name: string, reference: string, date: number) =>
  makeMe.aLaunchRecord
    .executing({ identity: `SEED-9#${name}`, title: `${name} launch` })
    .inClaudeSession({ sessionId: `${name}-launch` })
    .reportingThrough({
      origin: "http://localhost:4318",
      reference,
      command: "report",
    })
    .completedWith({ message: "", receivedAt: day(date) })
    .please();
// That launch's transcript in `root`: its one Opus 5.5 response weighs, at the
// list prices, (1,000×4 + 10,000×0.20 + 2,000×8 one-hour writes + 100×20) / 4
// = 6,000 Opus 5.5 input tokens.
const writeClaudeLaunch = (root: string, name: string, reference: string) =>
  writeClaudeSession(
    root,
    makeMe.aClaudeTranscript
      .forSession(`${name}-launch`)
      .withLaunchInput({ reference, command: "report", role: true })
      .withAssistant({
        uuid: `${name}-response`,
        messageId: `msg-${name}`,
        model: "claude-opus-5-5",
        effort: "high",
        usage: {
          input_tokens: 1_000,
          cache_read_input_tokens: 10_000,
          cache_creation_input_tokens: 2_000,
          cache_creation: {
            ephemeral_5m_input_tokens: 0,
            ephemeral_1h_input_tokens: 2_000,
          },
          output_tokens: 100,
          speed: "standard",
        },
      })
      .please(),
  );

test("Refresh brings in a Claude launch finished since the last check", async ({
  page,
}) => {
  const earlier = "5f0c6a52-6a1b-4c39-9f43-0d8b1c2e7a12",
    later = "5f0c6a52-6a1b-4c39-9f43-0d8b1c2e7a13";
  const claudeRoot = path.join(fixture.home, ".claude/projects/open-dough");
  keepLaunchStore(fixture.home, {
    "open-dough": [claudeLaunch("earlier", earlier, 6)],
  });
  writeClaudeLaunch(claudeRoot, "earlier", earlier);
  runImport(fixture.home, path.join(fixture.home, ".codex/sessions"), [
    "--claude-root",
    claudeRoot,
  ]);
  keepLaunchStore(fixture.home, {
    "open-dough": [
      claudeLaunch("earlier", earlier, 6),
      claudeLaunch("later", later, 8),
    ],
  });
  writeClaudeLaunch(claudeRoot, "later", later);
  const server = await fixture.start("preview");
  const usage = await visitUsage(page, server.baseURL);
  await usage.choose("Tool", "Claude Code");
  await usage.showsPoints(["Nov 6 · 6,000"]);

  await usage.refresh();
  await usage.showsPoints(["Nov 6 · 6,000", "Nov 8 · 6,000"]);
  await usage.showsChecked();
});
