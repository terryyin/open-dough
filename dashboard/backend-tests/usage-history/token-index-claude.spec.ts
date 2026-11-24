// Claude Code pricing in Opus 5.5 input-token equivalents. The November 15
// rate card lists input, five-minute writes, one-hour writes, reads and output
// per million tokens at 4/5/8/0.20/20 for Opus and 8/10/16/0.20/40 for Fable.
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { tokenIndexAnswer } from "../../server/tokenIndexRead.ts";
import { writeUsageHistory } from "../../server/usageHistory.ts";
import { deriveUsageTaskSummary } from "../../server/usageTaskSummary.ts";
import { usageTariffs } from "../../server/usageTariffs.ts";
import { defaultCohort } from "../../src/usageTokenIndex.ts";

const opus = "claude-opus-5-5";
const fable = "claude-fable-5-2";
const haiku = "claude-haiku-5-5";
const claudeCohort = { ...defaultCohort, tool: "claude" as const };
const reading = {
  projects: [makeMe.aPublishedSource.openDough.please()],
  launches: new Map(),
  checkedAt: null,
};
const claudeReading = { ...reading, tariff: usageTariffs.claude };
const claudeTask = (id: string) =>
  makeMe.aSummaryTask.identifiedAs(id).with({ host: "claude" });
const opusUsage = { model: opus, tier: "standard" };

test("Claude Code weighs its finished dashboard launches under the Claude tariff, workers at their own model, and leaves Codex's answer as it was", () => {
  const codex = makeMe.aSummaryTask.identifiedAs("codex").please();
  const codexReading = { ...reading, tariff: usageTariffs.codex };
  const codexBefore = tokenIndexAnswer(
    {
      ...codexReading,
      summary: makeMe.aUsageTaskSummary.with({ tasks: [codex] }).please(),
    },
    defaultCohort,
  );
  const opusResponse = {
    ...opusUsage,
    tokens: { uncachedInput: 1_000, cacheRead: 10_000, output: 100 },
  };
  const summary = makeMe.aUsageTaskSummary
    .with({
      tasks: [
        codex,
        claudeTask("fable-root")
          .endedAt("2026-11-02T12:00:00.000Z")
          .withUsage({
            model: fable,
            tier: "standard",
            responses: 2,
            tokens: {
              uncachedInput: 2_000,
              cacheRead: 200_000,
              cacheWrite: 20_000,
              cacheWrite5m: 8_000,
              cacheWrite1h: 12_000,
              output: 4_000,
            },
          })
          .withUsage(opusResponse)
          .withUsage({
            model: haiku,
            root: false,
            tier: "standard",
            tokens: {
              uncachedInput: 10_000,
              cacheRead: 1_000_000,
              cacheWrite: 100_000,
              cacheWrite5m: 100_000,
              cacheWrite1h: 0,
              output: 10_000,
            },
          })
          .please(),
        claudeTask("opus-root")
          .endedAt("2026-11-03T12:00:00.000Z")
          .withUsage(opusResponse)
          .please(),
        claudeTask("refinement")
          .with({ workflow: "refinement" })
          .withUsage({ model: "claude-sonnet-5-5", tier: "standard" })
          .please(),
      ],
    })
    .please();
  const input = { ...claudeReading, summary };

  const claude = tokenIndexAnswer(input, claudeCohort);
  expect(claude.tasks.map(({ id, index }) => [id, index])).toEqual([
    // Fable root, Opus root, and Haiku worker groups at their own rates.
    // (488,000 + 8,000 + 28,500) / 4
    ["fable-root", 131_125],
    ["opus-root", 2_000],
  ]);
  expect(claude.tariff.version).toBe(usageTariffs.claude.version);
  expect(claude.tasks[0]?.observed.model).toEqual({
    id: fable,
    name: "Claude Fable 5.2",
  });
  expect(claude.options.models.map(({ name }) => name)).toEqual([
    "Claude Fable 5.2",
    "Claude Opus 5.5",
    "Claude Sonnet 5.5",
  ]);
  const fableOnly = tokenIndexAnswer(input, { ...claudeCohort, model: fable });
  expect(fableOnly.tasks.map(({ id }) => id)).toEqual(["fable-root"]);
  expect(tokenIndexAnswer({ ...codexReading, summary }, defaultCohort)).toEqual(
    codexBefore,
  );
});

test("a stored one-hour cache write weighs more than the same five-minute write", async () => {
  const home = await mkdtemp(path.join(tmpdir(), "token-index-claude-writes-"));
  onTestFinished(() => rm(home, { recursive: true, force: true }));
  const store = path.join(home, "usage.json");
  const writing = (id: string, lifetime: "cacheWrite5m" | "cacheWrite1h") =>
    makeMe.aUsageTaskHistory
      .identifiedAs(id)
      .inClaudeCode()
      .withResponse({
        tokens: {
          uncachedInput: 1_000,
          cacheRead: 0,
          cacheWrite: 10_000,
          cacheWrite5m: 0,
          cacheWrite1h: 0,
          [lifetime]: 10_000,
          output: 0,
        },
      })
      .please();
  await writeUsageHistory(
    makeMe.aUsageHistory
      .with({
        tasks: [
          writing("five-minute", "cacheWrite5m"),
          writing("one-hour", "cacheWrite1h"),
        ],
      })
      .please(),
    store,
  );

  const answer = tokenIndexAnswer(
    { ...claudeReading, summary: await deriveUsageTaskSummary(store) },
    claudeCohort,
  );
  expect(answer.tasks.map(({ id, index }) => [id, index])).toEqual([
    // (1,000×4 + 10,000×5) / 4
    ["five-minute", 13_500],
    // (1,000×4 + 10,000×8) / 4
    ["one-hour", 21_000],
  ]);
});

test("a fast speed or an unsplit cache write, even at an estimated model's rates, leaves its Claude task without a point, counted unpriced", () => {
  const unsplit = {
    uncachedInput: 1_000,
    cacheRead: 0,
    cacheWrite: 500,
    output: 0,
  };
  const summary = makeMe.aUsageTaskSummary
    .with({
      tasks: [
        claudeTask("unknown-model-unsplit-write")
          .withUsage({
            model: "claude-mystery-9",
            tier: "standard",
            tokens: unsplit,
          })
          .please(),
        claudeTask("fast-worker")
          .withUsage(opusUsage)
          .withUsage({ model: opus, root: false, tier: "fast" })
          .please(),
        claudeTask("unsplit-write")
          .withUsage({ ...opusUsage, tokens: unsplit })
          .please(),
        claudeTask("no-write-and-synthetic")
          .withUsage(opusUsage)
          .withUsage({
            model: "<synthetic>",
            tier: "standard",
            tokens: { uncachedInput: 0, cacheRead: 0, output: 0 },
          })
          .please(),
      ],
    })
    .please();

  const answer = tokenIndexAnswer({ ...claudeReading, summary }, claudeCohort);
  expect(answer.tasks.map(({ id, index }) => [id, index])).toEqual([
    ["no-write-and-synthetic", 1_950],
  ]);
  expect(answer.unpriced).toBe(3);
});

test("an unlisted Claude model is estimated at the reference model's rates, cache writes included", () => {
  const mystery = claudeTask("mystery")
    .withUsage({
      model: "claude-mystery-9",
      tier: "standard",
      tokens: {
        uncachedInput: 1_000,
        cacheRead: 0,
        cacheWrite: 10_000,
        cacheWrite5m: 4_000,
        cacheWrite1h: 6_000,
        output: 0,
      },
    })
    .please();
  const summary = makeMe.aUsageTaskSummary.with({ tasks: [mystery] }).please();

  const [task] = tokenIndexAnswer(
    { ...claudeReading, summary },
    claudeCohort,
  ).tasks;
  // (1,000×4 + 4,000×5 + 6,000×8) / 4 at Claude Opus 5.5 rates
  expect(task?.index).toBe(18_000);
  expect(task?.substitutions).toEqual([
    {
      model: { id: "claude-mystery-9", name: "claude-mystery-9" },
      substitute: { id: opus, name: "Claude Opus 5.5" },
    },
  ]);
});
