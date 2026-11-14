// Native and collector overlap reconcile one response while preserving conflicts.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import {
  expect,
  test,
  launch,
  meta,
  context,
  response,
} from "../../tests/usage-history/retainedUsageTest.ts";
import {
  keepOperationalLaunch,
  nativeFile,
  nodeProcess,
  readImported,
  runImport,
} from "../../tests/usage-history/importHarness.ts";

test.describe("response usage reconciliation", () => {
  test("enriches partial measurements, reconciles a collector replay and retains conflicting facts without increasing totals", ({
    home,
    root,
  }) => {
    keepOperationalLaunch(home, launch("enrich", "turn"));
    const partial = response("enrich", "turn", "one", {
      input_tokens: 50,
      output_tokens: 2,
    });
    const file = nativeFile(root, "enrich", [meta("enrich"), partial]);
    runImport(home, root);
    nativeFile(root, "enrich", [
      meta("enrich"),
      partial,
      response("enrich", "turn", "one", {
        input_tokens: 50,
        cached_input_tokens: 40,
        cache_write_input_tokens: 0,
        output_tokens: 2,
      }),
    ]);
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
    writeFileSync(
      file,
      `${
        readFileSync(file, "utf8") +
        JSON.stringify(
          response("enrich", "turn", "one", {
            input_tokens: 50,
            cached_input_tokens: 42,
            cache_write_input_tokens: 0,
            output_tokens: 2,
          }),
        )
      }\n`,
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
    const used = response("conflict", "turn", "one", {
      input_tokens: 10,
      cached_input_tokens: 0,
      cache_write_input_tokens: 0,
      output_tokens: 2,
    });
    nativeFile(root, "conflict", [
      meta("conflict"),
      context("turn", "model-a", "low"),
      used,
      context("turn", "model-b", "low"),
      used,
    ]);
    runImport(home, root);
    const [observation] = Object.values(readImported(home).observations);
    assert(observation);
    expect(observation.settings.model).toBeUndefined();
    expect(observation.settings.effort).toBe("low");
    expect(observation.gaps).toContain("contradictory-observed-settings");
    expect(observation.measurements.map((item) => item.settings.model)).toEqual(
      ["model-a", "model-b"],
    );
    nativeFile(root, "conflict", [
      meta("conflict"),
      used,
      response("conflict", "another-turn", "one", { output_tokens: 2 }),
    ]);
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
