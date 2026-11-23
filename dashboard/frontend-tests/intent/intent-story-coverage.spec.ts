import { createElement } from "react";
import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { IntentStoryCoverage } from "../../src/IntentStoryCoverage.tsx";
import type { DoneRecordReadSource } from "../../src/doneRecordReadSource.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";
import {
  inertCiReads,
  openDoughSource,
  unconfiguredIntentReads,
} from "./intent-ci-status-fixtures.ts";
import { heldReply } from "./intent-ci-evidence-page.tsx";
import { intentStoryCompare } from "./intent-story-compare-page.ts";

const coverage = page.getByRole("region", {
  name: "Intent coverage",
  exact: true,
});
const noAssessment = "No Intent Coverage assessment was saved for this story.";
const unknown =
  "This done story could not be read, so whether it saved an Intent Coverage assessment is not known.";

type CoverageRecord = Pick<
  ReturnType<typeof makeMe.aDoneRecord.please>,
  "identity" | "title" | "completedAt" | "intentCoverage"
>;

async function showDoneCoverage(record: CoverageRecord) {
  await mountComponent(
    createElement(IntentStoryCoverage, {
      story: {
        identity: record.identity,
        title: record.title,
        completed: true,
        record: { state: "read", story: record },
      },
    }),
  );
  await expect
    .element(coverage.getByRole("heading", { name: "Intent coverage" }))
    .toBeVisible();
}

async function showsReport(report: string) {
  await expect.element(coverage.getByText(report)).toBeVisible();
  expect(
    coverage.element().querySelector(".intent-story-coverage-text")
      ?.textContent,
  ).toBe(report);
}

test("Intent shows an Insufficient evidence report with its reason and unavailable cost", async () => {
  const report =
    "Outcome: Insufficient evidence\n" +
    "Evidence: No maintained assertion checks the new wrap-up guidance.\n\n" +
    "Test runtime: unavailable (no test ran)\n" +
    "Human effort: unavailable (no human intervention observed)\n" +
    "Agent effort: 1 min (estimated from the work log)\n" +
    "Invocation-to-report elapsed: 67 s (measured by the host clock)\n";
  await showDoneCoverage(
    makeMe.aDoneRecord.withIntentCoverage({ report }).please(),
  );
  await showsReport(report);
});

test("Intent shows Unavailable and the reason when completion has no assessment report", async () => {
  const unavailable = "The check was interrupted before producing a report.";
  await showDoneCoverage(
    makeMe.aDoneRecord.withIntentCoverage({ unavailable }).please(),
  );
  await expect
    .element(coverage.getByText("Unavailable", { exact: true }))
    .toBeVisible();
  await expect
    .element(coverage.getByText(unavailable, { exact: true }))
    .toBeVisible();
});

test("Intent says an older completion read without an assessment saved none", async () => {
  await showDoneCoverage(makeMe.aDoneRecord.please());
  expect(
    [...coverage.element().querySelectorAll("p")].map((p) =>
      p.textContent.trim(),
    ),
  ).toEqual([noAssessment]);
});

test("Intent coverage waits for the done record, then distinguishes a failed read from absence and recovers on Retry", async () => {
  const report = "Outcome: Caught\nEvidence: The retried read shows it.\n";
  const record = makeMe.aDoneRecord
    .completed({ completedAt: new Date().toISOString() })
    .withIntentCoverage({ report })
    .please();
  const { done, doneReads } = makeMe.aDoneCatalog.holding([record]).please();
  const work = makeMe.aPublishedWork
    .with({
      ...makeMe.aPublishedWork.of(openDoughSource).at(done.revision).please(),
      done,
    })
    .please();
  const held =
    heldReply<Awaited<ReturnType<DoneRecordReadSource["readBodies"]>>>();
  const readBodies = vi
    .fn(doneReads.readBodies)
    .mockImplementationOnce(doneReads.readBodies)
    .mockImplementationOnce(() => held.promise);
  const bodyRequests = () =>
    readBodies.mock.calls.map(([source, revision, files]) => ({
      source,
      revision,
      files,
    }));
  const expectedRead = {
    source: openDoughSource,
    revision: done.revision,
    files: done.records.map(({ fileName }) => fileName),
  };
  const dashboard = await mountIntentCiPage({
    work,
    initialPerspective: "development",
    reads: {
      ci: inertCiReads(),
      intent: unconfiguredIntentReads,
      done: { readBodies },
    },
  });
  await dashboard.selectStory(record.identity, record.title);
  await intentStoryCompare().chooseTab("Intent coverage");
  await expect
    .element(coverage.getByRole("status"))
    .toHaveTextContent("Reading done story…");
  expect(bodyRequests()).toEqual([expectedRead, expectedRead]);

  held.reject(new Error("Done body request failed"));
  await expect
    .element(coverage.getByText(unknown, { exact: true }))
    .toBeVisible();
  await expect
    .element(coverage.getByText("Done stories could not be read."))
    .toBeVisible();
  await expect
    .element(coverage.getByText(noAssessment))
    .not.toBeInTheDocument();
  await expect
    .element(coverage.getByText("Unavailable", { exact: true }))
    .not.toBeInTheDocument();

  await coverage.getByRole("button", { name: "Retry done story" }).click();
  await showsReport(report);
  expect(bodyRequests()).toEqual([expectedRead, expectedRead, expectedRead]);
  await expect.element(coverage.getByText(unknown)).not.toBeInTheDocument();
});
