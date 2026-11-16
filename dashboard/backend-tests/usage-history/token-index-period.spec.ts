// Real HTTP/store period projection keeps prior eligible history and dated counts.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { TokenIndexAnswer } from "../../src/usageTokenIndex.ts";
import {
  expect,
  test,
  usageServer,
  writeTaskUsage,
} from "../../tests/usage-history/tokenIndexHarness.ts";

test("calendar bounds select tasks and unpriced counts after the historical rolling median", async ({
  machine,
}) => {
  const tasks = [...Array<number>(9).keys()].map((at) =>
    makeMe.aUsageTaskHistory
      .identifiedAs(`earlier-${at + 1}`)
      .endedAt(`2026-11-${String(at + 1).padStart(2, "0")}T12:00:00.000Z`)
      .please(),
  );
  tasks.push(
    makeMe.aUsageTaskHistory
      .identifiedAs("tenth")
      .endedAt("2026-11-15T12:00:00.000Z")
      .please(),
  );
  for (const [id, at] of [
    ["start", "2026-11-15T00:00:00.000Z"],
    ["before", "2026-11-14T23:59:59.999Z"],
    ["until", "2026-11-16T00:00:00.000Z"],
  ] as const)
    tasks.push(
      makeMe.aUsageTaskHistory
        .identifiedAs(id)
        .endedAt(at)
        .withWorkerGaps("missing-worker-evidence")
        .please(),
    );
  for (const [id, at] of [
    ["unpriced-in", "2026-11-15T10:00:00.000Z"],
    ["unpriced-out", "2026-11-14T10:00:00.000Z"],
  ] as const)
    tasks.push(
      makeMe.aUsageTaskHistory
        .identifiedAs(id)
        .endedAt(at)
        .withResponse({ model: "unrated-model" })
        .please(),
    );
  await writeTaskUsage(machine.home, tasks);
  const usage = await usageServer(machine);
  const read = async (from: string) => {
    const query = new URLSearchParams({
      from,
      until: "2026-11-16T00:00:00.000Z",
    });
    const result = await usage.request("GET", `/__usage/token-index?${query}`);
    expect(result.status).toBe(200);
    return result.body as TokenIndexAnswer;
  };
  const one = await read("2026-11-15T00:00:00.000Z");
  expect(one.tasks.map(({ id }) => id)).toEqual(["start", "tenth"]);
  expect(
    one.tasks.filter(({ coverage }) => coverage.kind === "partial"),
  ).toHaveLength(1);
  expect(one.unpriced).toBe(1);
  expect(one.average).toEqual([
    { at: "2026-11-15T12:00:00.000Z", task: "tenth", value: 1_950 },
  ]);
  const seven = await read("2026-11-09T00:00:00.000Z");
  expect(seven.average).toEqual(one.average);
  expect(seven.tasks.map(({ id }) => id)).toEqual([
    "earlier-9",
    "before",
    "start",
    "tenth",
  ]);
  expect(one.options).toEqual(seven.options);
  expect(one.options.models.map(({ id }) => id)).toContain("unrated-model");
  const all = await usage.chart();
  expect(all.tasks).toHaveLength(13);
  expect(all.unpriced).toBe(2);
  const empty = await usage.request(
    "GET",
    "/__usage/token-index?from=2026-11-17T00:00:00.000Z&until=2026-11-18T00:00:00.000Z",
  );
  expect(empty.status).toBe(200);
  expect(empty.body).toMatchObject({ tasks: [], average: [], unpriced: 0 });
});

test("malformed or incomplete period bounds are refused instead of broadening history", async ({
  machine,
}) => {
  const usage = await usageServer(machine);
  for (const query of [
    "from=2026-11-15T00:00:00.000Z",
    "until=2026-11-16T00:00:00.000Z",
    "from=broken&until=2026-11-16T00:00:00.000Z",
    "from=2026-11-16T00:00:00.000Z&until=2026-11-15T00:00:00.000Z",
    "from=2026-11-16T00:00:00.000Z&until=2026-11-16T00:00:00.000Z",
    "from=2026-11-15&until=2026-11-16",
    "from=2026-11-15T00:00:00.000Z&from=2026-11-14T00:00:00.000Z&until=2026-11-16T00:00:00.000Z",
  ])
    expect(
      (await usage.request("GET", `/__usage/token-index?${query}`)).status,
      query,
    ).toBe(400);
});
