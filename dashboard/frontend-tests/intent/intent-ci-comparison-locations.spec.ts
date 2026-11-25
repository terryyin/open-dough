// A selected Done story's CI comparison does not wait for the story's
// historical Intent locations read: it is the story's default view under its
// one header while that read is held, and stays, without reading the
// comparison again, once it settles; beside a failed locations read, Changed
// tests explains the failure with its Retry, which reads the completion
// revision again.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { IntentLocations } from "../../src/authenticatedIntentRead.ts";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import { ReadProblem } from "../../src/readProblem.ts";
import { ciReadsOf, heldReply } from "./intent-ci-evidence-page.tsx";
import { shownComparison } from "./intent-ci-comparison-page.ts";
import { mountDoneStory } from "./intent-done-story-page.tsx";

const readingLocations = "Reading the story's historical Intent locations…";
const landed = ["Baseline compared with Landed"];
const locations: IntentLocations = {
  status: "configured",
  locations: [
    makeMe.anIntentLocation
      .at("dashboard/tests")
      .ofKind("typescript")
      .selecting("dashboard/tests/a.spec.ts")
      .please(),
  ],
};

// Each locations revision read, every read held until the case answers it.
function heldLocations() {
  const revisions: string[] = [];
  const replies: ReturnType<typeof heldReply<IntentLocations>>[] = [];
  const reads: IntentReadSource = {
    readLocations: (...[, revision]) => {
      revisions.push(revision);
      const reply = heldReply<IntentLocations>();
      replies.push(reply);
      return reply.promise;
    },
    readFile: () => Promise.resolve(""),
    readCandidates: () => Promise.resolve({ status: "absent" }),
  };
  return { reads, revisions, replies };
}

async function doneStoryWithHeldLocations(completion: string) {
  const story = makeMe.aComparedStory.please();
  const held = heldLocations();
  const ci = ciReadsOf(story);
  const done = await mountDoneStory(story, completion, held.reads, ci.source);
  await expect.poll(() => held.revisions).toEqual([completion]);
  await expect
    .element(done.tab("CI comparison"))
    .toHaveAttribute("aria-selected", "true");
  const comparison = await shownComparison();
  await expect.poll(() => comparison.activeComparison()).toEqual(landed);
  return { done, held, ci, comparison, walls: comparison.wallTimes() };
}

test("a selected story's CI comparison shows under its one header while the Intent locations read is held, and stays without reading it again once it settles", async () => {
  const { done, held, ci, comparison, walls } =
    await doneStoryWithHeldLocations("1".repeat(40));
  await expect.element(done.title).toHaveTextContent("Story A");
  expect(done.headers.elements()).toHaveLength(1);
  expect(walls).not.toEqual([]);

  await expect
    .element(done.home.getByText(readingLocations, { exact: true }))
    .toBeVisible();
  expect(ci.asked.comparisons).toHaveLength(1);
  held.replies[0]?.resolve(locations);
  await expect
    .element(done.home.getByText(readingLocations, { exact: true }))
    .not.toBeInTheDocument();
  await done.tab("CI comparison").click();
  await expect.poll(() => comparison.activeComparison()).toEqual(landed);
  expect(comparison.wallTimes()).toEqual(walls);
  expect(ci.asked.comparisons).toHaveLength(1);
});

test("a failed Intent locations read leaves the story's CI comparison shown alongside an explanation of the failure, and Retry reads the completion revision", async () => {
  const completion = "2".repeat(40);
  const { done, held, comparison, walls } =
    await doneStoryWithHeldLocations(completion);
  held.replies[0]?.reject(
    new ReadProblem("locations read failed", undefined, "transient"),
  );

  await expect
    .poll(() => done.failure.element().textContent)
    .toBe(
      "Intent locations for Example at the story's landed revision 2222222 could not be read: locations read failed Retry",
    );
  await expect.element(done.retry).toBeVisible();

  await done.tab("CI comparison").click();
  await expect.poll(() => comparison.activeComparison()).toEqual(landed);
  expect(comparison.wallTimes()).toEqual(walls);

  await done.retry.click();
  await expect.poll(() => held.revisions).toEqual([completion, completion]);
  held.replies[1]?.resolve(locations);
  await expect.element(done.failure).not.toBeInTheDocument();
  await expect
    .element(done.home.getByText(readingLocations, { exact: true }))
    .not.toBeInTheDocument();
});
