// The typed review handler in-process explains why a kept ad hoc session has
// no readable comparison, given the session's typed kept state: no server, no
// machine stores.
import { unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../Distribution/tests/support/repository-fixture.mjs";
import type { LaunchRecord } from "../../src/agentLaunch.ts";
import { storyReview } from "../../server/storyReviewSnapshot.ts";

// A path no test creates: kept records name it as retired or gone.
const gone = (name: string) =>
  path.join(tmpdir(), `ad-hoc-review-unit-${process.pid}-${name}`);
const review = (session: string, records: readonly LaunchRecord[]) =>
  storyReview(
    makeMe.aSessionReviewRead.ofSession(session).keeping(records).please(),
    new AbortController().signal,
  );
const landedSession = (
  sessionId: string,
  repository: string,
  comparing: { base: string; revision: string },
) =>
  makeMe.aLaunchRecord
    .adHoc({ title: "Landed ad hoc" })
    .inIsolatedWorkspace({
      workspace: gone(`${sessionId}-retired`),
      branch: "ad-hoc/landed",
    })
    .inClaudeSession({ sessionId })
    .withLanding(
      makeMe.aLaunchLanding.capturedFrom({ repository }).comparing(comparing),
    );

test("Given a default launch without a landing, when its review is read, then it says its changes were not captured", async () => {
  const records = [
    makeMe.aLaunchRecord
      .adHoc({ title: "Default" })
      .inClaudeSession({ sessionId: "default-no-landing" })
      .markedDone()
      .please(),
  ];

  expect(await review("default-no-landing", records)).toEqual({
    kind: "landing-unavailable",
    comparison: "session-commits",
    explanation: "This session's changes were not captured.",
  });
});

test("Given an ad hoc landing whose repository is gone, when its review is read, then it explains the gap", async () => {
  const records = [
    landedSession("missing-repo", gone("landing-repo"), {
      base: "a".repeat(40),
      revision: "b".repeat(40),
    })
      .markedDone()
      .please(),
  ];

  expect(await review("missing-repo", records)).toEqual({
    kind: "landing-unavailable",
    explanation: "The captured landing repository is missing or unreadable.",
  });
});

test("Given an ad hoc landing whose comparison objects are gone, when its review is read, then it explains the gap", async () => {
  const repository = await materializeLocalCheckout(
    undefined,
    makeMe.aRepository.withRevision("base").withRevision("result").please(),
  );
  try {
    const base = repository.revisions.base;
    const revision = repository.revisions.result;
    const records = [
      landedSession("missing-objects", repository.integration, {
        base,
        revision,
      })
        .markedDone()
        .please(),
    ];
    unlinkSync(
      path.join(
        repository.integration,
        ".git",
        "objects",
        revision.slice(0, 2),
        revision.slice(2),
      ),
    );

    expect(await review("missing-objects", records)).toEqual({
      kind: "landing-unavailable",
      explanation:
        "The captured landing comparison objects are missing or unreadable.",
    });
  } finally {
    await repository.cleanup();
  }
});

test("Given an unreadable kept comparison, when its review is read, then it still identifies the session's commits", async () => {
  const records = [
    makeMe.aLaunchRecord
      .adHoc({ title: "Missing kept repository" })
      .inClaudeSession({ sessionId: "unreadable-kept-commits" })
      .keptSessionCommits({
        repository: gone("kept-repo"),
        runs: [{ base: "a".repeat(40), revision: "b".repeat(40) }],
      })
      .markedDone()
      .please(),
  ];

  expect(await review("unreadable-kept-commits", records)).toEqual({
    kind: "landing-unavailable",
    comparison: "session-commits",
    explanation:
      "The repository that kept this session's commits is missing or unreadable.",
  });
});
