// What a reader is told when GitHub refuses or the local `gh` fails: the
// installed answer parser (`readAnswer`) classifies what `gh` printed, the
// owner's admission (`ReadAdmission.answered`) settles any rate limit, and
// `reportedFailure` (../../server/readFailureMessage.ts) turns that class into
// safe wording, any directed wait, and transient-recovery eligibility.
// Recognized upstream statuses (408/500/502/503/504), lost connectivity and
// the owned timeout may recover transiently; access, missing, opaque and
// oversized failures keep their own wording. The real `gh` exceeding its
// output cap and the head listing's fallback stay with
// ./authenticated-read-output-bound.spec.ts.

import { expect, test } from "vitest";
import { ReadAdmission } from "../../../Distribution/src/skills/dough-execute-plan/scripts/github-request-admission.mjs";
import { readAnswer } from "../../../Distribution/src/skills/dough-execute-plan/scripts/github-request-answer.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { GhFailure } from "../../server/ghFailure.ts";
import { reportedFailure } from "../../server/readFailureMessage.ts";

const source = makeMe.aPublishedSource.openDough.please();
const reading = `${source.ref} of ${source.repository}`;
const checkAccess = `Check that \`gh auth status\` succeeds and that this login can read ${source.repository}, then reload the page.`;
const nowMs = Date.UTC(2026, 10, 27, 12);
const askedAt = new Date(nowMs).toISOString();

// What the reader is told for one `gh` call that exited with `stderr`, after
// `stdout` (GitHub's included status and headers, when it printed them).
function reportedFor(
  stderr: string,
  stdout = "",
  error: { readonly code: string | number } = { code: 1 },
  at = reading,
) {
  const { failure } = new ReadAdmission(60_000).answered(
    readAnswer(error, stdout, stderr, askedAt, nowMs),
    nowMs,
  );
  if (failure === undefined) throw new Error("the call did not fail");
  return reportedFailure(new GhFailure(failure), source, at);
}

const included = (status: number, headers: Record<string, string>) =>
  [
    `HTTP/2.0 ${String(status)} Refused`,
    ...Object.entries(headers).map(([name, value]) => `${name}: ${value}`),
    "",
    '{"message":"API rate limit exceeded"}',
  ].join("\r\n");

const answered = (status: number) =>
  reportedFor(`gh: Refused (HTTP ${String(status)})\n`);
const answeredPrefix = (status: number) =>
  `GitHub answered HTTP ${String(status)} to the local GitHub CLI while reading ${reading}.`;

test.each([408, 500, 502, 503, 504])(
  "GitHub HTTP %i carries transient recovery",
  (status) => {
    expect(answered(status)).toMatchObject({
      message: answeredPrefix(status),
      recovery: "transient",
    });
  },
);

test.each([401, 403, 404])(
  "GitHub HTTP %i keeps access advice without transient recovery",
  (status) => {
    expect(answered(status)).toMatchObject({
      message: `${answeredPrefix(status)} ${checkAccess}`,
      recovery: undefined,
    });
  },
);

test("lost connectivity carries transient recovery", () => {
  expect(reportedFor("error connecting to api.github.com\n").recovery).toBe(
    "transient",
  );
});

test("the owned timeout carries transient recovery", () => {
  expect(
    reportedFailure(new GhFailure({ kind: "timed-out" }), source, reading)
      .recovery,
  ).toBe("transient");
});

test("an opaque failure keeps access advice without a wait or transient recovery", () => {
  expect(reportedFor("gh: unexplained failure\n")).toEqual({
    message: `The local authenticated read failed while reading ${reading}. ${checkAccess}`,
    retryAfterSeconds: undefined,
    recovery: undefined,
  });
});

test.each([
  { at: reading, status: 403 },
  { at: ".planning/seeds/seed.md at abc", status: 429 },
  { at: ".planning/agents at abc", status: 403 },
  { at: "the last commit of .planning/seeds/seed.md at abc", status: 429 },
  { at: "branch story/one of terryyin/open-dough", status: 403 },
])(
  "a refused read of $at reports the Retry-After wait GitHub directed",
  ({ at, status }) => {
    expect(
      reportedFor(
        `gh: API rate limit exceeded (HTTP ${String(status)})\n`,
        included(status, { "Retry-After": "120" }),
        { code: 1 },
        at,
      ),
    ).toEqual({
      message: `GitHub limited the rate of the local GitHub CLI's requests (HTTP ${String(status)}) while reading ${at}. GitHub asked to wait 120 seconds before asking again.`,
      retryAfterSeconds: 120,
      recovery: undefined,
    });
  },
);

test("a refusal with nothing remaining waits until GitHub's reset time", () => {
  const reset = String(nowMs / 1000 + 90);
  expect(
    reportedFor(
      "gh: Forbidden (HTTP 403)\n",
      included(403, {
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": reset,
      }),
    ),
  ).toMatchObject({
    message: `GitHub limited the rate of the local GitHub CLI's requests (HTTP 403) while reading ${reading}. GitHub asked to wait 90 seconds before asking again.`,
    retryAfterSeconds: 90,
  });
});

test("an unmarked 403 keeps access advice without a wait", () => {
  expect(
    reportedFor("gh: Forbidden (HTTP 403)\n", included(403, {})),
  ).toMatchObject({
    message: `${answeredPrefix(403)} ${checkAccess}`,
    retryAfterSeconds: undefined,
  });
});

test("oversized output names its cause without raw output, a wait, recovery or an invented status", () => {
  const secret = "SECRET-BODY-MARKER";
  const reported = reportedFor("", `HTTP/2.0 200 OK\r\n\r\n{"sha":"${secret}`, {
    code: "ERR_CHILD_PROCESS_STDIO_MAXBUFFER",
  });
  expect(reported).toEqual({
    message: `The local GitHub CLI output exceeded the request's size limit while reading ${reading}.`,
    retryAfterSeconds: undefined,
    recovery: undefined,
  });
  expect(JSON.stringify(reported)).not.toContain(secret);
});
