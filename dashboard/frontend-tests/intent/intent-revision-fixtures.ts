import { createElement, useLayoutEffect, useState } from "react";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  pygardonFeatures,
  type PublishedFiles,
} from "../../../Distribution/tests/support/publishedFilesTestData.mjs";
import type { IntentLocations } from "../../src/authenticatedIntentRead.ts";
import type { IntentMode } from "../../src/intentProjectTabs.ts";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import { PageReadsOnPage } from "../../src/pageReads.tsx";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import { ProjectIntentReading } from "../../src/ProjectIntentReading.tsx";
import { IntentReadingProvider } from "../../src/pageIntentReading.tsx";
import type { PublishedWork } from "../../src/publishedWork.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";

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

// Project Intent on the reader's chosen view, which it keeps across
// rerenders with newly published work.
function ChosenView({
  work,
  initial,
  onOfferCommitted,
}: {
  readonly work: PublishedWork;
  readonly initial: IntentMode;
  readonly onOfferCommitted: (() => void) | undefined;
}) {
  const [mode, setMode] = useState(initial);
  useLayoutEffect(() => {
    onOfferCommitted?.();
  }, [onOfferCommitted]);
  return createElement(ProjectIntentReading, {
    source: work.source,
    work,
    project: { mode, modeIdPrefix: "project-intent", onModeChange: setMode },
    projectShown: true,
  });
}

// Mounts Project Intent at `revision`, reading through `readSource` and
// starting on `mode`. The reader's chosen view survives each newly offered
// revision, as on the page.
export async function mountIntentReading(
  readSource: IntentReadSource,
  revision: string,
  mode: IntentMode,
) {
  const source = makeMe.aPublishedSource.pygardon.please();
  const workAt = (observed: string) =>
    makeMe.aPublishedWork.of(source).at(observed).please();
  const reading = (
    work: PublishedWork,
    shown: boolean,
    onOfferCommitted?: () => void,
  ) =>
    createElement(
      PageReadsOnPage,
      { reads: pageReadsSupplying({ intent: readSource }) },
      createElement(IntentReadingProvider, {
        project: work.source.id,
        children:
          shown &&
          createElement(ChosenView, {
            work,
            initial: mode,
            onOfferCommitted,
          }),
      }),
    );
  const intent = await mountComponent(reading(workAt(revision), true), {
    viewport: { width: 1280, height: 600 },
    fillsViewport: true,
  });
  return {
    offerRevision: (observed: string) => {
      const committed = new Promise<void>((resolve) => {
        intent.rerender(reading(workAt(observed), true, resolve));
      });
      return { committed };
    },
    closeReading: (observed: string) => {
      intent.rerender(reading(workAt(observed), false));
    },
    showProject: (work: PublishedWork) => {
      intent.rerender(reading(work, true));
    },
  };
}
