// Changing scope or project cannot relabel an earlier local history read as
// the current scope's proof while live Proof is absent: a late entry answer
// from another project is aborted and ignored, and a failed file read never
// keeps its entry's answer at the same project endpoint.
import { expect, test } from "vitest";
import type { ScopeHistoryGlance } from "../../src/ciScopeHistory.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import { doughnutSource, workOf } from "./intent-ci-homepage-page.ts";
import { heldRead, openDoughSource } from "./intent-ci-status-fixtures.ts";
import {
  caseTimingHistory,
  mountUnprovenScopeHistory,
} from "./intent-project-scope-history-fixtures.ts";
import {
  openFileProof,
  openScopeChild,
  scopeHistoryIn,
} from "./intent-scope-history-page.ts";
import { openSummary } from "./intent-summary-proof-page.ts";

const work = workOf(openDoughSource, "b2b2b2b");
const endpoint = `Observed trunk endpoint ${shortSha(work.revision)}`;
const projects = [openDoughSource, doughnutSource];

test("late entry history cannot replace another file or project's history while live Proof is absent", async () => {
  const requests: string[] = [];
  const signals: AbortSignal[] = [];
  const old = heldRead<ScopeHistoryGlance>();
  const page = await mountUnprovenScopeHistory({
    work,
    projects,
    readScopeHistory: (source, path, at, signal) => {
      requests.push(`${source.id}:${path}`);
      signals.push(signal);
      if (source.id === "open-dough" && path === "dashboard/tests")
        return old.ask();
      const ms = source.id === "open-dough" ? 11000 : 9000;
      return Promise.resolve(caseTimingHistory(path, ms, at.revision));
    },
  });
  await openSummary("dashboard/tests");
  await expect.poll(() => requests).toEqual(["open-dough:dashboard/tests"]);
  await openScopeChild("example.spec.ts");
  const file = await openFileProof();
  const fileHistory = scopeHistoryIn(file);
  await expect
    .poll(() => fileHistory.readout().selected)
    .toBe(`${endpoint} · 11.0 s`);
  await expect.element(file.getByText("Live proof unavailable")).toBeVisible();

  await page.showWork(workOf(doughnutSource, "b2b2b2b"));
  const current = scopeHistoryIn(await openSummary("dashboard/tests"));
  await expect
    .poll(() => current.readout().selected)
    .toBe(`${endpoint} · 9.0 s`);
  // The other project's entry read was given up before it answered late.
  expect(signals[0]?.aborted).toBe(true);
  old.resolve(caseTimingHistory("dashboard/tests", 8000, work.revision));
  // The page commits a render after the late answer was handled.
  await old.ask();
  await page.showIntent();
  expect(current.readout().selected).toBe(`${endpoint} · 9.0 s`);
  expect(requests).toEqual([
    "open-dough:dashboard/tests",
    "open-dough:dashboard/tests/example.spec.ts",
    "doughnut:dashboard/tests",
  ]);
});

test("a failed new file read cannot retain the entry's answer at the same project endpoint", async () => {
  const requests: string[] = [];
  await mountUnprovenScopeHistory({
    work,
    projects,
    readScopeHistory: (...[, path, at]) => {
      requests.push(path);
      return path === "dashboard/tests"
        ? Promise.resolve(caseTimingHistory(path, 8000, at.revision))
        : Promise.reject(new Error("File local history unavailable"));
    },
  });
  const entry = scopeHistoryIn(await openSummary("dashboard/tests"));
  await expect.poll(() => entry.readout().selected).toBe(`${endpoint} · 8.0 s`);
  await openScopeChild("example.spec.ts");
  const file = await openFileProof();
  const history = scopeHistoryIn(file);
  await expect.poll(history.text).toContain("File local history unavailable");
  expect(history.readout().selected).toBeUndefined();
  expect(history.text()).not.toContain("Previously retrieved history");
  await expect.element(file.getByText("Live proof unavailable")).toBeVisible();
  expect(requests).toEqual([
    "dashboard/tests",
    "dashboard/tests/example.spec.ts",
  ]);
});
