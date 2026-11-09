// Compact endpoint source/absence states through the production comparison.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { test, expect } from "./pageTest.ts";
import { renderComparison } from "./comparisonRendering.ts";
import { comparisonRenderFacts } from "./comparisonRenderFacts.ts";
import {
  mixedEntryFacts,
  wallComparedFacts,
} from "./mountedComparisonFacts.ts";
import {
  expectAncestorSourceCue,
  expectExactSourceCue,
  expectNoRunOrAttemptIds,
} from "./expectCiComparisonSourceCue.ts";

test("missing Branch and Landed keep Baseline readable without fabricated zero or unrelated build", async ({
  page,
  comparisonRenderer,
}) => {
  const facts = wallComparedFacts();
  const gap = {
    kind: "none" as const,
    explanation:
      "No build at ddddddd: the workflow at that revision could not be read.",
  };
  const answer = makeMe.aStoryCiComparison
    .with({ ...facts.answer, branch: gap, landed: gap })
    .please();
  const rendered = comparisonRenderFacts(
    { ...facts, answer },
    mixedEntryFacts(),
  );
  const panel = await renderComparison(page, comparisonRenderer, rendered);
  const identities = panel.locator(".intent-ci-comparison-identity");
  await expect(identities.first()).toContainText("aaaaaaa");
  for (const index of [1, 2])
    await expect(identities.nth(index)).toHaveText(gap.explanation);
  await expect(panel.locator(".intent-ci-comparison-wall")).toHaveText([
    "3 min",
    "—",
    "—",
  ]);
  await expect(panel).not.toContainText("run 498");
  await expect(panel).not.toContainText("10 min");
});

test("failed Landed keeps its exact selected revision and Branch wall time", async ({
  page,
  comparisonRenderer,
}) => {
  const facts = wallComparedFacts();
  const answer = makeMe.aStoryCiComparison
    .with({
      ...facts.answer,
      landed: { ...facts.answer.landed, state: "failed" },
    })
    .please();
  const rendered = comparisonRenderFacts(
    { ...facts, answer },
    mixedEntryFacts(),
  );
  const panel = await renderComparison(page, comparisonRenderer, rendered);
  const identity = panel.locator(".intent-ci-comparison-identity").last();
  await expect(identity).toContainText("ccccccc");
  await expectExactSourceCue(identity);
  await expect(identity).toContainText("failed build");
  await expect(identity).not.toContainText("ddddddd");
  await expect(identity).not.toContainText("eeeeeee");
  await expectNoRunOrAttemptIds(identity);
  await expect(panel.locator(".intent-ci-comparison-wall").nth(1)).toHaveText(
    "3 min 20 s",
  );
  await expect(panel).not.toContainText("10 min");
});

test("Done Trunk Mode names Branch not applicable and an ancestor Landed build", async ({
  page,
  comparisonRenderer,
}) => {
  const facts = wallComparedFacts();
  const answer = makeMe.aStoryCiComparison
    .with({
      ...facts.answer,
      mode: "trunk",
      branch: {
        kind: "not-applicable",
        explanation: "Branch is not applicable in Trunk Mode.",
      },
      landed: {
        ...facts.answer.landed,
        selection: "ancestor",
        laterWithoutResult: 1,
      },
    })
    .please();
  const rendered = comparisonRenderFacts(
    { ...facts, answer },
    mixedEntryFacts(),
  );
  const panel = await renderComparison(page, comparisonRenderer, rendered);
  await expect(
    panel.locator(".intent-ci-comparison-identity").nth(1),
  ).toContainText("not applicable");
  const landed = panel.locator(".intent-ci-comparison-identity").last();
  await expect(landed).toContainText("ccccccc");
  await expectAncestorSourceCue(landed);
});

test("a confirmed equivalent build hides routine skip words and uses compact words without an icon", async ({
  page,
  comparisonRenderer,
}) => {
  const facts = wallComparedFacts();
  const skipped =
    "Skipped at ddddddd because CI ignores every change since its nearest built ancestor ccccccc.";
  const answer = makeMe.aStoryCiComparison
    .with({
      ...facts.answer,
      landed: {
        ...facts.answer.landed,
        selection: "equivalent",
        requestedStatus: { kind: "skipped", explanation: skipped },
      },
    })
    .please();
  const rendered = comparisonRenderFacts(
    { ...facts, answer },
    mixedEntryFacts(),
  );
  const panel = await renderComparison(page, comparisonRenderer, rendered);
  const identity = panel.locator(".intent-ci-comparison-identity").last();
  await expect(identity).toContainText("ccccccc");
  await expect(identity).toContainText("equivalent build");
  await expect(identity).not.toContainText(skipped);
  await expect(identity.locator(".intent-ci-comparison-source")).toHaveCount(0);
  await expectNoRunOrAttemptIds(identity);
});

for (const count of [1, 3]) {
  test(`cancelled Landed names its later build including ${count} later trunk revision${count === 1 ? "" : "s"}`, async ({
    page,
    comparisonRenderer,
  }) => {
    const facts = wallComparedFacts();
    const answer = makeMe.aStoryCiComparison
      .with({
        ...facts.answer,
        landed: {
          ...facts.answer.landed,
          selection: "later",
          laterWithoutResult: count,
          requestedStatus: {
            kind: "cancelled",
            explanation: "Cancelled at ddddddd.",
          },
        },
      })
      .please();
    const rendered = comparisonRenderFacts(
      { ...facts, answer },
      mixedEntryFacts(),
    );
    const panel = await renderComparison(page, comparisonRenderer, rendered);
    const identity = panel.locator(".intent-ci-comparison-identity").last();
    await expect(identity).toContainText("Cancelled at ddddddd.");
    await expect(identity).toContainText("ccccccc");
    await expect(identity).toContainText(
      `later trunk build: includes ${count} later trunk revision${count === 1 ? "" : "s"}`,
    );
    await expectNoRunOrAttemptIds(identity);
    await expect(panel.locator(".intent-ci-comparison-wall").last()).toHaveText(
      "4 min",
    );
  });
}
