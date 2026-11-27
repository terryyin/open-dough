// A revision check falls back to the ref only when the listing failed for a
// reason other than a rate limit. A rate limit reports the wait GitHub
// directed, or 60 seconds when it directed none. A 200 that spends the last
// allowance is still an answer.

import { expect, test } from "vitest";
import { headsAnswer } from "../../test-support/originAnswers.ts";
import { reportedFailure } from "../../server/readFailureMessage.ts";
import {
  checked,
  etagAt,
  freshSignal,
  ghPrinted,
  ghScript,
  headsAt,
  listingArgs,
  openDough,
  rateLimitNow,
  readingMain,
  refArgs,
  rejected,
  revisionA,
  revisionB,
  revisionChecks,
  shaAnswer,
} from "./revisionCheckHarness.ts";
import { withAuthenticatedRead } from "./revisionCheckHttp.ts";

function limitedMessage(status: number, wait: string): string {
  return `GitHub limited the rate of the local GitHub CLI's requests (HTTP ${String(status)}) while reading ${readingMain}. ${wait}`;
}

const namedNoWait = "GitHub named no wait, so reading resumes in 60 seconds.";
const loggedOut = `The local GitHub CLI is not logged in, so ${readingMain} could not be read. Run \`gh auth login\` (check with \`gh auth status\`), then reload the page.`;

async function reportedLimit(
  status: 403 | 429,
  headers: Readonly<Record<string, string>>,
) {
  const script = ghScript();
  script.answerListing(
    openDough.repository,
    ghPrinted(
      { code: 1 },
      status,
      headers,
      "{}",
      `gh: API rate limit exceeded (HTTP ${String(status)})`,
      rateLimitNow,
    ),
  );
  const error = await rejected(() =>
    revisionChecks(script.exchange).check(openDough, freshSignal()),
  );
  expect(script.calls).toEqual([listingArgs(openDough.repository)]);
  return reportedFailure(error, openDough, readingMain);
}

test("a rate limit never falls back to the ref alone, and a logged-out gh reports its own guidance", async () => {
  const limited = await reportedLimit(403, {});
  expect(limited).toMatchObject({
    message: limitedMessage(403, namedNoWait),
    retryAfterSeconds: 60,
  });
  const script = ghScript();
  script.answerListing(
    openDough.repository,
    ghPrinted(
      { code: 1 },
      403,
      {},
      "{}",
      "gh: API rate limit exceeded (HTTP 403)",
      rateLimitNow,
    ),
  );
  await withAuthenticatedRead(
    { checks: revisionChecks(script.exchange) },
    async (get) => {
      const response = await get(`source=open-dough&since=${revisionB}`);
      expect(response.status).toBe(502);
      expect(response.cacheControl).toBe("no-store");
      expect(response.body).toEqual({
        error: limitedMessage(403, namedNoWait),
        retryAfterSeconds: 60,
      });
    },
  );
  expect(script.calls).toEqual([listingArgs(openDough.repository)]);

  const out = ghScript();
  const login = ghPrinted(
    { code: 4 },
    undefined,
    {},
    "",
    "To get started with GitHub CLI, please run:  gh auth login\n",
    rateLimitNow,
  );
  out.answerListing(openDough.repository, login);
  out.answerRef(openDough.repository, login);
  const error = await rejected(() =>
    revisionChecks(out.exchange).check(openDough, freshSignal()),
  );
  expect(reportedFailure(error, openDough, readingMain)).toMatchObject({
    message: loggedOut,
    retryAfterSeconds: undefined,
  });
});

test("a rate limit passes on the wait GitHub directs, validated and bounded, or 60 seconds when it directs none", async () => {
  expect(await reportedLimit(429, { "Retry-After": "120" })).toMatchObject({
    message: limitedMessage(
      429,
      "GitHub asked to wait 120 seconds before asking again.",
    ),
    retryAfterSeconds: 120,
  });
  expect(
    await reportedLimit(403, {
      "X-RateLimit-Remaining": "0",
      "X-RateLimit-Reset": String(rateLimitNow / 1000 + 90),
    }),
  ).toMatchObject({ retryAfterSeconds: 90 });
  expect(await reportedLimit(429, { "Retry-After": "86400" })).toMatchObject({
    retryAfterSeconds: 3600,
  });
  for (const headers of [
    { "Retry-After": "soon" },
    { "X-RateLimit-Remaining": "12", "X-RateLimit-Reset": "1" },
    { "Retry-After": "0" },
    { "Retry-After": new Date(rateLimitNow - 5_000).toUTCString() },
    {
      "X-RateLimit-Remaining": "0",
      "X-RateLimit-Reset": String(rateLimitNow / 1000 - 5),
    },
  ]) {
    expect(await reportedLimit(403, headers)).toMatchObject({
      message: limitedMessage(403, namedNoWait),
      retryAfterSeconds: 60,
    });
  }
});

test("a successful answer that spends the last of the allowance is still an answer", async () => {
  const raw = headsAnswer(
    { main: revisionB },
    { "X-RateLimit-Remaining": "0", "X-RateLimit-Reset": "1" },
  );
  const script = ghScript();
  script.answerListing(
    openDough.repository,
    ghPrinted(
      null,
      200,
      {
        ETag: raw.etag ?? "",
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": "1",
      },
      raw.body,
      "",
      rateLimitNow,
    ),
  );
  const spent = await checked(
    revisionChecks(script.exchange),
    openDough,
    revisionA,
  );
  expect(spent).toEqual({
    kind: "answered",
    answer: { revision: revisionB, changed: true, branches: [] },
  });
});

test("a listing GitHub gives up on still reports the ref's commit for that check only", async () => {
  const script = ghScript();
  const checks = revisionChecks(script.exchange);
  script.answerListing(openDough.repository, headsAt(revisionA));
  await checked(checks, openDough, revisionA);

  script.answerListing(
    openDough.repository,
    ghPrinted(
      { code: 1 },
      504,
      {},
      JSON.stringify({ message: "Server Error" }),
      "gh: Server Error (HTTP 504)",
      rateLimitNow,
    ),
  );
  script.answerRef(openDough.repository, shaAnswer(revisionB));
  const fallenBack = await checked(checks, openDough, revisionA);
  expect(fallenBack).toEqual({
    kind: "answered",
    answer: { revision: revisionB, changed: true },
  });
  expect(script.calls.slice(-2)).toEqual([
    listingArgs(openDough.repository, etagAt(revisionA)),
    refArgs(openDough.repository),
  ]);

  script.answerListing(openDough.repository, headsAt(revisionB));
  const listed = await checked(checks, openDough, revisionB);
  expect(listed).toEqual({
    kind: "answered",
    answer: { revision: revisionB, changed: false, branches: [] },
  });
  expect(script.calls.at(-1)).toEqual(
    listingArgs(openDough.repository, etagAt(revisionA)),
  );
});
