// A declared branch keeps its bound checkout and committed delivery candidate.
import { readFile } from "node:fs/promises";
import path from "node:path";
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
        .editing("prior-draft", {
          at: at(44),
          files: { "prior-draft.txt": "unpublished draft\n" },
        }),
    { in: branch },
  )
  .kept();

test("a declared branch keeps its bound checkout and committed tip after main moves", async () => {
  const {
    published,
    at,
    worktrees: { [branch]: workspace },
    records: { declared: record },
    work: { entered },
    performWork,
  } = await aDraftBeforeEntry.please();
  const { stdout: draftHash } = await git(
    workspace,
    "hash-object",
    "prior-draft.txt",
  );
  await expect(
    git(workspace, "cat-file", "-e", draftHash.trim()),
  ).rejects.toThrow();
  const entry = await recordSessionBranchEntry(published, record, {
    workspace,
    branch,
  });

  expect(entry).toMatchObject({
    workspace,
    branch,
    committedTip: entered,
  });
  expect(await sessionBranchPins(workspace, record.session)).toEqual([]);
  await expect(
    git(workspace, "cat-file", "-e", draftHash.trim()),
  ).rejects.toThrow();
  await performWork(
    makeMe.aCheckoutWork.committing("later-main", { at: at(20) }),
  );
  expect(
    await recordSessionBranchEntry(published, record, { workspace, branch }),
  ).toEqual(entry);
  expect(await sessionBranchPins(workspace, record.session)).toEqual([]);
});

test("Done retains the declared branch tip for delivery", async () => {
  const {
    published,
    at,
    worktrees: { [branch]: workspace },
    records: { declared: record },
    performWork,
  } = await aDraftBeforeEntry.please();
  await recordSessionBranchEntry(published, record, { workspace, branch });
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

  const draft = "session.txt";
  const draftText = "unpublished change after the branch commit\n";
  await performWork(
    makeMe.aCheckoutWork.editing("private-draft", {
      at: at(15),
      files: { [draft]: draftText },
    }),
    { in: branch },
  );
  const { stdout: draftHash } = await git(workspace, "hash-object", draft);
  await expect(
    git(workspace, "cat-file", "-e", draftHash.trim()),
  ).rejects.toThrow();

  await setRecordDoneAt(published.id, record.session, at(10));

  const saved = await keptSession(published.id, record.session);
  expect(saved?.branchResult).toMatchObject({ committedTip: result });
  expect(saved?.sessionCommits).toBeUndefined();
  expect(await readFile(path.join(workspace, draft), "utf8")).toBe(draftText);
  expect((await git(workspace, "rev-parse", "HEAD")).stdout.trim()).toBe(
    result,
  );
  await expect(
    git(workspace, "cat-file", "-e", draftHash.trim()),
  ).rejects.toThrow();
  expect(await sessionBranchPins(workspace, record.session)).toMatchObject([
    { objectId: result },
  ]);
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
  expect([ownBranch.committedTip, otherBranch.committedTip]).toEqual([
    ours,
    theirs,
  ]);
});

test("an undeclared checkout move records Done without attributing the new branch", async () => {
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
  expect(saved?.doneAt).toBe(at(10));
  expect(saved?.branchEntry).toBeUndefined();
  expect(saved?.branchResult).toBeUndefined();
  expect(saved?.landing).toBeUndefined();
});
