// When Cursor replaces a chat that cannot load, the branch evidence its Done
// pinned stays owned by the original chat, and only the replacement's removal
// releases it.
import path from "node:path";
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  bindRecord,
  changeSessionRecord,
  deleteRecord,
  keptSession,
  replaceKeptSession,
} from "../../server/launchRecordStore.ts";
import { installRecordRemovalDispatch } from "../../server/launchRecordRemoval.ts";
import {
  launchRetentionDays,
  type LaunchRecord,
} from "../../src/launchRecord.ts";
import {
  aCheckout,
  anIsolatedLaunch,
  type Checkout,
  historyBeforeTheCase,
  inWorktree,
  keep,
  markDone,
  minutesAgo,
  review,
  source,
  undoDone,
  work,
} from "../support/doneCaptureCase.ts";
import {
  aDeclaringLaunch,
  identifyBranch,
} from "../support/declaredBranchCase.ts";

const originalId = "0a1b2c3d-e5f6-4789-abcd-ef0123456789";
const replacementId = "a1b2c3d4-e5f6-4789-abcd-ef0123456789";
const otherId = "f6e5d4c3-b2a1-4789-abcd-ef0123456789";

const inCursor = (sessionId: string, workspace: string) => ({
  sessionId,
  continuation: { workspace },
});

// The same launch continued under the chat Cursor created in its place.
const replacedBy = (record: LaunchRecord, sessionId: string): LaunchRecord => ({
  ...record,
  session: { ...record.session, sessionId },
});

async function cursorPins(checkout: Checkout, sessionId: string) {
  const { stdout } = await git(
    checkout.integration,
    "for-each-ref",
    "--format=%(objectname)",
    `refs/open-dough/session-branch/cursor/${sessionId}/`,
  );
  return stdout.split("\n").filter(Boolean);
}

// An isolated Cursor launch on the checkout's worktree `workspace`.
const anIsolatedCursorLaunch = (
  checkout: Checkout,
  workspace: string | undefined,
  branch: string,
  sessionId: string,
) => {
  if (workspace === undefined) throw new Error("Missing the worktree.");
  return {
    workspace,
    record: anIsolatedLaunch(checkout, { workspace, branch })
      .inCursorSession(inCursor(sessionId, workspace))
      .please(),
  };
};

const retentionAgo = new Date(
  Date.now() - (launchRetentionDays + 1) * 86_400_000,
).toISOString();

const removals = {
  deletion: (record) => deleteRecord(source, record.session),
  // Retention drops the aged record at the project's next record write.
  expiry: async (record) => {
    installRecordRemovalDispatch();
    await changeSessionRecord(source, record.session, (kept) => ({
      ...kept,
      doneAt: retentionAgo,
    }));
    await changeSessionRecord(source, record.session, (kept) => kept);
  },
} satisfies Record<string, (record: LaunchRecord) => Promise<unknown>>;

for (const [reason, remove] of Object.entries(removals)) {
  test(`${reason} releases the original branch pins after Cursor replaces its chat`, async () => {
    const checkout = await aCheckout({
      history: historyBeforeTheCase()
        .withWorkspace("topic", { from: "base" })
        .withWorkspace("separate", { from: "base" }),
      withOrigin: true,
    });
    const topic = anIsolatedCursorLaunch(
      checkout,
      checkout.execution,
      "topic",
      originalId,
    );
    const separate = anIsolatedCursorLaunch(
      checkout,
      path.join(checkout.integration, ".worktrees", "separate"),
      "separate",
      otherId,
    );
    keep(topic.record, separate.record);
    const { prior } = await work(
      inWorktree(checkout, topic.workspace),
      makeMe.aCheckoutWork.committing("prior", { at: minutesAgo(40) }),
    );
    await markDone(topic.record, minutesAgo(35));
    const originalPins = await cursorPins(checkout, originalId);
    expect(originalPins).toContain(prior);

    await undoDone(topic.record);
    const replacement = replacedBy(topic.record, replacementId);
    await replaceKeptSession(source, topic.record.session, replacement);
    expect(await cursorPins(checkout, originalId)).toEqual(originalPins);

    const { latest } = await work(
      inWorktree(checkout, topic.workspace),
      makeMe.aCheckoutWork.committing("latest", { at: minutesAgo(30) }),
    );
    await markDone(replacement);
    expect(await review(replacement)).toMatchObject({
      kind: "branch-result",
      baseline: checkout.base,
      tree: latest,
      files: [{ path: "latest.txt" }, { path: "prior.txt" }],
    });
    expect(await cursorPins(checkout, originalId)).toContain(latest);
    expect(await cursorPins(checkout, replacementId)).toEqual([]);
    const { kept } = await work(
      inWorktree(checkout, separate.workspace),
      makeMe.aCheckoutWork.committing("kept", { at: minutesAgo(30) }),
    );
    await markDone(separate.record);
    const otherPins = await cursorPins(checkout, otherId);
    expect(otherPins).toContain(kept);

    await remove(replacement);

    expect(await cursorPins(checkout, originalId)).toEqual([]);
    expect(await cursorPins(checkout, otherId)).toEqual(otherPins);
  });
}

test("a stale native replacement retains a branch identified while it was pending", async () => {
  const branch = "pending-topic";
  const checkout = await aCheckout({
    history: historyBeforeTheCase().withWorkspace(branch, { from: "base" }),
    withOrigin: true,
  });
  const workspace = checkout.execution;
  if (workspace === undefined) throw new Error("Missing the worktree.");
  const { present } = await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork.committing("present", { at: minutesAgo(70) }),
  );
  const stale = aDeclaringLaunch(checkout)
    .inCursorSession(inCursor(originalId, checkout.integration))
    .please();
  keep(stale);
  await identifyBranch(checkout, stale, { workspace, branch });
  const { entered } = await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork.committing("entered", { at: minutesAgo(30) }),
  );
  await markDone(stale);

  const replacement = replacedBy(stale, replacementId);
  await replaceKeptSession(source, stale.session, replacement);
  await bindRecord(source, replacement);
  const kept = await keptSession(source, replacement.session);
  if (kept === undefined) throw new Error("The replacement was not kept.");

  expect(
    await identifyBranch(checkout, kept, { workspace, branch }),
  ).toMatchObject({ committedTip: present });
  expect(await review(replacement)).toMatchObject({
    kind: "branch-result",
    tree: entered,
    files: [{ path: "entered.txt" }],
  });
});
