// Whether a pinned revision contains a launch's accepted publication, asked of
// the local authenticated read boundary (../server/containmentRead.ts)
// directly over real HTTP, with the synthetic `gh` answering from a fake
// GitHub that records every invocation. GitHub's comparison of the two commits
// in the catalog source's own repository decides; a failure or rate limit is
// reported as every read's is, never answered as containment; and a request
// naming anything but one shown and one accepted full commit id is refused
// before any `gh` call. The page's use of it, against a real origin's history:
// ./responsive-session-reconciliation.spec.ts.

import { expect, test } from "@playwright/test";
import {
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import { everyRepository, type GhCall } from "./support/fakeGitHub.ts";
import { compareAnswer } from "./comparisonAnswers.ts";
import {
  noConnection,
  notFoundAnswer,
  rateLimitedAnswer,
  type OriginAnswer,
} from "./originAnswers.ts";
import { rawRequest } from "./support/rawHttp.ts";

test.describe.configure({ mode: "serial" });

const accepted = "a1".repeat(20);
const shown = "b2".repeat(20);

test.describe("authenticated read boundary containment (dev launch mode)", () => {
  let server: DashboardServer;
  let answer: OriginAnswer = compareAnswer("ahead");

  test.beforeAll(async () => {
    server = await startDashboardServer({ mode: "dev" });
    server.github.serve(everyRepository, (call: GhCall) =>
      Promise.resolve(
        call.request.kind === "compare"
          ? answer
          : { exitCode: 1, stderr: "fake gh: unrecognized invocation\n" },
      ),
    );
  });

  test.afterAll(async () => {
    await server.close();
  });

  const ask = async (query: string) => {
    const before = server.github.calls.length;
    const response = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?${query}`,
      headers: { Origin: server.origin },
    });
    return {
      status: response.status,
      body: JSON.parse(response.body) as unknown,
      calls: server.github.calls.slice(before).map((call) => call.argv),
    };
  };
  const contains = (from = accepted, at = shown) =>
    ask(`source=open-dough&revision=${at}&contains=${from}`);

  test("answers whether the shown revision is, or descends from, the accepted one, asking GitHub's comparison in the source's repository", async () => {
    const expected = {
      ahead: true,
      identical: true,
      behind: false,
      diverged: false,
    } as const;
    for (const [status, contained] of Object.entries(expected)) {
      answer = compareAnswer(status as keyof typeof expected);
      const read = await contains();
      expect(read.status).toBe(200);
      expect(read.body).toEqual({ revision: shown, accepted, contained });
      expect(read.calls).toEqual([
        [
          "api",
          "--include",
          `repos/terryyin/open-dough/compare/${accepted}...${shown}?per_page=1`,
          "--jq",
          ".status",
        ],
      ]);
    }
    // GitHub knows no such accepted commit: the shown revision does not
    // contain it.
    answer = notFoundAnswer();
    expect((await contains()).body).toEqual({
      revision: shown,
      accepted,
      contained: false,
    });
  });

  test("a failure or rate limit is reported as a read failure, with only the wait GitHub directs", async () => {
    const reading = `whether ${shown} contains ${accepted}`;
    answer = rateLimitedAnswer(429, { "Retry-After": "120" });
    expect(await contains()).toMatchObject({
      status: 502,
      body: {
        error: `GitHub limited the rate of the local GitHub CLI's requests (HTTP 429) while reading ${reading}. GitHub asked to wait 120 seconds before asking again.`,
        retryAfterSeconds: 120,
      },
    });
    answer = rateLimitedAnswer();
    expect(await contains()).toMatchObject({
      status: 502,
      body: {
        error: `GitHub limited the rate of the local GitHub CLI's requests (HTTP 403) while reading ${reading}. Wait before reloading the page.`,
      },
    });
    answer = noConnection;
    expect(await contains()).toMatchObject({
      status: 502,
      body: {
        error: `The local GitHub CLI could not reach GitHub while reading ${reading}.`,
      },
    });
    // An answer that names no comparison status is no answer.
    answer = {
      status: 200,
      contentType: "application/json; charset=utf-8",
      body: JSON.stringify({ message: "something else" }),
    };
    const unnamed = await contains();
    expect(unnamed.status).toBe(502);
    expect(unnamed.body).toMatchObject({
      error: expect.stringContaining(
        `The local authenticated read failed while reading ${reading}.`,
      ),
    });
  });

  test("refuses anything but one shown and one accepted full commit id of a catalog source, before any gh call", async () => {
    answer = compareAnswer("ahead");
    const refusals = [
      `source=open-dough&revision=${shown}&contains=main`,
      `source=open-dough&revision=${shown}&contains=${accepted.slice(0, 7)}`,
      `source=open-dough&revision=HEAD&contains=${accepted}`,
      `source=open-dough&contains=${accepted}`,
      `source=open-dough&revision=${shown}&contains=${accepted}&contains=${shown}`,
      `source=open-dough&revision=${shown}&contains=${accepted}&path=README.md`,
      `source=open-dough&revision=${shown}&contains=${accepted}&branch=main`,
      `source=open-dough&since=${shown}&contains=${accepted}`,
      `source=open-dough&revision=${shown}&contains=${accepted.toUpperCase()}`,
      `source=open-dough&revision=${shown}&contains=${encodeURIComponent(`${accepted};rm -rf /`)}`,
    ];
    for (const query of refusals) {
      const refused = await ask(query);
      expect(refused.status, query).toBe(400);
      expect(refused.calls, query).toEqual([]);
    }
    const unknown = await ask(
      `source=elsewhere&revision=${shown}&contains=${accepted}`,
    );
    expect(unknown.status).toBe(404);
    expect(unknown.calls).toEqual([]);
  });
});
