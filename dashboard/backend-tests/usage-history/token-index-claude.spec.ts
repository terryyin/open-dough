// The Claude Code cohort under the Claude tariff, figured here from the
// Anthropic API list prices read 2026-11-15 (USD per 1M tokens: input,
// five-minute write, one-hour write, cache read, output), in Claude Opus 5.5
// input-token equivalents (its $4 input):
//   Opus 5.5  4 / 5 / 8 / 0.20 / 20
//   Fable 5.2 8 / 10 / 16 / 0.20 / 40
//   Haiku 5.5 0.10 / 0.125 / 0.20 / 0.01 / 0.50
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { usageTariffs } from "../../server/usageTariffs.ts";
import {
  day,
  expect,
  readCohort,
  test,
  usageServer,
  writeTaskUsage,
} from "../../test-support/usage-history/tokenIndexHarness.ts";

const opus = "claude-opus-5-5",
  fable = "claude-fable-5-2",
  haiku = "claude-haiku-5-5";

// Fable 5.2: 1,000×8 + 100,000×0.2 + 4,000×10 + 6,000×16 + 2,000×40 = 244,000.
const fableResponse = {
  model: fable,
  tokens: {
    uncachedInput: 1_000,
    cacheRead: 100_000,
    cacheWrite: 10_000,
    cacheWrite5m: 4_000,
    cacheWrite1h: 6_000,
    output: 2_000,
  },
};
// Opus 5.5 without writes: 1,000×4 + 10,000×0.2 + 100×20 = 8,000.
const opusResponse = {
  model: opus,
  tokens: { uncachedInput: 1_000, cacheRead: 10_000, output: 100 },
};

test("Claude Code weighs its finished dashboard launches under the Claude tariff, workers at their own model, and leaves Codex's answer as it was", async ({
  machine,
}) => {
  const codex = makeMe.aUsageTaskHistory.identifiedAs("codex").please();
  await writeTaskUsage(machine.home, [codex]);
  const usage = await usageServer(machine);
  // Writing the store again moves only the check time.
  const codexAnswer = async () => ({
    ...(await usage.chart("?tool=codex")),
    checkedAt: null,
  });
  const codexBefore = await codexAnswer();

  await writeTaskUsage(machine.home, [
    codex,
    makeMe.aUsageTaskHistory
      .identifiedAs("fable-root")
      .inClaudeCode()
      .endedAt(day(2))
      .withResponse(fableResponse)
      .withResponse(fableResponse)
      .withResponse(opusResponse)
      // Haiku 5.5: 10,000×0.10 + 1,000,000×0.01 + 100,000×0.125 + 10,000×0.50
      // = 28,500; at Fable's rates it would weigh 3,240,000.
      .withWorkerResponse({
        model: haiku,
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
    makeMe.aUsageTaskHistory
      .identifiedAs("opus-root")
      .inClaudeCode()
      .endedAt(day(3))
      .withResponse(opusResponse)
      .please(),
    makeMe.aUsageTaskHistory
      .identifiedAs("refinement")
      .inClaudeCode()
      .inWorkflow("refinement")
      .withResponse({ model: "claude-sonnet-5-5" })
      .please(),
  ]);

  const claude = await usage.chart("?tool=claude&workflow=execution");
  expect(claude.tasks.map(({ id, index }) => [id, index])).toEqual([
    // (2 × 244,000 + 8,000 + 28,500) / 4
    ["fable-root", 131_125],
    // 8,000 / 4
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
  const fableOnly = await usage.chart(`?tool=claude&model=${fable}`);
  expect(fableOnly.tasks.map(({ id }) => id)).toEqual(["fable-root"]);
  expect(await codexAnswer()).toEqual(codexBefore);
});

test("a one-hour cache write weighs more than the same five-minute write", async ({
  machine,
}) => {
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
  const cohort = await readCohort(
    machine.home,
    makeMe.aUsageHistory
      .with({
        tasks: [
          writing("five-minute", "cacheWrite5m"),
          writing("one-hour", "cacheWrite1h"),
        ],
      })
      .please(),
  );
  expect(
    cohort({ tool: "claude" }).tasks.map(({ id, index }) => [id, index]),
  ).toEqual([
    // (1,000×4 + 10,000×5) / 4
    ["five-minute", 13_500],
    // (1,000×4 + 10,000×8) / 4
    ["one-hour", 21_000],
  ]);
});

test("a fast speed or an unsplit cache write, even at an estimated model's rates, leaves its Claude task without a point, counted unpriced", async ({
  machine,
}) => {
  const tasks = [
    makeMe.aUsageTaskHistory
      .identifiedAs("unknown-model-unsplit-write")
      .inClaudeCode()
      .withResponse({
        model: "claude-mystery-9",
        tokens: { uncachedInput: 1_000, cacheWrite: 500, output: 0 },
      })
      .please(),
    makeMe.aUsageTaskHistory
      .identifiedAs("fast-worker")
      .inClaudeCode()
      .withResponse({})
      .withWorkerResponse({ serviceTier: "fast" })
      .please(),
    makeMe.aUsageTaskHistory
      .identifiedAs("unsplit-write")
      .inClaudeCode()
      .withResponse({
        tokens: { uncachedInput: 1_000, cacheWrite: 500, output: 0 },
      })
      .please(),
    // Writing nothing needs no split, and Claude Code's own messages weigh nothing:
    // (1,000×4 + 9,000×0.2 + 100×20) / 4.
    makeMe.aUsageTaskHistory
      .identifiedAs("no-write-and-synthetic")
      .inClaudeCode()
      .withResponse({})
      .withResponse({
        model: "<synthetic>",
        tokens: { uncachedInput: 0, cacheRead: 0, output: 0 },
      })
      .please(),
  ];
  const cohort = await readCohort(
    machine.home,
    makeMe.aUsageHistory.with({ tasks }).please(),
  );
  const answer = cohort({ tool: "claude" });
  expect(answer.tasks.map(({ id, index }) => [id, index])).toEqual([
    ["no-write-and-synthetic", 1_950],
  ]);
  expect(answer.unpriced).toBe(3);
});

test("an unlisted Claude model is estimated at the reference model's rates, cache writes included", async ({
  machine,
}) => {
  const cohort = await readCohort(
    machine.home,
    makeMe.aUsageHistory
      .with({
        tasks: [
          makeMe.aUsageTaskHistory
            .identifiedAs("mystery")
            .inClaudeCode()
            .withResponse({
              model: "claude-mystery-9",
              tokens: {
                uncachedInput: 1_000,
                cacheRead: 0,
                cacheWrite: 10_000,
                cacheWrite5m: 4_000,
                cacheWrite1h: 6_000,
                output: 0,
              },
            })
            .please(),
        ],
      })
      .please(),
  );
  const [task] = cohort({ tool: "claude" }).tasks;
  // (1,000×4 + 4,000×5 + 6,000×8) / 4 at Claude Opus 5.5 rates
  expect(task?.index).toBe(18_000);
  expect(task?.substitutions).toEqual([
    {
      model: { id: "claude-mystery-9", name: "claude-mystery-9" },
      substitute: { id: "claude-opus-5-5", name: "Claude Opus 5.5" },
    },
  ]);
});
