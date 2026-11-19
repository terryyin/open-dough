// The typed review handler in-process answers a kept ad hoc landing as
// landed from its captured comparison, given the session's typed kept state:
// no server, no machine stores.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { storyReview } from "../../server/storyReviewSnapshot.ts";

const head = (repository: string) =>
  execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: repository,
    encoding: "utf8",
  }).trim();
const review = (input: Parameters<typeof storyReview>[0]) =>
  storyReview(input, new AbortController().signal);

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
    const advanced = repository.revisions.later;
    const indexPath = path.join(repository.integration, ".git", "index");
    const index = readFileSync(indexPath);

    const answer = await review(
      makeMe.aSessionReviewRead
        .ofLandedAdHocSession("ad-hoc-landed-session", {
          repository: repository.integration,
          comparing: { base, revision },
          launchedAt,
        })
        .please(),
    );

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
    const read = makeMe.aSessionReviewRead
      .ofLandedAdHocSession("empty-landing", {
        repository: repository.integration,
        comparing: { base: tip, revision: tip },
      })
      .please();

    expect(await review(read)).toMatchObject({
      kind: "landed",
      baseline: tip,
      tree: tip,
      files: [],
    });
  } finally {
    await repository.cleanup();
  }
});
