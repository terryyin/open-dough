// Repeated and competing measurements reconcile into one response where it is
// read; the history keeps the task's totals, with a conflicting category
// unknown and its gap in the task's coverage, never a sum.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { taskUsage, usageHistoryFile } from "../../server/usageHistory.ts";
import { deriveUsageTaskSummary } from "../../server/usageTaskSummary.ts";
import {
  expect,
  test,
  launch,
} from "../../test-support/usage-history/retainedUsageTest.ts";
import {
  keepOperationalLaunch,
  nodeProcess,
  readImported,
  runImport,
  writeCodexSession,
} from "../../test-support/usage-history/importHarness.ts";

test.describe("response usage reconciliation", () => {
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
    runImport(home, root);
    const [task] = Object.values(readImported(home).tasks);
    assert(task);
    const measured = {
      uncachedInput: 10,
      cacheRead: 40,
      cacheWrite: 0,
      output: 2,
    };
    expect(taskUsage(readImported(home), task.id)).toMatchObject({
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
    runImport(home, root);
    const enriched = readImported(home);
    expect(Object.values(enriched.observations)).toHaveLength(1);
    const [observation] = Object.values(enriched.observations);
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
    nodeProcess(
      home,
      `
      const { writeUsageHistory } = await import('./dashboard/server/usageHistory.ts');
      await writeUsageHistory({ tasks: [${JSON.stringify({ ...task, requested: {} })}], observations: [${JSON.stringify(observation)}], associations: ${JSON.stringify(Object.values(enriched.associations))} });
    `,
    );
    const replayed = readImported(home);
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
    runImport(home, root);
    const conflicting = readImported(home);
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
    const summary = await deriveUsageTaskSummary(usageHistoryFile(home));
    expect(summary.tasks.map(({ id, gaps }) => [id, gaps])).toEqual([
      [task.id, ["missing-token-components"]],
    ]);
    const [conflicted] = Object.values(conflicting.observations);
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
    runImport(home, root);
    const settled = readImported(home);
    const [task] = Object.values(settled.tasks);
    const [observation] = Object.values(settled.observations);
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
    runImport(home, root);
    const history = readImported(home);
    expect(Object.values(history.observations)).toHaveLength(1);
    const [association] = Object.values(history.associations);
    const [conflicting] = Object.values(history.observations);
    assert(association);
    assert(conflicting);
    expect(association.taskId).toBeNull();
    expect(conflicting.gaps).toContain("contradictory-lineage");
    // The response names no task now, so it counts for none.
    expect(taskUsage(history, task.id).requests).toBe(0);
    const summary = await deriveUsageTaskSummary(usageHistoryFile(home));
    expect(
      summary.tasks.map(({ id, usage, gaps }) => [id, usage, gaps]),
    ).toEqual([[task.id, [], ["no-attributable-response-usage"]]]);
  });
});
