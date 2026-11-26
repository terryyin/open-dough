import { onTestFinished, vi } from "vitest";
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
  // The project tree, when the case answers it rather than the locations.
  readonly readTree?: Read<readonly string[]>;
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

// A read held until `release()`, then answering as `answer` does. The test's
// end releases it, so no read stays pending past the case.
export function heldAnswer<T>(answer: Read<T>) {
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  onTestFinished(release);
  const read = vi.fn(async (signal: AbortSignal) => {
    await held;
    return answer(signal);
  });
  return { read, release };
}

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
): IntentReadSource =>
  makeMe.anIntentReadSource
    .reading({
      readLocations: () => Promise.resolve(locations),
      readFile: (...[, path]) => Promise.resolve(fixtureFor(files, path)),
      readCandidates: () => Promise.resolve({ status: "absent" }),
    })
    .please();

export async function mountProjectIntent(
  revision: string,
  publications: Readonly<Record<string, FeaturePublication>>,
) {
  const readSource: IntentReadSource = makeMe.anIntentReadSource
    .reading({
      ...treeReads(publications),
      readLocations(...[, requestedRevision, signal]) {
        return fixtureFor(publications, requestedRevision).readLocations(
          signal,
        );
      },
      readFile(...[, path, requestedRevision, signal]) {
        const publication = fixtureFor(publications, requestedRevision);
        return fixtureFor(publication.files, path)(signal);
      },
      readCandidates: () => Promise.resolve({ status: "absent" }),
    })
    .please();
  return mountIntentReading(readSource, revision, "ci");
}

// The project tree read of each publication answering its own, if any have.
function treeReads(
  publications: Readonly<Record<string, FeaturePublication>>,
): Partial<Pick<IntentReadSource, "readProjectTree">> {
  if (Object.values(publications).every((p) => p.readTree === undefined))
    return {};
  return {
    readProjectTree(...[, requestedRevision, signal]) {
      const publication = fixtureFor(publications, requestedRevision);
      return (
        publication.readTree ??
        (() => Promise.resolve(Object.keys(publication.files)))
      )(signal);
    },
  };
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
