// Repeated and competing measurements reconcile into one response where it is
// read; the history keeps the task's totals, with a conflicting category
// unknown and its gap in the task's coverage, never a sum.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { describe, expect } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  readUsageHistory,
  taskUsage,
  usageHistoryFile,
  writeUsageHistory,
} from "../../server/usageHistory.ts";
import {
  claudeUsageRoots,
  importUsageHistory,
} from "../../server/usageImport.ts";
import type { UsageResponses } from "../../server/usageResponsesFile.ts";
import { deriveUsageTaskSummary } from "../../server/usageTaskSummary.ts";
import {
  test,
  launch,
} from "../../test-support/usage-history/retainedUsageTest.ts";
import {
  keepOperationalLaunch,
  writeCodexSession,
} from "../../test-support/usage-history/importHarness.ts";

describe("response usage reconciliation", () => {
  test("enriches partial measurements, counts a session written again once and leaves conflicting counters unknown without increasing totals", async ({
    home,
    root,
  }) => {
    keepOperationalLaunch(home, launch("enrich", "turn"));
    const partial = makeMe.aCodexRollout
      .forSession("enrich")
      .withResponse("turn", "one", { input_tokens: 50, output_tokens: 2 })
      .please();
    const file = writeCodexSession(root, partial);
    const options = makeMe.aUsageImportOptions
      .with({
        home,
        store: usageHistoryFile(home),
        codexRoots: [root],
        claudeRoots: claudeUsageRoots(home),
      })
      .please();
    await importUsageHistory(options);
    const initial = await readUsageHistory(options.store);
    const [task] = Object.values(initial.tasks);
    assert(task);
    const measured = {
      uncachedInput: 10,
      cacheRead: 40,
      cacheWrite: 0,
      output: 2,
    };
    expect(taskUsage(initial, task.id)).toMatchObject({
      requests: 1,
      tokens: { cacheRead: null, output: 2 },
    });
    writeCodexSession(
      root,
      makeMe.aCodexRollout
        .forSession("enrich")
        .withResponse("turn", "one", { input_tokens: 50, output_tokens: 2 })
        .withResponse("turn", "one", {
          input_tokens: 50,
          cached_input_tokens: 40,
          cache_write_input_tokens: 0,
          output_tokens: 2,
        })
        .please(),
    );
    await importUsageHistory(options);
    const enriched = await readUsageHistory(options.store);
    const { observations, associations } = JSON.parse(
      readFileSync(options.responses, "utf8"),
    ) as UsageResponses;
    expect(Object.values(observations)).toHaveLength(1);
    const [observation] = Object.values(observations);
    assert(observation);
    expect(observation.tokens).toEqual(expect.objectContaining(measured));
    expect(taskUsage(enriched, task.id)).toMatchObject({
      requests: 1,
      tokens: measured,
    });
    // Another writer passes the session's one response again, from its own
    // source, with its task.
    observation.measurements = observation.measurements.map((item) => ({
      ...item,
      source: { kind: "native", file: "collector://one" },
    }));
    await writeUsageHistory(
      {
        tasks: [{ ...task, requested: {} }],
        observations: [observation],
        associations: Object.values(associations),
      },
      options.store,
    );
    const replayed = await readUsageHistory(options.store);
    expect(replayed.tasks[task.id]?.requested).toEqual(
      expect.objectContaining({ model: "requested-model", effort: "high" }),
    );
    expect(taskUsage(replayed, task.id)).toMatchObject({
      requests: 1,
      tokens: measured,
    });
    const [conflict] = makeMe.aCodexRollout
      .forSession("enrich")
      .withResponse("turn", "one", {
        input_tokens: 50,
        cached_input_tokens: 42,
        cache_write_input_tokens: 0,
        output_tokens: 2,
      })
      .rows();
    assert(conflict);
    writeFileSync(
      file,
      `${readFileSync(file, "utf8") + JSON.stringify(conflict)}\n`,
    );
    await importUsageHistory(options);
    const conflicting = await readUsageHistory(options.store);
    const responses = JSON.parse(
      readFileSync(options.responses, "utf8"),
    ) as UsageResponses;
    expect(taskUsage(conflicting, task.id)).toMatchObject({
      requests: 1,
      tokens: {
        uncachedInput: null,
        cacheRead: null,
        cacheWrite: 0,
        output: 2,
      },
      unmeasured: { uncachedInput: 1, cacheRead: 1, cacheWrite: 0, output: 0 },
    });
    const summary = await deriveUsageTaskSummary(options.store);
    expect(summary.tasks.map(({ id, gaps }) => [id, gaps])).toEqual([
      [task.id, ["missing-token-components"]],
    ]);
    const [conflicted] = Object.values(responses.observations);
    assert(conflicted);
    expect(conflicted.tokens.cacheRead).toBeNull();
    expect(conflicted.tokens.uncachedInput).toBeNull();
    expect(conflicted.gaps).toContain("contradictory-measurements");
    expect(
      conflicted.measurements.some(
        (item) => item.reported["cached_input_tokens"] === 40,
      ),
    ).toBe(true);
    expect(
      conflicted.measurements.some(
        (item) => item.reported["cached_input_tokens"] === 42,
      ),
    ).toBe(true);
  });

  test("keeps conflicting observed settings and lineage evidence without selecting a winner or double charging", async ({
    home,
    root,
  }) => {
    keepOperationalLaunch(home, launch("conflict", "turn"));
    const used = {
      input_tokens: 10,
      cached_input_tokens: 0,
      cache_write_input_tokens: 0,
      output_tokens: 2,
    };
    writeCodexSession(
      root,
      makeMe.aCodexRollout
        .forSession("conflict")
        .withTurnContext("turn", "model-a", "low")
        .withResponse("turn", "one", used)
        .withTurnContext("turn", "model-b", "low")
        .withResponse("turn", "one", used)
        .please(),
    );
    const options = makeMe.aUsageImportOptions
      .with({
        home,
        store: usageHistoryFile(home),
        codexRoots: [root],
        claudeRoots: claudeUsageRoots(home),
      })
      .please();
    await importUsageHistory(options);
    const settled = await readUsageHistory(options.store);
    const settledResponses = JSON.parse(
      readFileSync(options.responses, "utf8"),
    ) as UsageResponses;
    const [task] = Object.values(settled.tasks);
    const [observation] = Object.values(settledResponses.observations);
    assert(task);
    assert(observation);
    expect(taskUsage(settled, task.id)).toMatchObject({
      requests: 1,
      tokens: { output: 2 },
    });
    expect(
      Object.values(settled.sessions).flatMap(({ entries }) =>
        entries.map(({ model, effort }) => [model, effort]),
      ),
    ).toEqual([[null, "low"]]);
    expect(observation.settings.model).toBeUndefined();
    expect(observation.settings.effort).toBe("low");
    expect(observation.gaps).toContain("contradictory-observed-settings");
    expect(observation.measurements.map((item) => item.settings.model)).toEqual(
      ["model-a", "model-b"],
    );
    writeCodexSession(
      root,
      makeMe.aCodexRollout
        .forSession("conflict")
        .withResponse("turn", "one", used)
        .withResponse("another-turn", "one", { output_tokens: 2 })
        .please(),
    );
    await importUsageHistory(options);
    const history = await readUsageHistory(options.store);
    const responses = JSON.parse(
      readFileSync(options.responses, "utf8"),
    ) as UsageResponses;
    expect(Object.values(responses.observations)).toHaveLength(1);
    const [association] = Object.values(responses.associations);
    const [conflicting] = Object.values(responses.observations);
    assert(association);
    assert(conflicting);
    expect(association.taskId).toBeNull();
    expect(conflicting.gaps).toContain("contradictory-lineage");
    // The response names no task now, so it counts for none.
    expect(taskUsage(history, task.id).requests).toBe(0);
    const summary = await deriveUsageTaskSummary(options.store);
    expect(
      summary.tasks.map(({ id, usage, gaps }) => [id, usage, gaps]),
    ).toEqual([[task.id, [], ["no-attributable-response-usage"]]]);
  });
});
