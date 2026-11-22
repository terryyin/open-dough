// Backend retention: ../../backend-tests/intent/landed-ci-history-read-window.spec.ts
// Backend ordering: ../../../Distribution/tests/support/landed-ci-history-reading-order.test.mjs
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { expect, onTestFinished, test, vi } from "vitest";
import { page, type Locator } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { IntentCiHistory } from "../../src/IntentCiHistory.tsx";
import {
  measuredHistoryOf,
  type LandedCiHistory,
} from "../../src/landedCiHistory.ts";

vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);

async function mountHistory(answer: LandedCiHistory) {
  const host = document.body.appendChild(document.createElement("div"));
  const root = createRoot(host);
  onTestFinished(() => {
    act(() => {
      root.unmount();
    });
    host.remove();
  });
  const history = { shown: measuredHistoryOf(answer), failed: undefined };
  await act(() => {
    root.render(createElement(IntentCiHistory, { history }));
    return Promise.resolve();
  });
  return page.getByRole("region", {
    name: "CI time without runner waits history",
    exact: true,
  });
}

function revealEvidence(history: Locator) {
  const disclosure = history.getByText("Builds and evidence", { exact: true });
  (disclosure.element() as HTMLElement).click();
  return history
    .getByRole("list", { name: "Builds and evidence", exact: true })
    .getByRole("listitem")
    .elements();
}

function chartGeometry(history: Locator) {
  const svg = history
    .getByRole("img", {
      name: "CI time without runner waits by build date",
      exact: true,
    })
    .element();
  const points = [
    ...svg.querySelectorAll<SVGCircleElement>("circle.history-chart-point"),
  ].map((circle) => ({
    x: circle.cx.baseVal.value,
    y: circle.cy.baseVal.value,
  }));
  const strokes = [...svg.querySelectorAll("path.history-chart-line")].flatMap(
    (path) =>
      (path.getAttribute("d") ?? "")
        .split("M")
        .filter((stroke) => stroke.trim() !== "")
        .map((stroke) => stroke.split("L").length),
  );
  return { points, strokes };
}

const displayDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});
const dateWords = (at: string | number) => displayDate.format(new Date(at));
const timeAttributes = (elements: readonly Element[]) =>
  elements.flatMap((element) =>
    [...element.querySelectorAll("time")].map((time) => time.dateTime),
  );

test("accepted landing order keeps a middle gap while reversed build dates retain their labels and true measured date span", async () => {
  const firstBuild = "2026-11-09T10:00:00Z";
  const lastBuild = "2026-11-05T10:00:00Z";
  const gap = "2026-11-30T10:00:00Z";
  const history = await mountHistory(
    makeMe.aCiHistoryAnswer
      .measuredBuild({
        revision: "a1".repeat(20),
        runId: 211,
        startedAt: firstBuild,
        completedAt: "2026-11-09T10:06:05Z",
        receivedAt: "2026-11-03T10:00:00Z",
        timeMs: 365_000,
      })
      .unmeasuredLanding({
        revision: "b2".repeat(20),
        receivedAt: gap,
        reason: "no-build",
      })
      .measuredBuild({
        revision: "c3".repeat(20),
        runId: 213,
        startedAt: lastBuild,
        completedAt: "2026-11-05T10:05:00Z",
        receivedAt: "2026-11-01T10:00:00Z",
        timeMs: 180_000,
      })
      .please(),
  );

  const heading = history.getByRole("heading").element();
  expect(heading.textContent).toBe(
    `CI time without runner waits history 2 measured builds · ${dateWords(lastBuild)}–${dateWords(firstBuild)}`,
  );
  expect(timeAttributes([heading])).toEqual([lastBuild, firstBuild]);
  expect(history.getByRole("definition").element().textContent).toBe("3 min");
  const rows = revealEvidence(history);
  expect(rows.map((row) => row.textContent)).toEqual([
    `${dateWords(firstBuild)} · 6 min 5 s · exact revision a1a1a1a · Run 211 · attempt 1`,
    `${dateWords(gap)} · No build · landed revision b2b2b2b`,
    `${dateWords(lastBuild)} · 3 min · exact revision c3c3c3c · Run 213 · attempt 1`,
  ]);
  expect(timeAttributes(rows)).toEqual([firstBuild, gap, lastBuild]);
  const { points, strokes } = chartGeometry(history);
  expect(points).toHaveLength(2);
  const [first, last] = points;
  if (!first || !last)
    throw new Error("Both measured builds must appear in the chart.");
  expect(first.x).toBeGreaterThan(last.x);
  expect(strokes.filter((points) => points > 1)).toEqual([]);
});

const dayMs = 24 * 60 * 60_000;
const firstStart = Date.parse("2026-10-01T12:00:00Z");
const startOf = (day: number) => firstStart + day * dayMs;
const at = (ms: number) => new Date(ms).toISOString();
const gapAt = (day: number) => at(startOf(day) + dayMs / 4);
const revisionOf = (day: number) =>
  (day + 1).toString(16).padStart(2, "0").repeat(20);
const durationWords = (seconds: number) =>
  `${String(Math.floor(seconds / 60))} min${seconds % 60 === 0 ? "" : ` ${String(seconds % 60)} s`}`;

test("a window of the newest 20 measured builds shows them in trunk order with the gaps among and after them, under 20 measured builds and their dates, as a line that rises, falls and varies", async () => {
  const builds = [
    300, 320, 340, 360, 380, 400, 420, 440, 430, 410, 390, 370, 350, 330, 400,
    310, 450, 320, 420, 300,
  ].map((seconds, index) => ({ day: 15 + index, seconds }));
  const answer = makeMe.aCiHistoryAnswer;
  type WindowGap = Omit<
    Parameters<typeof answer.unmeasuredLanding>[0],
    "receivedAt"
  >;
  const gaps: Partial<Record<number, WindowGap>> = {
    20: { revision: "e4".repeat(20), reason: "no-build" },
    22: {
      revision: "e5".repeat(20),
      reason: "expired",
      build: {
        revision: "b5".repeat(20),
        provenance: "equivalent",
        runId: 295,
      },
    },
    25: {
      revision: "e1".repeat(20),
      reason: "failed",
      build: { revision: "e1".repeat(20), provenance: "exact", runId: 291 },
    },
    28: {
      revision: "e6".repeat(20),
      reason: "unreadable",
      build: { revision: "b6".repeat(20), provenance: "later", runId: 296 },
    },
    30: {
      revision: "e2".repeat(20),
      reason: "cancelled",
      build: { revision: "e2".repeat(20), provenance: "exact", runId: 292 },
    },
  };
  for (const { day, seconds } of builds) {
    answer.measuredBuild({
      revision: revisionOf(day),
      runId: 100 + day,
      startedAt: at(startOf(day)),
      completedAt: at(startOf(day) + seconds * 1000),
      timeMs: seconds * 1000,
    });
    const gap = gaps[day];
    if (gap !== undefined) {
      answer.unmeasuredLanding({ ...gap, receivedAt: gapAt(day) });
    }
  }
  const history = await mountHistory(
    answer
      .pendingLanding({
        revision: "e3".repeat(20),
        receivedAt: gapAt(34),
        waitsFor: "build",
      })
      .please(),
  );

  expect(history.getByRole("heading").element().textContent).toBe(
    `CI time without runner waits history 20 measured builds · ${dateWords(startOf(15))}–${dateWords(startOf(34))}`,
  );
  expect(history.getByRole("definition").element().textContent).toBe("5 min");
  for (const role of [
    "combobox",
    "radio",
    "slider",
    "spinbutton",
    "textbox",
  ] as const) {
    expect(history.getByRole(role).elements(), role).toHaveLength(0);
  }

  const rows = revealEvidence(history);
  const measures = (after: number, through: number) =>
    builds
      .filter(({ day }) => after < day && day <= through)
      .map(
        ({ day, seconds }) =>
          `${dateWords(startOf(day))} · ${durationWords(seconds)} · exact revision ${revisionOf(day).slice(0, 7)} · Run ${String(100 + day)} · attempt 1`,
      );
  expect(rows.map((row) => row.textContent)).toEqual([
    ...measures(14, 20),
    `${dateWords(gapAt(20))} · No build · landed revision e4e4e4e`,
    ...measures(20, 22),
    `${dateWords(gapAt(22))} · CI proof expired · reused equivalent b5b5b5b for e5e5e5e · Run 295 · attempt 1`,
    ...measures(22, 25),
    `${dateWords(gapAt(25))} · Failed · exact revision e1e1e1e · Run 291 · attempt 1`,
    ...measures(25, 28),
    `${dateWords(gapAt(28))} · CI proof unreadable · later trunk build b6b6b6b for e6e6e6e · Run 296 · attempt 1`,
    ...measures(28, 30),
    `${dateWords(gapAt(30))} · Cancelled · exact revision e2e2e2e · Run 292 · attempt 1`,
    ...measures(30, 34),
    `${dateWords(gapAt(34))} · Pending · CI queued or running · landed revision e3e3e3e`,
  ]);

  const { points, strokes } = chartGeometry(history);
  expect(points).toHaveLength(20);
  for (const [index, build] of builds.slice(1).entries()) {
    const [before, point] = points.slice(index, index + 2);
    const previous = builds[index];
    if (!before || !point || !previous)
      throw new Error("Expected adjacent builds");
    expect(point.x).toBeGreaterThan(before.x);
    expect(Math.sign(before.y - point.y)).toBe(
      Math.sign(build.seconds - previous.seconds),
    );
  }
  expect(strokes).toEqual([6, 2, 3, 3, 2, 4]);
});
