// Intent CI proof read boundary (../../server/intentCiProofRead.ts
// via the authenticated read): a proof query must name the run's attempt; one
// that omits it is refused before GitHub is asked. Query-shape refusals of
// `parseIntentCiProofRead`:
// ../../../Distribution/tests/support/dashboard-ci-proof-parse.test.mjs.

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
import { trunkCi } from "../../test-support/support/trunkCiAnswers.ts";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";

const revision = "a1".repeat(20);

test("a CI proof query that omits the attempt is refused before asking GitHub", async () => {
  const server = await startDashboardServer(developmentBoundary);
  try {
    const ci = trunkCi(revision, () => []);
    const published = publishes({ revision });
    server.github.serve(
      everyRepository,
      async (call) => (await ci(call)) ?? published(call),
    );
    const ask = (query: string) =>
      rawRequest({
        url: `${server.baseURL}${authenticatedReadEndpoint}?source=open-dough&intent=ci-proof&run=41&revision=${revision}${query}`,
        headers: { Origin: server.origin },
      });
    const before = server.github.calls.length;
    const refused = await ask("");
    expect(refused.status).toBe(400);
    expect(server.github.calls.slice(before)).toEqual([]);
    // The same query naming its attempt is read from GitHub.
    const read = await ask("&attempt=1");
    expect(read.status).toBe(200);
    expect(server.github.calls.slice(before)).not.toEqual([]);
  } finally {
    await server.close();
  }
});
