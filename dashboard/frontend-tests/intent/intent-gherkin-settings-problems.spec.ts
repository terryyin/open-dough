// Unreadable and malformed Intent settings stay distinct from not-configured,
// and a failed Intent locations read names its specific cause and revision so
// manual Retry shows either the absent explanation or the configured source,
// on the page's Intent body (./intent-ci-page-mount.ts,
// ../../src/IntentLocationsUnavailable.tsx).
// Companion to ../../../e2e/intent/intent-gherkin-unusable.spec.ts location-body
// explanations.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { pygardonFeatures } from "../../../Distribution/tests/support/publishedFilesTestData.mjs";
import type { IntentLocations } from "../../src/authenticatedIntentRead.ts";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import type { PublishedWork } from "../../src/publishedWork.ts";
import { unreadCiReads } from "../../test-support/component-mount/unreadPageReads.ts";
import { intentBrowser } from "./intent-browser-page.ts";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";
import { fixtureFor } from "./intent-revision-fixtures.ts";
import { intentSettingsExplanation } from "./intent-settings-explanation-page.ts";

const doughnut = makeMe.aPublishedSource
  .with({
    id: "doughnut",
    label: "Doughnut",
    repository: "odde/doughnut",
  })
  .please();
const pygardon = makeMe.aPublishedSource.pygardon.please();

// The page's Intent body showing WORK, reading Intent through READSOURCE.
async function mountReading(readSource: IntentReadSource, work: PublishedWork) {
  const page = await mountIntentCiPage({
    work,
    projects: [doughnut, pygardon],
    reads: { intent: readSource, ci: unreadCiReads },
  });
  return { showProject: page.showWork };
}

// Intent locations whose first read is unreachable, failing with CAUSE, and
// whose next answers AFTERRETRY.
function unreachableFirstLocationsRead(
  work: PublishedWork,
  afterRetry: IntentLocations,
  files: Readonly<Record<string, string>> = {},
) {
  const unreachable = makeMe.anUnreachableIntentReply
    .at(work.revision)
    .please();
  let attempts = 0;
  const readSource: IntentReadSource = {
    readLocations(source, revision) {
      expect(source.id).toBe(work.source.id);
      expect(revision).toBe(work.revision);
      attempts += 1;
      if (attempts === 1) return Promise.reject(unreachable);
      return Promise.resolve(afterRetry);
    },
    readFile(source, path, revision) {
      expect(source.id).toBe(work.source.id);
      expect(revision).toBe(work.revision);
      return Promise.resolve(fixtureFor(files, path));
    },
    readCandidates: () => Promise.resolve({ status: "absent" }),
  };
  return { readSource, cause: unreachable.message, attempts: () => attempts };
}

test("unreadable and malformed Intent settings stay distinct from not-configured", async () => {
  const unreadable = makeMe.aPublishedWork
    .of(doughnut)
    .at("a0".repeat(20))
    .please();
  const malformed = makeMe.aPublishedWork
    .of(pygardon)
    .at("b1".repeat(20))
    .please();
  const unconfigured = makeMe.aPublishedWork
    .of(doughnut)
    .at("a1".repeat(20))
    .please();
  const answers: Readonly<Record<string, IntentLocations>> = {
    [`${unreadable.source.id}@${unreadable.revision}`]:
      makeMe.anIntentLocationsAnswer.withUnreadableSettings().please(),
    [`${malformed.source.id}@${malformed.revision}`]:
      makeMe.anIntentLocationsAnswer.withMalformedSettings().please(),
    [`${unconfigured.source.id}@${unconfigured.revision}`]:
      makeMe.anIntentLocationsAnswer.notConfigured().please(),
  };
  const readSource: IntentReadSource = {
    readLocations: (source, revision) =>
      Promise.resolve(fixtureFor(answers, `${source.id}@${revision}`)),
    readFile: (...[, path]) =>
      Promise.reject(new Error(`Unexpected file read for ${path}`)),
    readCandidates: () => Promise.resolve({ status: "absent" }),
  };

  const intent = await mountReading(readSource, unreadable);
  const explanation = intentSettingsExplanation();
  await explanation.reads(
    ".planning/open-dough.json could not be read, so Intent locations for Doughnut are unavailable.",
  );
  await explanation.panelExcludes("No Intent locations are configured");
  await explanation.panelExcludes("is not valid JSON");

  await intent.showProject(malformed);
  await explanation.reads(
    ".planning/open-dough.json is not valid JSON, so Intent locations for Pygardon could not be read.",
  );
  await explanation.panelExcludes("No Intent locations are configured");
  await explanation.panelExcludes(
    "could not be read, so Intent locations for Pygardon are unavailable.",
  );

  await intent.showProject(unconfigured);
  await explanation.isAbsent();
  await explanation.panelReads(
    "No Intent locations are configured for Doughnut.",
  );
  await explanation.panelExcludes("could not be read");
  await explanation.panelExcludes("is not valid JSON");
});

test("an Intent locations read that fails names its cause, and Retry reads it again", async () => {
  const published = makeMe.aPublishedWork
    .of(doughnut)
    .at("c2".repeat(20))
    .please();
  const { readSource, cause, attempts } = unreachableFirstLocationsRead(
    published,
    makeMe.anIntentLocationsAnswer.notConfigured().please(),
  );

  await mountReading(readSource, published);
  const explanation = intentSettingsExplanation();
  await explanation.says(
    `Intent locations for Doughnut could not be read: ${cause} Retry`,
  );

  await explanation.retry();
  await explanation.isAbsent();
  await explanation.panelReads(
    "No Intent locations are configured for Doughnut.",
  );
  expect(attempts()).toBe(2);
});

test("retrying a failed Intent locations read opens the configured source at its revision", async () => {
  const published = makeMe.aPublishedWork
    .of(pygardon)
    .at("c3".repeat(20))
    .please();
  const files = makeMe.somePublishedFiles.ofPygardonFeatures
    .openingJobsWith("Recover locations")
    .please();
  const configured = makeMe.anIntentLocationsAnswer
    .locating(
      makeMe.anIntentLocation
        .at(pygardonFeatures.folder)
        .ofKind("gherkin")
        .selecting(...Object.keys(files))
        .please(),
    )
    .please();
  const { readSource, cause, attempts } = unreachableFirstLocationsRead(
    published,
    configured,
    files,
  );

  await mountReading(readSource, published);
  const explanation = intentSettingsExplanation();
  await explanation.says(
    `Intent locations for Pygardon could not be read: ${cause} Retry`,
  );

  await explanation.retry();
  await explanation.isAbsent();
  const browser = intentBrowser();
  await browser.isAt(published.revision);
  const jobsReading = await browser.open(pygardonFeatures.jobs);
  await jobsReading.shows("Scenario: Recover locations");
  await jobsReading.isAt(published.revision);
  expect(attempts()).toBe(2);
});
