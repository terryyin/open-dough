import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { PinnedTexts } from "../../server/pinnedTexts.ts";
import { RetainedAnswers } from "../../server/retainedAnswers.ts";
import { reviewRepositoryPath } from "../../server/reviewRepository.ts";
import { RevisionMemo } from "../../server/revisionMemo.ts";
import { verifiedOriginTrunk } from "../../server/verifiedOriginTrunk.ts";
import {
  backlogPath,
  bareReview,
  git,
  opened,
} from "./verifiedOriginTrunkCase.ts";

// Each upload-pack the Review repository's Git reaches origin with: one per
// probe and one per fetch.
function countedUploadPacks(fixture: string, review: string, origin: string) {
  const log = path.join(fixture, "counted-upload-pack.log");
  const gate = path.join(fixture, "counted-upload-pack");
  writeFileSync(log, "");
  writeFileSync(
    gate,
    `#!/bin/sh\nprintf 'call\\n' >> "${log}"\nexec git upload-pack "$@"\n`,
    { mode: 0o755 },
  );
  bareReview(review, origin, gate);
  return () => readFileSync(log, "utf8").split("\n").filter(Boolean).length;
}

async function confirmedAcrossRestarts() {
  const atA = "Backlog at A.\n";
  const atB = "Backlog at B.\n";
  const { repository, source, signal } = await opened(
    makeMe.aRepository
      .withRevision("a", { files: { [backlogPath]: atA } })
      .withRevision("b", { files: { [backlogPath]: atB } })
      .please(),
  );
  const { a, b } = repository.revisions;
  if (a === undefined || b === undefined)
    throw new Error("Revisions a and b were not materialized.");
  git(repository.origin, "update-ref", "refs/heads/main", a);
  const review = reviewRepositoryPath(source);
  const uploadPacks = countedUploadPacks(
    repository.fixture,
    review,
    repository.origin,
  );
  // A started server: its own pinned texts over the same machine records.
  const restarted = () =>
    verifiedOriginTrunk(
      source,
      new PinnedTexts(new RevisionMemo(new RetainedAnswers())),
      signal,
    );
  const blockedRecordWrite = path.join(
    review,
    "open-dough-board-confirmation.json.tmp",
  );
  return {
    a: { revision: a, backlog: atA },
    b: { revision: b, backlog: atB },
    moveOriginTo: (revision: string) =>
      git(repository.origin, "update-ref", "refs/heads/main", revision),
    uploadPacks,
    restarted,
    failRecordWrites: () => {
      mkdirSync(path.join(blockedRecordWrite, "held"), { recursive: true });
    },
    allowRecordWrites: () => {
      rmSync(blockedRecordWrite, { recursive: true, force: true });
    },
  };
}

test("a failed confirmation record answers the former confirmation after a restart until a retry records B", async () => {
  const board = await confirmedAcrossRestarts();
  const observedA = await board.restarted();
  expect(observedA).toMatchObject({ kind: "verified", ...board.a });
  if (observedA.kind !== "verified") throw new Error("A was not verified.");
  board.moveOriginTo(board.b.revision);
  board.failRecordWrites();
  await expect(board.restarted()).resolves.toEqual({
    kind: "verified",
    ...board.a,
    confirmedAt: observedA.confirmedAt,
    unrecorded: true,
  });
  await expect(board.restarted()).resolves.toEqual({
    kind: "verified",
    ...board.a,
    confirmedAt: observedA.confirmedAt,
    unrecorded: true,
  });
  board.allowRecordWrites();
  const observedB = await board.restarted();
  expect(observedB).toMatchObject({ kind: "verified", ...board.b });
  expect(observedB).not.toHaveProperty("unrecorded");
});

test("an open whose record matches origin confirms a later time without fetching, after a restart", async () => {
  const board = await confirmedAcrossRestarts();
  board.moveOriginTo(board.b.revision);
  const first = await board.restarted();
  if (first.kind !== "verified") throw new Error("B was not verified.");
  const probeOnly = board.uploadPacks() + 1;
  const later = await board.restarted();
  expect(later).toMatchObject({ kind: "verified", ...board.b });
  if (later.kind !== "verified") throw new Error("B was not verified.");
  expect(later.confirmedAt > first.confirmedAt).toBe(true);
  expect(board.uploadPacks()).toBe(probeOnly);
});
