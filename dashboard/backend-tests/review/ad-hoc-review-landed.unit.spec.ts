// The typed review handler in-process answers a kept ad hoc landing as
// landed from its captured comparison, given the session's typed kept state:
// no server, no machine stores.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
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
const head = (repository: string) =>
  execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: repository,
    encoding: "utf8",
  }).trim();
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

test("Given a kept Done ad hoc landing whose trunk advanced afterwards, when its review is read, then it answers landed and leaves HEAD and the index unchanged", async () => {
  const repository = await materializeLocalCheckout(
    undefined,
    makeMe.aRepository
      .withRevision("base", {
        backlog: null,
        files: { "delivered.txt": "before\n" },
      })
      .withRevision("result", { files: { "delivered.txt": "after\n" } })
      .withRevision("later", { files: { "later-trunk.txt": "later\n" } })
      .please(),
  );
  try {
    const base = repository.revisions.base;
    const revision = repository.revisions.result;
    const launchedAt = "2026-01-02T12:00:00.000Z";
    const sessionId = "ad-hoc-landed-session";
    const records = [
      landedSession(sessionId, repository.integration, { base, revision })
        .launchedAt(launchedAt)
        .markedDone()
        .please(),
    ];
    const advanced = repository.revisions.later;
    const indexPath = path.join(repository.integration, ".git", "index");
    const index = readFileSync(indexPath);

    const answer = await review(sessionId, records);

    expect(answer).toMatchObject({
      kind: "landed",
      baseline: base,
      tree: revision,
      landing: {
        workflow: "ad-hoc",
        launchedAt,
        remote: "origin",
        target: "refs/heads/main",
        base,
        revision,
      },
      files: [
        expect.objectContaining({ path: "delivered.txt", kind: "modified" }),
      ],
    });
    expect(answer.runs).toBeUndefined();
    expect(answer.selectedRun).toBeUndefined();
    expect(
      "repository" in (answer.kind === "landed" ? answer.landing : {}),
    ).toBe(false);
    expect(head(repository.integration)).toBe(advanced);
    expect(readFileSync(indexPath)).toEqual(index);
  } finally {
    await repository.cleanup();
  }
});

test("Given an ad hoc landing whose base and revision hold the same tree, when its review is read, then it is landed empty", async () => {
  const repository = await materializeLocalCheckout(
    undefined,
    makeMe.aRepository
      .withRevision("same", {
        backlog: null,
        files: { "unchanged.txt": "same\n" },
      })
      .please(),
  );
  try {
    const tip = repository.revisions.same;
    const records = [
      landedSession("empty-landing", repository.integration, {
        base: tip,
        revision: tip,
      })
        .markedDone()
        .please(),
    ];

    expect(await review("empty-landing", records)).toMatchObject({
      kind: "landed",
      baseline: tip,
      tree: tip,
      files: [],
    });
  } finally {
    await repository.cleanup();
  }
});
