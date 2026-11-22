// A Done story whose worktree is retired chooses in Intent's Compare, through
// Review changes' own selection, between its published completion and one of
// its captured landed runs. Its Intent locations and the CI comparison's
// landed endpoint stay on the story's landed result whatever is chosen.
// Explicit service answers own the Git judgment.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import { prepareFrontendDoneIntent } from "../../test-support/support/frontendIntentDoneStory.ts";
import { selectDoneStoryForCiComparison } from "../../test-support/support/selectDoneStoryForCiComparison.ts";
import {
  chooseStoryTab,
  intentStory,
} from "../../test-support/support/intentStoryPage.ts";
import { comparisonReading } from "../../test-support/intentCiComparisonPage.ts";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

const oid = (digit: string) => digit.repeat(40);
const older = makeMe.aReviewRun
  .keyed("capture-older-run")
  .launchedAt("2026-01-01T10:00:00.000Z")
  .comparing(oid("1"), oid("2"))
  .please();
const newer = makeMe.aReviewRun
  .keyed("capture-newer-run")
  .launchedAt("2026-01-02T12:00:00.000Z")
  .comparing(oid("3"), oid("4"))
  .please();
const runs = [newer, older];
const landedOn = (run: typeof older, name: string) =>
  makeMe.aStoryReview.landed().adding(`${name}.txt`).onRun(run, runs).please();

test("a Done story opens on its published completion, chooses a captured landed run and returns, while its locations and landed CI endpoint stay put", async ({
  page,
  frontendServices,
}) => {
  const setup = await prepareFrontendDoneIntent(page, frontendServices);
  setup.review.answerHistoricalSnapshot(setup.identity, {
    ...setup.review.snapshot(),
    runs,
  });
  setup.review.answerRunSnapshot(older.key, landedOn(older, "older"));
  setup.review.answerRunSnapshot(newer.key, landedOn(newer, "newer"));
  const locationRevisions: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      url.pathname === authenticatedReadEndpoint &&
      url.searchParams.get("intent") === "locations"
    )
      locationRevisions.push(url.searchParams.get("revision") ?? "");
  });
  const { intent, panel } = await selectDoneStoryForCiComparison(page);
  const landedEndpoint = comparisonReading(panel).identities.nth(2);
  const landedText = await landedEndpoint.textContent();
  const story = intentStory(intent);
  const compare = story.compare();
  await chooseStoryTab(intent, "Changes");

  await test.step("it opens on Published completion, naming the completion revision, without a run choice", async () => {
    await expect(compare.choice("Published completion")).toBeChecked();
    await expect(compare.choice("All changes")).toHaveCount(0);
    await expect(compare.choice("Commits")).toHaveCount(0);
    await expect(compare.run).toHaveCount(0);
    await story.headerDetail();
    await expect(story.header.revisions).toContainText(
      setup.completion.slice(0, 7),
    );
  });

  await test.step("Landed runs and the older run list its changes and name its tree", async () => {
    await compare.choose("Landed runs");
    await expect(compare.run).toHaveValue(newer.key);
    await expect(story.outside).toContainText("newer.txt");
    await compare.chooseRun(older.key);
    await expect(compare.run).toHaveValue(older.key);
    await expect(story.outside).toContainText("older.txt");
    await expect(story.header.revisions).toContainText(oid("2").slice(0, 7));
  });

  await test.step("its locations and the CI comparison's landed endpoint stay at the landed result", async () => {
    expect(new Set(locationRevisions)).toEqual(new Set([setup.completion]));
    await chooseStoryTab(intent, "CI comparison");
    await expect(landedEndpoint).toHaveText(landedText ?? "");
    await chooseStoryTab(intent, "Changes");
  });

  await test.step("Published completion again returns to it", async () => {
    await compare.choose("Published completion");
    await expect(compare.run).toHaveCount(0);
    await expect(story.header.revisions).toContainText(
      setup.completion.slice(0, 7),
    );
  });
});

test("a newer default run moves an unchosen run but not a chosen one while the old run is still listed", async ({
  page,
  frontendServices,
}) => {
  const setup = await prepareFrontendDoneIntent(page, frontendServices);
  setup.review.answerHistoricalSnapshot(
    setup.identity,
    landedOn(older, "older"),
  );
  setup.review.answerRunSnapshot(older.key, landedOn(older, "older"));
  setup.review.answerRunSnapshot(newer.key, landedOn(newer, "newer"));
  const { intent } = await selectDoneStoryForCiComparison(page);
  // Each default answer's landed tree is its own, so only the run chosen is
  // observed here.
  const compare = intentStory(intent).compare();
  await chooseStoryTab(intent, "Changes");
  await expect(compare.choice("Landed runs")).toBeChecked();
  await expect(compare.run).toHaveValue(older.key);

  await test.step("a later default naming the newer run moves Intent to it when no run was chosen", async () => {
    setup.review.answerHistoricalSnapshot(
      setup.identity,
      landedOn(newer, "newer"),
    );
    await compare.refresh();
    await expect(compare.run).toHaveValue(newer.key);
  });

  await test.step("after choosing the older run, a newer default keeps it", async () => {
    await compare.chooseRun(older.key);
    await expect(compare.run).toHaveValue(older.key);
    const asked = setup.review.asked().length;
    await compare.refresh();
    await expect.poll(() => setup.review.asked().length).toBeGreaterThan(asked);
    await expect(compare.run).toHaveValue(older.key);
  });
});
