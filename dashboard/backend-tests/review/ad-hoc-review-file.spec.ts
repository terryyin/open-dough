// The typed file diff and file text handlers in-process admit an ad hoc
// session's file read by its captured reference, comparison and listed
// rename, or by its kept run's pair, given the session's typed kept state: no
// server, no machine stores. Each refusal carries its HTTP status.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../Distribution/tests/support/repository-fixture.mjs";
import type { ReviewedFileDiff } from "../../src/storyReviewContract.ts";
import { RefusedRequest } from "../../server/localOrigin.ts";
import {
  reviewedFileDiff,
  reviewedFileText,
} from "../../server/storyReviewFileResponse.ts";

const signal = () => new AbortController().signal;
// Enough identical lines that a small edit stays a rename under Git -M.
const kept = [...Array(12).keys()].map((line) => `kept ${line}\n`).join("");
const renamedFile = { path: "new.txt", oldPath: "old.txt" };
const reference = "11111111-1111-4111-8111-111111111111";
const otherReference = "22222222-2222-4222-8222-222222222222";

async function renameRevisionRepo() {
  return materializeLocalCheckout(
    undefined,
    makeMe.aRepository
      .withRevision("base", { backlog: null, files: { "old.txt": kept } })
      .withRevision("result", {
        backlog: null,
        remove: ["old.txt"],
        files: { "new.txt": `${kept}renamed\n` },
      })
      .please(),
  );
}

test("Given a kept landed session whose comparison renames a file, when the diff and text of the rename are read, then both answer", async () => {
  const repository = await renameRevisionRepo();
  try {
    const { base, result } = repository.revisions;
    const read = makeMe.aSessionReviewRead
      .ofLandedAdHocSession("ad-hoc-file-admit", {
        repository: repository.integration,
        comparing: { base, revision: result },
        reference,
      })
      .readingFile({ reference, baseline: base, tree: result, ...renamedFile })
      .please();

    expect(await reviewedFileDiff(read, signal())).toEqual({
      kind: "diff",
      printed: expect.stringContaining("renamed") as string,
    });
    expect(await reviewedFileText(read, signal())).toEqual({
      kind: "text",
      baseline: kept,
      tree: `${kept}renamed\n`,
    });
  } finally {
    await repository.cleanup();
  }
});

async function expectRefusedAsNotOnCapturedRun(refused: Promise<unknown>) {
  await expect(refused).rejects.toBeInstanceOf(RefusedRequest);
  await expect(refused).rejects.toMatchObject({
    status: 409,
    message: "The file or comparison does not belong to this captured run.",
  });
}

type Pair = { base: string; result: string };
for (const [subject, handler, mismatch] of [
  ["a foreign path", reviewedFileDiff, () => ({ path: "missing.txt" })],
  [
    "a foreign comparison",
    reviewedFileText,
    ({ result }: Pair) => ({ baseline: result }),
  ],
  [
    "another session's reference",
    reviewedFileDiff,
    () => ({ reference: otherReference }),
  ],
] as const) {
  test(`Given a kept landed session beside another, when a file read names ${subject}, then it is refused as not on the captured run`, async () => {
    const repository = await renameRevisionRepo();
    try {
      const { base, result } = repository.revisions;
      const landing = (owned: string) => ({
        repository: repository.integration,
        comparing: { base, revision: result },
        reference: owned,
      });
      const other = makeMe.aLaunchRecord
        .ofLandedAdHocSession("other-session", landing(otherReference))
        .please();
      const named = {
        reference,
        baseline: base,
        tree: result,
        ...renamedFile,
        ...mismatch({ base, result }),
      };
      const read = makeMe.aSessionReviewRead
        .ofLandedAdHocSession("ad-hoc-file-refuse", landing(reference))
        .alsoKeeping([other])
        .readingFile(named)
        .please();

      const refused = handler(read, signal());

      await expectRefusedAsNotOnCapturedRun(refused);
    } finally {
      await repository.cleanup();
    }
  });
}

test("Given a kept landed session, when a file diff names its baseline and file at a foreign tree, then it is refused as not on the captured run", async () => {
  const repository = await renameRevisionRepo();
  try {
    const { base, result } = repository.revisions;
    const read = makeMe.aSessionReviewRead
      .ofLandedAdHocSession("ad-hoc-foreign-tree", {
        repository: repository.integration,
        comparing: { base, revision: result },
        reference,
      })
      .readingFile({ reference, baseline: base, tree: base, ...renamedFile })
      .please();

    const refused = reviewedFileDiff(read, signal());

    await expectRefusedAsNotOnCapturedRun(refused);
  } finally {
    await repository.cleanup();
  }
});

// Reads, in a session with one kept run, the file diff of the named pair
// and file, and hands the answer to `observe`.
async function readKeptRunDiff(
  named: (pair: Pair) => object,
  observe: (diff: Promise<ReviewedFileDiff>) => Promise<void>,
) {
  const repository = await renameRevisionRepo();
  try {
    const { base, result } = repository.revisions;
    const read = makeMe.aSessionReviewRead
      .ofAdHocSessionWithKeptRun("session-with-kept-run", {
        repository: repository.integration,
        run: { base, revision: result },
      })
      .readingFile({
        baseline: base,
        tree: result,
        ...renamedFile,
        ...named({ base, result }),
      })
      .please();
    await observe(reviewedFileDiff(read, signal()));
  } finally {
    await repository.cleanup();
  }
}

test("Given a session with one kept run, when a file diff names that run's pair, then it answers", async () => {
  await readKeptRunDiff(
    () => ({}),
    async (diff) => {
      expect(await diff).toEqual({
        kind: "diff",
        printed: expect.stringContaining("renamed") as string,
      });
    },
  );
});

for (const [subject, named] of [
  ["another pair", ({ result }: Pair) => ({ baseline: result })],
  ["another path", () => ({ path: "missing.txt" })],
] as const) {
  test(`Given a session with one kept run, when a file diff names ${subject}, then it is refused as not among its kept commits`, async () => {
    await readKeptRunDiff(named, async (diff) => {
      await expect(diff).rejects.toBeInstanceOf(RefusedRequest);
      await expect(diff).rejects.toMatchObject({
        status: 409,
        message:
          "The file or comparison does not belong to this session's kept commits.",
      });
    });
  });
}
