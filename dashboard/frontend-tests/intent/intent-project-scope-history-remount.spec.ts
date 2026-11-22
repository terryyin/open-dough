// Leaving Intent and reentering it after a same-head snapshot refresh keeps
// the scope's kept history: the observed endpoint and prior answer stand
// beside the failure of the reread.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { workOf } from "./intent-ci-homepage-page.ts";
import {
  caseTimingHistory,
  mountUnprovenScopeHistory,
  openDoughSource,
} from "./intent-ci-status-fixtures.ts";
import {
  openScopeSummary,
  scopeHistoryIn,
} from "./intent-scope-history-page.ts";

const work = makeMe.aPublishedWork
  .with({
    ...workOf(openDoughSource, "a1a1a1a"),
    retrievedAt: new Date("2026-11-11T07:00:00Z"),
  })
  .please();

test("reentering Intent after a same-head snapshot refresh keeps the observed endpoint and prior answer when local history fails", async () => {
  const through: string[] = [];
  const page = await mountUnprovenScopeHistory({
    work,
    readScopeHistory: (...[, path, endpoint]) => {
      through.push(endpoint.at);
      return through.length === 1
        ? Promise.resolve(caseTimingHistory(path, 8000, endpoint.revision))
        : Promise.reject(new Error("Local history failed after reentry"));
    },
  });
  const history = scopeHistoryIn(await openScopeSummary("dashboard/tests"));
  await expect.poll(() => history.readout().selected).toContain("8.0 s");

  await page.showDevelopment();
  await expect.element(history.region).not.toBeInTheDocument();
  await page.showWork({
    ...work,
    retrievedAt: new Date("2026-11-11T07:03:00Z"),
  });
  await page.showIntent();
  const reentered = scopeHistoryIn(await openScopeSummary("dashboard/tests"));
  await expect
    .poll(reentered.text)
    .toContain("Local history failed after reentry");
  expect(reentered.endpointTime()).toBe("2026-11-11T07:00:00.000Z");
  expect(reentered.readout().selected).toContain("8.0 s");
  expect(reentered.text()).toContain("Previously retrieved history");
  expect(through).toEqual([
    "2026-11-11T07:00:00.000Z",
    "2026-11-11T07:00:00.000Z",
  ]);
});
