// Published detail asks only the reachable in-repository records at the
// pinned revision, plus typed profiles, sessions and Done replies.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { ObservationOutcomes } from "../../src/observationOutcomes.ts";
import { readPublishedWork } from "../../src/publishedWorkRead.ts";
import { ReadProblem } from "../../src/readProblem.ts";
import {
  additionCommit,
  expectedDetailPaths,
  observationSupplying,
  ownerIdentity,
  profilePath,
  revision,
  sessionRecord,
} from "./published-detail-path-mix-supply.ts";

test("published detail reads only reachable records and typed detail groups at the pin", async () => {
  const { reads, detailPaths, additionPaths } = observationSupplying({});
  const work = await readPublishedWork(
    makeMe.aPublishedSource.openDough.please(),
    new AbortController().signal,
    new ObservationOutcomes(),
    undefined,
    undefined,
    undefined,
    reads,
  );

  expect(work.revision).toBe(revision);
  const entries = [...work.taken, ...work.backlog];
  expect(
    entries.map((entry) => ({
      title: entry.title,
      canonical: entry.canonical.kind,
      plan: entry.plan?.kind,
    })),
  ).toEqual([
    {
      title: "Repair the installer's update report",
      canonical: "snapshot",
      plan: undefined,
    },
    {
      title: "See the project's published work in a story dashboard",
      canonical: "snapshot",
      plan: "snapshot",
    },
    {
      title: "Follow a record kept outside the planning directory",
      canonical: "snapshot",
      plan: undefined,
    },
    {
      title: "Follow a record named from the repository root",
      canonical: "snapshot",
      plan: undefined,
    },
    {
      title: "Read the hosting provider's note",
      canonical: "external",
      plan: "external",
    },
    {
      title: "Reach outside the repository",
      canonical: "unusable",
      plan: undefined,
    },
    {
      title: "Run a script from a link",
      canonical: "unusable",
      plan: "unusable",
    },
    {
      title: "Point at an anchor and no file",
      canonical: "unusable",
      plan: undefined,
    },
    {
      title: "Walk back to the planning directory",
      canonical: "unusable",
      plan: undefined,
    },
    {
      title: "Name a web address without a host",
      canonical: "unusable",
      plan: undefined,
    },
    {
      title: "Spell a path that cannot be decoded",
      canonical: "unusable",
      plan: undefined,
    },
  ]);
  // Exactly these distinct canonical file paths.
  expect([...new Set(detailPaths)].sort()).toEqual(expectedDetailPaths);

  const owned = work.taken.find((entry) => entry.identity === ownerIdentity);
  expect(owned?.owner?.status).toBe("recorded");
  const assignment =
    owned?.owner?.status === "recorded"
      ? owned.owner.assignments[0]
      : undefined;
  expect(assignment).toMatchObject({
    profilePath,
    name: "Akiho",
    agent: "Akiho-chan",
    mode: "trunk",
    branch: "origin/main",
  });
  const human = assignment?.human;
  expect(human).toMatchObject({
    status: "credited",
    name: "Terry",
    allocation: additionCommit,
  });
  expect(human?.status === "credited" ? human.avatar : undefined).toContain(
    "akiho-chan.json",
  );
  expect(additionPaths).toEqual([profilePath]);
  expect(work.publishedSessions).toEqual({
    status: "listed",
    revision,
    sessions: [sessionRecord],
  });
  expect(work.done).toEqual({
    status: "catalogued",
    revision,
    records: [],
    unreadable: [],
  });
});

test("a failed published-sessions group stays a gap while profiles and Done answer", async () => {
  const { reads } = observationSupplying({
    sessions: () =>
      Promise.reject(
        new ReadProblem("The boundary refused the sessions listing."),
      ),
  });
  const work = await readPublishedWork(
    makeMe.aPublishedSource.openDough.please(),
    new AbortController().signal,
    new ObservationOutcomes(),
    undefined,
    undefined,
    undefined,
    reads,
  );

  expect(work.publishedSessions?.status).toBe("unavailable");
  expect(
    work.publishedSessions?.status === "unavailable" &&
      work.publishedSessions.problem,
  ).toContain("Published sessions could not be read.");
  expect(work.done).toEqual({
    status: "catalogued",
    revision,
    records: [],
    unreadable: [],
  });
  const owned = work.taken.find((entry) => entry.identity === ownerIdentity);
  expect(owned?.owner?.status).toBe("recorded");
});
