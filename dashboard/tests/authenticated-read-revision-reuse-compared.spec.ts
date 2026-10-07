// What GitHub's comparison of two revisions names, beyond what each commit
// between names (../server/commitsBetween.ts): a merge's own change list names
// only what differs from its first parent, so a record that differs between
// the revision last read and the newly named one is read at the new one even
// when no commit between names it. Counts the `gh` calls GitHub received
// (./revisionReuseBoundary.ts).

import { expect, test } from "./support/pageTest.ts";
import { aheadByAnswer } from "./comparisonAnswers.ts";
import {
  filesFor,
  madeBy,
  modified,
  named,
  newSeedPath,
  otherSeedPath,
  seedPath,
  seedText,
} from "./revisionReuseOrigin.ts";
import { revisionReuseBoundary, type Answer } from "./revisionReuseBoundary.ts";

test.describe.configure({ mode: "serial" });

test.describe("authenticated read reuse of what the comparison names (dev launch mode)", () => {
  const { at, readEverything, asked, publishedAt, movedTo } =
    revisionReuseBoundary();

  test("a seed that differs between A and B is read at B though the merge between does not name it", async () => {
    const [a, b] = [named("a0"), named("b0")];
    const files = filesFor("merged");
    const published = await publishedAt(a, files);
    const merged = { ...files, [seedPath]: seedText("merged at B") };
    // GitHub names a merge's files against its first parent, which a line off
    // A's leaves without the seed A's line changed.
    await movedTo(published, a, { revision: b, files: merged }, [
      madeBy("c0", [modified("src/app.ts")]),
    ]);

    let seedAtB: Answer | undefined;
    expect(
      await asked(async () => {
        await at(b).backlog();
        seedAtB = await at(b).file(seedPath);
        await readEverything(b);
      }),
    ).toEqual(["compare a0...b0", "commit c0", `content ${seedPath}@b0`]);
    expect(seedAtB).toEqual({
      status: 200,
      body: { revision: b, path: seedPath, text: seedText("merged at B") },
    });
  });

  test("a seed the comparison names as renamed away, though no commit between does, is missing at B", async () => {
    const [a, b] = [named("0a"), named("0b")];
    const files = filesFor("renamed");
    const published = await publishedAt(a, files);
    const { [otherSeedPath]: renamed = "", ...kept } = files;
    await movedTo(published, a, {
      revision: b,
      files: { ...kept, [newSeedPath]: renamed },
    });
    const merge = madeBy("0c", [modified("src/app.ts")]);
    published.made.set(merge.sha, merge);
    // GitHub names a rename once: by its new path and the one it came from.
    published.compared.set(`${a}...${b}`, (perPage) =>
      aheadByAnswer([merge.sha], perPage, [
        {
          filename: newSeedPath,
          status: "renamed",
          previous_filename: otherSeedPath,
        },
      ]),
    );

    let missing: Answer | undefined;
    expect(
      await asked(async () => {
        missing = await at(b).file(otherSeedPath);
      }),
    ).toEqual(["compare 0a...0b", "commit 0c", `content ${otherSeedPath}@0b`]);
    expect(missing?.status).toBe(502);
    expect(JSON.stringify(missing?.body)).toContain("HTTP 404");
  });
});
