// What a phone reads of a settled automatic CI repeat from its Done card,
// with no receipt journey and a dashboard that collects nothing
// (../support/ciFollowUpSettledReading.ts): both attempts and their frozen
// reference. The original's proof is ./intent-ci-follow-up-proof.spec.ts, and
// returning to the comparison ./intent-ci-follow-up-return.spec.ts.
import { attemptLink } from "../ciEvidenceLabelsPage.ts";
import { expectNoSidewaysScrollIn } from "../pageLayout.ts";
import {
  actionsRequests,
  expect,
  keepSettledRepeat,
  test,
} from "../support/ciFollowUpSettledReading.ts";
import {
  expectWholeOnPhone,
  openCiFollowUp,
  retainedCiFollowUpReading,
  shownCiFollowUpCard,
} from "../support/ciFollowUpReadingPage.ts";
import { queuedIdentity } from "../support/startOrigin.ts";

test.use({ viewport: { width: 390, height: 844 } });

const attemptUrl = (attempt: number) =>
  `https://github.com/terryyin/open-dough/actions/runs/71/attempts/${String(attempt)}`;

test("a settled request's card opens both attempts, the saved rule and the frozen reference with its excluded outlier on a phone, in keyboard order, without acquiring CI", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  // Story A's run 71 first passed in 120 s against five prior builds of 100 s
  // each, a sixth of 116 s excluded; its repeat passed in 100 s.
  const { completion } = await keepSettledRepeat(page, origin, github, {
    run: 71,
    seconds: 120,
    repeatSeconds: 100,
    averageSeconds: 100,
    excludedPrior: {
      seconds: 116,
      reason: "Slow outlier: more than 15% above the median",
    },
  });
  const before = actionsRequests(github);
  await page.goto(dashboard.baseURL);
  const card = await shownCiFollowUpCard(page, "Story A");
  await expect(card, "recovered card").toContainText(
    "CI timing returned to range",
  );
  await expect(card, "Done").toContainText("Done");
  await openCiFollowUp(card, "keyboard");
  const {
    intent,
    comparison,
    original,
    repeat,
    reference,
    referenceDisclosure,
  } = retainedCiFollowUpReading(page);
  await expect(comparison, "comparison opened").toContainText(
    "CI timing returned to range",
  );
  await expect(intent, "the story selected").toHaveAttribute(
    "data-selected-story",
    queuedIdentity,
  );
  await expect(comparison, "published landing").toContainText(
    `Published Done landing ${completion}`,
  );
  for (const [attempt, name, started, wallTime, difference] of [
    [
      original,
      "original",
      "2026-11-10T06:00:00.000Z",
      "2 min",
      "+20.0 s (+20%)",
    ],
    [repeat, "repeat", "2026-11-10T07:00:00.000Z", "1 min 40 s", "0 ms (0%)"],
  ] as const) {
    await expect(attempt, `${name}'s revision`).toContainText(completion);
    await expect(attempt, `${name}'s workflow`).toContainText(
      "Workflow ci.yml · ID 7001",
    );
    await expect(attempt, `${name}'s start`).toContainText(started);
    await expect(attempt, `${name}'s wall time`).toContainText(
      `Attempt wall time: ${wallTime}`,
    );
    await expect(attempt, `${name}'s difference`).toContainText(difference);
    await expect(attempt, `${name}'s completeness`).toContainText(
      "Complete comparable proof",
    );
  }
  await expect(comparison, "saved rule").toContainText(
    "Saved provisional rule: repeat once at or above 5%",
  );
  await expect(comparison, "prior builds used").toContainText(
    "5 prior builds used",
  );
  const evidence = reference.evidence;
  await expect(evidence.locator("p"), "evidence rows").toHaveCount(7);
  await expect(reference.included, "included builds").toHaveCount(5);
  await expect(reference.selected, "selected build").toHaveCount(1);
  await expect(reference.excluded, "excluded build").toHaveCount(1);
  const outlier = evidence.locator("p").filter({ hasText: "run/6/1" });
  await expect(outlier, "the outlier excluded").toContainText("× Excluded");
  await expect(outlier, "the outlier's reason").toContainText(
    "Slow outlier: more than 15% above the median",
  );
  await expect(
    evidence.locator("p").filter({ hasText: "run/71/1" }),
    "the selected build",
  ).toContainText("◆ Selected");
  const first = attemptLink(original, "Run 71 · attempt 1");
  await expect(first, "original's exact link").toHaveAttribute(
    "href",
    attemptUrl(1),
  );
  const second = attemptLink(repeat, "Run 71 · attempt 2");
  await expect(second, "repeat's exact link").toHaveAttribute(
    "href",
    attemptUrl(2),
  );
  await first.focus();
  await page.keyboard.press("Tab");
  await expect(second, "Tab reaches the repeat's link").toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    referenceDisclosure,
    "Tab reaches the reference disclosure",
  ).toBeFocused();
  const evidenceLinks = await evidence.getByRole("link").all();
  expect(evidenceLinks, "an evidence link for each build").toHaveLength(7);
  for (const link of evidenceLinks) {
    await page.keyboard.press("Tab");
    await expect(link, "Tab reaches each evidence link").toBeFocused();
  }
  await expectWholeOnPhone(original, "original");
  await expectWholeOnPhone(repeat, "repeat");
  await expectWholeOnPhone(evidence, "reference evidence");
  await expectNoSidewaysScrollIn(page, comparison);
  expect(actionsRequests(github), "no CI request from first render").toEqual(
    before,
  );
});
