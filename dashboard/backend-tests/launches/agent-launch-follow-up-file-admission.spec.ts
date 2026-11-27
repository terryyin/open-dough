// Start admits a file follow-up on a Done story's landed run or published
// completion only when the file, and any named line on its side, belongs to
// that comparison's Git text, before acceptance reaches the host. Page
// composed context: agent-launch-follow-up-forged-context.spec.ts.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { fileFactsOf } from "../../test-support/support/followUpCompletedFile.ts";
import { aDoneStoryStart, storyA } from "../support/doneStoryStart.ts";

const literalPath = "[literal]*.txt";

test("a file follow-up on a launch's landed run admits and names its comparison", async () => {
  const { revision, tree, received, startAt, retainedLanding, keep } =
    await aDoneStoryStart();
  const base = revision("claim");
  const run = retainedLanding(storyA, { base, revision: tree });
  keep(run);

  const accepted = await startAt(
    makeMe.aFileFollowUp
      .onLandedRunOf(run.record)
      .at({ path: literalPath, line: 1, side: "new" })
      .please(),
  );

  expect(accepted.kind, JSON.stringify(accepted)).toBe("accepted");
  const input = received[0]?.input ?? "";
  expect(input).toContain(`- Path: ${literalPath}`);
  expect(input).toContain(`Landed run ${base} → ${tree}`);
  expect(input).toContain("- Line: 1");
  expect(input).toContain("- Side: new");
});

test("a file, line or side outside the published completion is refused before acceptance", async () => {
  const { publishedCompletion, received, startAt, refusal } =
    await aDoneStoryStart();
  const review = await publishedCompletion();
  const literal = review.files.find((file) => file.path === literalPath);
  if (literal === undefined) throw new Error("expected literal file");
  const valid = fileFactsOf(review, literal, { line: 1, side: "new" });

  for (const { change, message } of [
    {
      change: { path: "never-in-comparison.txt" },
      message:
        "The file or comparison does not belong to this published completion.",
    },
    {
      change: { line: 9_999, side: "new" as const },
      message: "The line or side does not belong to this comparison.",
    },
    {
      change: { line: 1, side: "old" as const },
      message: "The line or side does not belong to this comparison.",
    },
  ])
    expect(await refusal(startAt({ ...valid, ...change }))).toMatchObject({
      status: 409,
      message,
    });

  expect((await startAt(valid)).kind).toBe("accepted");
  expect(received).toHaveLength(1);
});
