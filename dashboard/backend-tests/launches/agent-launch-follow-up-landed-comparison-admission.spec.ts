// Start admits a Done story's whole selected comparison only when it is the
// exact pair of that story's retained or published landing, or of its
// published completion, before acceptance reaches the host.
import { expect, test } from "vitest";
import { otherStory } from "../../test-support/support/followUpStories.ts";
import {
  aDoneStoryStart,
  storyA,
  type DoneStoryStart,
} from "../support/doneStoryStart.ts";

const notOnRun = "The file or comparison does not belong to this captured run.";

for (const { landing, landed } of [
  {
    landing: "retained",
    landed: ({ retainedLanding, keep }: DoneStoryStart) => {
      const run = retainedLanding(storyA);
      keep(run);
      return Promise.resolve(run.reference);
    },
  },
  {
    landing: "published",
    landed: ({ publishLanding }: DoneStoryStart) => publishLanding(),
  },
]) {
  test(`a whole follow-up admits the exact pair of a ${landing} landing`, async () => {
    const doneStory = await aDoneStoryStart();
    const { baseline, tree, received, start } = doneStory;
    const reference = await landed(doneStory);

    const accepted = await start({ reference, baseline, tree });

    expect(accepted.kind, JSON.stringify(accepted)).toBe("accepted");
    expect(received).toHaveLength(1);
    expect(received[0]?.input).toContain(
      `- Comparison: Landed run ${baseline} → ${tree}`,
    );
  });
}

test("a mismatched baseline or tree and another story's reference are refused before acceptance", async () => {
  const {
    baseline,
    tree,
    received,
    start,
    refusal,
    retainedLanding,
    keep,
    revision,
  } = await aDoneStoryStart();
  const own = retainedLanding(storyA);
  const foreign = retainedLanding(otherStory);
  keep(own, foreign);
  const valid = { reference: own.reference, baseline, tree };

  for (const { comparison, status, message } of [
    {
      comparison: { ...valid, baseline: revision("implementation") },
      status: 409,
      message: notOnRun,
    },
    {
      comparison: { ...valid, tree: baseline },
      status: 409,
      message: notOnRun,
    },
    {
      comparison: { ...valid, reference: foreign.reference },
      status: 404,
      message: "This story has no landed run with that reference.",
    },
  ])
    expect(await refusal(start(comparison))).toMatchObject({ status, message });

  expect((await start(valid)).kind).toBe("accepted");
  expect(received).toHaveLength(1);
});

test("a published whole-story comparison refuses a different tree before acceptance", async () => {
  const { tree, received, start, refusal, publishedCompletion } =
    await aDoneStoryStart();
  const review = await publishedCompletion();
  const valid = {
    completion: tree,
    baseline: review.baseline,
    tree: review.tree,
  };

  expect(await refusal(start({ ...valid, tree }))).toMatchObject({
    status: 409,
    message: "The comparison does not belong to this published completion.",
  });

  expect((await start(valid)).kind).toBe("accepted");
  expect(received).toHaveLength(1);
});
