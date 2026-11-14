import assert from "node:assert/strict";
import { dirname } from "node:path";
import { test } from "node:test";
import { admitEntry } from "../../src/skills/dough-product-backlog/scripts/product-backlog-take.mjs";
import {
  added,
  addedHome,
  addedLine,
  backlog,
  projectFile,
  scratchProject,
  takenEntry,
  trunkQueue,
} from "./product-backlog-fixture.mjs";

// Startup admission uses this operation for accepted work no list holds yet.
test("admission appends unlisted work to Taken and refuses work already listed", (t) => {
  const project = scratchProject(t);
  const planPath = "slice-plans/058-queue-trunk-integration/PLAN.md";
  addedHome(project);
  projectFile(project, planPath);
  const request = {
    ...added,
    plan: planPath,
    backlogDirectory: dirname(project.file),
  };
  const admitted = admitEntry(project.read(), request);
  assert.equal(admitted.result, "admitted");
  assert.equal(
    admitted.source,
    backlog.replace(
      `${takenEntry}\n`,
      `${takenEntry}\n${addedLine} ([plan](${planPath}))\n`,
    ),
  );
  assert.throws(
    () => admitEntry(admitted.source, request),
    /is already listed in "## Taken"/,
  );
  assert.throws(
    () => admitEntry(project.read(), { ...request, identity: trunkQueue }),
    /is already listed in "## Backlog list"/,
  );
  assert.throws(
    () =>
      admitEntry(project.read(), {
        ...request,
        href: "seeds/SEED-008-worktree-branch-trunk-sync.md#same-machine-merge-queue",
      }),
    /already listed/,
  );
});
