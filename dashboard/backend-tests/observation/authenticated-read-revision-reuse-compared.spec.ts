// What GitHub's comparison of two revisions and each commit between name
// (../../server/commitsBetween.ts): a merge's own change list names only what
// differs from its first parent, so a record that differs between the
// revision last read and the newly named one is read at the new one even
// when no commit between names it, and a path renamed away is not served
// from the earlier revision whether the comparison or a commit's own record
// names the rename. Reads at the newly named revision that need GitHub's
// account while one of them is still asking for it wait on that account, so
// the comparison is asked once however the reads coincide. Counts the `gh`
// calls GitHub received (./revisionReuseBoundary.ts).

import { expect, test } from "../../test-support/support/pageTest.ts";
import { aheadByAnswer } from "../../test-support/comparisonAnswers.ts";
import { holdingAnswer } from "../../test-support/support/heldGitHubAnswer.ts";
import { refusedMarker } from "../../test-support/support/sharedReads.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { answerFrom } from "../../test-support/revisionReuseAnswers.ts";
import {
  madeBy,
  modified,
  named,
  serveReusePublication,
} from "../../test-support/revisionReuseOrigin.ts";
import { revisionReuseBoundary, type Answer } from "./revisionReuseBoundary.ts";

const origin = makeMe.aProjectRevision;

test.describe.configure({ mode: "serial" });

test.describe("authenticated read reuse of what the comparison names (development environment)", () => {
  const { server, at, readEverything, asked, publishedAt, movedTo } =
    revisionReuseBoundary();

  test("a read at B that arrives while another awaits the commit between waits on the same comparison", async () => {
    const files = origin.labeled("coinciding").please().files;
    const published = await publishedAt(files);
    const { revision: a } = published;
    const b = await movedTo(published, a, { files }, [
      madeBy("f2", [modified("src/app.ts")]),
    ]);
    // The comparison is answered at once; the commit between is held.
    const held = holdingAnswer(
      (call) => Promise.resolve(answerFrom(published, call)),
      (request) => request.kind === "commit",
    );
    serveReusePublication(server().github, published, held.answer);

    let answers: Answer[] = [];
    expect(
      await asked(async () => {
        const seed = at(b).file(origin.paths.seed);
        await expect
          .poll(() =>
            server().github.calls.some(
              ({ request }) => request.kind === "commit",
            ),
          )
          .toBe(true);
        const profiles = at(b).profiles();
        // Once refused, the profiles read sent before it is waiting.
        await refusedMarker(server());
        held.release();
        answers = await Promise.all([seed, profiles]);
      }),
    ).toEqual([
      `content ${origin.paths.backlog}@${b}`,
      `compare ${a}...${b}`,
      `commit ${named("f2")}`,
    ]);
    expect(answers.map(({ status }) => status)).toEqual([200, 200]);
    expect(answers[1]?.body).toMatchObject({
      revision: b,
      profiles: expect.arrayContaining([
        { path: origin.paths.profile, text: files[origin.paths.profile] },
      ]),
    });
  });

  test("a seed that differs between A and B is read at B though the merge between does not name it", async () => {
    const files = origin.labeled("merged").please().files;
    const published = await publishedAt(files);
    const { revision: a } = published;
    const mergedText = origin.seedText("merged at B");
    const merged = { ...files, [origin.paths.seed]: mergedText };
    // GitHub names a merge's files against its first parent, which a line off
    // A's leaves without the seed A's line changed.
    const b = await movedTo(published, a, { files: merged }, [
      madeBy("c0", [modified("src/app.ts")]),
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
      `commit ${named("c0")}`,
      `content ${origin.paths.seed}@${b}`,
    ]);
    expect(seedAtB).toEqual({
      status: 200,
      body: { revision: b, path: origin.paths.seed, text: mergedText },
    });
  });

  test("a seed the comparison names as renamed away, though no commit between does, is missing at B", async () => {
    const files = origin.labeled("renamed").please().files;
    const published = await publishedAt(files);
    const { revision: a } = published;
    const { [origin.paths.otherSeed]: renamed = "", ...kept } = files;
    const b = await movedTo(published, a, {
      files: { ...kept, [origin.paths.newSeed]: renamed },
    });
    const merge = madeBy("0c", [modified("src/app.ts")]);
    published.made.set(merge.sha, merge);
    // GitHub names a rename once: by its new path and the one it came from.
    published.compared.set(`${a}...${b}`, (perPage) =>
      aheadByAnswer([merge.sha], perPage, [
        {
          filename: origin.paths.newSeed,
          status: "renamed",
          previous_filename: origin.paths.otherSeed,
        },
      ]),
    );

    let missing: Answer | undefined;
    expect(
      await asked(async () => {
        missing = await at(b).file(origin.paths.otherSeed);
      }),
    ).toEqual([
      `content ${origin.paths.backlog}@${b}`,
      `compare ${a}...${b}`,
      `commit ${named("0c")}`,
      `content ${origin.paths.otherSeed}@${b}`,
    ]);
    expect(missing?.status).toBe(502);
    expect(JSON.stringify(missing?.body)).toContain("HTTP 404");
  });

  test("a seed a commit between renames away, though the comparison does not name it, is missing at B and its new path is read", async () => {
    const project = origin.labeled("renamed by a commit");
    const files = project.please().files;
    const published = await publishedAt(files);
    const { revision: a } = published;
    // The backlog at B still names the old path, and names the new one too.
    const atB = project
      .with({
        backlog: project.backlogNaming(project.newSeedEntry),
        files: { [origin.paths.newSeed]: project.newSeedText },
        remove: [origin.paths.otherSeed],
      })
      .please().files;
    const rename = madeBy("1c", [
      modified(origin.paths.backlog),
      {
        filename: origin.paths.newSeed,
        status: "renamed",
        previous_filename: origin.paths.otherSeed,
      },
    ]);
    const b = await movedTo(
      published,
      a,
      {
        files: atB,
      },
      [rename],
    );
    // GitHub's comparison names the rename too; naming no files here leaves
    // the commit's own record as the only account of it.
    published.compared.set(`${a}...${b}`, (perPage) =>
      aheadByAnswer([rename.sha], perPage, []),
    );

    let missing: Answer | undefined;
    let moved: Answer | undefined;
    expect(
      await asked(async () => {
        missing = await at(b).file(origin.paths.otherSeed);
        moved = await at(b).file(origin.paths.newSeed);
      }),
    ).toEqual([
      `content ${origin.paths.backlog}@${b}`,
      `compare ${a}...${b}`,
      `commit ${named("1c")}`,
      `content ${origin.paths.otherSeed}@${b}`,
      `content ${origin.paths.newSeed}@${b}`,
    ]);
    expect(missing?.status).toBe(502);
    expect(JSON.stringify(missing?.body)).toContain("HTTP 404");
    expect(moved).toEqual({
      status: 200,
      body: {
        revision: b,
        path: origin.paths.newSeed,
        text: project.newSeedText,
      },
    });
  });
});
