import assert from "node:assert/strict";
import { test } from "node:test";
import { parseIntentCiHistoryRead } from "../../dashboard/server/intentCiHistoryRead.ts";
import { contextForAdmittedRead } from "../../dashboard/server/readDiagnosticContext.ts";
import {
  readIntentCiScopeHistory,
  readIntentCiHistory,
} from "../../dashboard/src/authenticatedIntentCiHistoryRead.ts";
import { authenticatedGet } from "../../dashboard/src/authenticatedGet.ts";
import { noteLimit } from "../../dashboard/src/readingLimit.ts";
import { makeMe } from "./makeMe.mjs";

test("scope history names a safe path, exact published endpoint and its date", () => {
  const read = parseIntentCiHistoryRead(
    new URLSearchParams({
      intent: "ci-history",
      scope: "dashboard/tests",
      revision: "b".repeat(40),
      through: "2026-11-02T00:00:00Z",
    }),
  );
  assert.deepEqual(read, {
    kind: "intent-ci-history",
    scope: "dashboard/tests",
    revision: "b".repeat(40),
    through: "2026-11-02T00:00:00Z",
  });
  assert.deepEqual(contextForAdmittedRead("open-dough", read), {
    source: "open-dough",
    category: "intent",
    pin: "b".repeat(40),
  });
});

test("a scope history request refuses traversal, mixed reads, duplicate fields and an absent endpoint date", () => {
  for (const query of [
    {
      scope: "../tests",
      revision: "b".repeat(40),
      through: "2026-11-02T00:00:00Z",
    },
    {
      scope: "tests",
      revision: "not-a-revision",
      through: "2026-11-02T00:00:00Z",
    },
    { scope: "tests", revision: "b".repeat(40) },
    { scope: "tests", revision: "b".repeat(40), through: "yesterday" },
    {
      scope: "tests",
      revision: "b".repeat(40),
      through: "2026-11-02T00:00:00Z",
      path: "README.md",
    },
  ])
    assert.equal(
      parseIntentCiHistoryRead(
        new URLSearchParams({ intent: "ci-history", ...query }),
      ).kind,
      "refused",
    );
  assert.equal(
    parseIntentCiHistoryRead(
      new URLSearchParams(
        `intent=ci-history&scope=tests&scope=other&revision=${"b".repeat(40)}&through=2026-11-02T00:00:00Z`,
      ),
    ).kind,
    "refused",
  );
  assert.deepEqual(
    parseIntentCiHistoryRead(new URLSearchParams({ intent: "ci-history" })),
    { kind: "intent-ci-history" },
  );
});

test("the browser reads the local scope boundary and refuses another scope or endpoint's answer", async () => {
  const source = makeMe.aPublishedSource
    .with({
      id: "open-dough",
      repository: "terryyin/open-dough",
      label: "Open Dough",
    })
    .please();
  const endpoint = { revision: "b".repeat(40), at: "2026-11-02T00:00:00Z" };
  const original = globalThis.fetch;
  let answer = makeMe.aScopeHistoryGlance
    .with({
      path: "tests",
      selectedRevision: endpoint.revision,
      availability: "empty",
      entries: [],
    })
    .please();
  let asked;
  globalThis.fetch = async (url) => {
    asked = String(url);
    return Response.json(answer);
  };
  try {
    assert.deepEqual(
      await readIntentCiScopeHistory(
        source,
        "tests",
        endpoint,
        new AbortController().signal,
      ),
      answer,
    );
    assert.equal(
      new URL(asked, "http://localhost").pathname,
      "/__authenticated-read",
    );
    assert.equal(
      new URL(asked, "http://localhost").searchParams.get("scope"),
      "tests",
    );
    assert.equal(
      new URL(asked, "http://localhost").searchParams.get("revision"),
      endpoint.revision,
    );
    assert.equal(
      new URL(asked, "http://localhost").searchParams.get("history"),
      "glance",
    );
    answer = makeMe.aScopeHistoryGlance
      .with({
        path: "other",
        selectedRevision: endpoint.revision,
        availability: "empty",
        entries: [],
      })
      .please();
    await assert.rejects(
      readIntentCiScopeHistory(
        source,
        "tests",
        endpoint,
        new AbortController().signal,
      ),
      /shape this dashboard does not understand/,
    );
    answer = makeMe.aScopeHistoryGlance
      .with({
        path: "tests",
        selectedRevision: "c".repeat(40),
        availability: "empty",
        entries: [],
      })
      .please();
    await assert.rejects(
      readIntentCiScopeHistory(
        source,
        "tests",
        endpoint,
        new AbortController().signal,
      ),
      /shape this dashboard does not understand/,
    );
  } finally {
    globalThis.fetch = original;
  }
});

test("an upstream rate limit still withholds live acquisition while both collected histories read local evidence", async () => {
  const source = makeMe.aPublishedSource
    .with({
      id: "open-dough",
      repository: "terryyin/open-dough",
      label: "Open Dough",
    })
    .please();
  const endpoint = { revision: "b".repeat(40), at: "2026-11-02T00:00:00Z" };
  const scope = makeMe.aScopeHistoryGlance
    .with({
      path: "tests",
      selectedRevision: endpoint.revision,
      availability: "empty",
      entries: [],
    })
    .please();
  const originalFetch = globalThis.fetch;
  const originalClock = Date.now;
  const calls = [];
  Date.now = () => 1000;
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    return Response.json(
      String(url).includes("scope=") ? scope : { entries: [] },
    );
  };
  try {
    noteLimit(60);
    await assert.rejects(
      authenticatedGet(
        "source=open-dough&intent=ci-status",
        "live CI",
        new AbortController().signal,
      ),
      /GitHub limited/,
    );
    assert.equal(calls.length, 0);
    assert.deepEqual(
      await readIntentCiScopeHistory(
        source,
        "tests",
        endpoint,
        new AbortController().signal,
      ),
      scope,
    );
    assert.deepEqual(
      await readIntentCiHistory(source, new AbortController().signal),
      { entries: [] },
    );
    assert.equal(calls.length, 2);
  } finally {
    globalThis.fetch = originalFetch;
    Date.now = originalClock;
  }
});
