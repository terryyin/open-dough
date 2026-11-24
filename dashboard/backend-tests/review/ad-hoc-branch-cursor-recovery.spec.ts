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
  keep,
  markDone,
  source,
  undoDone,
} from "../support/doneCaptureCase.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";

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
    const {
      checkout,
      records: { topic: original, other },
      performWork,
      at,
    } = await aDoneCaptureCase()
      .withOrigin()
      .withWorkspace("topic")
      .withIsolatedLaunch(
        "topic",
        { launched: 60 },
        "topic",
        (launch, { worktrees }) =>
          launch.inCursorSession(inCursor(originalId, worktrees.topic ?? "")),
      )
      .withCheckoutLaunch("other", { launched: 60 }, (launch, { checkout }) =>
        launch.inCursorSession(inCursor(otherId, checkout.integration)),
      )
      .kept()
      .please();
    // Another kept session's branch result, pinned by its owner.
    await keepBranchResultRefs(other.session, {
      repository: checkout.integration,
      doneAt: at(30),
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
    const { prior } = await performWork(
      makeMe.aCheckoutWork.committing("prior", { at: at(40) }),
      { in: "topic" },
    );
    await markDone(original, at(35));
    const originalPins = await sessionBranchPins(
      checkout.integration,
      original.session,
    );
    expect(originalPins).toContainEqual(
      expect.objectContaining({ objectId: prior }),
    );

    await undoDone(original);
    const replacement = replacedBy(original, replacementId);
    await replaceKeptSession(source, original.session, replacement);
    expect(
      await sessionBranchPins(checkout.integration, original.session),
    ).toEqual(originalPins);

    const { latest } = await performWork(
      makeMe.aCheckoutWork.committing("latest", { at: at(30) }),
      { in: "topic" },
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
      await sessionBranchPins(checkout.integration, original.session),
    ).toContainEqual(expect.objectContaining({ objectId: latest }));
    expect(
      await sessionBranchPins(checkout.integration, replacement.session),
    ).toEqual([]);

    await remove(replacement);

    expect(
      await sessionBranchPins(checkout.integration, original.session),
    ).toEqual([]);
    expect(
      await sessionBranchPins(checkout.integration, other.session),
    ).toEqual(otherPins);
  });
}

test("a stale native replacement retains a branch identified while it was pending", async () => {
  const branch = "pending-topic";
  const {
    checkout,
    worktrees: { [branch]: workspace },
    work: { present },
    performWork,
    at,
  } = await aDoneCaptureCase()
    .withOrigin()
    .withWorkspace(branch)
    .withWork(
      (at) => makeMe.aCheckoutWork.committing("present", { at: at(70) }),
      {
        in: branch,
      },
    )
    .please();
  const launch = makeMe.aLaunchRecord
    .startedOnMainOf(checkout)
    .launchedAt(at(60))
    .inCursorSession(inCursor(originalId, checkout.integration));
  const { entry } = await proposeBranchEntry(trunkRef, launch.please(), {
    workspace,
    branch,
  });
  const stale = launch.enteredBranch(entry).please();
  keep(stale);
  const { entered } = await performWork(
    makeMe.aCheckoutWork.committing("entered", { at: at(30) }),
    { in: branch },
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
