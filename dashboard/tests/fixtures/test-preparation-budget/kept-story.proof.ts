// Preparation-page cases whose origins start from each of the worker's kept
// stories, one of them also taking the native Codex queued origin, so the
// outer proof (runtime/kept-history-worker.spec.ts) can place each worker
// preparation against the case's private origin.
import {
  startingFromKeptIntentStory,
  startingFromKeptStory,
  startingFromKeptSummaryComparisonStory,
} from "../../support/keptPublishedStory.ts";
import { expect, test } from "../../support/preparationPage.ts";

test.extend(startingFromKeptStory)(
  "keptStory",
  ({ origin, queuedCodexOriginReady }) => {
    expect(origin.origin).toBeTruthy();
    expect(queuedCodexOriginReady).toBeUndefined();
  },
);

test.extend(startingFromKeptIntentStory)("keptIntentStory", ({ origin }) => {
  expect(origin.origin).toBeTruthy();
});

test.extend(startingFromKeptSummaryComparisonStory)(
  "keptSummaryComparisonStory",
  ({ origin }) => {
    expect(origin.origin).toBeTruthy();
  },
);
