// The Tool choice over a store the offline import filled from both tools'
// native sessions; pricing variants belong to backend token-index tests.
import path from "node:path";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { keepLaunchStore } from "../../dashboard/tests/support/launchStore.ts";
import { test } from "../../dashboard/tests/support/pageTest.ts";
import { systemSettingsMachine } from "../../dashboard/tests/support/systemSettingsMachine.ts";
import { visitUsage } from "../../dashboard/tests/support/systemSettingsUsagePage.ts";
import {
  runImport,
  writeClaudeSession,
  writeCodexSession,
} from "../../dashboard/tests/usage-history/importHarness.ts";

const sol = "gpt-6.1-sol";
const day = (date: number) =>
  `2026-11-${String(date).padStart(2, "0")}T12:00:00.000Z`;
let fixture: ReturnType<typeof systemSettingsMachine>;
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date("2026-11-15T12:00:00.000Z") });
  fixture = systemSettingsMachine();
});
test.afterEach(async () => fixture.close());

test("Claude Code shows its imported launches under its own tariff, and Codex again shows its own", async ({
  page,
}) => {
  const reference = "5f0c6a52-6a1b-4c39-9f43-0d8b1c2e7a11";
  keepLaunchStore(fixture.home, {
    "open-dough": [
      makeMe.aLaunchRecord
        .executing({ identity: "SEED-9#codex", title: "Codex launch" })
        .inCodexSession({ sessionId: "codex-launch" })
        .withFirstInput({ state: "confirmed", turnId: "first-turn" })
        .completedWith({ message: "", receivedAt: day(6) })
        .please(),
      makeMe.aLaunchRecord
        .executing({ identity: "SEED-9#claude", title: "Claude launch" })
        .inClaudeSession({ sessionId: "claude-launch" })
        .reportingThrough({
          origin: "http://localhost:4318",
          reference,
          command: "report",
        })
        .completedWith({ message: "", receivedAt: day(7) })
        .please(),
    ],
  });
  const codexRoot = path.join(fixture.home, ".codex/sessions/2026/11");
  writeCodexSession(
    codexRoot,
    makeMe.aCodexRollout
      .forSession("codex-launch")
      .withTurnContext("first-turn", sol, "xhigh")
      .withResponse("first-turn", "codex-response", {
        input_tokens: 10_000,
        cached_input_tokens: 9_000,
        cache_write_input_tokens: 0,
        output_tokens: 100,
      })
      .please(),
  );
  const claudeRoot = path.join(fixture.home, ".claude/projects/open-dough");
  writeClaudeSession(
    claudeRoot,
    makeMe.aClaudeTranscript
      .forSession("claude-launch")
      .withLaunchInput({ reference, command: "report", role: true })
      // Opus 5.5 list prices: (1,000×4 + 10,000×0.20 + 2,000×8 one-hour
      // writes + 100×20) / 4 = 6,000 Opus 5.5 input tokens.
      .withAssistant({
        uuid: "claude-response",
        messageId: "msg-claude",
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
  runImport(fixture.home, codexRoot, ["--claude-root", claudeRoot]);
  const server = await fixture.start("preview");
  const usage = await visitUsage(page, server.baseURL);
  const codexTariff =
    "Codex rate card read 2026-11-15 · standard speed · GPT-6.1 Sol input-token equivalents";
  await usage.showsPoints(["Nov 6 · 1,950"]);
  await usage.showsTariff(codexTariff);

  await usage.choose("Tool", "Claude Code");
  await usage.showsPoints(["Nov 7 · 6,000"]);
  await usage.showsTariff(
    "Anthropic API list prices read 2026-11-15 · standard speed · Claude Opus 5.5 input-token equivalents",
  );
  await usage.offers("Model", ["All models", "Claude Opus 5.5"]);
  await usage.selectPoint("Nov 7 · 6,000", "pointer");
  await usage.showsFact("Observed model", "Claude Opus 5.5 · high effort");
  await usage.closeDetail("Nov 7 · 6,000");

  await usage.choose("Tool", "Codex");
  await usage.showsPoints(["Nov 6 · 1,950"]);
  await usage.showsTariff(codexTariff);
});
