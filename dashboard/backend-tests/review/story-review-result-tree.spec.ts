// A story result's answer from its admitted tree. Which tree a named Done,
// Taken or landed comparison admits is ./story-review-result-admission.spec.ts;
// literal Git tree reads are ./story-review-published-taken.spec.ts and
// ../intent/authenticated-read-project-browse.spec.ts.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { agentSettingsPath } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { resultAnswer } from "../../server/storyReviewResultAnswer.ts";

test("each Intent location the result declares answers only the files it selects", async () => {
  const tree = makeMe.aStoryResultTree
    .declaringTypeScriptAt("first")
    .withFile("guides/guide.txt")
    .please();

  expect(await resultAnswer(tree)).toMatchObject({
    kind: "inventory",
    revision: tree.revision,
    locations: [{ path: "first", files: ["first/first.spec.ts"] }],
  });
});

test("a tree without Intent settings lists its files without locations", async () => {
  const tree = makeMe.aStoryResultTree.withFile("guide.txt").please();

  expect(await resultAnswer(tree)).toEqual({
    kind: "inventory",
    revision: tree.revision,
    paths: ["guide.txt"],
    locations: null,
  });
});

for (const [problem, settings] of [
  ["malformed", makeMe.aStoryResultTree.withIntentSettings("{")],
  ["unreadable", makeMe.aStoryResultTree.withUnreadableIntentSettings()],
] as const) {
  test(`a result keeps its inventory when Intent settings are ${problem}`, async () => {
    const tree = settings.withFile("guide.txt").please();

    expect(await resultAnswer(tree)).toMatchObject({
      paths: [agentSettingsPath, "guide.txt"],
      locations: null,
      settingsProblem: problem,
    });
  });
}

test("a path reads as its text, absence or unavailability at the result's revision", async () => {
  const tree = makeMe.aStoryResultTree
    .withFile("guide.txt", "captured text\n")
    .withUnreadableFile("image")
    .please();
  const { revision } = tree;

  expect(await resultAnswer(tree, "guide.txt")).toEqual({
    kind: "text",
    revision,
    path: "guide.txt",
    text: "captured text\n",
  });
  expect(await resultAnswer(tree, "*.txt")).toEqual({
    kind: "absent",
    revision,
    path: "*.txt",
  });
  expect(await resultAnswer(tree, "image")).toMatchObject({
    kind: "unavailable",
    revision,
    path: "image",
  });
});

test("a tree Git cannot list leaves the result unavailable", async () => {
  const tree = makeMe.aStoryResultTree
    .thatCannotBeListed("bad tree object")
    .please();

  expect(await resultAnswer(tree)).toEqual({
    kind: "unavailable",
    revision: tree.revision,
    explanation: "The result tree could not be listed: bad tree object",
  });
});
