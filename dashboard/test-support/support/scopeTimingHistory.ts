// A scope's retained test execution time history as the glance read
// (`intent=ci-history&scope=…&revision=…`, ../../src/authenticatedIntentCiHistoryRead.ts)
// answers it to a frontend-only journey: its prior builds, any failed build
// and the selected build, measured in test cases and test files, with each
// unit's prior-build figures. Collection and the figures' projection belong to
// ../../backend-tests/intent/landed-ci-scope-proof-completion.spec.ts and
// ../../../e2e/intent/intent-scope-collected-file-timing-history.spec.ts.
import type { Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import type {
  ScopeGlanceEntry,
  ScopeHistoryGlance,
} from "../../src/ciScopeHistory.ts";
import { fulfillJson } from "./frontendSubstituteAnswers.ts";

const units = ["case", "file"] as const;
type Unit = (typeof units)[number];

// One unit's timings: each prior build's, or "failed", then the selected
// build's, and the prior-build figures the Backend projected for it.
export type ScopeUnitTimings = {
  readonly priors: readonly (number | "failed")[];
  readonly selectedMs: number;
  readonly averageMs: number;
  readonly difference: string;
};

// Builds on consecutive November days, the selected build last; every unit
// lists the same builds, failed at the same place.
export function scopeTimingHistory(
  selectedRevision: string,
  path: string,
  timings: Readonly<Record<Unit, ScopeUnitTimings>>,
): ScopeHistoryGlance {
  const builds = [...timings.case.priors, timings.case.selectedMs];
  const selectedIndex = builds.length - 1;
  const entries = Array.from(builds.keys(), (index): ScopeGlanceEntry => {
    const day = String(index + 1);
    const selected = index === selectedIndex;
    const build = {
      key: `run/${day}/1`,
      date: `2026-11-0${day}T10:00:00Z`,
      selected,
      landings: [{ selected, provenance: "exact" as const }],
    };
    const msOf = (unit: Unit) =>
      selected ? timings[unit].selectedMs : timings[unit].priors[index];
    if (msOf("case") === "failed") {
      const gap = { status: "failed" as const, reason: "Failed CI build" };
      return {
        ...build,
        kind: "gap",
        gap,
        readings: units.map((unit) => ({ kind: "gap", unit, ...gap })),
      };
    }
    return {
      ...build,
      kind: "point",
      readings: units.map((unit) => ({
        kind: "point",
        unit,
        ms: Number(msOf(unit)),
        segment: `${unit}/1`,
      })),
    };
  });
  const sampleCount = timings.case.priors.filter(
    (ms) => ms !== "failed",
  ).length;
  return makeMe.aScopeHistoryGlance
    .with({
      path,
      selectedRevision,
      availability: "retained",
      entries,
      references: units.map((unit) => {
        const { selectedMs, averageMs, difference } = timings[unit];
        return {
          unit,
          reference: {
            endpoint: selectedRevision,
            selected: {
              key: `run/${String(builds.length)}/1`,
              date: `2026-11-0${String(builds.length)}T10:00:00Z`,
              ms: selectedMs,
            },
            sampleCount,
            averageMs,
            difference: {
              text: difference,
              changeMs: selectedMs - averageMs,
              relative: (selectedMs - averageMs) / averageMs,
            },
          },
        };
      }),
    })
    .please();
}

// Answers each scope's glance read at a Done landing with the history arranged
// for that scope and landing.
export async function serveDoneScopeHistories(
  page: Page,
  histories: readonly ScopeHistoryGlance[],
): Promise<void> {
  await page.route(
    (url) =>
      url.pathname === authenticatedReadEndpoint &&
      url.searchParams.get("intent") === "ci-history" &&
      url.searchParams.has("scope"),
    async (route) => {
      const params = new URL(route.request().url()).searchParams;
      const history = histories.find(
        ({ path, selectedRevision }) =>
          path === params.get("scope") &&
          selectedRevision === params.get("revision"),
      );
      if (history === undefined)
        throw new Error(`Unarranged scope history ${params.toString()}`);
      await fulfillJson(route, history);
    },
  );
}
