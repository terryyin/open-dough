// An execution checkout launch identifies its own branch: the entry keeps the state
// and Execution checkout tip it found, and Done keeps separate captured pairs.
import { storyReview } from "../../server/storyReviewSnapshot.ts";
import { retainedBranchPairFiles } from "../../server/retainedReviewPair.ts";
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { sessionBranchPins } from "../../server/launchRecordPins.ts";
import {
  keptSession,
  setRecordDoneAt,
} from "../../server/launchRecordStore.ts";
import { recordSessionBranchEntry } from "../../server/sessionBranchEntry.ts";
import { captureBranchResult } from "../../server/sessionBranchCapture.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";

const branch = "draft" as const;

// A kept launch that committed on main while the draft worktree took a
// commit and an uncommitted edit of its own.
const aDraftBeforeEntry = aDoneCaptureCase()
  .withOrigin()
  .withWorkspace(branch)
  .withCheckoutLaunch("declared", { launched: 60 })
  .withWork((at) =>
    makeMe.aCheckoutWork.committing("onMain", {
      at: at(50),
      files: { "main-work.txt": "main work\n" },
    }),
  )
  .withWork(
    (at) =>
      makeMe.aCheckoutWork
        .committing("entered", { at: at(45) })
        .editing("prior-draft", { at: at(44) }),
    { in: branch },
  )
  .kept();

test("a declared branch keeps its entry state and Execution checkout tip after main moves", async () => {
  const {
    published,
    at,
    worktrees: { [branch]: workspace },
    records: { declared: record },
    work: { onMain, entered },
    performWork,
  } = await aDraftBeforeEntry.please();
  const entry = await recordSessionBranchEntry(published, record, {
    workspace,
    branch,
  });

  expect(entry).toMatchObject({
    workspace,
    branch,
    committedTip: entered,
    defaultTip: onMain,
  });
  const pins = await sessionBranchPins(workspace, record.session);
  expect(pins).toMatchObject([
    { objectId: entered },
    { objectId: onMain },
    { objectId: entry.tree },
  ]);
  await performWork(
    makeMe.aCheckoutWork.committing("later-main", { at: at(20) }),
  );
  expect(
    await recordSessionBranchEntry(published, record, { workspace, branch }),
  ).toEqual(entry);
  expect(await sessionBranchPins(workspace, record.session)).toEqual(pins);
});

test("Done saves the entry-time Execution checkout run and the declared branch's own pair", async () => {
  const {
    published,
    at,
    checkout,
    worktrees: { [branch]: workspace },
    records: { declared: record },
    performWork,
  } = await aDraftBeforeEntry.please();
  const entry = await recordSessionBranchEntry(published, record, {
    workspace,
    branch,
  });
  const { result } = await performWork(
    makeMe.aCheckoutWork.committing("result", {
      at: at(30),
      files: { "session.txt": "session.txt\n" },
    }),
    { in: branch },
  );
  await performWork(
    makeMe.aCheckoutWork.committing("later-main", { at: at(20) }),
  );

  await setRecordDoneAt(published.id, record.session, at(10));

  const saved = await keptSession(published.id, record.session);
  expect(saved?.sessionCommits?.runs).toEqual([
    { base: checkout.base, revision: entry.defaultTip },
  ]);
  expect(saved?.branchResult).toMatchObject({
    base: entry.tree,
    revision: result,
  });
});

test("two declared sessions each capture their own branch", async () => {
  const {
    at,
    records: { first, second },
    work: { ours, theirs },
  } = await aDoneCaptureCase()
    .withOrigin()
    .withWorkspace(branch)
    .withWorkspace("other")
    .withDeclaringLaunch("first", { launched: 60 }, branch)
    .withDeclaringLaunch("second", { launched: 60 }, "other")
    .withWork((at) => makeMe.aCheckoutWork.committing("ours", { at: at(30) }), {
      in: branch,
    })
    .withWork(
      (at) => makeMe.aCheckoutWork.committing("theirs", { at: at(30) }),
      { in: "other" },
    )
    .please();
  const [{ result: ownBranch }, { result: otherBranch }] = await Promise.all([
    captureBranchResult(first, at(10)),
    captureBranchResult(second, at(10)),
  ]);
  const signal = new AbortController().signal;

  expect([ownBranch.revision, otherBranch.revision]).toEqual([ours, theirs]);
  expect(await retainedBranchPairFiles(ownBranch, signal)).toMatchObject({
    files: [{ path: "ours.txt" }],
  });
  expect(await retainedBranchPairFiles(otherBranch, signal)).toMatchObject({
    files: [{ path: "theirs.txt" }],
  });
});

test("an undeclared checkout move explains the missing branch association", async () => {
  const {
    published,
    at,
    checkout,
    records: { undeclared: record },
    performWork,
  } = await aDoneCaptureCase()
    .withCheckoutLaunch("undeclared", { launched: 60 })
    .kept()
    .please();
  await git(checkout.integration, "switch", "--quiet", "-c", "not-identified");
  await performWork(
    makeMe.aCheckoutWork.committing("not-attributed", { at: at(30) }),
  );
  await setRecordDoneAt(published.id, record.session, at(10));

  const saved = await keptSession(published.id, record.session);
  if (saved === undefined) throw new Error("Missing the kept launch.");
  expect(
    await storyReview(
      { record: saved, read: {} },
      new AbortController().signal,
    ),
  ).toMatchObject({
    kind: "landing-unavailable",
    explanation:
      "No branch was identified for this session, and no execution checkout commits were captured.",
  });
});
