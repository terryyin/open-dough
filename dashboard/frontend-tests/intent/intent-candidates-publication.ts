// A project's published features beside its Test Optimization Candidates
// record, read through one source that counts each record and file read, and
// Project Intent mounted on that source as the reader enters it on the page.
import { createElement } from "react";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { PublishedFiles } from "../../../Distribution/tests/support/publishedFilesTestData.mjs";
import type { IntentCandidatesReadResult } from "../../src/authenticatedIntentCandidatesRead.ts";
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
import { featuresOpening, fixtureFor } from "./intent-revision-fixtures.ts";

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
// `scenario` beside any further published `files`, and the answer to its
// candidates record.
export type CandidatesPublication = {
  readonly source: PublishedSource;
  readonly scenario: string;
  readonly files?: PublishedFiles;
  readonly candidates: IntentCandidatesReadResult;
};

// Each project's published features and candidates record at any revision,
// counting every record read and every file read by the revision it asked
// for.
export function projectsPublishedWithCandidates(
  publications: readonly CandidatesPublication[],
) {
  const reads: string[] = [];
  const fileReads: { path: string; revision: string }[] = [];
  const published = Object.fromEntries(
    publications.map((publication) => [
      publication.source.id,
      {
        ...publication,
        features: featuresOpening(publication.scenario, publication.files),
      },
    ]),
  );
  const of = (source: PublishedSource) => fixtureFor(published, source.id);
  const readSource: IntentReadSource = {
    readLocations: (source, ...[, signal]) =>
      of(source).features.readLocations(signal),
    readFile(source, path, revision, signal) {
      fileReads.push({ path, revision });
      return fixtureFor(of(source).features.files, path)(signal);
    },
    readCandidates(source, revision) {
      reads.push(revision);
      return Promise.resolve(of(source).candidates);
    },
  };
  return { reads, fileReads, readSource };
}

// Pygardon's published features, beside any further `files`, with `record`
// as its candidates record.
export const publishedWithCandidates = (
  record: string,
  files?: PublishedFiles,
) =>
  projectsPublishedWithCandidates([
    {
      source: makeMe.aPublishedSource.pygardon.please(),
      scenario: "List jobs",
      ...(files === undefined ? {} : { files }),
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
