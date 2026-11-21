// Unreadable and malformed Intent settings stay distinct from not-configured,
// and a failed Intent locations read names its specific cause and revision so
// manual Retry shows either the absent explanation or the configured source
// (../../src/ProjectIntentReading.tsx, ../../src/IntentLocationsUnavailable.tsx).
// Companion to ../../../e2e/intent/intent-gherkin-unusable.spec.ts location-body
// explanations.
import { createElement } from "react";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { pygardonFeatures } from "../../../Distribution/tests/support/publishedFilesTestData.mjs";
import {
  requestIntentLocationsAt,
  type IntentLocations,
} from "../../src/authenticatedIntentRead.ts";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import { PageReadsOnPage } from "../../src/pageReads.tsx";
import { ProjectIntentReading } from "../../src/ProjectIntentReading.tsx";
import type { PublishedWork } from "../../src/publishedWork.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import { intentBrowser } from "./intent-browser-page.ts";
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

async function mountReading(
  readSource: IntentReadSource,
  initial: PublishedWork,
) {
  const render = (work: PublishedWork) =>
    createElement(
      PageReadsOnPage,
      { reads: pageReadsSupplying({ intent: readSource }) },
      createElement(ProjectIntentReading, {
        source: work.source,
        work,
        project: {
          mode: "ci",
          modeIdPrefix: "project-intent",
          onModeChange: () => undefined,
        },
        projectShown: true,
      }),
    );
  const mounted = await mountComponent(render(initial), {
    viewport: { width: 1280, height: 600 },
    fillsViewport: true,
  });
  return {
    showProject(work: PublishedWork) {
      mounted.rerender(render(work));
    },
  };
}

function unreachableFirstLocationsRead(
  work: PublishedWork,
  afterRetry: IntentLocations,
  files: Readonly<Record<string, string>> = {},
) {
  const realFetch = globalThis.fetch.bind(globalThis);
  vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    if (url.includes(authenticatedReadEndpoint)) {
      return Promise.reject(new TypeError("Failed to fetch"));
    }
    return realFetch(input, init);
  });
  onTestFinished(() => {
    vi.restoreAllMocks();
  });
  let attempts = 0;
  const readSource: IntentReadSource = {
    readLocations(source, revision, signal) {
      expect(source.id).toBe(work.source.id);
      expect(revision).toBe(work.revision);
      attempts += 1;
      if (attempts === 1) {
        return requestIntentLocationsAt(source, revision, signal);
      }
      return Promise.resolve(afterRetry);
    },
    readFile(source, path, revision) {
      expect(source.id).toBe(work.source.id);
      expect(revision).toBe(work.revision);
      return Promise.resolve(fixtureFor(files, path));
    },
    readCandidates: () => Promise.resolve({ status: "absent" }),
  };
  return { readSource, attempts: () => attempts };
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
  await explanation.panelExcludes("No intent locations are configured");
  await explanation.panelExcludes("is not valid JSON");

  intent.showProject(malformed);
  await explanation.reads(
    ".planning/open-dough.json is not valid JSON, so Intent locations for Pygardon could not be read.",
  );
  await explanation.panelExcludes("No intent locations are configured");
  await explanation.panelExcludes(
    "could not be read, so Intent locations for Pygardon are unavailable.",
  );

  intent.showProject(unconfigured);
  await explanation.isAbsent();
  await explanation.panelReads(
    "No intent locations are configured for Doughnut.",
  );
  await explanation.panelExcludes("could not be read");
  await explanation.panelExcludes("is not valid JSON");
});

test("an Intent locations read that fails names its cause, and Retry reads it again", async () => {
  const published = makeMe.aPublishedWork
    .of(doughnut)
    .at("c2".repeat(20))
    .please();
  const { readSource, attempts } = unreachableFirstLocationsRead(
    published,
    makeMe.anIntentLocationsAnswer.notConfigured().please(),
  );

  await mountReading(readSource, published);
  const explanation = intentSettingsExplanation();
  await explanation.says(
    `Intent locations for Doughnut could not be read: The local authenticated read could not be reached while reading .planning/open-dough.json at ${published.revision}. Retry`,
  );

  await explanation.retry();
  await explanation.isAbsent();
  await explanation.panelReads(
    "No intent locations are configured for Doughnut.",
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
  const { readSource, attempts } = unreachableFirstLocationsRead(
    published,
    configured,
    files,
  );

  await mountReading(readSource, published);
  const explanation = intentSettingsExplanation();
  await explanation.says(
    `Intent locations for Pygardon could not be read: The local authenticated read could not be reached while reading .planning/open-dough.json at ${published.revision}. Retry`,
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
