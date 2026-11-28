// A real HTTP branch watch still reports a directed wait from its REST
// listing even though the trunk is verified through Git.
import { expect, test } from "../../test-support/support/pageTest.ts";
import {
  headsAnswer,
  rateLimitedAnswer,
} from "../../test-support/originAnswers.ts";
import { rawRequest } from "../../test-support/support/rawHttp.ts";
import {
  failListingAfterProfiles,
  streamServer,
  streamUrl,
  withStreamOrigin,
} from "./revisionStreamBoundary.ts";

test("the interim branch listing passes on GitHub's directed or bounded backoff wait", async () => {
  const limitedMessage = (status: number, wait: string) =>
    `GitHub limited the rate of the local GitHub CLI's requests (HTTP ${String(status)}) while reading main of terryyin/open-dough. ${wait}`;
  const refusedOnOwnServer = async (
    refusal: () => ReturnType<typeof rateLimitedAnswer>,
  ) => {
    let result: { status: number; body: unknown } | undefined;
    await withStreamOrigin(await streamServer(), async (origin, server) => {
      const { older } = origin.repository.revisions;
      await failListingAfterProfiles(server, older, refusal());
      const before = server.github.calls.length;
      const response = await rawRequest({
        url: streamUrl(server, `&since=${older}&watch=story%2Fone`),
        headers: { Origin: server.origin },
      });
      expect(
        server.github.calls.slice(before).map(({ request }) => request.kind),
      ).toEqual(["matching-refs"]);
      result = {
        status: response.status,
        body: JSON.parse(response.body) as unknown,
      };
    });
    if (result === undefined)
      throw new Error("The branch watch did not answer.");
    return result;
  };

  const retryAfter = await refusedOnOwnServer(() =>
    rateLimitedAnswer(429, { "Retry-After": "120" }),
  );
  expect(retryAfter.status).toBe(502);
  expect(retryAfter.body).toEqual({
    error: limitedMessage(
      429,
      "GitHub asked to wait 120 seconds before asking again.",
    ),
    retryAfterSeconds: 120,
  });

  const reset = await refusedOnOwnServer(() =>
    rateLimitedAnswer(403, {
      "X-RateLimit-Remaining": "0",
      "X-RateLimit-Reset": String(Math.floor(Date.now() / 1000) + 90),
    }),
  );
  expect(reset.status).toBe(502);
  const { retryAfterSeconds } = reset.body as { retryAfterSeconds: number };
  expect(retryAfterSeconds).toBeGreaterThanOrEqual(85);
  expect(retryAfterSeconds).toBeLessThanOrEqual(90);

  // A direction beyond GitHub's own hour-long window is bounded to it.
  expect(
    (
      await refusedOnOwnServer(() =>
        rateLimitedAnswer(429, { "Retry-After": "86400" }),
      )
    ).body,
  ).toMatchObject({ retryAfterSeconds: 3600 });

  // Headers that direct nothing usable direct no wait, so the process backs
  // off its own first wait: an unreadable Retry-After, a reset while
  // allowance remains, and a time already passed -- a zero Retry-After, a
  // past Retry-After date, or a past reset once allowance is spent.
  for (const headers of [
    () => ({ "Retry-After": "soon" }),
    () => ({ "X-RateLimit-Remaining": "12", "X-RateLimit-Reset": "1" }),
    () => ({ "Retry-After": "0" }),
    () => ({ "Retry-After": new Date(Date.now() - 5_000).toUTCString() }),
    () => ({
      "X-RateLimit-Remaining": "0",
      "X-RateLimit-Reset": String(Math.floor(Date.now() / 1000) - 5),
    }),
  ]) {
    const undirected = await refusedOnOwnServer(() =>
      rateLimitedAnswer(403, headers()),
    );
    expect(undirected.status).toBe(502);
    expect(undirected.body).toEqual({
      error: limitedMessage(
        403,
        "GitHub named no wait, so reading resumes in 60 seconds.",
      ),
      retryAfterSeconds: 60,
    });
  }
});

test("a branch listing spending its last allowance still reports the recorded branch", async () => {
  await withStreamOrigin(await streamServer(), async (origin, server) => {
    const { older, published } = origin.repository.revisions;
    await failListingAfterProfiles(server, older, {
      ...headsAnswer({ main: published, "story/one": older }),
      headers: { "X-RateLimit-Remaining": "0", "X-RateLimit-Reset": "1" },
    });
    const response = await rawRequest({
      url: streamUrl(server, `&since=${older}&watch=story%2Fone`),
      headers: { Origin: server.origin },
    });
    expect(response.status).toBe(200);
    expect(JSON.parse(response.body)).toMatchObject({
      revision: published,
      branches: [{ branch: "story/one", head: older }],
    });
  });
});
