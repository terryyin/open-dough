// Failures of the local authenticated read boundary's revision check
// (../server/revisionChecks.ts, ../server/rateLimitDirection.ts), tested
// directly against real HTTP and the synthetic `gh`
// (./revisionCheckBoundary.ts): a failed listing is classified as a failure;
// a rate limit passes on only the wait GitHub directs; an answer spending the
// last allowance is still an answer; and a listing that fails for any reason
// but a rate limit reports the ref's commit alone, naming no branch head, for
// that check only. Answers and GitHub's 304:
// ./authenticated-read-revision-check.spec.ts.

import { expect, test } from "@playwright/test";
import {
  commitAnswer,
  notLoggedIn,
  rateLimitedAnswer,
} from "./originAnswers.ts";
import {
  checkArgv,
  listingEtag,
  revisionA,
  revisionB,
  revisionCheckBoundary,
} from "./revisionCheckBoundary.ts";

test.describe.configure({ mode: "serial" });

// The argv that asks which commit a repository's `main` names, and nothing
// about other branches.
function refArgv(repository: string): string[] {
  return ["api", `repos/${repository}/commits/main`, "--jq", ".sha"];
}

// GitHub giving up on an answer, as it does on a large repository's listing.
const gatewayTimeout = {
  status: 504,
  contentType: "application/json; charset=utf-8",
  body: JSON.stringify({ message: "Server Error" }),
};

test.describe("authenticated read boundary revision check failures (dev launch mode)", () => {
  const { main, listing, check } = revisionCheckBoundary();

  test("a real failure of the conditional listing is still classified as a failure, and a rate limit is never asked of the ref alone", async () => {
    listing.set("terryyin/open-dough", rateLimitedAnswer());
    main.set("terryyin/open-dough", commitAnswer(revisionB));
    const limited = await check("open-dough", revisionB);
    listing.delete("terryyin/open-dough");
    expect(limited.status).toBe(502);
    expect(limited.body).toEqual({
      error:
        "GitHub limited the rate of the local GitHub CLI's requests (HTTP 403) while reading main of terryyin/open-dough. Wait before pressing Retry.",
    });
    // Only the listing: a rate limit is never asked of the ref alone.
    expect(limited.calls).toHaveLength(1);
    expect(limited.calls[0]?.at(-1)).toBe(
      "repos/terryyin/open-dough/git/matching-refs/heads/",
    );

    main.set("terryyin/open-dough", notLoggedIn);
    const loggedOut = await check("open-dough", revisionB);
    expect(loggedOut.status).toBe(502);
    expect(loggedOut.body).toEqual({
      error:
        "The local GitHub CLI is not logged in, so main of terryyin/open-dough could not be read. Run `gh auth login` (check with `gh auth status`), then press Retry.",
    });
  });

  test("a rate limit that directs a wait passes on only that wait, validated and bounded, for the page's next check", async () => {
    const limitedMessage = (status: number, wait: string) =>
      `GitHub limited the rate of the local GitHub CLI's requests (HTTP ${String(status)}) while reading main of terryyin/open-dough. ${wait}`;

    main.set(
      "terryyin/open-dough",
      rateLimitedAnswer(429, { "Retry-After": "120" }),
    );
    const retryAfter = await check("open-dough", revisionB);
    expect(retryAfter.status).toBe(502);
    expect(retryAfter.body).toEqual({
      error: limitedMessage(
        429,
        "GitHub asked to wait 120 seconds before asking again.",
      ),
      retryAfterSeconds: 120,
    });

    const resetSeconds = Math.floor(Date.now() / 1000) + 90;
    main.set(
      "terryyin/open-dough",
      rateLimitedAnswer(403, {
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(resetSeconds),
      }),
    );
    const reset = await check("open-dough", revisionB);
    expect(reset.status).toBe(502);
    const { retryAfterSeconds } = reset.body as { retryAfterSeconds: number };
    expect(retryAfterSeconds).toBeGreaterThanOrEqual(85);
    expect(retryAfterSeconds).toBeLessThanOrEqual(90);

    // A direction beyond GitHub's own hour-long window is bounded to it.
    main.set(
      "terryyin/open-dough",
      rateLimitedAnswer(429, { "Retry-After": "86400" }),
    );
    expect((await check("open-dough", revisionB)).body).toMatchObject({
      retryAfterSeconds: 3600,
    });

    // Headers that direct nothing usable leave the ordinary failure alone:
    // an unreadable Retry-After, and a reset while allowance remains.
    for (const headers of [
      { "Retry-After": "soon" },
      { "X-RateLimit-Remaining": "12", "X-RateLimit-Reset": "1" },
    ]) {
      main.set("terryyin/open-dough", rateLimitedAnswer(403, headers));
      const undirected = await check("open-dough", revisionB);
      expect(undirected.status).toBe(502);
      expect(undirected.body).toEqual({
        error: limitedMessage(403, "Wait before pressing Retry."),
      });
    }
  });

  test("a successful answer that spends the last of the allowance is still an answer, not a failure", async () => {
    main.set("terryyin/open-dough", {
      ...commitAnswer(revisionB),
      headers: { "X-RateLimit-Remaining": "0", "X-RateLimit-Reset": "1" },
    });
    const spent = await check("open-dough", revisionA);
    expect(spent.status).toBe(200);
    expect(spent.body).toEqual({
      revision: revisionB,
      changed: true,
      branches: [],
    });
  });

  test("a listing GitHub gives up on still reports the ref's commit, from the ref alone and naming no branch heads, for that check only", async () => {
    main.set("terryyin/open-dough", commitAnswer(revisionA));
    await check("open-dough", revisionA);

    listing.set("terryyin/open-dough", gatewayTimeout);
    main.set("terryyin/open-dough", commitAnswer(revisionB));
    const fallenBack = await check("open-dough", revisionA);
    expect(fallenBack.status).toBe(200);
    expect(fallenBack.body).toEqual({ revision: revisionB, changed: true });
    expect(fallenBack.calls).toEqual([
      checkArgv("terryyin/open-dough", listingEtag(revisionA)),
      refArgv("terryyin/open-dough"),
    ]);

    // The next listing that succeeds names branch heads again, still
    // conditional on the last listing GitHub gave.
    listing.delete("terryyin/open-dough");
    const listed = await check("open-dough", revisionB);
    expect(listed.body).toEqual({
      revision: revisionB,
      changed: false,
      branches: [],
    });
    expect(listed.calls).toEqual([
      checkArgv("terryyin/open-dough", listingEtag(revisionA)),
    ]);
  });
});
