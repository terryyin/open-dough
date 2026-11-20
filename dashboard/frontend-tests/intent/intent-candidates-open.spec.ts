// Opening a recorded location from an Optimization Candidates entry reads
// that file at the shown revision into CI status's Purpose with the file
// selected and its folders opened; choosing Optimization Candidates again
// returns the keyboard to that entry without rereading the record, its other
// links still there (SEED-192 examples 1, 2 and 8; ../../src/IntentCandidatesRecord.tsx).
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { pygardonFeatures } from "../../../Distribution/tests/support/publishedFilesTestData.mjs";
import type { PublishedWork } from "../../src/publishedWork.ts";
import { intentBrowser } from "./intent-browser-page.ts";
import { intentCandidates, intentViewTab } from "./intent-candidates-page.ts";
import { intentFileReading } from "./intent-file-reading-page.ts";
import {
  mountPageIntentReading,
  publishedWithCandidates,
} from "./intent-candidates-publication.ts";

const revision = "5c".repeat(20);
const work: PublishedWork = makeMe.aPublishedWork.ofPygardon
  .at(revision)
  .please();
const at = (path: string) => `${pygardonFeatures.folder}/${path}`;
const poles = at("launch/second_server.feature");
const family = [
  at("watch/attention.feature"),
  at("watch/watcher.feature"),
  at("watch/watcher_updates.feature"),
  at("watch/watcher_failures.feature"),
] as const;
const landed = at("review/boundary/landed_runs.feature");
const featureOf = (path: string) =>
  `Feature: ${path}\n  Scenario: Read ${path}\n    Then it is read\n`;
const files = Object.fromEntries(
  [poles, ...family, landed].map((path) => [path, featureOf(path)]),
);
const quoted = (...paths: readonly string[]) =>
  paths.map((path) => `\`${path}\``).join(", ");
const fields = (evidence: string) => ({
  observedCost: "about 40s",
  uniqueProtection: "the journey stays protected",
  alternativesAttempted: "none",
  dispositionRationale: "accepted necessary cost — retain the path.",
  date: "2026-10-30",
  evidence,
});
const record = makeMe.aTestOptimizationCandidatesRecord
  .accepted(
    "agent-launch-poles",
    quoted(poles),
    fields(`Intent file [second-server journey](../${poles})`),
  )
  .accepted("long-integrated-journeys", quoted(...family), fields("triage"))
  .accepted("landed-runs-tail", quoted(landed), fields("triage"))
  .please();

test("a recorded location opens its file read at the shown revision in Purpose, selected in its opened folders, and returning focuses the entry without rereading", async () => {
  const { reads, fileReads, readSource } = publishedWithCandidates(
    record,
    files,
  );
  await mountPageIntentReading(readSource, work);
  const candidates = await (
    await intentCandidates().choose()
  ).isRecordedAt(revision);
  await candidates.shows("agent-launch-poles");

  const opened = await candidates.openSource("agent-launch-poles", poles);
  await (await opened.shows(`Scenario: Read ${poles}`)).isSelected();
  await opened.isAt(revision);
  expect(fileReads).toContainEqual({ path: poles, revision });
  await expect
    .element(intentViewTab("CI status"))
    .toHaveAttribute("aria-selected", "true");
  await expect.element(candidates.record).not.toBeInTheDocument();

  await candidates.choose();
  await expect.element(candidates.entry("agent-launch-poles")).toHaveFocus();
  expect(reads, "returning reads the record once").toEqual([revision]);

  const [attention, watcher, ...watcherRest] = family;
  await (
    await candidates.openSource("long-integrated-journeys", watcher)
  ).shows(`Scenario: Read ${watcher}`);
  expect(fileReads).toContainEqual({ path: watcher, revision });
  await candidates.choose();
  for (const other of [attention, ...watcherRest])
    await expect
      .element(candidates.sourceLink("long-integrated-journeys", other))
      .toBeVisible();

  await (
    await (
      await candidates.openSource("landed-runs-tail", landed)
    ).shows(`Scenario: Read ${landed}`)
  ).isSelected();
  await (
    await intentBrowser().showsFolderExpanded(pygardonFeatures.folder)
  ).showsFolderExpanded("review/boundary");

  await candidates.choose();
  await userEvent.click(
    candidates.entry("agent-launch-poles").getByRole("button", {
      name: /second-server journey/i,
    }),
  );
  await (
    await intentFileReading(poles).shows(`Scenario: Read ${poles}`)
  ).isSelected();
  expect(reads, "every return keeps the one record read").toEqual([revision]);
});
