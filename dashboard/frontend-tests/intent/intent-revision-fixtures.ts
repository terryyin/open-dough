import { createElement, useState } from "react";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  pygardonFeatures,
  type PublishedFiles,
} from "../../../Distribution/tests/support/publishedFilesTestData.mjs";
import type { IntentCandidatesReadResult } from "../../src/authenticatedIntentCandidatesRead.ts";
import type { IntentLocations } from "../../src/authenticatedIntentRead.ts";
import type { IntentMode } from "../../src/intentProjectTabs.ts";
import {
  IntentModeProvider,
  useIntentModeChoice,
} from "../../src/pageIntentMode.tsx";
import {
  StorySelectionProvider,
  usePageStorySelection,
} from "../../src/pageStorySelection.tsx";
import {
  IntentReadSourceOnPage,
  type IntentReadSource,
} from "../../src/intentReadSource.ts";
import { ProjectIntentReading } from "../../src/ProjectIntentReading.tsx";
import { IntentReadingProvider } from "../../src/pageIntentReading.tsx";
import type { PublishedSource } from "../../src/publishedSource.ts";
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
    readCandidates: () => Promise.resolve({ status: "absent" }),
  };
  return mountIntentReading(readSource, revision, "ci");
}

// Project Intent on the reader's chosen view, which it keeps across
// rerenders with newly published work.
function ChosenView({
  work,
  initial,
}: {
  readonly work: PublishedWork;
  readonly initial: IntentMode;
}) {
  const [mode, setMode] = useState(initial);
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
  const workAt = (observed: string) =>
    makeMe.aPublishedWork.ofPygardon.at(observed).please();
  const reading = (work: PublishedWork, shown: boolean) =>
    createElement(
      IntentReadSourceOnPage,
      { value: readSource },
      createElement(IntentReadingProvider, {
        project: work.source.id,
        children: shown && createElement(ChosenView, { work, initial: mode }),
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

// Project Intent on the view the page keeps for its project and selected
// story, as the page offers it when the reader enters Intent.
function PageChosenView({ work }: { readonly work: PublishedWork }) {
  return createElement(ProjectIntentReading, {
    source: work.source,
    work,
    project: useIntentModeChoice(work.source.id),
    projectShown: true,
  });
}

function PageIntent({ work }: { readonly work: PublishedWork }) {
  return createElement(StorySelectionProvider, {
    selection: usePageStorySelection(),
    children: createElement(IntentModeProvider, {
      project: work.source.id,
      children: createElement(IntentReadingProvider, {
        project: work.source.id,
        children: createElement(PageChosenView, { work }),
      }),
    }),
  });
}

// A project's published source, its features opening its jobs feature with
// `scenario`, and the answer to its candidates record.
export type CandidatesPublication = {
  readonly source: PublishedSource;
  readonly scenario: string;
  readonly candidates: IntentCandidatesReadResult;
};

// Each project's published features and candidates record at any revision,
// counting every record read by the revision it asked for.
export function projectsPublishedWithCandidates(
  publications: readonly CandidatesPublication[],
) {
  const reads: string[] = [];
  const published = Object.fromEntries(
    publications.map((publication) => [
      publication.source.id,
      { ...publication, features: featuresOpening(publication.scenario) },
    ]),
  );
  const of = (source: PublishedSource) => fixtureFor(published, source.id);
  const readSource: IntentReadSource = {
    readLocations: (source, ...[, signal]) =>
      of(source).features.readLocations(signal),
    readFile: (source, path, ...[, signal]) =>
      fixtureFor(of(source).features.files, path)(signal),
    readCandidates(source, revision) {
      reads.push(revision);
      return Promise.resolve(of(source).candidates);
    },
  };
  return { reads, readSource };
}

// Pygardon's published features with `record` as its candidates record.
export const publishedWithCandidates = (record: string) =>
  projectsPublishedWithCandidates([
    {
      source: makeMe.aPublishedSource.pygardon.please(),
      scenario: "List jobs",
      candidates: { status: "present", text: record },
    },
  ]);

// Mounts Project Intent for `work` as the reader enters it on the page,
// reading through `readSource`. `showProject` switches the page to another
// project's published work.
export async function mountPageIntentReading(
  readSource: IntentReadSource,
  work: PublishedWork,
) {
  const reading = (shown: PublishedWork) =>
    createElement(
      IntentReadSourceOnPage,
      { value: readSource },
      createElement(PageIntent, { work: shown }),
    );
  const intent = await mountComponent(reading(work), {
    viewport: { width: 1280, height: 900 },
    fillsViewport: true,
  });
  return {
    showProject: (shown: PublishedWork) => {
      intent.rerender(reading(shown));
    },
  };
}
