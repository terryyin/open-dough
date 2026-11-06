// Intent CI status read boundary (../../server/intentCiStatusRead.ts): refuses
// unsafe judged branch names, the shared branch-read parameter, a pinned
// revision, and a malformed kept form before asking GitHub; a kept read with
// nothing stored answers none without further CI asks (SEED-239 slice 5).

import { expect, test } from "../dashboardTest.ts";
import { openDough } from "../intentCodeBrowseFixtures.ts";
import {
  judgmentCalls,
  publishProject,
  trunkCi,
} from "../intentCiStatusPage.ts";
import { openUntilRead } from "../pageRequestNotes.ts";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";

test("the CI status read refuses an unsafe branch name and a pinned revision before asking GitHub", async ({
  page,
}) => {
  const published = publishProject(page, openDough);
  published.serveCi(trunkCi(openDough.revision, () => []));
  await openUntilRead(page);
  const before = published.requests.length;
  // Asked from the page, as the page's own reads are.
  const ask = (query: string) =>
    page.evaluate(async (url) => {
      const response = await fetch(url);
      return {
        status: response.status,
        body: (await response.json()) as unknown,
      };
    }, `${authenticatedReadEndpoint}?source=open-dough&${query}`);
  for (const query of [
    "intent=ci-status&judged=main..other",
    "intent=ci-status&judged=has%20space",
    "intent=ci-status&judged=main&judged=other",
    // The shared `branch` parameter names only a branch read.
    "intent=ci-status&branch=main",
    `intent=ci-status&revision=${openDough.revision}`,
  ]) {
    const answer = await ask(query);
    expect(answer.status, query).toBe(400);
  }
  const answer = await ask("intent=ci-status");
  expect(answer.status).toBe(200);
  expect(answer.body).toMatchObject({
    branch: "main",
    state: "unread",
    freshness: "fresh",
  });
  expect(judgmentCalls(published.requests.slice(before))).toEqual([
    "actions-runs",
    "actions-workflow",
    "commit-list main",
  ]);
  const keptNone = await ask("intent=ci-status&kept=1");
  expect(keptNone.status).toBe(200);
  expect(keptNone.body).toEqual({ none: true });
  expect(judgmentCalls(published.requests.slice(before))).toEqual([
    "actions-runs",
    "actions-workflow",
    "commit-list main",
  ]);
  for (const query of [
    "intent=ci-status&kept=yes",
    "intent=ci-status&kept=1&kept=1",
  ]) {
    const refused = await ask(query);
    expect(refused.status, query).toBe(400);
  }
});
