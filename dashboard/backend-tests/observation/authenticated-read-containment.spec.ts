import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { readAnswer } from "../../../Distribution/src/skills/dough-execute-plan/scripts/github-request-answer.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeRepository } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { performContainmentRead } from "../../server/containmentRead.ts";
import { execGh } from "../../server/ghRead.ts";
import { reportedFailure } from "../../server/readFailureMessage.ts";
import { readingOf } from "../../server/readingRequestedRead.ts";
import { parseRequestedRead } from "../../server/requestedRead.ts";
import { comparisonIn } from "../../test-support/comparisonAnswers.ts";
import {
  noConnection,
  rateLimitedAnswer,
  type OriginAnswer,
} from "../../test-support/originAnswers.ts";
import { asGhReply } from "../../test-support/support/ghReply.ts";
import { parseRequest } from "../../test-support/support/ghRequest.ts";

vi.mock(import("../../server/ghRead.ts"), async (importOriginal) => ({
  ...(await importOriginal()),
  execGh: vi.fn(),
}));

const source = makeMe.aPublishedSource.pygardon.please();
const compare = vi.mocked(execGh);
const accepted = "a1".repeat(20);
const shown = "b2".repeat(20);
const askedAt = "2026-09-01T09:00:00Z";

function parse(accepted: string, shown: string) {
  const parameters = new URLSearchParams({
    source: source.id,
    revision: shown,
    contains: accepted,
  });
  const read = parseRequestedRead(parameters);
  if (read.kind !== "containment-at")
    throw new Error("Expected an admitted containment read.");
  return read;
}

function answerComparisons(
  answer: (base: string, head: string) => OriginAnswer,
) {
  compare.mockImplementation((args) => {
    const request = parseRequest(args);
    if (request.kind !== "compare" || request.repository !== source.repository)
      throw new Error("Expected a comparison in the configured repository.");
    const { stdout, stderr, exitCode } = asGhReply(
      ["--include", ...args],
      request,
      answer(request.base, request.head),
    );
    const decoded = readAnswer(
      exitCode === 0 ? null : { code: exitCode },
      stdout,
      stderr,
      askedAt,
    );
    const failure = decoded.failure;
    if (failure?.kind === "rate-limited") {
      const { status, waitSeconds } = failure;
      if (waitSeconds === undefined)
        throw new Error("Expected GitHub to direct a wait in this fixture.");
      return Promise.resolve({
        ...decoded,
        failure: { kind: "rate-limited", status, waitSeconds },
      });
    }
    return Promise.resolve({ ...decoded, failure });
  });
}

beforeEach(() => {
  compare.mockReset();
});

describe("published containment", () => {
  const description = makeMe.aRepository
    .withRevision("base")
    .withRevision("accepted", { files: { "publication.md": "Accepted\n" } })
    .withRevision("unrelated", {
      parents: ["base"],
      files: { "unrelated.md": "Unrelated\n" },
      tags: ["unrelated"],
    })
    .withRevision("descendant", {
      parents: ["accepted"],
      files: { "publication.md": "Advanced\n" },
    })
    .please();
  let repository: Awaited<
    ReturnType<
      typeof materializeRepository<
        "base" | "accepted" | "unrelated" | "descendant"
      >
    >
  >;

  beforeAll(async () => {
    repository = await materializeRepository(description);
    return () => repository.cleanup();
  });

  test.each([
    {
      name: "an equal revision",
      accepted: "accepted",
      shown: "accepted",
      contains: true,
    },
    {
      name: "a descendant",
      accepted: "accepted",
      shown: "descendant",
      contains: true,
    },
    {
      name: "a behind revision",
      accepted: "accepted",
      shown: "base",
      contains: false,
    },
    {
      name: "a divergent revision",
      accepted: "accepted",
      shown: "unrelated",
      contains: false,
    },
    {
      name: "an unknown accepted commit",
      accepted: "missing",
      shown: "descendant",
      contains: false,
    },
  ] as const)("answers containment for $name", async (row) => {
    const revisions = { ...repository.revisions, missing: "cc".repeat(20) };
    answerComparisons((base, head) =>
      comparisonIn(repository.origin, base, head),
    );
    const accepted = revisions[row.accepted];
    const revision = revisions[row.shown];
    const signal = new AbortController().signal;

    await expect(
      performContainmentRead(source, parse(accepted, revision), signal),
    ).resolves.toEqual({
      kind: "answered",
      answer: { revision, accepted, contained: row.contains },
    });
    expect(compare).toHaveBeenCalledExactlyOnceWith(
      [
        "api",
        `repos/${source.repository}/compare/${accepted}...${revision}?per_page=1`,
        "--jq",
        ".status",
      ],
      signal,
    );
  });
});

const reading = `whether ${shown} contains ${accepted}`;

test.each([
  {
    name: "a rate limit directing a wait",
    answer: rateLimitedAnswer(429, { "Retry-After": "120" }),
    message:
      `GitHub limited the rate of the local GitHub CLI's requests (HTTP 429) while reading ${reading}. ` +
      "GitHub asked to wait 120 seconds before asking again.",
    retryAfterSeconds: 120,
    recovery: undefined,
  },
  {
    name: "an unavailable comparison",
    answer: noConnection,
    message: `The local GitHub CLI could not reach GitHub while reading ${reading}.`,
    retryAfterSeconds: undefined,
    recovery: "transient",
  },
  {
    name: "a comparison without a status",
    answer: {
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ message: "something else" }),
    },
    message: `The local authenticated read failed while reading ${reading}. Check that \`gh auth status\` succeeds and that this login can read ${source.repository}, then reload the page.`,
    retryAfterSeconds: undefined,
    recovery: undefined,
  },
])(
  "fails the read for $name",
  async ({ answer, message, retryAfterSeconds, recovery }) => {
    answerComparisons(() => answer);
    const read = parse(accepted, shown);

    await expect(
      performContainmentRead(source, read, new AbortController().signal).catch(
        (error: unknown) =>
          reportedFailure(error, source, readingOf(source, read)),
      ),
    ).resolves.toEqual({ message, retryAfterSeconds, recovery });
  },
);

const shownParameter = `revision=${shown}`;
const acceptedParameter = `contains=${accepted}`;
const pair = `${shownParameter}&${acceptedParameter}`;
const fullRevisions = "A containment read names only full commit shas.";
const onlyRevisions =
  "A containment read names only the revision shown and the accepted revision.";

test.each([
  ["an accepted branch name", `${shownParameter}&contains=main`, fullRevisions],
  [
    "an abbreviated accepted commit",
    `${shownParameter}&contains=${accepted.slice(0, 7)}`,
    fullRevisions,
  ],
  [
    "a symbolic shown revision",
    `revision=HEAD&${acceptedParameter}`,
    fullRevisions,
  ],
  ["a missing shown revision", acceptedParameter, onlyRevisions],
  ["two accepted revisions", `${pair}&contains=${shown}`, onlyRevisions],
  ["an extra file path", `${pair}&path=README.md`, onlyRevisions],
  ["an extra branch", `${pair}&branch=main`, onlyRevisions],
  [
    "a check in place of the shown revision",
    `since=${shown}&${acceptedParameter}`,
    onlyRevisions,
  ],
  [
    "an upper-case accepted revision",
    `${shownParameter}&contains=${accepted.toUpperCase()}`,
    fullRevisions,
  ],
  ["an accepted revision with a suffix", `${pair}%3Bextra`, fullRevisions],
] as const)("refuses %s in a containment request", (...[, query, message]) => {
  expect(
    parseRequestedRead(new URLSearchParams(`source=${source.id}&${query}`)),
  ).toEqual({ kind: "refused", status: 400, message });
});
