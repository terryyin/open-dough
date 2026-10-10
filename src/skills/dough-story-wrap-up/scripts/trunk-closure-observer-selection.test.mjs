// Which of its coordinator's observers closure selects when several that
// ended each registered the final closure: none of them, and the one live
// observer the coordinator holds beside them before that observer registers
// it, with real workers. The gap's reason and directories are proven through
// the installed `finish` in `trunk-closure-owner-gaps.test.mjs`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { registerPushedRevision } from "../../dough-execute-plan/scripts/ci-mailbox-revision-coverage.mjs";
import {
  siblingCheckouts,
  startReceipt,
} from "../../dough-execute-plan/scripts/execution-increment-managed-delivery-owner-test-fixtures.mjs";
import { closureObservers, observerAccess } from "./trunk-closure-observer.mjs";

test("closure selects none of several ended observers that each registered the final closure, and selects its coordinator's one live observer that has yet to register it beside them", async (t) => {
  const { fixture, startObserver, hook } = await siblingCheckouts(t, "cursor");
  const sha = "a".repeat(40);
  const claimed = async () => {
    const directory = await startObserver("publisher");
    await hook("publisher", "coordinator", startReceipt(directory));
    return directory;
  };
  const ended = [await claimed(), await claimed()];
  for (const directory of ended) {
    registerPushedRevision(directory, sha);
    await fixture.stopObserver(directory);
  }
  const select = async () =>
    closureObservers({
      repo: "owner/project",
      branch: "main",
      host: "cursor",
      session: { conversation_id: "coordinator" },
      root: await observerAccess(fixture.execution),
      storage: fixture.storage,
    }).select(sha);

  assert.equal((await select()).gap.ownership, "ended");

  const live = await claimed();
  assert.equal((await select()).directory, live);
});
