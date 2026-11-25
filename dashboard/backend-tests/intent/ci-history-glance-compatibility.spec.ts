// A Done or scoped history page opened before the glance capability existed
// keeps reading the full default answer it understands, with its membership,
// median and run links, while the current Done and scope readers ask for the
// glance explicitly and keep the same chart data and figures.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, expect, test } from "vitest";
import {
  readIntentCiDoneWallTimeHistory,
  readIntentCiScopeHistory,
} from "../../src/authenticatedIntentCiHistoryRead.ts";
import {
  parseIntentCiHistoryRead,
  performIntentCiHistoryRead,
} from "../../server/intentCiHistoryRead.ts";
import { previousDoneWallTimeHistoryOf } from "../../test-support/support/previousCiHistoryReader/doneWallTimeHistory.ts";
import { previousScopeHistoryOf } from "../../test-support/support/previousCiHistoryReader/scopeHistory.ts";
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

let home = "";

afterEach(() => {
  if (home !== "") rmSync(home, { recursive: true, force: true });
  home = "";
});

test("previous Done and scoped readers keep parsing the full default answers with membership, median and run links; the current readers ask for the glance and keep the chart data", async () => {
  home = mkdtempSync(path.join(tmpdir(), "ci-history-glance-compatibility-"));
  await keepGlanceHistory(home);
  const { revision } = landedEndpoint;
  const selected = expect.objectContaining({
    key: "run/7/1",
    status: "selected",
  }) as unknown;
  const previousDone = previousDoneWallTimeHistoryOf(
    await historyAnswer(home, doneHistoryQuery),
    revision,
  );
  expect(previousDone?.reference).toMatchObject({
    evidence: expect.arrayContaining([
      selected,
      expect.objectContaining({ key: "run/8/1", status: "excluded" }),
    ]) as unknown,
    medianMs: 100000,
  });
  expect(previousDone?.entries.map((entry) => entry.revision)).toContain(
    laterRevision,
  );
  expect(JSON.stringify(previousDone?.entries)).toContain('"runUrl"');
  const previousScope = previousScopeHistoryOf(
    await historyAnswer(home, scopeHistoryQuery),
    glanceScope,
    revision,
  );
  expect(previousScope?.references?.[0]?.reference).toMatchObject({
    evidence: expect.arrayContaining([selected]) as unknown,
    medianMs: 100,
  });
  expect(previousScope?.entries[0]).toMatchObject({
    landings: [{ revision: "01".repeat(20) }],
    build: { runUrl: "https://ci.invalid/runs/1" },
  });
  // Without their membership the glance answers would be unreadable to them.
  const glanceOf = (query: Record<string, string>) =>
    historyAnswer(home, { ...query, history: "glance" });
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

  const transport = ciReadingTransport(async (requested) => {
    const named = parseIntentCiHistoryRead(requested);
    if (named?.kind !== "intent-ci-history")
      throw new Error(
        `expected intent-ci-history read, got ${JSON.stringify(named)}`,
      );
    const outcome = await performIntentCiHistoryRead(glanceSource, named, {
      home,
    });
    if (outcome.kind !== "answered")
      throw new Error(
        `expected answered history, got ${JSON.stringify(outcome)}`,
      );
    return Response.json(outcome.answer);
  });
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
        new URL(url, "http://local.test").searchParams.get("history"),
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
});
