// A Done or scoped history page opened before the glance capability existed
// keeps reading the full default answer it understands, through the real
// local authenticated boundary, while the current Done and scope readers ask
// for the glance explicitly and keep the same chart data and figures.
import {
  readIntentCiDoneWallTimeHistory,
  readIntentCiScopeHistory,
} from "../../src/authenticatedIntentCiHistoryRead.ts";
import { previousDoneWallTimeHistoryOf } from "../../tests/support/previousCiHistoryReader/doneWallTimeHistory.ts";
import { previousScopeHistoryOf } from "../../tests/support/previousCiHistoryReader/scopeHistory.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";
import { ciReadingTransport } from "../support/ciReadingTransport.ts";
import {
  doneHistoryQuery,
  glanceScope,
  glanceSource,
  historyAnswer,
  keepGlanceHistory,
  landedEndpoint,
  laterRevision,
  scopeHistoryQuery,
} from "../support/retainedGlanceHistory.ts";

test.use({ serverMode: "boundary" });

test("previous Done and scoped readers keep parsing the full default answers; the current readers ask for the glance and keep the chart data", async ({
  dashboard,
  github,
}) => {
  await keepGlanceHistory(dashboard.home);
  const before = github.calls.length;
  const { revision } = landedEndpoint;
  const selected = expect.objectContaining({
    key: "run/7/1",
    status: "selected",
  });
  const previousDone = previousDoneWallTimeHistoryOf(
    await historyAnswer(dashboard.origin, doneHistoryQuery),
    revision,
  );
  expect(previousDone?.reference?.evidence).toContainEqual(selected);
  const previousScope = previousScopeHistoryOf(
    await historyAnswer(dashboard.origin, scopeHistoryQuery),
    glanceScope,
    revision,
  );
  expect(previousScope?.references?.[0]?.reference.evidence).toContainEqual(
    selected,
  );
  // Without their membership the glance answers would be unreadable to them.
  const glanceOf = (query: Record<string, string>) =>
    historyAnswer(dashboard.origin, { ...query, history: "glance" });
  expect(
    previousDoneWallTimeHistoryOf(await glanceOf(doneHistoryQuery), revision),
  ).toBeUndefined();
  expect(
    previousScopeHistoryOf(
      await glanceOf(scopeHistoryQuery),
      glanceScope,
      revision,
    ),
  ).toBeUndefined();

  const transport = ciReadingTransport(async (requested) =>
    Response.json(
      await historyAnswer(dashboard.origin, Object.fromEntries(requested)),
    ),
  );
  try {
    const { signal } = new AbortController();
    const done = await readIntentCiDoneWallTimeHistory(
      glanceSource,
      landedEndpoint,
      signal,
    );
    const scope = await readIntentCiScopeHistory(
      glanceSource,
      glanceScope,
      landedEndpoint,
      signal,
    );
    expect(
      transport.requests.map(({ url }) =>
        new URL(url, dashboard.origin).searchParams.get("history"),
      ),
    ).toEqual(["glance", "glance"]);
    expect(done.entries.map((entry) => entry.revision)).toEqual(
      previousDone?.entries
        .map((entry) => entry.revision)
        .filter((each) => each !== laterRevision),
    );
    expect(done.reference.averageMs).toBe(previousDone?.reference?.averageMs);
    expect(scope.entries.map((entry) => entry.key)).toEqual(
      previousScope?.entries.map((entry) => entry.key),
    );
    expect(scope.references?.[0]?.reference.averageMs).toBe(
      previousScope?.references?.[0]?.reference.averageMs,
    );
  } finally {
    transport.restore();
  }
  expect(github.calls).toHaveLength(before);
});
