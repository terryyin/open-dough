// The done catalog through real history-preserving publication: a story tip
// changing only done records merges through the backlog adapter, and the
// published commit carries a catalog describing its record files.
import assert from "node:assert/strict";
import { test } from "node:test";
import { publishHistoryPreservingCandidate } from "../../src/skills/dough-execute-plan/scripts/history-preserving-publication.mjs";
import { git } from "../../src/skills/dough-execute-plan/scripts/publication-test-fixtures.mjs";
import {
  assertCatalogDescribes,
  catalog,
  done,
  fileNames,
} from "./product-backlog-git-done-catalog-fixture.mjs";
import { divergedDoneBranches } from "./published-done-branches.mjs";

test("history-preserving publication merges a story tip changing only done records through the backlog adapter, publishing a current catalog", async (t) => {
  const { origin, execution, storyTip } = await divergedDoneBranches(t);

  const published = await publishHistoryPreservingCandidate({
    ownedWorkspace: execution,
    publishedTip: storyTip,
    branch: "exec/story",
  });

  assert.equal(published.classification, "published");
  assert.deepEqual(published.adapterStatuses, ["accepted"]);
  const { sha } = published.receipt;
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
