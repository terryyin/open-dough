// A selected Done or scoped history read that names the glance capability
// answers the chart data and compact figures the glance views read, as a
// projection of the same retained history's default answer, through the real
// local authenticated boundary. The default answer's membership, median and
// run links are in ./ci-history-glance-compatibility.spec.ts. Browsing reads
// no CI.
import {
  doneHistoryQuery,
  failedRevision,
  glanceScope,
  historyAnswer,
  keepGlanceHistory,
  landedEndpoint,
  scopeHistoryQuery,
} from "../support/retainedGlanceHistory.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";

test.use({ serverMode: "boundary" });

type Answer = Record<string, unknown> & {
  readonly entries: readonly Record<string, unknown>[];
};

// The compact figures of a full reference, which the glance must equal.
const figuresOf = (reference: Record<string, unknown>) => {
  const { endpoint, selected, sampleCount, averageMs, difference } = reference;
  return { endpoint, selected, sampleCount, averageMs, difference };
};

test("the glance capability sends the Done chart through its landing and compact figures without membership, median, filtering detail or run links", async ({
  dashboard,
  github,
}) => {
  await keepGlanceHistory(dashboard.home);
  const before = github.calls.length;
  const full = (await historyAnswer(
    dashboard.origin,
    doneHistoryQuery,
  )) as Answer & { readonly reference: Record<string, unknown> };
  const glance = (await historyAnswer(dashboard.origin, {
    ...doneHistoryQuery,
    history: "glance",
  })) as Answer;

  expect(glance).toEqual({
    selectedRevision: landedEndpoint.revision,
    availability: "retained",
    entries: expect.any(Array) as unknown,
    reference: {
      endpoint: landedEndpoint.revision,
      selected: {
        key: "run/7/1",
        date: "2026-11-07T09:00:00Z",
        ms: 120000,
      },
      sampleCount: 5,
      averageMs: 100000,
      difference: { text: "+20.0 s", changeMs: 20000, relative: 0.2 },
    },
  });
  expect(glance.reference).toEqual(figuresOf(full.reference));
  // Dated measurements and the typed failed gap, through the landing only.
  expect(
    glance.entries.map(({ kind, revision, reason }) =>
      kind === "point" ? revision : `${String(revision)} ${String(reason)}`,
    ),
  ).toEqual([
    ...[1, 2, 3, 4].map((index) => String(index).padStart(2, "0").repeat(20)),
    `${failedRevision} failed`,
    "06".repeat(20),
    landedEndpoint.revision,
  ]);
  expect(glance.entries.at(-1)).toMatchObject({
    kind: "point",
    startedAt: "2026-11-07T09:00:00Z",
    completedAt: "2026-11-07T09:02:00.000Z",
    runId: 7,
    runAttempt: 1,
    landings: [{ revision: landedEndpoint.revision, provenance: "exact" }],
  });
  expect(JSON.stringify(glance)).not.toMatch(
    /"(runUrl|evidence|medianMs|from|to)"/,
  );
  expect(github.calls).toHaveLength(before);
});

test("the glance capability sends scoped dated readings, typed gaps, segments and provenance with compact figures and no landing or run metadata", async ({
  dashboard,
  github,
}) => {
  await keepGlanceHistory(dashboard.home);
  const before = github.calls.length;
  const full = (await historyAnswer(
    dashboard.origin,
    scopeHistoryQuery,
  )) as Answer & {
    readonly references: readonly { reference: Record<string, unknown> }[];
  };
  const glance = (await historyAnswer(dashboard.origin, {
    ...scopeHistoryQuery,
    history: "glance",
  })) as Answer & { readonly references: readonly unknown[] };

  expect(glance).toMatchObject({
    path: glanceScope,
    selectedRevision: landedEndpoint.revision,
    availability: "retained",
  });
  expect(glance.references).toEqual([
    {
      unit: "case",
      reference: {
        ...figuresOf(full.references[0]?.reference ?? {}),
        sampleCount: 5,
        averageMs: 100,
      },
    },
  ]);
  const prior = {
    key: "run/1/1",
    date: "2026-11-01T09:00:00Z",
    selected: false,
    landings: [{ selected: false, provenance: "exact" }],
    kind: "point",
    readings: [{ kind: "point", unit: "case", ms: 100, segment: "1" }],
  };
  expect(glance.entries[0]).toEqual(prior);
  expect(glance.entries.find((entry) => entry.kind === "gap")).toEqual({
    key: "run/5/1",
    date: "2026-11-05T09:00:00Z",
    selected: false,
    landings: [{ selected: false, provenance: "exact" }],
    kind: "gap",
    readings: [
      {
        kind: "gap",
        unit: "case",
        status: "failed",
        reason: "Failed CI build",
      },
    ],
    gap: { status: "failed", reason: "Failed CI build" },
  });
  expect(glance.entries.find((entry) => entry.selected === true)).toEqual({
    ...prior,
    key: "run/7/1",
    date: "2026-11-07T09:00:00Z",
    selected: true,
    landings: [{ selected: true, provenance: "exact" }],
    readings: [{ kind: "point", unit: "case", ms: 120, segment: "2" }],
  });
  expect(JSON.stringify(glance)).not.toMatch(
    /"(runUrl|runId|revision|receivedAt|build|run|evidence|medianMs|from|to|entry)"/,
  );
  expect(github.calls).toHaveLength(before);
});
