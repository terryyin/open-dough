// A scope's kept history is keyed by its endpoint revision: a newer snapshot
// at the same head reads no history again, and a late answer for the old head
// cannot replace the new head's history.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { ScopeHistoryGlance } from "../../src/ciScopeHistory.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import { workOf } from "./intent-ci-homepage-page.ts";
import {
  caseTimingHistory,
  heldRead,
  mountUnprovenScopeHistory,
  openDoughSource,
} from "./intent-ci-status-fixtures.ts";
import {
  openScopeSummary,
  scopeHistoryIn,
} from "./intent-scope-history-page.ts";

const first = makeMe.aPublishedWork
  .with({
    ...workOf(openDoughSource, "a1a1a1a"),
    retrievedAt: new Date("2026-11-11T07:00:00Z"),
  })
  .please();

test("a newer timestamp at the same head issues no history read, and a late old endpoint reply cannot replace the new one", async () => {
  const next = workOf(openDoughSource, "b2b2b2b").revision;
  const requests: string[] = [];
  const old = heldRead<ScopeHistoryGlance>();
  const page = await mountUnprovenScopeHistory({
    work: first,
    readScopeHistory: (...[, path, endpoint]) => {
      requests.push(endpoint.revision);
      return endpoint.revision === first.revision
        ? old.ask()
        : Promise.resolve(caseTimingHistory(path, 11000, endpoint.revision));
    },
  });
  const history = scopeHistoryIn(await openScopeSummary("dashboard/tests"));
  await expect.poll(() => requests).toEqual([first.revision]);

  await page.showWork({
    ...first,
    retrievedAt: new Date("2026-11-11T07:02:00Z"),
  });
  await expect.poll(history.endpointTime).toBe("2026-11-11T07:00:00.000Z");
  expect(requests).toEqual([first.revision]);

  await page.showWork({
    ...first,
    revision: next,
    retrievedAt: new Date("2026-11-11T07:03:00Z"),
  });
  const shown = `Observed trunk endpoint ${shortSha(next)} · 11.0 s`;
  await expect.poll(() => history.readout().selected).toBe(shown);
  old.resolve(caseTimingHistory("dashboard/tests", 8000, first.revision));
  await old.ask();
  await expect.poll(() => history.readout().selected).toBe(shown);
  expect(requests).toEqual([first.revision, next]);
});
