import { createElement } from "react";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  pygardonFeatures,
  type PublishedFiles,
} from "../../../Distribution/tests/support/publishedFilesTestData.mjs";
import type { IntentLocations } from "../../src/authenticatedIntentRead.ts";
import {
  IntentReadSourceOnPage,
  type IntentReadSource,
} from "../../src/intentReadSource.ts";
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
    files: Object.fromEntries(
      Object.entries(files).map(([path, text]) => [
        path,
        () => Promise.resolve(text),
      ]),
    ),
  };
}

export const featuresOpening = (scenario: string) =>
  publishedFeatures(
    makeMe.somePublishedFiles.ofPygardonFeatures
      .openingJobsWith(scenario)
      .please(),
  );

function fixtureFor<T>(fixtures: Readonly<Record<string, T>>, key: string): T {
  const fixture = fixtures[key];
  if (fixture === undefined) throw new Error(`No published fixture for ${key}`);
  return fixture;
}

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
  };
  const workAt = (observed: string) =>
    makeMe.aPublishedWork.ofPygardon.at(observed).please();
  const reading = (work: PublishedWork, shown: boolean) =>
    createElement(
      IntentReadSourceOnPage,
      { value: readSource },
      createElement(IntentReadingProvider, {
        project: work.source.id,
        children:
          shown &&
          createElement(ProjectIntentReading, {
            source: work.source,
            work,
            project: {
              mode: "ci",
              modeIdPrefix: "project-intent",
              onModeChange() {},
            },
            projectShown: true,
          }),
      }),
    );
  const intent = await mountComponent(reading(workAt(revision), true), {
    viewport: { width: 1280, height: 600 },
    fillsViewport: true,
  });
  return {
    offerRevision: (observed: string) => {
      intent.rerender(reading(workAt(observed), true));
    },
    closeReading: (observed: string) => {
      intent.rerender(reading(workAt(observed), false));
    },
    showProject: (work: PublishedWork) => {
      intent.rerender(reading(work, true));
    },
  };
}
