// History facts at a revision the configured ref names next
// (../server/pinnedTexts.ts): which commit added a listed profile's
// allocation (`committed=added`) and when a plan or profile was last
// committed (`committed=last`) are answered from what is held at the revision
// last read only when no commit between touched that path; otherwise the
// history is listed, and walked, at the new revision. Identical text is never
// that evidence, so a profile removed and re-added with the same bytes
// credits the re-adding commit. Counts the `gh` calls GitHub received
// (./revisionReuseBoundary.ts).

import { expect, test } from "./support/pageTest.ts";
import {
  backlogPath,
  filesFor,
  madeBy,
  modified,
  named,
  otherProfilePath,
  planPath,
  profilePath,
  seedPath,
} from "./revisionReuseOrigin.ts";
import { revisionReuseBoundary, type Answer } from "./revisionReuseBoundary.ts";
import { pathChange, type PathChange } from "./pathHistoryAnswers.ts";

test.describe.configure({ mode: "serial" });

const at = (iso: string) => new Date(`2026-10-0${iso}Z`);

// The history facts a page asks at a revision: both profiles' additions and
// the plan's and the seed's last commit times.
const factPaths = [
  ["addition", profilePath],
  ["addition", otherProfilePath],
  ["lastCommitted", planPath],
  ["lastCommitted", seedPath],
] as const;

// The same human's addition of `path` by commit `n`, at `when`.
const addedBy = (n: number, committer: string, when: Date): PathChange => ({
  ...pathChange(n, "added", committer, { login: "terryyin" }),
  committedAt: when,
});

test.describe("authenticated read history reuse at a newly named revision (dev launch mode)", () => {
  const { at: readsAt, asked, publishedAt, movedTo } = revisionReuseBoundary();

  const factsAt = async (revision: string) => {
    const reads = readsAt(revision);
    const answers: Answer[] = [];
    for (const [kind, path] of factPaths) {
      answers.push(await reads[kind](path));
    }
    return answers;
  };

  // Both profiles credit the same human, each by an addition of its own, and
  // the plan was last committed by a commit of its own.
  const history = {
    [profilePath]: [addedBy(0x21, "Terry Yin", at("1T08:00:00"))],
    [otherProfilePath]: [addedBy(0x22, "Terry Yin", at("2T08:00:00"))],
    [planPath]: [
      {
        ...pathChange(0x23, "modified", "Planner"),
        committedAt: at("3T08:00:00"),
      },
    ],
  };

  test("an unrelated commit: additions and last commit times at B are answered from A without listing any history", async () => {
    const [a, b] = [named("11"), named("12")];
    const files = filesFor("history-unrelated");
    const published = await publishedAt(a, files, history);
    const factsAtA = await factsAt(a);
    for (const answer of factsAtA) expect(answer.status).toBe(200);
    await movedTo(published, a, { revision: b, files, history }, [
      madeBy("13", [modified("src/app.ts")]),
    ]);

    let factsAtB: Answer[] = [];
    expect(
      await asked(async () => {
        factsAtB = await factsAt(b);
      }),
    ).toEqual([
      "compare 11...12",
      "commit 13",
      // The plan's reachability reads the backlog at B itself.
      `content ${backlogPath}@12`,
    ]);
    // Each assignment keeps its own addition, not the other's of the same
    // human.
    expect(JSON.stringify(factsAtB)).toEqual(
      JSON.stringify(factsAtA).replaceAll(a, b),
    );
    expect(factsAtB[0]?.body).not.toEqual(factsAtB[1]?.body);
  });

  test("a touched profile and plan are listed and walked at B; the untouched profile's addition is reused", async () => {
    const [a, b] = [named("14"), named("15")];
    const files = filesFor("history-touched");
    const published = await publishedAt(a, files, history);
    await factsAt(a);
    const changing = {
      ...pathChange(0x16, "modified", "Mo Modifier"),
      committedAt: at("6T08:00:00"),
    };
    const atB = {
      ...files,
      [profilePath]: `${files[profilePath]}\n`,
      [planPath]: "# Plan touched\n",
    };
    await movedTo(
      published,
      a,
      {
        revision: b,
        files: atB,
        history: {
          ...history,
          [profilePath]: [changing, ...history[profilePath]],
          [planPath]: [changing, ...history[planPath]],
        },
      },
      [{ ...changing, files: [modified(profilePath), modified(planPath)] }],
    );

    let factsAtB: Answer[] = [];
    expect(
      (
        await asked(async () => {
          factsAtB = await factsAt(b);
        })
      ).sort(),
    ).toEqual(
      [
        "compare 14...15",
        "commit 16",
        `content ${backlogPath}@15`,
        "listing .planning/agents@15",
        `commit-list ${profilePath}@15`,
        `commit-list ${planPath}@15`,
      ].sort(),
    );
    // The walk at B passes the modifying commit to the same addition, whose
    // commit record the walk at A already holds.
    expect(factsAtB[0]?.body).toMatchObject({
      revision: b,
      added: { commit: named("21"), committerName: "Terry Yin" },
    });
    expect(factsAtB[2]?.body).toMatchObject({
      revision: b,
      committedAt: expect.stringContaining("2026-10-06T08:00:00"),
    });
  });

  test("a profile removed and re-added with identical text credits the re-adding commit's committer and time", async () => {
    const [a, b] = [named("17"), named("18")];
    const files = filesFor("history-readded");
    const published = await publishedAt(a, files, history);
    await factsAt(a);
    const removing = {
      ...pathChange(0x19, "removed", "Remover"),
      committedAt: at("4T08:00:00"),
    };
    const readding = {
      ...addedBy(0x1a, "Re Adder", at("5T08:00:00")),
      login: "readder",
    };
    await movedTo(
      published,
      a,
      {
        revision: b,
        files,
        history: {
          ...history,
          [profilePath]: [readding, removing, ...history[profilePath]],
        },
      },
      [
        { ...removing, files: [{ filename: profilePath, status: "removed" }] },
        { ...readding, files: [{ filename: profilePath, status: "added" }] },
      ],
    );

    let addition: Answer | undefined;
    expect(
      (
        await asked(async () => {
          addition = await readsAt(b).addition(profilePath);
        })
      ).sort(),
    ).toEqual(
      [
        "compare 17...18",
        "commit 19",
        "commit 1a",
        "listing .planning/agents@18",
        `commit-list ${profilePath}@18`,
      ].sort(),
    );
    expect(addition?.body).toMatchObject({
      revision: b,
      added: {
        commit: named("1a"),
        committerName: "Re Adder",
        committedAt: expect.stringContaining("2026-10-05T08:00:00"),
        login: "readder",
      },
    });
  });
});
