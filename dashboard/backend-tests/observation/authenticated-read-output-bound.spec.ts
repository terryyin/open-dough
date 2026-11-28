// A real gh subprocess exceeds the authenticated read's 32 MiB output bound
// (../../server/ghRead.ts); the request owner carries its safe cause through
// the HTTP notice/history.
import { expect, test } from "../../test-support/support/pageTest.ts";
import { everyRepository } from "../../test-support/support/fakeGitHub.ts";
import {
  pinnedAt,
  sharedSeedPath,
  unnamedRevision,
} from "../../test-support/support/sharedReads.ts";
import { rawRequest } from "../../test-support/support/rawHttp.ts";
import {
  failListingAfterProfiles,
  streamServer,
  streamUrl,
  withStreamOrigin,
} from "./revisionStreamBoundary.ts";
import {
  inspect,
  knownSourceId,
  secretMarker,
  developmentBoundary,
  startDashboardServer,
} from "../../test-support/support/readDiagnostics.ts";

// Past the bound by a margin the answer's JSON framing cannot make up.
const pastBound = 33 * 1024 * 1024;

test("oversized gh output names its cause without retry advice, raw output or an invented upstream status", async () => {
  const server = await startDashboardServer({
    ...developmentBoundary,
    liveServer: "separate process",
  });
  try {
    server.github.serve(everyRepository, () =>
      Promise.resolve({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          sha: secretMarker + "x".repeat(pastBound),
        }),
      }),
    );
    const response = await pinnedAt(server);
    expect(response.status).toBe(502);
    expect(JSON.parse(response.body)).toEqual({
      error: `The local GitHub CLI output exceeded the request's size limit while reading ${sharedSeedPath} at ${unnamedRevision}.`,
    });
    expect(response.body).not.toContain(secretMarker);
    expect(response.body.length).toBeLessThan(300);
    const history = await inspect(server);
    expect(history.failures).toHaveLength(1);
    expect(history.failures[0]).toMatchObject({
      source: knownSourceId,
      category: "content",
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

test("an oversized branch listing keeps the verified trunk without claiming branch heads", async () => {
  await withStreamOrigin(await streamServer(), async (origin, server) => {
    const { older, published } = origin.repository.revisions;
    await failListingAfterProfiles(server, older, {
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          ref: `refs/heads/${"x".repeat(pastBound)}`,
          object: { type: "commit", sha: older },
        },
      ]),
    });
    const before = server.github.calls.length;
    const response = await rawRequest({
      url: streamUrl(server, `&since=${older}&watch=story%2Fone`),
      headers: { Origin: server.origin },
    });
    expect(response.status).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      revision: published,
      changed: true,
      askedAt: expect.any(String),
      confirmedAt: expect.any(String),
    });
    expect(
      server.github.calls.slice(before).map(({ request }) => request.kind),
    ).toEqual(["matching-refs"]);
  });
});
