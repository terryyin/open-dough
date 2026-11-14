import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "./makeMe.mjs";
import {
  scopeReferenceEntry,
  scopeReferenceReading,
} from "./scopePriorReferenceTestData.mjs";
import { readIntentCiScopeHistory } from "../../../dashboard/src/authenticatedIntentCiHistoryRead.ts";
import { scopeHistoryGlanceOf } from "../../../dashboard/server/ciHistoryGlance.ts";

test("the browser scope reader rejects a reference for another landing even when the outer path and selected revision match", async () => {
  const source = makeMe.aPublishedSource
    .with({
      id: "open-dough",
      repository: "terryyin/open-dough",
      label: "Open Dough",
    })
    .please();
  const answer = scopeHistoryGlanceOf(
    scopeReferenceReading(
      [100, 100, 100, 100, 100, 120].map((ms) => [scopeReferenceEntry(ms)]),
    ),
  );
  const endpoint = {
    revision: answer.selectedRevision,
    at: "2026-11-06T00:00:00Z",
  };
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response(JSON.stringify(answer));
    assert.deepEqual(
      await readIntentCiScopeHistory(
        source,
        answer.path,
        endpoint,
        new AbortController().signal,
      ),
      answer,
    );
    // Exact mismatched wire identity is the input under proof, outside MakeMe.
    const mismatched = {
      ...answer,
      references: answer.references.map((candidate) => ({
        ...candidate,
        reference: { ...candidate.reference, endpoint: "f".repeat(40) },
      })),
    };
    globalThis.fetch = async () => new Response(JSON.stringify(mismatched));
    await assert.rejects(
      readIntentCiScopeHistory(
        source,
        answer.path,
        endpoint,
        new AbortController().signal,
      ),
      /shape this dashboard does not understand/,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
