// Intent CI status read boundary (../../server/intentCiStatusRead.ts): refuses
// unsafe judged branch names, the shared branch-read parameter, a pinned
// revision, and a malformed kept form before asking GitHub; a kept read with
// nothing stored answers none without further CI asks (SEED-239 slice 5).

import { expect, test } from "../../test-support/support/pageTest.ts";
import {
  developmentBoundary,
  startDashboardServer,
} from "../../test-support/support/dashboardServer.ts";
import {
  everyRepository,
  publishes,
} from "../../test-support/support/fakeGitHub.ts";
import { rawRequest } from "../../test-support/support/rawHttp.ts";
import {
  judgmentCalls,
  trunkCi,
} from "../../test-support/support/trunkCiAnswers.ts";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";

test("the CI status read refuses an unsafe branch name and a pinned revision before asking GitHub", async () => {
  const server = await startDashboardServer(developmentBoundary);
  try {
    // Open Dough's trunk, published at `revision`, with no CI runs listed.
    const published = publishes({});
    const { revision } = published;
    const ci = trunkCi(revision, () => []);
    server.github.serve(
      everyRepository,
      async (call) => (await ci(call)) ?? published(call),
    );
    const before = server.github.calls.length;
    const asked = () => judgmentCalls(server.github.calls.slice(before));
    const ask = async (query: string) => {
      const response = await rawRequest({
        url: `${server.baseURL}${authenticatedReadEndpoint}?source=open-dough&${query}`,
        headers: { Origin: server.origin },
      });
      return {
        status: response.status,
        body: JSON.parse(response.body) as unknown,
      };
    };
    for (const query of [
      "intent=ci-status&judged=main..other",
      "intent=ci-status&judged=has%20space",
      "intent=ci-status&judged=main&judged=other",
      // The shared `branch` parameter names only a branch read.
      "intent=ci-status&branch=main",
      `intent=ci-status&revision=${revision}`,
    ]) {
      const answer = await ask(query);
      expect(answer.status, query).toBe(400);
    }
    expect(asked()).toEqual([]);
    const answer = await ask("intent=ci-status");
    expect(answer.status).toBe(200);
    expect(answer.body).toMatchObject({
      branch: "main",
      state: "unread",
      freshness: "fresh",
    });
    expect(asked()).toEqual([
      "actions-runs",
      "actions-workflow",
      "commit-list main",
    ]);
    const keptNone = await ask("intent=ci-status&kept=1");
    expect(keptNone.status).toBe(200);
    expect(keptNone.body).toEqual({ none: true });
    for (const query of [
      "intent=ci-status&kept=yes",
      "intent=ci-status&kept=1&kept=1",
    ]) {
      const refused = await ask(query);
      expect(refused.status, query).toBe(400);
    }
    expect(asked()).toEqual([
      "actions-runs",
      "actions-workflow",
      "commit-list main",
    ]);
  } finally {
    await server.close();
  }
});
