// Project Intent's scope history beside live Scope Proof: a failed or empty
// history read keeps the Proof usable, offers Retry and recovers on the same
// observed endpoint; endpoint words mark a measured zero and explain a unit's
// partial gap. The integrated journey owns real collection.
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { workOf } from "./intent-ci-homepage-page.ts";
import { openDoughSource } from "./intent-ci-status-fixtures.ts";
import { mountUnprovenScopeHistory } from "./intent-project-scope-history-fixtures.ts";
import {
  openScopeSummary,
  scopeHistoryIn,
} from "./intent-scope-history-page.ts";

const trunkSource = makeMe.aPublishedSource
  .with({ ...openDoughSource, ref: "trunk" })
  .please();

test("configured trunk keeps its observed endpoint through failed and empty reads while scope Proof stays usable", async () => {
  const work = workOf(trunkSource, "a1a1a1a");
  let failed = true;
  const endpoints: string[] = [];
  await mountUnprovenScopeHistory({
    work,
    viewport: { width: 390, height: 844 },
    readScopeHistory: (...[, path, endpoint]) => {
      endpoints.push(endpoint.revision);
      return failed
        ? Promise.reject(new Error("Local history unavailable"))
        : Promise.resolve(
            makeMe.aScopeHistoryGlance
              .with({
                path,
                selectedRevision: endpoint.revision,
                availability: "empty",
                entries: [],
              })
              .please(),
          );
    },
  });
  const summary = await openScopeSummary("dashboard/tests");
  const history = scopeHistoryIn(summary);
  await expect
    .element(history.failure)
    .toHaveTextContent("Local history unavailable");
  expect(
    history.measures().find((note) => note.includes("Cumulative")),
  ).toContain("Trunk trunk observed");
  await expect.element(summary.getByRole("table")).toBeVisible();

  failed = false;
  await userEvent.click(history.retry);
  await expect.poll(history.status).toBe("No collected history");
  expect(history.failure.query()).toBeNull();
  expect(history.charts()).toBe(0);
  expect(endpoints).toEqual([work.revision, work.revision]);
  await expect.element(summary.getByRole("table")).toBeVisible();
  expect(history.scrollingSideways(), "scrolling sideways").toEqual([]);
});

test("project endpoint words mark a measured zero and explain partial-unit gaps without joining them", async () => {
  const work = workOf(openDoughSource, "a1a1a1a");
  await mountUnprovenScopeHistory({
    work,
    readScopeHistory: (...[, path, endpoint]) =>
      Promise.resolve(
        makeMe.aScopeHistoryGlance
          .with({
            path,
            selectedRevision: endpoint.revision,
            availability: "retained",
            entries: [
              {
                key: "run/31/1",
                kind: "point",
                date: "2026-11-07T10:00:00Z",
                selected: true,
                landings: [{ selected: true, provenance: "exact" }],
                readings: [
                  { kind: "point", unit: "case", ms: 0, segment: "case/0" },
                  {
                    kind: "gap",
                    unit: "file",
                    status: "unavailable",
                    reason: "Partial · missing part 2",
                  },
                ],
              },
            ],
          })
          .please(),
      ),
  });
  const history = scopeHistoryIn(await openScopeSummary("dashboard/tests"));
  const chart = await history.chart("test cases", "observed trunk endpoint");
  expect(chart.readout()).toBe("Nov 7 · Endpoint · 0 ms");
  expect(history.pointTitle("test cases")).toBe(
    "Nov 7 · 0 ms · test cases · Exact build · Observed trunk endpoint",
  );
  await history.choose("Test files", "keyboard");
  await expect
    .poll(history.text)
    .toContain(
      "No complete test execution times are available for test files.",
    );
  expect(history.charts()).toBe(0);
});
