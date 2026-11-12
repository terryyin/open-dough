import { attemptLink } from "../ciEvidenceLabelsPage.ts";
import { backToStory, projectIntentLink } from "../intentModePage.ts";
import { selectStory } from "../storyCardSelection.ts";
// Real collection first, then a fresh reader process and the card-to-Intent route.
import { expect, test } from "../support/preparationPage.ts";
import {
  followUpSettings,
  prepareRepeatScenario,
} from "../support/ciFollowUpScenario.ts";
import {
  recheckingLandedCi,
  restartAsLandedCiReader,
} from "../support/landedCiHistory.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { publishIntentTrunk } from "../support/intentStoryWorktree.ts";
import { chooseStoryTab } from "../support/intentStoryPage.ts";
import {
  ciFollowUpCard,
  expectOriginalProofNavigation,
  openCiFollowUp,
  retainedCiFollowUpReading,
} from "../support/ciFollowUpReadingPage.ts";
import { expectNoSidewaysScrollIn } from "../pageLayout.ts";

test.use({ serverMode: "boundary", extraEnv: recheckingLandedCi });

test("the completed card opens both collected attempts and their frozen reference without acquiring CI, including first render, revisit and reload on a phone", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  publishIntentTrunk(origin.project);
  const scenario = await prepareRepeatScenario(
    origin,
    github,
    120,
    [100, 100, 100, 100, 100, 116],
  );
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: scenario.story.completion,
    repository: "terryyin/open-dough",
    follows: true,
    realHistory: true,
  });
  scenario.serve();
  // The landing starts asynchronous collection. Observe its actual rerun
  // submission before asserting; this callback returns immediately and holds
  // no producer or teardown resource.
  let notifySubmission: (() => void) | undefined;
  const submissionReached = new Promise<void>((resolve) => {
    notifySubmission = resolve;
  });
  scenario.holdSubmission(() => {
    notifySubmission?.();
    return Promise.resolve();
  });
  await followUpSettings(dashboard, true);
  await scenario.ingest(dashboard);
  await submissionReached;
  expect(scenario.repeatCalls).toHaveLength(1);
  scenario.setRepeat({ seconds: 100 });
  await expect
    .poll(() => followUpSettings(dashboard))
    .toMatchObject({
      body: {
        cards: [
          {
            kind: "recovered",
            originalMs: 120000,
            repeatMs: 100000,
            averageMs: 100000,
          },
        ],
      },
    });
  await followUpSettings(dashboard, false);
  const reader = await restartAsLandedCiReader(dashboard, origin, "preview");
  try {
    const ciCalls = () =>
      github.calls.filter(({ request }) => request.kind.startsWith("actions-"));
    const before = ciCalls().length;
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(reader.baseURL);
    const card = ciFollowUpCard(page, "Story A");
    const {
      intent,
      development,
      intentChoice,
      comparison,
      original,
      repeat,
      reference,
      referenceDisclosure,
      refresh,
    } = retainedCiFollowUpReading(page);
    await expect(card).toContainText("CI timing returned to range");
    await expect(card).toContainText("Done");
    await openCiFollowUp(card, "keyboard");
    await expect(comparison).toContainText("CI timing returned to range");
    await expect(intent).toHaveAttribute(
      "data-selected-story",
      scenario.identity,
    );
    await expect(comparison).toContainText(scenario.story.completion);
    await expect(comparison).toContainText("Workflow ci.yml · ID 7001");
    await expect(original).toContainText(scenario.story.completion);
    await expect(repeat).toContainText(scenario.story.completion);
    await expect(original).toContainText("Workflow ci.yml · ID 7001");
    await expect(repeat).toContainText("Workflow ci.yml · ID 7001");
    await expect(original).toContainText("2026-11-10T06:00:00.000Z");
    await expect(repeat).toContainText("2026-11-10T07:00:00.000Z");
    await expect(original).toContainText("Attempt wall time: 2 min");
    await expect(original).toContainText("+20.0 s (+20%)");
    await expect(repeat).toContainText("Attempt wall time: 1 min 40 s");
    await expect(repeat).toContainText("0 ms (0%)");
    await expect(original).toContainText("Complete comparable proof");
    await expect(repeat).toContainText("Complete comparable proof");
    await expect(comparison).toContainText(
      "Saved provisional rule: repeat once at or above 5%",
    );
    await expect(comparison).toContainText("5 prior builds used");
    const evidence = reference.evidence;
    await expect(evidence.locator("p")).toHaveCount(7);
    await expect(evidence).toContainText("✓ Included");
    await expect(evidence).toContainText("◆ Selected");
    await expect(evidence).toContainText("× Excluded");
    await expect(evidence).toContainText(
      "Slow outlier: more than 15% above the median",
    );
    await expect(evidence).toContainText("run/6/1");
    await expect(evidence).toContainText("run/71/1");
    const first = attemptLink(original, "Run 71 · attempt 1");
    await expect(first).toHaveAttribute(
      "href",
      "https://github.com/terryyin/open-dough/actions/runs/71/attempts/1",
    );
    const second = attemptLink(repeat, "Run 71 · attempt 2");
    await expect(second).toHaveAttribute(
      "href",
      "https://github.com/terryyin/open-dough/actions/runs/71/attempts/2",
    );
    await first.focus();
    await page.keyboard.press("Tab");
    await expect(second).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(referenceDisclosure).toBeFocused();
    for (const link of await evidence.getByRole("link").all()) {
      await page.keyboard.press("Tab");
      await expect(link).toBeFocused();
    }
    await expectNoSidewaysScrollIn(page, comparison);
    expect(ciCalls()).toHaveLength(before);
    await expectOriginalProofNavigation(page, {
      location: "dashboard/tests",
      file: "dashboard/tests/a.spec.ts",
      originalAttempt: "Run 71 · attempt 1",
      repeatAttempt: "Run 71 · attempt 2",
      originalUrl:
        "https://github.com/terryyin/open-dough/actions/runs/71/attempts/1",
      passedCases: "2092 passed test cases",
      absentFraming: "story branch of",
    });
    expect(ciCalls()).toHaveLength(before);
    await refresh.click();
    await expect(comparison).toContainText("Saved prior-build reference");
    await page.reload();
    await expect(comparison).toContainText("CI timing returned to range");
    expect(ciCalls()).toHaveLength(before);
    await chooseStoryTab(intent, "Changed tests");
    await page.goBack();
    await expect(card).toContainText("CI timing returned to range");
    await openCiFollowUp(card, "pointer");
    await expect(comparison).toContainText("2 min");
    expect(ciCalls()).toHaveLength(before);
    expect(scenario.repeatCalls).toEqual([71]);
    // An explicit new selection in Development yields to normal Intent.
    await page.setViewportSize({ width: 1440, height: 900 });
    await development.check();
    await selectStory(
      page.getByRole("article", { name: "Story B", exact: true }),
    ).click();
    await expect
      .poll(() => new URL(page.url()).searchParams.get("followUp"))
      .toBeNull();
    await expect(development).toBeChecked();
    await intentChoice.check();
    await expect(intent).toHaveAttribute("data-selected-story", "SEED-B#b");
    await expect(comparison).toHaveCount(0);
    await development.check();
    await openCiFollowUp(card, "pointer");
    await expect(comparison).toBeVisible();
    await projectIntentLink(intent).click();
    await expect(backToStory(intent)).toBeVisible();
    await expect(comparison).toHaveCount(0);
  } finally {
    await reader.close();
  }
});
