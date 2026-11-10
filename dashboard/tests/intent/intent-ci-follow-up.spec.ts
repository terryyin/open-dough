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
import { expectOriginalProofNavigation } from "../support/ciFollowUpReadingPage.ts";
import { expectNoSidewaysScrollIn } from "../pageLayout.ts";

test.use({ extraEnv: recheckingLandedCi });

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
  await followUpSettings(dashboard, true);
  await scenario.ingest(dashboard);
  await expect.poll(() => scenario.repeatCalls.length).toBe(1);
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
    const card = page.getByRole("article", { name: "Story A", exact: true });
    await expect(card).toContainText("CI timing returned to range");
    await expect(card).toContainText("Done");
    const route = card.getByRole("link", {
      name: "Review original, repeat and saved reference",
    });
    await route.focus();
    await page.keyboard.press("Enter");
    const comparison = page.getByRole("region", {
      name: "Retained CI follow-up comparison",
    });
    await expect(comparison).toContainText("CI timing returned to range");
    await expect(
      page.getByRole("main", { name: "Intent", exact: true }),
    ).toHaveAttribute("data-selected-story", scenario.identity);
    await expect(comparison).toContainText(scenario.story.completion);
    await expect(comparison).toContainText("Workflow ci.yml · ID 7001");
    const original = comparison.getByRole("region", {
      name: "Original CI attempt",
    });
    const repeat = comparison.getByRole("region", {
      name: "Repeat CI attempt",
    });
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
    const evidence = comparison.getByRole("group", {
      name: "Prior-build reference evidence",
    });
    await expect(evidence.locator("p")).toHaveCount(7);
    await expect(evidence).toContainText("✓ Included");
    await expect(evidence).toContainText("◆ Selected");
    await expect(evidence).toContainText("× Excluded");
    await expect(evidence).toContainText(
      "Slow outlier: more than 15% above the median",
    );
    await expect(evidence).toContainText("run/6/1");
    await expect(evidence).toContainText("run/71/1");
    const first = original.getByRole("link", { name: "Run 71 · attempt 1" });
    await expect(first).toHaveAttribute(
      "href",
      "https://github.com/terryyin/open-dough/actions/runs/71/attempts/1",
    );
    const second = repeat.getByRole("link", { name: "Run 71 · attempt 2" });
    await expect(second).toHaveAttribute(
      "href",
      "https://github.com/terryyin/open-dough/actions/runs/71/attempts/2",
    );
    await first.focus();
    await page.keyboard.press("Tab");
    await expect(second).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(comparison.locator("summary")).toBeFocused();
    for (const link of await evidence.getByRole("link").all()) {
      await page.keyboard.press("Tab");
      await expect(link).toBeFocused();
    }
    await expectNoSidewaysScrollIn(page, comparison);
    expect(ciCalls()).toHaveLength(before);
    await expectOriginalProofNavigation(page);
    expect(ciCalls()).toHaveLength(before);
    await page
      .getByRole("button", { name: "Refresh retained follow-up" })
      .click();
    await expect(comparison).toContainText("Saved prior-build reference");
    await page.reload();
    await expect(comparison).toContainText("CI timing returned to range");
    expect(ciCalls()).toHaveLength(before);
    await chooseStoryTab(
      page.getByRole("main", { name: "Intent", exact: true }),
      "Changed tests",
    );
    await page.goBack();
    await expect(card).toContainText("CI timing returned to range");
    await card
      .getByRole("link", {
        name: "Review original, repeat and saved reference",
      })
      .click();
    await expect(comparison).toContainText("2 min");
    expect(ciCalls()).toHaveLength(before);
    expect(scenario.repeatCalls).toEqual([71]);
    // An explicit new selection in Development yields to normal Intent.
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.getByRole("radio", { name: "Development", exact: true }).check();
    await page
      .getByRole("article", { name: "Story B", exact: true })
      .getByRole("button", { name: "Select story", exact: true })
      .click();
    await expect
      .poll(() => new URL(page.url()).searchParams.get("followUp"))
      .toBeNull();
    await expect(
      page.getByRole("radio", { name: "Development", exact: true }),
    ).toBeChecked();
    await page.getByRole("radio", { name: "Intent", exact: true }).check();
    await expect(
      page.getByRole("main", { name: "Intent", exact: true }),
    ).toHaveAttribute("data-selected-story", "SEED-B#b");
    await expect(comparison).toHaveCount(0);
    await page.getByRole("radio", { name: "Development", exact: true }).check();
    await card
      .getByRole("link", {
        name: "Review original, repeat and saved reference",
      })
      .click();
    await expect(comparison).toBeVisible();
    await page
      .getByRole("button", { name: "Project Intent", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Back to selected story", exact: true }),
    ).toBeVisible();
    await expect(comparison).toHaveCount(0);
  } finally {
    await reader.close();
  }
});
