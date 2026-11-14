// Declared graph facts arrange real ancestry and deterministic first-parent trees.
import assert from "node:assert/strict";
import { test } from "node:test";
import { git } from "../../src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "./makeMe.mjs";
import { materializeRepository } from "./repository-fixture.mjs";
import { renderPublishedRevisions } from "./repository-revision-files.mjs";

test("declared Git parents preserve branch topology, first-parent files and private workspace ancestry", async (t) => {
  const history = makeMe.aRepository
    .withRevision("base", { files: { "base.txt": "base\n" } })
    .withRevision("left", {
      parents: ["base"],
      files: { "left.txt": "left\n" },
    })
    .withRevision("right", {
      parents: ["base"],
      files: { "right.txt": "right\n" },
    })
    .withRevision("merge", {
      parents: ["right", "left"],
      files: { "resolution.txt": "resolved\n" },
    })
    .withWorkspace("story", { from: "merge" })
    .withUnpublishedRevision("private-side", {
      parents: ["base"],
      files: { "private.txt": "private\n" },
    })
    .withUnpublishedRevision("private-merge", {
      parents: ["private-side", "merge"],
      files: { "private-resolution.txt": "private merge\n" },
    })
    .please();
  const repository = await materializeRepository(history);
  t.after(repository.cleanup);
  const rendered = renderPublishedRevisions(history);
  assert.equal(rendered.merge["left.txt"], undefined);
  assert.equal(rendered.merge["right.txt"], "right\n");
  assert.equal(rendered.merge["resolution.txt"], "resolved\n");
  const { integration, execution, origin, revisions } = repository;
  const read = async (checkout, ...args) =>
    (await git(checkout, ...args)).stdout.trim();
  assert.equal(
    await read(integration, "show", "-s", "--format=%P", revisions.merge),
    `${revisions.right} ${revisions.left}`,
  );
  assert.equal(
    await read(integration, "ls-tree", "-r", "--name-only", revisions.merge),
    ".planning/PRODUCT-BACKLOG.md\nbase.txt\nresolution.txt\nright.txt",
  );
  assert.equal(
    await read(
      execution,
      "show",
      "-s",
      "--format=%P",
      revisions["private-merge"],
    ),
    `${revisions["private-side"]} ${revisions.merge}`,
  );
  assert.equal(
    await read(
      execution,
      "ls-tree",
      "-r",
      "--name-only",
      revisions["private-merge"],
    ),
    ".planning/PRODUCT-BACKLOG.md\nbase.txt\nprivate-resolution.txt\nprivate.txt",
  );
  assert.equal(await read(origin, "rev-parse", "main"), revisions.merge);
  await assert.rejects(
    git(origin, "cat-file", "-e", revisions["private-merge"]),
  );
});
