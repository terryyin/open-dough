// A real `gh` subprocess exceeds the authenticated read's 32 MiB output bound
// (../../server/ghRead.ts): a pinned content read fails with its safe cause
// and no raw output or invented status, and the revision check's oversized
// head listing falls back to the ref alone without claiming branch heads.
// Classification wording for every other failure:
// ./authenticated-read-failure-report.spec.ts.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test as base } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { disconnectGh, GhFailure, runGh } from "../../server/ghRead.ts";
import { reportedFailure } from "../../server/readFailureMessage.ts";
import { RevisionChecks } from "../../server/revisionChecks.ts";
import {
  endFakeGh,
  fakeGhEnv,
  installFakeGh,
} from "../../test-support/support/fakeGh.ts";
import {
  everyRepository,
  startFakeGitHub,
  type FakeGitHub,
} from "../../test-support/support/fakeGitHub.ts";
import { commitAnswer } from "../../test-support/originAnswers.ts";
import { withRestoredEnv } from "../../test-support/support/testEnv.ts";

// Past the bound by a margin the answer's JSON framing cannot make up.
const pastBound = 33 * 1024 * 1024;
const secretMarker = "SECRET-OUTPUT-MARKER";
const source = makeMe.aPublishedSource.openDough.please();
const revisionA = "a1".repeat(20);
const revisionB = "b2".repeat(20);
// A real `gh` writing past 32 MiB takes seconds, so each case keeps the
// former Playwright default of 30 s instead of Vitest's 5 s.
const pastBoundTimeoutMs = 30_000;

// The production read in this worker, its real CLI `gh` answering from a
// fake GitHub.
const test = base.extend<{ github: FakeGitHub }>({
  // eslint-disable-next-line no-empty-pattern
  github: async ({}, use) => {
    const root = mkdtempSync(path.join(tmpdir(), "dough-output-bound-"));
    const github = await startFakeGitHub();
    const gh = installFakeGh(root, { transport: "cli" });
    const restore = withRestoredEnv(fakeGhEnv(gh, github.url));
    try {
      await use(github);
    } finally {
      disconnectGh();
      await endFakeGh(gh);
      restore();
      await github.close();
      rmSync(root, { recursive: true, force: true });
    }
  },
});

test(
  "oversized gh output names its cause without raw output or an invented upstream status",
  async ({ github }) => {
    github.serve(everyRepository, () =>
      Promise.resolve({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ sha: secretMarker + "x".repeat(pastBound) }),
      }),
    );
    const reading = `seed.md at ${revisionA}`;
    const failure = await runGh(
      ["api", `repos/${source.repository}/contents/seed.md?ref=${revisionA}`],
      new AbortController().signal,
    ).then(
      () => undefined,
      (error: unknown) => error,
    );
    expect(failure).toBeInstanceOf(GhFailure);
    expect((failure as GhFailure).reason).toEqual({ kind: "output-bound" });
    const reported = reportedFailure(failure, source, reading);
    expect(reported).toEqual({
      message: `The local GitHub CLI output exceeded the request's size limit while reading ${reading}.`,
      retryAfterSeconds: undefined,
      recovery: undefined,
    });
    expect(JSON.stringify(reported)).not.toContain(secretMarker);
    expect(github.calls).toHaveLength(1);
  },
  pastBoundTimeoutMs,
);

test(
  "an oversized branch listing still falls back to the ref alone without claiming branch-head evidence",
  async ({ github }) => {
    github.serve(everyRepository, ({ request }) =>
      Promise.resolve(
        request.kind === "matching-refs"
          ? {
              status: 200,
              contentType: "application/json",
              body: JSON.stringify([
                {
                  ref: `refs/heads/${"x".repeat(pastBound)}`,
                  object: { type: "commit", sha: revisionA },
                },
              ]),
            }
          : commitAnswer(revisionB),
      ),
    );
    const checks = new RevisionChecks({
      tracked: new Set(),
      scope: () => Promise.resolve(undefined),
    });
    expect(await checks.check(source, new AbortController().signal)).toEqual({
      revision: revisionB,
      heads: undefined,
    });
    expect(github.calls.map(({ argv }) => argv)).toEqual([
      [
        "api",
        "--include",
        `repos/${source.repository}/git/matching-refs/heads/`,
      ],
      [
        "api",
        "--include",
        `repos/${source.repository}/commits/main`,
        "--jq",
        ".sha",
      ],
    ]);
  },
  pastBoundTimeoutMs,
);
