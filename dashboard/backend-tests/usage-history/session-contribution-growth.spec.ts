// What a new task adds to the stored usage history
// (../../server/usageHistory.ts): its task record and its session's
// contribution, a few kilobytes however many responses its rollout holds.
import { statSync } from "node:fs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  readUsageHistory,
  usageHistoryFile,
} from "../../server/usageHistory.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";
import {
  test,
  expect,
  launch,
} from "../../test-support/usage-history/retainedUsageTest.ts";
import {
  sessionTotals,
  writeCodexSession,
} from "../../test-support/usage-history/importHarness.ts";
import {
  claudeUsageRoots,
  importUsageHistory,
} from "../../server/usageImport.ts";

const used = (output: number) => ({
  input_tokens: 10,
  cached_input_tokens: 4,
  cache_write_input_tokens: 1,
  output_tokens: output,
});

test("a new task with a 400-response rollout grows the history by under 10 KB", async ({
  home,
  root,
}) => {
  keepLaunchStore(home, { "open-dough": [launch("earlier", "turn")] });
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("earlier")
      .withResponse("turn", "earlier-one", used(2))
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
  const { store } = options;
  const before = statSync(store).size;

  keepLaunchStore(home, {
    "open-dough": [launch("earlier", "turn"), launch("grown", "turn")],
  });
  const rollout = makeMe.aCodexRollout
    .forSession("grown")
    .withTurnContext("turn", "model-a", "low");
  for (const index of [...Array<number>(400).keys()])
    rollout.withResponse("turn", `grown-${index}`, used(3));
  writeCodexSession(root, rollout.please());
  expect(await importUsageHistory(options)).toMatchObject({
    tasks: 2,
    observations: 401,
  });

  expect(sessionTotals(await readUsageHistory(options.store))).toEqual([
    ["earlier", 1, 2],
    ["grown", 400, 1200],
  ]);
  const growth = statSync(store).size - before;
  expect(growth).toBeGreaterThan(0);
  expect(growth).toBeLessThan(10 * 1024);
});
