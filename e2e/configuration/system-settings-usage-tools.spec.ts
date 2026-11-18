// Codex and Claude Code compared over a store the offline import filled from
// native sessions: a filter change, a task's detail, each tool's real unit,
// and Refresh bringing in a later Claude launch; display, tariff, model and
// pricing variants belong to frontend and backend token-index tests.
import path from "node:path";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { keepLaunchStore } from "../../dashboard/test-support/support/launchStore.ts";
import { expect } from "../../dashboard/test-support/dashboardTest.ts";
import { test } from "../../dashboard/test-support/support/pageTest.ts";
import { systemSettingsMachine } from "../../dashboard/test-support/support/systemSettingsMachine.ts";
import { visitUsage } from "../../dashboard/test-support/support/systemSettingsUsagePage.ts";
import { usageChart } from "../../dashboard/test-support/support/usageChartPage.ts";
import { usageSpacing } from "../../dashboard/test-support/support/usageSpacingPage.ts";
import {
  runImport,
  writeClaudeSession,
  writeCodexSession,
} from "../../dashboard/test-support/usage-history/importHarness.ts";

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

// A finished Codex launch on Nov 6 whose one GPT-6.1 Sol response at xhigh
// weighs 1,950 Sol input tokens, as in Usage's Codex journey.
const codexLaunch = makeMe.aLaunchRecord
  .executing({ identity: "SEED-9#codex", title: "codex launch" })
  .inCodexSession({ sessionId: "codex-launch" })
  .launchedAt(day(6))
  .withFirstInput({ state: "confirmed", turnId: "first-turn" })
  .completedWith({ message: "", receivedAt: day(6) })
  .please();
const writeCodexLaunch = (root: string) =>
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("codex-launch")
      .withTurnContext("first-turn", "gpt-6.1-sol", "xhigh")
      .withResponse("first-turn", "codex-response", {
        input_tokens: 10_000,
        cached_input_tokens: 9_000,
        cache_write_input_tokens: 0,
        output_tokens: 100,
      })
      .please(),
  );

test("both tools compare on one chart in their own units, follow a filter, open a task, take a Claude launch from Refresh and space tasks equally", async ({
  page,
}) => {
  const earlier = "5f0c6a52-6a1b-4c39-9f43-0d8b1c2e7a12",
    later = "5f0c6a52-6a1b-4c39-9f43-0d8b1c2e7a13";
  const claudeRoot = path.join(fixture.home, ".claude/projects/open-dough");
  keepLaunchStore(fixture.home, {
    "open-dough": [codexLaunch, claudeLaunch("earlier", earlier, 6)],
  });
  writeClaudeLaunch(claudeRoot, "earlier", earlier);
  writeCodexLaunch(path.join(fixture.home, ".codex/sessions/2026/11"));
  runImport(fixture.home, path.join(fixture.home, ".codex/sessions"), [
    "--claude-root",
    claudeRoot,
  ]);
  keepLaunchStore(fixture.home, {
    "open-dough": [
      codexLaunch,
      claudeLaunch("earlier", earlier, 6),
      claudeLaunch("later", later, 8),
    ],
  });
  writeClaudeLaunch(claudeRoot, "later", later);
  const server = await fixture.start("preview");
  const usage = await visitUsage(page, server.baseURL);
  await usage.showTool("Claude Code", true);
  await usage.showsPoints([
    "Nov 6 · Codex · 1,950",
    "Nov 6 · Claude Code · 6,000",
  ]);
  await usage.showsToolNotes([
    "Codex rate card read 2026-11-15 · standard speed · GPT-6.1 Sol input-token equivalents",
    "Anthropic API list prices read 2026-11-15 · standard speed · Claude Opus 5.5 input-token equivalents",
    "Not included: background agent-view row summaries, recaps and idle compaction",
  ]);
  await usage.choose("Effort", "high");
  await usage.showsPoints(["Nov 6 · Claude Code · 6,000"]);
  await usage.showsCohortNote("0 tasks · Last 30 days", "Codex");
  await usage.selectPoint("Nov 6 · Claude Code · 6,000", "pointer");
  await usage.showsFact("Token index", "6,000");
  await usage.closeDetail("Nov 6 · Claude Code · 6,000");

  await usage.refresh();
  await usage.showsPoints([
    "Nov 6 · Claude Code · 6,000",
    "Nov 8 · Claude Code · 6,000",
  ]);
  await usage.showsChecked();
  await usage.choose("Effort", "Any effort");
  const shown = [
    "Nov 6 · Codex · 1,950",
    "Nov 6 · Claude Code · 6,000",
    "Nov 8 · Claude Code · 6,000",
  ];
  await usage.showsPoints(shown);

  const spacing = usageSpacing(page);
  await spacing.space(true);
  await spacing.showsTaskOrderAxis();
  const [first, second, third] = await usageChart(page).markCentres(shown);
  expect((third?.x ?? 0) - (second?.x ?? 0)).toBeCloseTo(
    (second?.x ?? 0) - (first?.x ?? 0),
    1,
  );
  await usage.selectPoint("Nov 8 · Claude Code · 6,000", "pointer");
  await usage.showsFact("Token index", "6,000");
  await usage.showsFact("Ended", { at: day(8), outcome: "Completed" });
  await spacing.space(false);
  await spacing.showsDateAxis(["Nov 6", "Nov 8"]);
  await usage.showsFact("Token index", "6,000");
});
