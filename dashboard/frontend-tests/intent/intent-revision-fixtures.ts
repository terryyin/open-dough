import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  pygardonFeatures,
  type PublishedFiles,
} from "../../../Distribution/tests/support/publishedFilesTestData.mjs";
import type { IntentLocations } from "../../src/authenticatedIntentRead.ts";
import type { IntentMode } from "../../src/intentProjectTabs.ts";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import type { PublishedWork } from "../../src/publishedWork.ts";
import { unreadCiReads } from "../../test-support/component-mount/unreadPageReads.ts";
import { intentCandidates } from "./intent-candidates-page.ts";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";

type Read<T> = (signal: AbortSignal) => Promise<T>;

export type FeaturePublication = {
  readonly readLocations: Read<IntentLocations>;
  readonly files: Readonly<Record<string, Read<string>>>;
};

export function publishedFeatures(
  files: PublishedFiles,
  folder: string = pygardonFeatures.folder,
): FeaturePublication {
  const locations: IntentLocations = {
    status: "configured",
    locations: [
      makeMe.anIntentLocation
        .at(folder)
        .ofKind("gherkin")
        .selecting(...Object.keys(files))
        .please(),
    ],
  };
  return {
    readLocations: () => Promise.resolve(locations),
    files: readsOf(files),
  };
}

// Each of `files` read as published.
export const readsOf = (files: PublishedFiles): FeaturePublication["files"] =>
  Object.fromEntries(
    Object.entries(files).map(([path, text]) => [
      path,
      () => Promise.resolve(text),
    ]),
  );

export const featuresOpening = (scenario: string, files?: PublishedFiles) =>
  publishedFeatures({
    ...makeMe.somePublishedFiles.ofPygardonFeatures
      .openingJobsWith(scenario)
      .please(),
    ...files,
  });

export function fixtureFor<T>(
  fixtures: Readonly<Record<string, T>>,
  key: string,
): T {
  const fixture = fixtures[key];
  if (fixture === undefined) throw new Error(`No published fixture for ${key}`);
  return fixture;
}

// Intent reads answering LOCATIONS and each of FILES, with no Candidates record.
export const intentReadsPublishing = (
  locations: IntentLocations,
  files: Readonly<Record<string, string>>,
): IntentReadSource => ({
  readLocations: () => Promise.resolve(locations),
  readFile: (...[, path]) => Promise.resolve(fixtureFor(files, path)),
  readCandidates: () => Promise.resolve({ status: "absent" }),
});

export async function mountProjectIntent(
  revision: string,
  publications: Readonly<Record<string, FeaturePublication>>,
) {
  const readSource: IntentReadSource = {
    readLocations(...[, requestedRevision, signal]) {
      return fixtureFor(publications, requestedRevision).readLocations(signal);
    },
    readFile(...[, path, requestedRevision, signal]) {
      const publication = fixtureFor(publications, requestedRevision);
      return fixtureFor(publication.files, path)(signal);
    },
    readCandidates: () => Promise.resolve({ status: "absent" }),
  };
  return mountIntentReading(readSource, revision, "ci");
}

// Mounts the page's production Intent body on Pygardon's work at `revision`,
// reading through `readSource`, on CI status or, through its tab, on
// Optimization Candidates. Each operation returns once the page committed
// the view it asks for.
export async function mountIntentReading(
  readSource: IntentReadSource,
  revision: string,
  view: IntentMode,
) {
  const source = makeMe.aPublishedSource.pygardon.please();
  const workAt = (observed: string) =>
    makeMe.aPublishedWork.of(source).at(observed).please();
  const intent = await mountIntentCiPage({
    work: workAt(revision),
    viewport: { width: 1280, height: 600 },
    reads: { intent: readSource, ci: unreadCiReads },
  });
  if (view === "candidates") await intentCandidates().choose();
  let reading = true;
  return {
    // The page observes `observed`, and the reader is back on Intent.
    async offerRevision(observed: string) {
      await intent.showWork(workAt(observed));
      if (!reading) await intent.showIntent();
      reading = true;
    },
    // The reader leaves Intent for Development, where the page then
    // observes `observed`.
    async closeReading(observed: string) {
      await intent.showDevelopment();
      reading = false;
      await intent.showWork(workAt(observed));
    },
    showProject: (work: PublishedWork) => intent.showWork(work),
  };
}
