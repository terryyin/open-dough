// When Cursor replaces a chat that cannot load, the branch evidence its Done
// pinned stays owned by the original chat, and only the replacement's removal
// releases it.
import { retainedBranchPairFiles } from "../../server/retainedReviewPair.ts";
import { branchResultAtDone } from "../../src/sessionBranchResult.ts";
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  keepBranchResultRefs,
  sessionBranchPins,
} from "../../server/launchRecordPins.ts";
import {
  bindRecord,
  changeSessionRecord,
  deleteRecord,
  keptSession,
  replaceKeptSession,
} from "../../server/launchRecordStore.ts";
import { retireExpiredRecords } from "../../server/launchRecordRemoval.ts";
import { recordSessionBranchEntry } from "../../server/sessionBranchEntry.ts";
import { proposeBranchEntry } from "../../server/branchEntryProposal.ts";
import {
  launchRetentionDays,
  type LaunchRecord,
} from "../../src/launchRecord.ts";
import {
  aCheckout,
  type Checkout,
  historyBeforeTheCase,
  inWorktree,
  keep,
  markDone,
  minutesAgo,
  source,
  undoDone,
  work,
} from "../support/doneCaptureCase.ts";

const trunkRef = "refs/heads/main";
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
    record: makeMe.aLaunchRecord
      .isolatedIn(checkout, { workspace, branch })
      .inCursorSession(inCursor(sessionId, workspace))
      .please(),
  };
};

const retentionAgo = new Date(
  Date.now() - (launchRetentionDays + 1) * 86_400_000,
).toISOString();

const removals = {
  deletion: (record) => deleteRecord(source, record.session),
  // Retention drops the aged record at the project's next record write,
  // which retires it through the production cleanup.
  expiry: async (record) => {
    await changeSessionRecord(source, record.session, (kept) => ({
      ...kept,
      doneAt: retentionAgo,
    }));
    await changeSessionRecord(
      source,
      record.session,
      (kept) => kept,
      retireExpiredRecords,
    );
  },
} satisfies Record<string, (record: LaunchRecord) => Promise<unknown>>;

for (const [reason, remove] of Object.entries(removals)) {
  test(`${reason} releases the original branch pins after Cursor replaces its chat`, async () => {
    const checkout = await aCheckout({
      history: historyBeforeTheCase().withWorkspace("topic", { from: "base" }),
      withOrigin: true,
    });
    const topic = anIsolatedCursorLaunch(
      checkout,
      checkout.execution,
      "topic",
      originalId,
    );
    const other = makeMe.aLaunchRecord
      .startedOnMainOf(checkout)
      .inCursorSession(inCursor(otherId, checkout.integration))
      .please();
    keep(topic.record, other);
    // Another kept session's branch result, pinned by its owner.
    await keepBranchResultRefs(other.session, {
      repository: checkout.integration,
      doneAt: minutesAgo(30),
      base: checkout.base,
      revision: checkout.base,
      committedTip: checkout.base,
    });
    const otherPins = await sessionBranchPins(
      checkout.integration,
      other.session,
    );
    expect(otherPins).toContainEqual(
      expect.objectContaining({ objectId: checkout.base }),
    );
    const { prior } = await work(
      inWorktree(checkout, topic.workspace),
      makeMe.aCheckoutWork.committing("prior", { at: minutesAgo(40) }),
    );
    await markDone(topic.record, minutesAgo(35));
    const originalPins = await sessionBranchPins(
      checkout.integration,
      topic.record.session,
    );
    expect(originalPins).toContainEqual(
      expect.objectContaining({ objectId: prior }),
    );

    await undoDone(topic.record);
    const replacement = replacedBy(topic.record, replacementId);
    await replaceKeptSession(source, topic.record.session, replacement);
    expect(
      await sessionBranchPins(checkout.integration, topic.record.session),
    ).toEqual(originalPins);

    const { latest } = await work(
      inWorktree(checkout, topic.workspace),
      makeMe.aCheckoutWork.committing("latest", { at: minutesAgo(30) }),
    );
    await markDone(replacement);
    const saved = await keptSession(source, replacement.session);
    const branch = saved && branchResultAtDone(saved);
    if (branch === undefined)
      throw new Error("Missing the kept branch result.");
    expect(branch).toMatchObject({ base: checkout.base, revision: latest });
    expect(
      await retainedBranchPairFiles(branch, new AbortController().signal),
    ).toMatchObject({ files: [{ path: "latest.txt" }, { path: "prior.txt" }] });
    expect(
      await sessionBranchPins(checkout.integration, topic.record.session),
    ).toContainEqual(expect.objectContaining({ objectId: latest }));
    expect(
      await sessionBranchPins(checkout.integration, replacement.session),
    ).toEqual([]);

    await remove(replacement);

    expect(
      await sessionBranchPins(checkout.integration, topic.record.session),
    ).toEqual([]);
    expect(
      await sessionBranchPins(checkout.integration, other.session),
    ).toEqual(otherPins);
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
  const launch = makeMe.aLaunchRecord
    .startedOnMainOf(checkout)
    .inCursorSession(inCursor(originalId, checkout.integration));
  const { entry } = await proposeBranchEntry(trunkRef, launch.please(), {
    workspace,
    branch,
  });
  const stale = launch.enteredBranch(entry).please();
  keep(stale);
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
    await recordSessionBranchEntry({ id: source, ref: trunkRef }, kept, {
      workspace,
      branch,
    }),
  ).toMatchObject({ committedTip: present });
  const saved = await keptSession(source, replacement.session);
  const branchResult = saved && branchResultAtDone(saved);
  if (branchResult === undefined)
    throw new Error("Missing the kept branch result.");
  expect(branchResult.revision).toBe(entered);
  expect(
    await retainedBranchPairFiles(branchResult, new AbortController().signal),
  ).toMatchObject({ files: [{ path: "entered.txt" }] });
});
