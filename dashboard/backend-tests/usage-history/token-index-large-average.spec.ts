import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  test,
  expect,
  usageServer,
  writeTaskUsage,
} from "../../tests/usage-history/tokenIndexHarness.ts";

test("an isolated 65-million task leaves the ten-task median at one million", async ({
  machine,
}) => {
  const indexes = [
    1_000_000, 1_000_000, 1_000_000, 1_000_000, 65_000_000, 1_000_000,
    1_000_000, 1_000_000, 1_000_000, 1_000_000,
  ];
  const tasks = indexes.map((index, at) =>
    makeMe.aUsageTaskHistory
      .identifiedAs(`task-${at}`)
      .endedAt(`2026-11-${String(at + 1).padStart(2, "0")}T12:00:00.000Z`)
      .withResponse({
        tokens: { uncachedInput: index, cacheRead: 0, output: 0 },
      })
      .please(),
  );
  await writeTaskUsage(machine.home, tasks);
  const usage = await usageServer(machine);
  const answer = await usage.chart();
  expect(answer.tasks.map((task) => task.index)).toEqual(indexes);
  expect(answer.average).toEqual([
    { at: "2026-11-10T12:00:00.000Z", value: 1_000_000 },
  ]);
});
