// Git mechanics: a Trunk Mode suffix changing only done records replays
// through the backlog adapter.
import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { divergedDoneBranches } from "../../../../tests/support/published-done-branches.mjs";
import {
  assertCatalogDescribes,
  catalog,
  done,
  fileNames,
} from "../../../../tests/support/product-backlog-git-done-catalog-fixture.mjs";
import { publishExecutionIncrement } from "./execution-increment-publication.mjs";
import { git, lsRemoteSha } from "./publication-test-fixtures.mjs";

const trunkTarget = "refs/heads/main";

test("Trunk Mode increment replays a suffix changing only done records through the backlog adapter, publishing a current catalog", async (t) => {
  const { origin, execution, publishedBase } = await divergedDoneBranches(t);

  const published = await publishExecutionIncrement({
    workspace: execution,
    ...makeMe.anIncrementPublication
      .with({
        branch: "exec/story",
        previouslyPublishedBase: publishedBase,
        targetRef: trunkTarget,
      })
      .please(),
    register: () => {},
    validate: async () => ({ ok: true }),
  });

  assert.equal(published.ok, true, JSON.stringify(published));
  const { sha } = published.receipt;
  assert.equal(await lsRemoteSha(origin, trunkTarget), sha);
  assert.equal(
    (await git(origin, "log", "-1", "--format=%s", sha)).stdout.trim(),
    "Rebuild the done catalog from its record files",
  );
  const publishedCatalog = assertCatalogDescribes(
    (await git(origin, "show", `${sha}:${catalog}`)).stdout,
    (await git(origin, "ls-tree", `${sha}:${done}`)).stdout,
  );
  assert.deepEqual(fileNames(publishedCatalog), [
    "X_X.json",
    "Y_Y.json",
    "Z_Z.json",
  ]);
});
