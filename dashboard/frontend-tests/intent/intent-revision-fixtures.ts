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
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";

type Read<T> = (signal: AbortSignal) => Promise<T>;

export type FeaturePublication = {
  readonly readLocations: Read<IntentLocations>;
  readonly files: Readonly<Record<string, Read<string>>>;
};

export function publishedFeatures(files: PublishedFiles): FeaturePublication {
  const locations: IntentLocations = {
    status: "configured",
    locations: [
      makeMe.anIntentLocation
        .at(pygardonFeatures.folder)
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

export function featureRead(publication: FeaturePublication, path: string) {
  return fixtureFor(publication.files, path);
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
      return featureRead(
        fixtureFor(publications, requestedRevision),
        path,
      )(signal);
    },
  };
  const readingAt = (observed: string) => {
    const work = makeMe.aPublishedWork.ofPygardon.at(observed).please();
    return createElement(
      IntentReadSourceOnPage,
      { value: readSource },
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
    );
  };
  const intent = await mountComponent(readingAt(revision), {
    viewport: { width: 1280, height: 600 },
    fillsViewport: true,
  });
  return {
    offerRevision: (observed: string) => {
      intent.rerender(readingAt(observed));
    },
  };
}
