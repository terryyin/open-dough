// Real Summary gap rendering with canonical prepared endpoint and proof answers.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { test, expect } from "../support/pageTest.ts";
import { renderComparison } from "../support/comparisonRendering.ts";
import { comparisonRenderFacts } from "../support/comparisonRenderFacts.ts";
import { summaryScopeFacts } from "../support/comparisonScopeFacts.ts";
import {
  comparisonLabels,
  expectLeadingEvidenceLabels,
  expectEvidenceLabels,
  expectLabelInFull,
  expectNoComparisonFraming,
  expectObservedNotAttributed,
} from "../ciEvidenceLabelsPage.ts";
import { expectComparisonScopeRows } from "../intentScopeProofPage.ts";
import {
  noBreakdownEntryRows,
  runningLandedEntryRows,
  trunkEntryRows,
} from "../support/summaryComparisonGapExpectedRows.ts";
import { takenTrunkComparison } from "../support/comparisonMountSelections.ts";
import { entryComparisonRows } from "../support/summaryComparisonExpectedRows.ts";

test("Summary keeps entry totals and explains every child when Baseline lacks file breakdown", async ({
  page,
  comparisonRenderer,
}) => {
  const facts = summaryScopeFacts();
  const baseline = [
    makeMe.aCiProofEntry
      .at("dashboard/tests")
      .counting(4)
      .timed(12_040)
      .please(),
    makeMe.aCiProofEntry.at("tests").counting(2, "file").timed(2_500).please(),
  ];
  const rendered = comparisonRenderFacts(facts, [
    baseline,
    ...facts.entries.slice(1),
  ]);
  await renderComparison(page, comparisonRenderer, rendered);
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  await expectObservedNotAttributed(summary);
  await expectComparisonScopeRows(
    summary,
    "dashboard/tests",
    noBreakdownEntryRows,
  );
});

test("Summary retains Branch figures and explicit running Landed gaps in every row", async ({
  page,
  comparisonRenderer,
}) => {
  const facts = summaryScopeFacts();
  const answer = makeMe.aStoryCiComparison
    .with({
      ...facts.answer,
      landed: { ...facts.answer.landed, kind: "running" },
    })
    .please();
  const rendered = comparisonRenderFacts({ ...facts, answer }, facts.entries);
  await renderComparison(page, comparisonRenderer, rendered);
  await expectComparisonScopeRows(
    page.getByRole("region", { name: "Summary", exact: true }),
    "dashboard/tests",
    runningLandedEntryRows,
  );
});

test("a done Trunk Summary names Branch not applicable and preserves each Landed difference", async ({
  page,
  comparisonRenderer,
}) => {
  const facts = summaryScopeFacts();
  const answer = makeMe.aStoryCiComparison
    .with({
      ...facts.answer,
      mode: "trunk",
      branch: {
        kind: "not-applicable",
        explanation:
          "Branch comparison is not applicable for a Trunk Mode story.",
      },
      landed: {
        ...facts.answer.landed,
        selection: "ancestor",
        laterWithoutResult: 1,
        requestedStatus: {
          kind: "no-build",
          explanation:
            "No build at completion: the workflow at that revision could not be read.",
        },
      },
    })
    .please();
  const rendered = comparisonRenderFacts({ ...facts, answer }, facts.entries);
  await renderComparison(page, comparisonRenderer, rendered);
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  await expectLeadingEvidenceLabels(comparisonLabels(summary, facts.identity), [
    "Baseline No build aaaaaaa",
    "Branch Not applicable",
    "Landed No build ccccccc",
  ]);
  await expectComparisonScopeRows(summary, "dashboard/tests", trunkEntryRows);
});

test("a queued selection renders no previous Summary comparison or Baseline column", async ({
  page,
  comparisonRenderer,
}) => {
  const facts = summaryScopeFacts();
  const rendered = comparisonRenderFacts(facts, facts.entries);
  await renderComparison(page, comparisonRenderer, rendered);
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  await expectComparisonScopeRows(
    summary,
    "dashboard/tests",
    entryComparisonRows,
  );
  const identity = "SEED-B#b";
  const work = makeMe.aPublishedWork
    .with({
      ...facts.work,
      backlog: [
        {
          identity,
          title: "Story B",
          canonical: {
            kind: "external",
            recorded: "https://example.test/b",
            url: "https://example.test/b",
          },
        },
      ],
    })
    .please();
  await renderComparison(page, comparisonRenderer, {
    ...rendered,
    identity,
    work,
  });
  await expectNoComparisonFraming(summary);
  await expect(comparisonLabels(summary, facts.identity)).toHaveCount(0);
  await expect(
    summary.getByRole("columnheader", { name: "Baseline" }),
  ).toHaveCount(0);
  await expect(summary).not.toContainText(facts.identity);
});

test("a Taken Story Branch Summary labels its provisional comparison and not-yet-landed endpoint", async ({
  page,
  comparisonRenderer,
}) => {
  const facts = summaryScopeFacts();
  const taken = takenTrunkComparison(facts);
  const assigned = taken.work.taken[0];
  if (assigned?.owner?.status !== "recorded")
    throw new Error("A recorded Taken assignment is required");
  const work = makeMe.aPublishedWork
    .with({
      ...taken.work,
      taken: [
        {
          ...assigned,
          owner: {
            ...assigned.owner,
            assignments: assigned.owner.assignments.map((owner) => ({
              ...owner,
              mode: "story-branch",
              branch: "feature/a",
            })),
          },
        },
      ],
    })
    .please();
  const answer = makeMe.aStoryCiComparison
    .with({
      ...facts.answer,
      phase: "taken",
      landed: {
        kind: "not-landed",
        explanation: "The story has not landed yet.",
      },
    })
    .please();
  const rendered = comparisonRenderFacts(
    { ...facts, work, answer },
    facts.entries,
  );
  await renderComparison(page, comparisonRenderer, rendered);
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  const labels = comparisonLabels(summary, "Story A");
  await expectEvidenceLabels(labels, [
    "Provisional",
    "Baseline No build aaaaaaa",
    "Branch bbbbbbb",
    "Landed Not landed yet",
  ]);
  await expectLabelInFull(
    labels,
    "Landed Not landed yet",
    /has not landed yet/,
  );
  await expectObservedNotAttributed(summary);
  await expect(
    summary.getByRole("table", {
      name: "CI proof of the immediate folders and files of dashboard/tests",
    }),
  ).toBeVisible();
});
