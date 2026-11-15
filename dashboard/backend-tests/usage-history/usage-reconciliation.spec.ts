// Native and collector overlap reconcile one response while preserving conflicts.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  expect,
  test,
  launch,
} from "../../tests/usage-history/retainedUsageTest.ts";
import {
  keepOperationalLaunch,
  nodeProcess,
  readImported,
  runImport,
  writeCodexSession,
} from "../../tests/usage-history/importHarness.ts";

test.describe("response usage reconciliation", () => {
  test("enriches partial measurements, reconciles a collector replay and retains conflicting facts without increasing totals", ({
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
    expect(observation.tokens).toEqual(
      expect.objectContaining({
        uncachedInput: 10,
        cacheRead: 40,
        cacheWrite: 0,
        output: 2,
      }),
    );
    observation.measurements = observation.measurements.map((item) => ({
      ...item,
      source: { kind: "native", file: "collector://one" },
    }));
    const [task] = Object.values(enriched.tasks);
    assert(task);
    nodeProcess(
      home,
      `
      const { writeUsageHistory } = await import('./dashboard/server/usageHistory.ts');
      await writeUsageHistory({ tasks: [${JSON.stringify({ ...task, requested: {} })}], observations: [${JSON.stringify(observation)}] });
    `,
    );
    const replayed = readImported(home);
    expect(Object.values(replayed.observations)).toHaveLength(1);
    const [replayedTask] = Object.values(replayed.tasks);
    const [replayedObservation] = Object.values(replayed.observations);
    assert(replayedTask);
    assert(replayedObservation);
    expect(replayedTask.requested).toEqual(
      expect.objectContaining({ model: "requested-model", effort: "high" }),
    );
    expect(replayedObservation.tokens).toEqual(
      expect.objectContaining({
        uncachedInput: 10,
        cacheRead: 40,
        cacheWrite: 0,
        output: 2,
      }),
    );
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
    const [conflicted] = Object.values(readImported(home).observations);
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

  test("keeps conflicting observed settings and lineage evidence without selecting a winner or double charging", ({
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
    const [observation] = Object.values(readImported(home).observations);
    assert(observation);
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
  });
});
