// A real gh subprocess exceeds the authenticated read's 1 MiB output bound;
// the request owner carries its safe cause through the HTTP notice/history.
import { expect, test } from "./support/pageTest.ts";
import { everyRepository } from "./support/fakeGitHub.ts";
import { rawRequest } from "./support/rawHttp.ts";
import { commitAnswer } from "./originAnswers.ts";
import {
  checkArgv,
  ownRevisionCheckBoundary,
  revisionA,
  revisionB,
} from "./revisionCheckBoundary.ts";
import {
  inspect,
  knownSourceId,
  secretMarker,
  startDashboardServer,
} from "./support/readDiagnostics.ts";

test("oversized gh output names its cause without retry advice, raw output or an invented upstream status", async () => {
  const server = await startDashboardServer({ mode: "dev" });
  try {
    server.github.serve(everyRepository, () =>
      Promise.resolve({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          sha: secretMarker + "x".repeat(2 * 1024 * 1024),
        }),
      }),
    );
    const response = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}`,
      headers: { Origin: server.origin },
    });
    expect(response.status).toBe(502);
    expect(JSON.parse(response.body)).toEqual({
      error:
        "The local GitHub CLI output exceeded the request's size limit while reading main of terryyin/open-dough.",
    });
    expect(response.body).not.toContain(secretMarker);
    expect(response.body.length).toBeLessThan(300);
    const history = await inspect(server);
    expect(history.failures).toHaveLength(1);
    expect(history.failures[0]).toMatchObject({
      source: knownSourceId,
      category: "ref",
      cause: "output-bound",
    });
    expect(history.failures[0]?.status).toBeUndefined();
    expect(history.failures[0]?.rateLimit).toBeUndefined();
    expect(history.body).not.toContain(secretMarker);
    expect(server.ghCalls()).toHaveLength(1);
  } finally {
    await server.close();
  }
});

test("an oversized branch listing still falls back to the ref alone without claiming branch-head evidence", async () => {
  const boundary = await ownRevisionCheckBoundary();
  const repository = "terryyin/open-dough";
  try {
    boundary.listing.set(repository, {
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          ref: `refs/heads/${"x".repeat(2 * 1024 * 1024)}`,
          object: { type: "commit", sha: revisionA },
        },
      ]),
    });
    boundary.main.set(repository, commitAnswer(revisionB));
    const response = await boundary.check(knownSourceId, revisionA);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ revision: revisionB, changed: true });
    expect(response.calls).toEqual([
      checkArgv(repository),
      ["api", "--include", `repos/${repository}/commits/main`, "--jq", ".sha"],
    ]);
  } finally {
    await boundary.close();
  }
});
