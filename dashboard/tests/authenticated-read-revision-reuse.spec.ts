// The local authenticated read boundary at a revision its configured ref
// names next (../server/pinnedTexts.ts): once this dashboard process answered
// the backlog at revision A, reads at the newly named revision B ask GitHub
// to compare A with B and what each commit between changed, and a record or
// listing no commit touched is answered from what is held at A without
// asking GitHub again; what a commit between touched is read at B. Tested
// directly against real HTTP and the synthetic `gh`, counting the `gh` calls
// GitHub received (./revisionReuseBoundary.ts).

import { expect, test } from "./support/pageTest.ts";
import { aheadByAnswer } from "./comparisonAnswers.ts";
import {
  addedDonePath,
  backlogNaming,
  backlogPath,
  donePath,
  filesFor,
  madeBy,
  modified,
  named,
  newSeedPath,
  otherProfilePath,
  otherSeedPath,
  planPath,
  profilePath,
  seedPath,
  seedText,
} from "./revisionReuseOrigin.ts";
import { revisionReuseBoundary, type Answer } from "./revisionReuseBoundary.ts";

test.describe.configure({ mode: "serial" });

test.describe("authenticated read reuse at a newly named revision (dev launch mode)", () => {
  const { server, at, readEverything, asked, publishedAt, movedTo } =
    revisionReuseBoundary();

  test("an unrelated commit: every kind of read at B is answered from A after one comparison and one commit read", async () => {
    const [a, b] = [named("a1"), named("b1")];
    const files = filesFor("unrelated");
    const published = await publishedAt(a, files);
    const answersAtA = await readEverything(a);
    await movedTo(published, a, { revision: b, files }, [
      madeBy("c1", [modified("src/app.ts")]),
    ]);

    const reads = at(b);
    expect(await asked(reads.backlog)).toEqual([
      "compare a1...b1",
      "commit c1",
    ]);
    expect(await asked(() => reads.file(seedPath))).toEqual([]);
    expect(await asked(() => reads.file(otherSeedPath))).toEqual([]);
    expect(await asked(() => reads.file(planPath))).toEqual([]);
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
    const [a, b] = [named("a2"), named("b2")];
    const files = filesFor("changed-seed");
    const published = await publishedAt(a, files);
    const changed = { ...files, [seedPath]: seedText("changed-seed at B") };
    await movedTo(published, a, { revision: b, files: changed }, [
      madeBy("c2", [modified(seedPath)]),
    ]);

    let seedAtB: Answer | undefined;
    expect(
      await asked(async () => {
        await at(b).backlog();
        seedAtB = await at(b).file(seedPath);
        await readEverything(b);
      }),
    ).toEqual(["compare a2...b2", "commit c2", `content ${seedPath}@b2`]);
    expect(seedAtB).toEqual({
      status: 200,
      body: {
        revision: b,
        path: seedPath,
        text: seedText("changed-seed at B"),
      },
    });
  });

  test("a changed backlog naming a new seed, an added done record, and a changed plan are read at B; nothing else is", async () => {
    const [a, b] = [named("a3"), named("b3")];
    const files = filesFor("changed");
    const published = await publishedAt(a, files);
    const backlogAtB = backlogNaming(
      "changed",
      "- [New](seeds/SEED-303-new.md#new) — SEED-303#new\n",
    );
    const atB = {
      ...files,
      [backlogPath]: backlogAtB,
      [newSeedPath]:
        '# New\n\n<a id="new"></a>\n\n### New\n\n**Identity:** SEED-303#new\n',
      [addedDonePath]: `{"label":"added"}\n`,
      [planPath]: "# Plan changed, a slice done\n",
    };
    await movedTo(published, a, { revision: b, files: atB }, [
      madeBy("c3", [
        modified(backlogPath),
        { filename: newSeedPath, status: "added" },
      ]),
      madeBy("d3", [
        { filename: addedDonePath, status: "added" },
        modified(planPath),
      ]),
    ]);

    let answers: Answer[] = [];
    expect(
      (
        await asked(async () => {
          answers = [
            ...(await readEverything(b)),
            await at(b).file(newSeedPath),
          ];
        })
      ).sort(),
    ).toEqual(
      [
        "compare a3...b3",
        "commit c3",
        "commit d3",
        `content ${backlogPath}@b3`,
        `content ${planPath}@b3`,
        "listing .planning/done@b3",
        `content ${addedDonePath}@b3`,
        `content ${newSeedPath}@b3`,
      ].sort(),
    );
    expect(answers[0]?.body).toEqual({ revision: b, backlog: backlogAtB });
    expect(answers[3]?.body).toMatchObject({
      text: "# Plan changed, a slice done\n",
    });
    expect(answers[5]?.body).toMatchObject({
      records: [
        { path: donePath, text: files[donePath] },
        { path: addedDonePath, text: `{"label":"added"}\n` },
      ],
    });
  });

  test("a profile a commit between removed is not listed at B, and its text at A is not served", async () => {
    const [a, b] = [named("a4"), named("b4")];
    const files = filesFor("removed");
    const published = await publishedAt(a, files);
    const { [otherProfilePath]: removed, ...atB } = files;
    expect(removed).toBeDefined();
    await movedTo(published, a, { revision: b, files: atB }, [
      madeBy("c4", [{ filename: otherProfilePath, status: "removed" }]),
    ]);

    let profiles: Answer | undefined;
    expect(
      await asked(async () => {
        profiles = await at(b).profiles();
      }),
    ).toEqual(["compare a4...b4", "commit c4", "listing .planning/agents@b4"]);
    expect(profiles?.body).toMatchObject({
      revision: b,
      profiles: [{ path: profilePath, text: files[profilePath] }],
    });
    expect(JSON.stringify(profiles?.body)).not.toContain(otherProfilePath);
  });

  test("a record the backlog still names that a commit between removed is missing at B, not filled from A", async () => {
    const [a, b] = [named("a5"), named("b5")];
    const files = filesFor("missing");
    const published = await publishedAt(a, files);
    const { [otherSeedPath]: removed, ...atB } = files;
    await movedTo(published, a, { revision: b, files: atB }, [
      madeBy("c5", [{ filename: otherSeedPath, status: "removed" }]),
    ]);

    let missing: Answer | undefined;
    expect(
      await asked(async () => {
        missing = await at(b).file(otherSeedPath);
      }),
    ).toEqual(["compare a5...b5", "commit c5", `content ${otherSeedPath}@b5`]);
    expect(missing?.status).toBe(502);
    expect(JSON.stringify(missing?.body)).toContain("HTTP 404");
    expect(JSON.stringify(missing?.body)).not.toContain(removed ?? "");
  });

  test("a move from A past B to C is compared from A, reading each commit between", async () => {
    const [a, b, c] = [named("ad"), named("bd"), named("cd")];
    const files = filesFor("past");
    const published = await publishedAt(a, files);
    // The ref named B, but no check found it before it moved on to C.
    published.revisions.set(b, files);
    published.trunk.revision = b;
    await movedTo(published, a, { revision: c, files });
    const between = [
      madeBy("ed", [modified("src/app.ts")]),
      madeBy("fd", [modified("README.md")]),
    ];
    for (const made of between) published.made.set(made.sha, made);
    published.compared.set(`${a}...${c}`, (perPage) =>
      aheadByAnswer(
        between.map(({ sha }) => sha),
        perPage,
      ),
    );

    // The commits between are read together, in no particular order.
    expect((await asked(() => readEverything(c))).sort()).toEqual([
      "commit ed",
      "commit fd",
      "compare ad...cd",
    ]);
  });
});
