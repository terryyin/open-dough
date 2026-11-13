import { comparisonReading } from "../../tests/intentCiComparisonPage.ts";
// Named builds, source cues and overall observed metrics use the production UI.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { CiTimeWithoutRunnerWaits } from "../../src/storyCiComparison.ts";
import { test, expect } from "../../tests/support/pageTest.ts";
import { renderComparison } from "../../tests/support/comparisonRendering.ts";
import { comparisonRenderFacts } from "../../tests/support/comparisonRenderFacts.ts";
import {
  mixedEntryFacts,
  wallComparedFacts,
} from "../../tests/support/mountedComparisonFacts.ts";
import { expectCueState } from "../../tests/support/expectCiComparisonCues.ts";
import {
  expectAncestorSourceCue,
  sourceIdentityFacts,
  expectNoRunOrAttemptIds,
} from "../../tests/support/expectCiComparisonSourceCue.ts";
import "./mountedComparisonGapCases.ts";
import "./mountedComparisonEndpointCases.ts";
import "./mountedComparisonAdapterCases.ts";
import "./mountedComparisonTakenCases.ts";
import "./mountedComparisonCancelledCases.ts";

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
    await expect(comparisonReading(panel).activeComparison).toHaveText(
      "Baseline compared with Landed",
    );
    const counts = comparisonReading(panel).overallCounts;
    await expect(counts).toHaveText(
      "2,090 → 2,092 test cases (+2); 5 → 8 test files (+3)",
    );
    await expectCueState(counts, { count: "more-strong" });
    const timing = comparisonReading(panel).overallTiming;
    if (unavailable) await expect(timing).toHaveCount(0);
    else {
      await expect(timing).toHaveText("+17 s");
      await expectCueState(timing, {
        duration: "none",
        durationReason: "below threshold",
      });
    }
    await expect(comparisonReading(panel).overallWallTime).toHaveText("+20 s");
    await expect(panel.locator(".intent-ci-comparison-metrics dt")).toHaveText(
      unavailable
        ? ["Counts", "CI wall time"]
        : ["Counts", "CI time without runner waits", "CI wall time"],
    );
    await expect(comparisonReading(panel).wallTimes).toHaveText([
      "4 min 59 s",
      "13 min 27 s",
      "5 min 19 s",
    ]);
    await expect(comparisonReading(panel).timesWithoutWaits).toHaveText([
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
  const identities = comparisonReading(panel).identities;
  const observed = await sourceIdentityFacts(identities);
  expect(observed).toHaveLength(3);
  expect(observed[0]?.text).toContain(
    "No build at ddddddd: the workflow at that revision could not be read.",
  );
  expect(observed[0]?.text).toContain("aaaaaaa");
  expect(observed[0]?.text).toContain(
    "ancestor: 2 later revisions without a build",
  );
  expect(observed.map(({ sources }) => sources)).toEqual([
    [
      {
        selection: "ancestor",
        title: "ancestor: 2 later revisions without a build",
      },
    ],
    [{ selection: "exact", title: "exact revision" }],
    [{ selection: "exact", title: "exact revision" }],
  ]);
  await expect(
    identities
      .nth(0)
      .locator('.intent-ci-comparison-source[data-selection="ancestor"]'),
  ).toBeVisible();
  for (const index of [1, 2]) {
    await expect(
      identities
        .nth(index)
        .locator('.intent-ci-comparison-source[data-selection="exact"]'),
    ).toBeVisible();
    expect(observed[index]?.text).toContain("exact revision");
  }
  expect(observed[1]?.text).toContain("bbbbbbb");
  expect(observed[2]?.text).toContain("ccccccc");
  for (const identity of observed) {
    expect(identity.rawText).not.toMatch(/run \d+/);
    expect(identity.rawText).not.toMatch(/attempt /i);
    expect(identity.rawText).not.toMatch(/before|branch|landed/);
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
    const identity = comparisonReading(panel).identities.first();
    if (visible) await expect(identity).toContainText(explanation);
    else await expect(identity).not.toContainText(explanation);
    await expectAncestorSourceCue(
      identity,
      "ancestor: 1 later revision without a build",
    );
    await expect(identity).toContainText("aaaaaaa");
    await expectNoRunOrAttemptIds(identity);
    await expect(comparisonReading(panel).wallTimes.first()).toHaveText(
      "3 min",
    );
  });
}
