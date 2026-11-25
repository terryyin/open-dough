import { expect, test, vi } from "vitest";
import { page, userEvent, type Locator } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { storyReviewIds } from "../../../Distribution/tests/support/storyReviewCompletedTestData.mjs";
import type { LaunchAttemptSource } from "../../src/launchAttempts.ts";
import type { ReviewSource } from "../../src/reviewSource.ts";
import type { StoryReview } from "../../src/storyReviewContract.ts";
import { unanswered } from "../../test-support/support/waitUntil.ts";
import { launchDialog } from "../launches/ad-hoc-launch-page.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";
import { mountStoryIntent } from "./intent-story-perspective.tsx";

const source = makeMe.aPublishedSource.openDough.please();
const title =
  "Keep the comparison follow-up beside Notes while reading a long story title";
const identity = "SEED-7#comparison-follow-up";
const taken = {
  identity: "SEED-8#still-taken",
  title: "Still implementing",
  branch: "claude/still-taken",
};
const completion = "3".repeat(40);
const widerBaseline = "4".repeat(40);
const { baseline, tree } = storyReviewIds;
const action = page.getByRole("button", {
  name: "Follow up on comparison",
  exact: true,
});
const heading = page.getByRole("heading", { name: title, exact: true });
const notes = page.getByRole("button", { name: "Notes", exact: true });
const publishedPair = `Comparison: Published completion ${baseline} → ${tree}`;
const publishedReview = () =>
  makeMe.aStoryReview
    .published(completion)
    .adding("story.txt")
    .please({
      from: widerBaseline,
      changes: makeMe.aStoryReview.adding("story.txt").adding("trunk.txt"),
    });

async function openIntent(
  review: ReviewSource["review"],
  launchSource?: LaunchAttemptSource,
) {
  const record = makeMe.aDoneRecord
    .completed({ identity, title, completedAt: "2026-11-25T00:00:00.000Z" })
    .please();
  const { done, doneReads } = makeMe.aDoneCatalog.holding([record]).please();
  const work = makeMe.aPublishedWork
    .of(source)
    .at(done.revision)
    .taking(taken)
    .please();
  const mounted = await mountStoryIntent({
    work: { ...work, done },
    identity,
    ...(launchSource === undefined ? {} : { launchSource }),
    viewport: { width: 390, height: 720 },
    reads: {
      done: doneReads,
      review: { review, fileText: unanswered, fileDiff: unanswered },
      storyNotes: () => Promise.resolve({ kind: "unreadable" }),
    },
  });
  return { ...mounted, revision: done.revision };
}

function bounds(locator: Locator) {
  return locator.element().getBoundingClientRect();
}

function expectTitleActionsBesideHeading(feedback: Locator) {
  const words = bounds(heading);
  const notesButton = bounds(notes);
  const followUpButton = bounds(action);
  const titleLine = heading.element().parentElement;
  expect(notes.element().closest(".intent-story-title-line")).toBe(titleLine);
  expect(action.element().closest(".intent-story-title-line")).toBe(titleLine);
  expect(notesButton.left).toBeGreaterThanOrEqual(words.right);
  expect(followUpButton.left).toBeGreaterThanOrEqual(notesButton.right);
  for (const control of [notesButton, followUpButton]) {
    expect(control.top).toBeGreaterThanOrEqual(words.top);
    expect(control.bottom).toBeLessThanOrEqual(words.bottom);
  }
  expect(followUpButton.right).toBeLessThanOrEqual(window.innerWidth);
  expect(bounds(feedback).top).toBeGreaterThanOrEqual(words.bottom);
}

test("the published comparison icon beside Notes opens by keyboard and regains focus on Cancel", async () => {
  await openIntent(() => Promise.resolve(publishedReview()));
  const warning = intentStoryCompare().header.getByRole("status").filter({
    hasText: "The notes could not be read.",
  });
  await expect.element(action).toBeVisible();
  await expect.element(warning).toBeVisible();
  expect(action.elements()).toHaveLength(1);
  await expect.element(action).toHaveTextContent("");
  expect(
    action.element().querySelector("svg[aria-hidden='true']"),
  ).not.toBeNull();
  expectTitleActionsBesideHeading(warning);

  notes.element().focus();
  await userEvent.keyboard("{Tab}");
  await expect.element(action).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  const form = launchDialog();
  await expect
    .element(form.dialog.getByText(`Follows up ${identity} — ${title}`))
    .toBeVisible();
  await expect.element(form.dialog.getByText(publishedPair)).toBeVisible();
  form.cancel.element().focus();
  await userEvent.keyboard("{Enter}");
  await expect.element(form.dialog).not.toBeInTheDocument();
  await expect.element(action).toHaveFocus();
});

test("comparison follow-up sends the widened pair and shows its launch feedback below the title", async () => {
  const failure = "The test host declined this start.";
  const accept = vi.fn<LaunchAttemptSource["accept"]>().mockResolvedValue({
    kind: "failed",
    explanation: failure,
  });
  const { revision } = await openIntent(
    () => Promise.resolve(publishedReview()),
    {
      accept,
      waitForChange: unanswered,
    },
  );
  const story = intentStoryCompare();
  await story.includeMerged.click();
  await expect.element(story.includeMerged).toBeChecked();
  action.element().focus();
  await userEvent.keyboard("{Space}");
  const form = launchDialog();
  await expect
    .element(
      form.dialog.getByText(
        `Comparison: Published completion ${widerBaseline} → ${tree}`,
      ),
    )
    .toBeVisible();
  await form.instruction.fill("Review the merged changes");
  await form.start.click();
  const feedback = story.header.getByText(`Launch failed: ${failure}`, {
    exact: true,
  });
  await expect.element(feedback).toBeVisible();
  expect(accept).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({
      source: source.id,
      workflow: "ad-hoc",
      instruction: "Review the merged changes",
      followUp: {
        story: {
          identity,
          revision,
          comparison: { completion, baseline: widerBaseline, tree },
        },
      },
    }),
    false,
  );
  expectTitleActionsBesideHeading(feedback);
});

test("an unreadable comparison, a Taken story and Project Intent offer no comparison follow-up", async () => {
  const unavailable = "Published objects are unavailable.";
  const intent = await openIntent(({ identity: selected }) =>
    Promise.resolve(
      selected === taken.identity
        ? makeMe.aStoryReview.adding("work.txt").please()
        : makeMe.aStoryReview.unavailable(unavailable).please(),
    ),
  );
  const story = intentStoryCompare();
  await expect.poll(story.summaryText).toContain("No comparison is available.");
  await story.openDetails();
  await expect
    .element(story.details.getByText(unavailable, { exact: false }))
    .toBeVisible();
  await expect.element(action).not.toBeInTheDocument();

  await intent.selectStory(taken.identity);
  await expect.poll(story.summaryText).toContain("1 changed file");
  await story.openDetails();
  await expect
    .element(
      story.header.getByRole("heading", {
        name: "Published story branch",
        exact: true,
      }),
    )
    .toBeVisible();
  await expect.element(action).not.toBeInTheDocument();

  await intent.selectStory(undefined);
  await expect
    .element(page.getByRole("region", { name: "Project Intent", exact: true }))
    .toBeVisible();
  await expect.element(action).not.toBeInTheDocument();
});

test("follow-up uses the visible published pair while a chosen run is reading", async () => {
  const run = makeMe.aReviewRun
    .keyed("capture-waiting-run")
    .comparing("5".repeat(40), "6".repeat(40))
    .please();
  let answerRun: ((answer: StoryReview) => void) | undefined;
  const runAnswer = new Promise<StoryReview>((resolve) => {
    answerRun = resolve;
  });
  await openIntent((query) =>
    query.run === run.key
      ? runAnswer
      : Promise.resolve({ ...publishedReview(), runs: [run] }),
  );
  const story = intentStoryCompare();
  await expect.element(action).toBeVisible();
  await story.chooseLatestLanding();
  await expect
    .element(
      story.header.getByText("The previous comparison stays visible.", {
        exact: false,
      }),
    )
    .toBeVisible();
  await action.click();
  const form = launchDialog();
  await expect.element(form.dialog.getByText(publishedPair)).toBeVisible();
  await form.cancel.click();
  answerRun?.(
    makeMe.aStoryReview.unavailable("The landed run cannot be read.").please(),
  );
  await expect
    .element(story.alert)
    .toHaveTextContent("The chosen changes could not be read.");
  await expect.element(action).not.toBeInTheDocument();
});
