import path from "node:path";
import {
  agentRecoverEndpoint,
  recoverSessionAnswerSchema,
} from "../../src/sessionRecovery.ts";
import { storyReviewFileTextEndpoint } from "../../src/storyReviewContract.ts";
import { stopCursorRunner } from "../../server/hosts/cursor/runnerClient.ts";
import {
  deleteRecord,
  markDone,
} from "../../test-support/agentLaunchBoundary.ts";
import { daysAgo } from "../../test-support/machineLaunchRecords.ts";
import { getReview } from "../../test-support/support/completedReviewRequests.ts";
import {
  postCompletion,
  recordOperation,
} from "../../test-support/support/completionRecovery.ts";
import { expect, test } from "../../test-support/support/cursorStart.ts";
import { commit } from "../../test-support/support/launchLanding.ts";
import {
  keepLaunchRecords,
  keptLaunchRecords,
} from "../../test-support/support/launchStore.ts";
import { git } from "../../test-support/support/storyReviewWorktree.ts";
import {
  cursorBranchPins,
  cursorReport,
  cursorSessionQuery,
  detachCursor,
  identifyCursorBranch,
  launchCursorReview,
  postCursorSession,
  readCursorBranch,
} from "../../test-support/support/cursorBranchRecovery.ts";

test.use({ serverMode: "boundary" });

const replacementId = "a1b2c3d4-e5f6-4789-abcd-ef0123456789";
const otherId = "f6e5d4c3-b2a1-4789-abcd-ef0123456789";

const recoveryTest = test.extend<{
  recoveredBranch: {
    oldId: string;
    otherPins: string[];
    otherReference: string;
  };
}>({
  recoveredBranch: async ({ dashboard, cursor, origin, request }, use) => {
    const original = await launchCursorReview(dashboard, "Review this topic");
    const oldId = original.session.sessionId;
    const reference = original.request.reporting?.reference;
    if (reference === undefined)
      throw new Error("The launch did not keep a reporting reference.");
    const workspace = path.join(origin.machine, "topic");
    git(origin.project, "worktree", "add", "--quiet", "-b", "topic", workspace);
    commit(workspace, "before-handoff.txt");
    await identifyCursorBranch(dashboard, oldId, workspace, "topic");
    commit(workspace, "prior-done.txt");
    const initialReport = cursorReport(reference, oldId).please();
    const initialDone = await postCompletion(dashboard.origin, initialReport);
    expect(initialDone.status, initialDone.body).toBe(200);
    const first = await readCursorBranch(request, dashboard, oldId);
    if (first.kind !== "branch-result")
      throw new Error("The original Done has no branch comparison.");
    const oldPins = cursorBranchPins(origin.project, oldId);
    expect(oldPins.some((pin) => pin.endsWith(first.tree))).toBe(true);

    const reopening = cursorReport(reference, oldId)
      .withOutcome("unfinished")
      .saying("Continue review")
      .please();
    const reopened = await postCompletion(dashboard.origin, reopening);
    expect(reopened.status, reopened.body).toBe(200);
    await detachCursor(dashboard, original.session);
    cursor.setAttachMode("cannot-load");
    cursor.queueCreateChatId(replacementId);
    const recovering = await postCursorSession(
      dashboard,
      agentRecoverEndpoint,
      cursorSessionQuery(oldId),
    );
    expect(recovering.status, recovering.body).toBe(200);
    expect(
      recoverSessionAnswerSchema.parse(JSON.parse(recovering.body)),
    ).toMatchObject({
      kind: "recovered",
      record: {
        session: { sessionId: replacementId },
        branchResult: { base: first.baseline, revision: first.tree },
      },
    });
    expect(cursorBranchPins(origin.project, oldId)).toEqual(oldPins);

    const latest = commit(workspace, "after-recovery.txt");
    const done = await markDone(dashboard, cursorSessionQuery(replacementId));
    expect(done.status, done.body).toBe(200);
    expect(
      await readCursorBranch(request, dashboard, replacementId),
    ).toMatchObject({
      kind: "branch-result",
      baseline: first.baseline,
      tree: latest,
      files: [{ path: "after-recovery.txt" }, { path: "prior-done.txt" }],
    });
    const text = await getReview(
      request,
      dashboard,
      storyReviewFileTextEndpoint,
      {
        ...cursorSessionQuery(replacementId),
        baseline: first.baseline,
        tree: latest,
        path: "after-recovery.txt",
      },
    );
    expect(await text.json()).toEqual({
      kind: "text",
      baseline: null,
      tree: "after-recovery.txt\n",
    });
    const pinsAfterRecovery = cursorBranchPins(origin.project, oldId);
    expect(pinsAfterRecovery.some((pin) => pin.endsWith(latest))).toBe(true);
    expect(cursorBranchPins(origin.project, replacementId)).toEqual([]);

    cursor.queueCreateChatId(otherId);
    const other = await launchCursorReview(
      dashboard,
      "Keep a separate result",
      true,
    );
    const separate = other.establishedSession?.workspace;
    const otherReference = other.request.reporting?.reference;
    if (separate === undefined || otherReference === undefined)
      throw new Error(
        "The second launch did not establish a reported workspace.",
      );
    const otherTip = commit(separate, "separate.txt");
    const otherDone = await markDone(dashboard, cursorSessionQuery(otherId));
    expect(otherDone.status, otherDone.body).toBe(200);
    const otherPins = cursorBranchPins(origin.project, otherId);
    expect(otherPins.some((pin) => pin.endsWith(otherTip))).toBe(true);

    await use({ oldId, otherPins, otherReference });
  },
});

recoveryTest(
  "deletion releases the original branch pins after Cursor replaces its chat",
  async ({ dashboard, origin, recoveredBranch }) => {
    const { oldId, otherPins } = recoveredBranch;
    await stopCursorRunner(dashboard.home);
    const removed = await deleteRecord(
      dashboard,
      cursorSessionQuery(replacementId),
    );
    expect(JSON.parse(removed.body)).toEqual({ kind: "deleted" });

    expect(cursorBranchPins(origin.project, oldId)).toEqual([]);
    expect(cursorBranchPins(origin.project, otherId)).toEqual(otherPins);
  },
);

recoveryTest(
  "expiry releases the original branch pins after Cursor replaces its chat",
  async ({ dashboard, origin, recoveredBranch }) => {
    const { oldId, otherPins, otherReference } = recoveredBranch;
    keepLaunchRecords(
      dashboard,
      keptLaunchRecords(dashboard).map((record) =>
        "session" in record && record.session.sessionId === replacementId
          ? { ...record, doneAt: daysAgo(31) }
          : record,
      ),
    );
    const update = cursorReport(otherReference, otherId)
      .saying("Separate result stays kept")
      .please();
    const written = await postCompletion(dashboard.origin, update);
    expect(written.status, written.body).toBe(200);

    expect(cursorBranchPins(origin.project, oldId)).toEqual([]);
    expect(cursorBranchPins(origin.project, otherId)).toEqual(otherPins);
  },
);

test("a stale native replacement retains a branch identified while it was pending", async ({
  dashboard,
  origin,
  request,
}) => {
  const { session } = await launchCursorReview(
    dashboard,
    "Identify my checkout",
  );
  const stale = keptLaunchRecords(dashboard).find(
    (record) =>
      "session" in record && record.session.sessionId === session.sessionId,
  );
  if (stale === undefined || !("session" in stale))
    throw new Error("The original native snapshot was not available.");
  const workspace = path.join(origin.machine, "pending-topic");
  git(
    origin.project,
    "worktree",
    "add",
    "--quiet",
    "-b",
    "pending-topic",
    workspace,
  );
  const before = commit(workspace, "already-present.txt");
  await identifyCursorBranch(
    dashboard,
    session.sessionId,
    workspace,
    "pending-topic",
  );
  const latest = commit(workspace, "after-entry.txt");
  const done = await markDone(dashboard, cursorSessionQuery(session.sessionId));
  expect(done.status, done.body).toBe(200);

  const replacement = {
    ...stale,
    session: { ...session, sessionId: replacementId },
  };
  await recordOperation(dashboard, "replaceKeptSession", [
    "open-dough",
    session,
    replacement,
  ]);
  await recordOperation(dashboard, "bindRecord", ["open-dough", replacement]);
  const confirmed = await identifyCursorBranch(
    dashboard,
    replacementId,
    workspace,
    "pending-topic",
  );
  expect(JSON.parse(confirmed.body)).toMatchObject({
    branchEntry: { committedTip: before },
  });
  expect(
    await readCursorBranch(request, dashboard, replacementId),
  ).toMatchObject({
    kind: "branch-result",
    tree: latest,
    files: [{ path: "after-entry.txt" }],
  });
});
