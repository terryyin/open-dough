// Named builds, source cues and overall observed metrics use the production UI.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { CiTimeWithoutRunnerWaits } from "../../src/storyCiComparison.ts";
import { test, expect } from "../support/pageTest.ts";
import { renderComparison } from "../support/comparisonRendering.ts";
import { comparisonRenderFacts } from "../support/comparisonRenderFacts.ts";
import {
  mixedEntryFacts,
  wallComparedFacts,
} from "../support/mountedComparisonFacts.ts";
import { expectCueState } from "../support/expectCiComparisonCues.ts";
import {
  expectAncestorSourceCue,
  expectExactSourceCue,
  expectNoRunOrAttemptIds,
} from "../support/expectCiComparisonSourceCue.ts";
import "../support/mountedComparisonGapCases.ts";
import "../support/mountedComparisonEndpointCases.ts";
import "../support/mountedComparisonAdapterCases.ts";
import "../support/mountedComparisonTakenCases.ts";
import "../support/mountedComparisonCancelledCases.ts";

for (const unavailable of [false, true]) {
  test(`overall metrics preserve observed counts, whole seconds and ${unavailable ? "unavailable" : "measured"} execution time`, async ({
    page,
    comparisonRenderer,
  }) => {
    const facts = wallComparedFacts();
    const timed = (
      slot: typeof facts.answer.baseline,
      wallMs: number,
      timing: CiTimeWithoutRunnerWaits,
    ) => ({
      ...slot,
      completedAt: new Date(
        Date.parse("2026-11-09T00:00:00Z") + wallMs,
      ).toISOString(),
      timeWithoutRunnerWaits: timing,
    });
    const answer = makeMe.aStoryCiComparison
      .with({
        ...facts.answer,
        baseline: timed(facts.answer.baseline, 299_000, {
          milliseconds: 295_000,
        }),
        branch: timed(facts.answer.branch, 807_000, { milliseconds: 287_000 }),
        landed: timed(
          facts.answer.landed,
          319_000,
          unavailable
            ? { reason: "The build's attempt jobs could not be read." }
            : { milliseconds: 312_000 },
        ),
      })
      .please();
    const rendered = comparisonRenderFacts(
      { ...facts, answer },
      mixedEntryFacts(),
    );
    const panel = await renderComparison(page, comparisonRenderer, rendered);
    await expect(panel.getByRole("heading")).toHaveText([
      /^Baseline compared with /,
      "CI entry timing comparison",
    ]);
    await expect(panel).toContainText(
      "Observed builds; differences are not attributed to the story",
    );
    await expect(panel.locator(".intent-ci-comparison-active")).toHaveText(
      "Baseline compared with Landed",
    );
    const counts = panel.locator(".intent-ci-comparison-overall-counts");
    await expect(counts).toHaveText(
      "2,090 → 2,092 test cases (+2); 5 → 8 test files (+3)",
    );
    await expectCueState(counts, { count: "more-strong" });
    const timing = panel.locator(".intent-ci-comparison-overall-timing");
    if (unavailable) await expect(timing).toHaveCount(0);
    else {
      await expect(timing).toHaveText("+17 s");
      await expectCueState(timing, {
        duration: "none",
        durationReason: "below threshold",
      });
    }
    await expect(
      panel.locator(".intent-ci-comparison-overall-wall"),
    ).toHaveText("+20 s");
    await expect(panel.locator(".intent-ci-comparison-metrics dt")).toHaveText(
      unavailable
        ? ["Counts", "CI wall time"]
        : ["Counts", "CI time without runner waits", "CI wall time"],
    );
    await expect(panel.locator(".intent-ci-comparison-wall")).toHaveText([
      "4 min 59 s",
      "13 min 27 s",
      "5 min 19 s",
    ]);
    await expect(
      panel.locator(".intent-ci-comparison-without-waits"),
    ).toHaveText([
      "4 min 55 s",
      "4 min 47 s",
      unavailable
        ? "Unavailable. The build's attempt jobs could not be read."
        : "5 min 12 s",
    ]);
    await expect(panel).not.toContainText("Entry comparison is not yet shown.");
    await expect(panel).not.toContainText(
      "merge resolutions whose story changes cannot be attributed safely",
    );
    await expect(panel).not.toContainText(
      "merge resolutions affecting this story's files whose changes cannot be attributed safely",
    );
  });
}

test("exact and ancestor source icons retain accessible and hover wording without subjects or run identities", async ({
  page,
  comparisonRenderer,
}) => {
  const facts = wallComparedFacts();
  const answer = makeMe.aStoryCiComparison
    .with({
      ...facts.answer,
      baseline: {
        ...facts.answer.baseline,
        selection: "ancestor",
        laterWithoutResult: 2,
        requestedStatus: {
          kind: "no-build",
          explanation:
            "No build at ddddddd: the workflow at that revision could not be read.",
        },
      },
    })
    .please();
  const rendered = comparisonRenderFacts(
    { ...facts, answer },
    mixedEntryFacts(),
  );
  const panel = await renderComparison(page, comparisonRenderer, rendered);
  const identities = panel.locator(".intent-ci-comparison-identity");
  const baseline = identities.nth(0);
  await expect(baseline).toContainText(
    "No build at ddddddd: the workflow at that revision could not be read.",
  );
  await expect(baseline).toContainText("aaaaaaa");
  await expectAncestorSourceCue(
    baseline,
    "ancestor: 2 later revisions without a build",
  );
  await expect(
    baseline.locator(".intent-ci-comparison-source"),
  ).toHaveAttribute("title", "ancestor: 2 later revisions without a build");
  for (const index of [1, 2]) {
    await expectExactSourceCue(identities.nth(index));
    await expect(
      identities.nth(index).locator(".intent-ci-comparison-source"),
    ).toHaveAttribute("title", "exact revision");
  }
  await expect(identities.nth(1)).toContainText("bbbbbbb");
  await expect(identities.nth(2)).toContainText("ccccccc");
  for (const identity of await identities.all()) {
    await expectNoRunOrAttemptIds(identity);
    await expect(identity).not.toContainText(/before|branch|landed/);
  }
  await expect(
    panel.getByRole("columnheader", { name: "CI wall time", exact: true }),
  ).toBeVisible();
  await expect(
    panel.getByRole("columnheader", {
      name: "CI time without runner waits",
      exact: true,
    }),
  ).toBeVisible();
});

for (const [kind, explanation, visible] of [
  [
    "skipped",
    "Skipped at ddddddd because CI ignores every change since its nearest built ancestor aaaaaaa.",
    false,
  ],
  ["cancelled", "Cancelled at ddddddd.", true],
] as const) {
  test(`${kind} requested status keeps the ancestor source with its intentional visibility`, async ({
    page,
    comparisonRenderer,
  }) => {
    const facts = wallComparedFacts();
    const answer = makeMe.aStoryCiComparison
      .with({
        ...facts.answer,
        baseline: {
          ...facts.answer.baseline,
          selection: "ancestor",
          laterWithoutResult: 1,
          requestedStatus: { kind, explanation },
        },
      })
      .please();
    const rendered = comparisonRenderFacts(
      { ...facts, answer },
      mixedEntryFacts(),
    );
    const panel = await renderComparison(page, comparisonRenderer, rendered);
    const identity = panel.locator(".intent-ci-comparison-identity").first();
    if (visible) await expect(identity).toContainText(explanation);
    else await expect(identity).not.toContainText(explanation);
    await expectAncestorSourceCue(
      identity,
      "ancestor: 1 later revision without a build",
    );
    await expect(identity).toContainText("aaaaaaa");
    await expectNoRunOrAttemptIds(identity);
    await expect(
      panel.locator(".intent-ci-comparison-wall").first(),
    ).toHaveText("3 min");
  });
}
