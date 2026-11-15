// What a repeated check does with evidence that is split or gone: a Refresh
// reads every file of a session one of whose files changed, so each of its
// responses is counted once, and a task whose rollout was deleted after it
// was read keeps its totals and its point in the chart through a Refresh and
// an import. Checks that find nothing new are ./repeated-checks.spec.ts.
import { appendFileSync, rmSync, utimesSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keepLaunchStore } from "../../tests/support/launchStore.ts";
import {
  runImport,
  writeCodexSession,
} from "../../tests/usage-history/importHarness.ts";
import {
  counters,
  expect,
  finished,
  rootRollout,
  storedUsage,
  test,
  usageServer,
} from "../../tests/usage-history/tokenIndexHarness.ts";

const longAgo = new Date("2026-11-01T00:00:00.000Z");

test("a Refresh after one of a session's two files changed counts each of the session's responses once, and so does an import after it", async ({
  machine,
}) => {
  const { home } = machine;
  const sessions = path.join(home, ".codex/sessions");
  const archived = path.join(home, ".codex/archived_sessions");
  const bothRoots = ["--codex-root", archived];
  keepLaunchStore(home, { "open-dough": [finished("split")] });
  const live = writeCodexSession(
    path.join(sessions, "2026/11/14"),
    rootRollout("split", 100).please(),
  );
  // The archived file repeats the live file's response and holds one more.
  const unchanged = writeCodexSession(
    archived,
    rootRollout("split", 100)
      .withResponse("split-turn", "split-archived", counters(30))
      .please(),
  );
  runImport(home, sessions, bothRoots);
  const usage = await usageServer(machine);
  await usage.refresh();
  const totals = async () =>
    (await storedUsage(home))
      .get("SEED-7#split")
      ?.map(({ responses, tokens }) => [responses, tokens.output]);
  expect(await totals()).toEqual([[2, 130]]);

  utimesSync(unchanged, longAgo, longAgo);
  const [gained] = makeMe.aCodexRollout
    .forSession("split")
    .withResponse("split-turn", "split-new", counters(5))
    .rows();
  appendFileSync(live, `${JSON.stringify(gained)}\n`);
  await usage.refresh();

  expect(await totals()).toEqual([[3, 135]]);

  runImport(home, sessions, bothRoots);
  expect(await totals()).toEqual([[3, 135]]);
});

test("a task whose rollout was deleted keeps its totals and its point in the chart through a Refresh and then an import", async ({
  machine,
}) => {
  const { home } = machine;
  const sessions = path.join(home, ".codex/sessions");
  const day = path.join(sessions, "2026/11/14");
  keepLaunchStore(home, {
    "open-dough": [finished("kept"), finished("removed")],
  });
  const kept = writeCodexSession(day, rootRollout("kept", 100).please());
  const rollout = writeCodexSession(
    day,
    rootRollout("removed", 200)
      .withResponse("removed-turn", "removed-more", counters(40))
      .please(),
  );
  runImport(home, sessions);
  const usage = await usageServer(machine);
  await usage.refresh();
  const chart = await usage.chart();
  const point = chart.tasks.find(
    ({ identity }) => identity === "SEED-7#removed",
  );
  expect(point?.coverage).toEqual({ kind: "measured" });
  expect(point?.index).toBeGreaterThan(0);
  const removed = async () => (await storedUsage(home)).get("SEED-7#removed");
  const totals = await removed();
  expect(totals).toMatchObject([
    { root: true, responses: 2, tokens: { output: 240 } },
  ]);

  rmSync(rollout);
  // The other task's rollout changes, so this Refresh writes the history.
  const [gained] = makeMe.aCodexRollout
    .forSession("kept")
    .withResponse("kept-turn", "kept-more", counters(7))
    .rows();
  appendFileSync(kept, `${JSON.stringify(gained)}\n`);
  await usage.refresh();

  expect(await removed()).toEqual(totals);
  const refreshed = await usage.chart();
  expect(refreshed.tasks).toContainEqual(point);
  expect(refreshed.tasks).toHaveLength(chart.tasks.length);

  runImport(home, sessions);

  expect(await removed()).toEqual(totals);
  const imported = await usage.chart();
  expect(imported.tasks).toContainEqual(point);
  expect(imported.tasks).toHaveLength(chart.tasks.length);
});
