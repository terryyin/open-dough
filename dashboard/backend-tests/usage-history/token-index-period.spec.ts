// Period projection keeps prior eligible history and dated counts.
import { expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { readTokenIndex } from "../../server/tokenIndexRead.ts";
import { codexTariff } from "../../server/usageTariffs.ts";
import type { UsagePeriod } from "../../src/usagePeriod.ts";

test("calendar bounds select tasks and unpriced counts after the historical rolling median", async () => {
  const tasks = [...Array<number>(9).keys()].map((at) =>
    makeMe.aSummaryTask
      .identifiedAs(`earlier-${at + 1}`)
      .endedAt(`2026-11-${String(at + 1).padStart(2, "0")}T12:00:00.000Z`)
      .please(),
  );
  tasks.push(
    makeMe.aSummaryTask
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
      makeMe.aSummaryTask
        .identifiedAs(id)
        .endedAt(at)
        .with({ gaps: ["missing-worker-evidence"] })
        .please(),
    );
  for (const [id, at] of [
    ["unpriced-in", "2026-11-15T10:00:00.000Z"],
    ["unpriced-out", "2026-11-14T10:00:00.000Z"],
  ] as const)
    tasks.push(
      makeMe.aSummaryTask
        .identifiedAs(id)
        .endedAt(at)
        .withUsage({ tier: "fast" })
        .please(),
    );
  // An unrated model is estimated: plotted and dated, outside the median.
  tasks.push(
    makeMe.aSummaryTask
      .identifiedAs("estimated-in")
      .endedAt("2026-11-15T11:00:00.000Z")
      .withUsage({ model: "unrated-model" })
      .please(),
  );
  const inputs = {
    summary: makeMe.aUsageTaskSummary.with({ tasks }).please(),
    projects: [makeMe.aPublishedSource.openDough.please()],
    launches: new Map(),
    tariff: codexTariff,
    checkedAt: null,
  };
  const until = "2026-11-16T00:00:00.000Z";
  const read = (period?: UsagePeriod) =>
    readTokenIndex("GET", new URLSearchParams(period), () => inputs);

  const one = await read({ from: "2026-11-15T00:00:00.000Z", until });
  expect(one.tasks.map(({ id }) => id)).toEqual([
    "start",
    "estimated-in",
    "tenth",
  ]);
  expect(
    one.tasks.filter(({ coverage }) => coverage.kind === "partial"),
  ).toHaveLength(1);
  expect(one.unpriced).toBe(1);
  expect(one.average).toEqual([
    { at: "2026-11-15T12:00:00.000Z", task: "tenth", value: 1_950 },
  ]);
  const seven = await read({ from: "2026-11-09T00:00:00.000Z", until });
  expect(seven.average).toEqual(one.average);
  expect(seven.tasks.map(({ id }) => id)).toEqual([
    "earlier-9",
    "before",
    "start",
    "estimated-in",
    "tenth",
  ]);
  expect(one.options).toEqual(seven.options);
  expect(one.options.models.map(({ id }) => id)).toContain("unrated-model");
  const all = await read();
  expect(all.tasks).toHaveLength(14);
  expect(all.unpriced).toBe(2);
  const empty = await read({
    from: "2026-11-17T00:00:00.000Z",
    until: "2026-11-18T00:00:00.000Z",
  });
  expect(empty).toMatchObject({ tasks: [], average: [], unpriced: 0 });
});

test("malformed or incomplete period bounds are refused before reading usage", async () => {
  const load = vi.fn<() => never>();

  for (const query of [
    "from=2026-11-15T00:00:00.000Z",
    "until=2026-11-16T00:00:00.000Z",
    "from=broken&until=2026-11-16T00:00:00.000Z",
    "from=2026-11-16T00:00:00.000Z&until=2026-11-15T00:00:00.000Z",
    "from=2026-11-16T00:00:00.000Z&until=2026-11-16T00:00:00.000Z",
    "from=2026-11-15&until=2026-11-16",
    "from=2026-11-15T00:00:00.000Z&from=2026-11-14T00:00:00.000Z&until=2026-11-16T00:00:00.000Z",
  ])
    await expect(
      readTokenIndex("GET", new URLSearchParams(query), load),
      query,
    ).rejects.toMatchObject({ status: 400 });
  expect(load).not.toHaveBeenCalled();
});
