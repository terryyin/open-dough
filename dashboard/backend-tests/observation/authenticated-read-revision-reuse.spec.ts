// The local authenticated read boundary at a revision its configured ref
// names next (../../server/pinnedTexts.ts): once this dashboard process answered
// the backlog at revision A, the backlog at the newly named revision B is read
// there directly, while reads of the records it names ask GitHub to compare A
// with B and what each commit between changed, and a record or listing
// neither the comparison nor a commit between touched is answered from what
// is held at A without asking GitHub again; what either touched is read at B.
// Tested
// directly against real HTTP and the synthetic `gh`, counting the `gh` calls
// GitHub received (./revisionReuseBoundary.ts).

import { expect, test } from "../../test-support/support/pageTest.ts";
import { aheadBy } from "../../test-support/comparisonAnswers.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  advanceReusePublication,
  madeBy,
  modified,
  named,
} from "../../test-support/revisionReuseOrigin.ts";
import { revisionReuseBoundary, type Answer } from "./revisionReuseBoundary.ts";

const origin = makeMe.aProjectRevision;

test.describe.configure({ mode: "serial" });

test.describe("authenticated read reuse at a newly named revision (development environment)", () => {
  const { server, at, readEverything, asked, publishedAt, movedTo } =
    revisionReuseBoundary();

  test("an unrelated commit: the backlog is read at B, and every other kind of read there is answered from A after one comparison and one commit read", async () => {
    const files = origin.labeled("unrelated").please().files;
    const published = await publishedAt(files);
    const { revision: a } = published;
    const answersAtA = await readEverything(a);
    const b = await movedTo(published, a, { files }, [
      madeBy("c1", [modified("src/app.ts")]),
    ]);

    const reads = at(b);
    expect(await asked(reads.backlog)).toEqual([
      `content ${origin.paths.backlog}@${b}`,
    ]);
    expect(await asked(() => reads.file(origin.paths.seed))).toEqual([
      `compare ${a}...${b}`,
      `commit ${named("c1")}`,
    ]);
    expect(await asked(() => reads.file(origin.paths.otherSeed))).toEqual([]);
    expect(await asked(() => reads.file(origin.paths.plan))).toEqual([]);
    expect(await asked(reads.profiles)).toEqual([]);
    expect(await asked(reads.done)).toEqual([]);
    // The comparison asked GitHub for at most ten commits between.
    expect(
      server().github.calls.find(({ request }) => request.kind === "compare")
        ?.argv,
    ).toContain(`repos/terryyin/open-dough/compare/${a}...${b}?per_page=10`);

    // Each answer is A's, as B's own.
    const answersAtB = await readEverything(b);
    expect(JSON.stringify(answersAtB)).toEqual(
      JSON.stringify(answersAtA).replaceAll(a, b),
    );
  });

  test("a changed seed alone is read at B, and its new text is answered there", async () => {
    const files = origin.labeled("changed-seed").please().files;
    const published = await publishedAt(files);
    const { revision: a } = published;
    const changedText = origin.seedText("changed-seed at B");
    const changed = { ...files, [origin.paths.seed]: changedText };
    const b = await movedTo(published, a, { files: changed }, [
      madeBy("c2", [modified(origin.paths.seed)]),
    ]);

    let seedAtB: Answer | undefined;
    expect(
      await asked(async () => {
        await at(b).backlog();
        seedAtB = await at(b).file(origin.paths.seed);
        await readEverything(b);
      }),
    ).toEqual([
      `content ${origin.paths.backlog}@${b}`,
      `compare ${a}...${b}`,
      `commit ${named("c2")}`,
      `content ${origin.paths.seed}@${b}`,
    ]);
    expect(seedAtB).toEqual({
      status: 200,
      body: {
        revision: b,
        path: origin.paths.seed,
        text: changedText,
      },
    });
  });

  test("a changed backlog naming a new seed, an added done record, and a changed plan are read at B; nothing else is", async () => {
    const project = origin.labeled("changed");
    const files = project.please().files;
    const published = await publishedAt(files);
    const { revision: a } = published;
    const atB = project
      .with({
        backlog: project.backlogNaming(project.newSeedEntry),
        files: {
          [origin.paths.newSeed]: project.newSeedText,
          [origin.paths.plan]: "# Plan changed, a slice done\n",
        },
        doneRecords: [project.doneRecord("SEED-304#added", "added")],
      })
      .please().files;
    const b = await movedTo(published, a, { files: atB }, [
      madeBy("c3", [
        modified(origin.paths.backlog),
        { filename: origin.paths.newSeed, status: "added" },
      ]),
      madeBy("d3", [
        { filename: origin.paths.addedDone, status: "added" },
        modified(origin.paths.doneCatalog),
        modified(origin.paths.plan),
      ]),
    ]);

    let answers: Answer[] = [];
    expect(
      (
        await asked(async () => {
          answers = [
            ...(await readEverything(b)),
            await at(b).file(origin.paths.newSeed),
          ];
        })
      ).sort(),
    ).toEqual(
      [
        `compare ${a}...${b}`,
        `commit ${named("c3")}`,
        `commit ${named("d3")}`,
        `content ${origin.paths.backlog}@${b}`,
        `content ${origin.paths.plan}@${b}`,
        `listing .planning/done@${b}`,
        `content ${origin.paths.doneCatalog}@${b}`,
        `content ${origin.paths.addedDone}@${b}`,
        `content ${origin.paths.newSeed}@${b}`,
      ].sort(),
    );
    expect(answers[0]?.body).toEqual({
      revision: b,
      backlog: atB[origin.paths.backlog],
    });
    expect(answers[3]?.body).toMatchObject({
      text: "# Plan changed, a slice done\n",
    });
    expect(answers[5]?.body).toMatchObject({
      records: [
        { path: origin.paths.done, text: files[origin.paths.done] },
        { path: origin.paths.addedDone, text: atB[origin.paths.addedDone] },
      ],
    });
  });

  test("a profile a commit between removed is not listed at B, and its text at A is not served", async () => {
    const files = origin.labeled("removed").please().files;
    const published = await publishedAt(files);
    const { revision: a } = published;
    const { [origin.paths.otherProfile]: removed, ...atB } = files;
    expect(removed).toBeDefined();
    const b = await movedTo(published, a, { files: atB }, [
      madeBy("c4", [
        { filename: origin.paths.otherProfile, status: "removed" },
      ]),
    ]);

    let profiles: Answer | undefined;
    expect(
      await asked(async () => {
        profiles = await at(b).profiles();
      }),
    ).toEqual([
      `compare ${a}...${b}`,
      `commit ${named("c4")}`,
      `listing .planning/agents@${b}`,
    ]);
    expect(profiles?.body).toMatchObject({
      revision: b,
      profiles: [
        { path: origin.paths.profile, text: files[origin.paths.profile] },
      ],
    });
    expect(JSON.stringify(profiles?.body)).not.toContain(
      origin.paths.otherProfile,
    );
  });

  test("a record the backlog still names that a commit between removed is missing at B, not filled from A", async () => {
    const files = origin.labeled("missing").please().files;
    const published = await publishedAt(files);
    const { revision: a } = published;
    const { [origin.paths.otherSeed]: removed, ...atB } = files;
    const b = await movedTo(published, a, { files: atB }, [
      madeBy("c5", [{ filename: origin.paths.otherSeed, status: "removed" }]),
    ]);

    let missing: Answer | undefined;
    expect(
      await asked(async () => {
        missing = await at(b).file(origin.paths.otherSeed);
      }),
    ).toEqual([
      `content ${origin.paths.backlog}@${b}`,
      `compare ${a}...${b}`,
      `commit ${named("c5")}`,
      `content ${origin.paths.otherSeed}@${b}`,
    ]);
    expect(missing?.status).toBe(502);
    expect(JSON.stringify(missing?.body)).toContain("HTTP 404");
    expect(JSON.stringify(missing?.body)).not.toContain(removed ?? "");
  });

  test("a move from A past B to C is compared from A, reading each commit between", async () => {
    const files = origin.labeled("past").please().files;
    const published = await publishedAt(files);
    const { revision: a } = published;
    // The ref named B, but no check found it before it moved on to C.
    await advanceReusePublication(published, { files });
    const c = await movedTo(published, a, { files });
    const between = [
      madeBy("ed", [modified("src/app.ts")]),
      madeBy("fd", [modified("README.md")]),
    ];
    for (const made of between) published.made.set(made.sha, made);
    published.compared.set(
      `${a}...${c}`,
      aheadBy(between.map(({ sha }) => sha)),
    );

    // The commits between are read together, in no particular order.
    expect((await asked(() => readEverything(c))).sort()).toEqual([
      `commit ${named("ed")}`,
      `commit ${named("fd")}`,
      `compare ${a}...${c}`,
      `content ${origin.paths.backlog}@${c}`,
    ]);
  });
});
