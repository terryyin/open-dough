// Profile additions and last-committed times at a revision the ref names
// next (../../server/pinnedTexts.ts): answered from what is held at the
// revision last read only when no commit between touched that path.
// Identical text is never that evidence.

import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { CommitRecord } from "../../server/ghCommit.ts";
import type { PinnedTexts } from "../../server/pinnedTexts.ts";
import {
  changed,
  commitRecord,
  commitSha,
  historyPins,
  paths,
  revisionA,
  revisionB,
  source,
  type HistoryCalls,
} from "./revisionReuseHistoryHarness.ts";

const profileCommit = commitSha(0x21);
const otherCommit = commitSha(0x22);
const terry = "Terry Yin";
const profileAdded = "2026-10-01T08:00:00.000Z";
const otherAdded = "2026-10-02T08:00:00.000Z";
const planAtA = "2026-10-03T08:00:00.000Z";
const seedAtA = "2026-10-03T09:00:00.000Z";

function heldAtA(): {
  records: Map<string, CommitRecord>;
  pathCommits: Map<string, readonly string[]>;
  commitTimes: Map<string, string>;
} {
  return {
    records: new Map([
      [
        profileCommit,
        commitRecord(
          profileCommit,
          [changed(paths.profile, "added")],
          terry,
          profileAdded,
          "terryyin",
        ),
      ],
      [
        otherCommit,
        commitRecord(
          otherCommit,
          [changed(paths.otherProfile, "added")],
          terry,
          otherAdded,
          "terryyin",
        ),
      ],
    ]),
    pathCommits: new Map([
      [`${revisionA}\0${paths.profile}`, [profileCommit]],
      [`${revisionA}\0${paths.otherProfile}`, [otherCommit]],
    ]),
    commitTimes: new Map([
      [`${revisionA}\0${paths.plan}`, planAtA],
      [`${revisionA}\0${paths.seed}`, seedAtA],
    ]),
  };
}

async function factsAt(
  pinned: PinnedTexts,
  revision: string,
  signal: AbortSignal,
) {
  const add = pinned.adder(source, revision, signal);
  const time = pinned.committer(source, revision, signal);
  return {
    profile: await add(paths.profile),
    other: await add(paths.otherProfile),
    plan: await time(paths.plan),
    seed: await time(paths.seed),
  };
}

function published(label: string, atB: Readonly<Record<string, string>>) {
  const atA = makeMe.aProjectRevision.labeled(label).please().files;
  return new Map<string, Readonly<Record<string, string>>>([
    [revisionA, atA],
    [revisionB, atB],
  ]);
}

test("an unrelated commit: profile additions and last-committed times at B are answered from A without listing any history", async () => {
  const unrelated = commitSha(0x13);
  const held = heldAtA();
  held.records.set(
    unrelated,
    commitRecord(
      unrelated,
      [changed("src/app.ts", "modified")],
      "Fixture Committer",
      "2026-10-04T08:00:00.000Z",
    ),
  );
  const files = makeMe.aProjectRevision
    .labeled("history-unrelated")
    .please().files;
  const { pinned, signal, calls, moved, settle } = historyPins({
    files: new Map([
      [revisionA, files],
      [revisionB, files],
    ]),
    ...held,
    between: [unrelated],
  });
  const atA = await factsAt(pinned, revisionA, signal);
  settle();
  moved();

  const atB = await factsAt(pinned, revisionB, signal);

  expect(calls).toEqual({
    pathLists: [],
    commitTimes: [],
    commits: [unrelated],
    files: [],
    compared: [{ base: revisionA, head: revisionB }],
  } satisfies HistoryCalls);
  expect(atB.profile).toEqual(atA.profile);
  expect(atB.other).toEqual(atA.other);
  expect(atB.profile).not.toEqual(atB.other);
  expect(atB.plan).toBe(atA.plan);
  expect(atB.seed).toBe(atA.seed);
});

test("a touched profile and plan are listed and walked at B; the untouched profile's addition is reused", async () => {
  const modifying = commitSha(0x16);
  const touchedAt = "2026-10-06T08:00:00.000Z";
  const held = heldAtA();
  held.records.set(
    modifying,
    commitRecord(
      modifying,
      [changed(paths.profile, "modified"), changed(paths.plan, "modified")],
      "Mo Modifier",
      touchedAt,
    ),
  );
  held.pathCommits.set(`${revisionB}\0${paths.profile}`, [
    modifying,
    profileCommit,
  ]);
  held.commitTimes.set(`${revisionB}\0${paths.plan}`, touchedAt);
  const files = makeMe.aProjectRevision
    .labeled("history-touched")
    .please().files;
  const { pinned, signal, calls, moved, settle } = historyPins({
    files: published("history-touched", {
      ...files,
      [paths.profile]: `${files[paths.profile]}\n`,
      [paths.plan]: "# Plan touched\n",
    }),
    ...held,
    between: [modifying],
  });
  const atA = await factsAt(pinned, revisionA, signal);
  settle();
  moved();

  const atB = await factsAt(pinned, revisionB, signal);

  expect(calls.pathLists).toEqual([`${paths.profile}@${revisionB}`]);
  expect(calls.commitTimes).toEqual([`${paths.plan}@${revisionB}`]);
  expect(calls.commits).toEqual([modifying]);
  expect(calls.files).toEqual([]);
  expect(calls.compared).toEqual([{ base: revisionA, head: revisionB }]);
  expect(atB.profile).toEqual(atA.profile);
  expect(atB.profile).toMatchObject({
    commit: profileCommit,
    committerName: terry,
  });
  expect(atB.other).toEqual(atA.other);
  expect(atB.plan).toBe(touchedAt);
  expect(atB.seed).toBe(atA.seed);
});

test("a profile removed and re-added with identical text credits the re-adding commit's committer and time", async () => {
  const removing = commitSha(0x19);
  const readding = commitSha(0x1a);
  const readdedAt = "2026-10-05T08:00:00.000Z";
  const held = heldAtA();
  held.records.set(
    removing,
    commitRecord(
      removing,
      [changed(paths.profile, "removed")],
      "Remover",
      "2026-10-04T08:00:00.000Z",
    ),
  );
  held.records.set(
    readding,
    commitRecord(
      readding,
      [changed(paths.profile, "added")],
      "Re Adder",
      readdedAt,
      "readder",
    ),
  );
  held.pathCommits.set(`${revisionB}\0${paths.profile}`, [
    readding,
    removing,
    profileCommit,
  ]);
  const files = makeMe.aProjectRevision
    .labeled("history-readded")
    .please().files;
  const { pinned, signal, calls, moved, settle } = historyPins({
    files: new Map([
      [revisionA, files],
      [revisionB, files],
    ]),
    ...held,
    between: [removing, readding],
  });
  const addAtA = pinned.adder(source, revisionA, signal);
  const atA = await addAtA(paths.profile);
  settle();
  moved();

  const atB = await pinned.adder(source, revisionB, signal)(paths.profile);

  expect(calls.pathLists).toEqual([`${paths.profile}@${revisionB}`]);
  expect([...calls.commits].sort()).toEqual([removing, readding].sort());
  expect(calls.commitTimes).toEqual([]);
  expect(calls.files).toEqual([]);
  expect(atB).toEqual({
    commit: readding,
    committerName: "Re Adder",
    committedAt: readdedAt,
    login: "readder",
    avatar: null,
  });
  expect(atB).not.toEqual(atA);
});
