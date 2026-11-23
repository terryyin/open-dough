// A project's published features beside its Test Optimization Candidates
// record, read through one source that counts each record and file read, and
// the production Intent body mounted on that source through the page entry.
import { createElement } from "react";
import {
  IntentModeProvider,
  useIntentModeChoice,
} from "../../src/pageIntentMode.tsx";
import {
  StorySelectionProvider,
  usePageStorySelection,
} from "../../src/pageStorySelection.tsx";
import { PageReadsOnPage } from "../../src/pageReads.tsx";
import { ProjectIntentReading } from "../../src/ProjectIntentReading.tsx";
import { IntentReadingProvider } from "../../src/pageIntentReading.tsx";
import { IntentReadRecovery } from "../../src/intentReadRecovery.tsx";
import { useLimitRecovery } from "../../src/limitRecovery.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { PublishedFiles } from "../../../Distribution/tests/support/publishedFilesTestData.mjs";
import type { IntentCandidatesReadResult } from "../../src/authenticatedIntentCandidatesRead.ts";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import type { PublishedSource } from "../../src/publishedSource.ts";
import type { PublishedWork } from "../../src/publishedWork.ts";
import {
  pageReadsSupplying,
  unreadCiReads,
} from "../../test-support/component-mount/unreadPageReads.ts";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";
import {
  featuresOpening,
  fixtureFor,
  readsOf,
  type FeaturePublication,
} from "./intent-revision-fixtures.ts";

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

// Project Intent recovers on the page's one schedule: `useLimitRecovery`
// mounts the shared transient timer and follows the standing limit, as the
// published observation does for `configuredDashboardContent.tsx`.
function PageIntent({ work }: { readonly work: PublishedWork }) {
  const { limitedUntil } = useLimitRecovery({
    withheld: false,
    readSettled: true,
    visibility: "visible",
    readAfresh: () => undefined,
  });
  return createElement(IntentReadRecovery, {
    visibility: "visible",
    limitStands: limitedUntil !== undefined,
    children: createElement(PageIntentReading, { work }),
  });
}

function PageIntentReading({ work }: { readonly work: PublishedWork }) {
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
// `scenario` beside any further published `files`, any Python `tests` its
// `tests` location selects, and the answer to its candidates record.
export type CandidatesPublication = {
  readonly source: PublishedSource;
  readonly scenario: string;
  readonly files?: PublishedFiles;
  readonly tests?: PublishedFiles;
  readonly candidates: IntentCandidatesReadResult;
};

// `features` beside a Python `tests` location selecting each of `tests`.
function withTests(
  features: FeaturePublication,
  tests: PublishedFiles = {},
): FeaturePublication {
  if (Object.keys(tests).length === 0) return features;
  const location = makeMe.anIntentLocation
    .at("tests")
    .ofKind("python")
    .selecting(...Object.keys(tests))
    .please();
  return {
    async readLocations(signal) {
      const read = await features.readLocations(signal);
      return read.status === "configured"
        ? { ...read, locations: [...read.locations, location] }
        : read;
    },
    files: { ...features.files, ...readsOf(tests) },
  };
}

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
        features: withTests(
          featuresOpening(publication.scenario, publication.files),
          publication.tests,
        ),
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

// Pygardon's published features, beside any further `files` and Python
// `tests`, with `record` as its candidates record.
export const publishedWithCandidates = (
  record: string,
  files?: PublishedFiles,
  tests?: PublishedFiles,
) =>
  projectsPublishedWithCandidates([
    {
      source: makeMe.aPublishedSource.pygardon.please(),
      scenario: "List jobs",
      ...(files === undefined ? {} : { files }),
      ...(tests === undefined ? {} : { tests }),
      candidates: { status: "present", text: record },
    },
  ]);

// Mounts the production Intent body for `work` through the page entry,
// reading through `readSource`, as ./intent-ci-page-mount.ts offers it.
export const mountPageIntentReading = (
  readSource: IntentReadSource,
  work: PublishedWork,
) =>
  mountIntentCiPage({ work, reads: { intent: readSource, ci: unreadCiReads } });

// G1/G2 interim: Project Intent on the observation's recovery schedule, for
// the one case whose automatic transient and limit recovery needs the
// published observation's timers until
// SEED-413#drive-published-observation-through-page-entry lands.
export async function mountIntentOnObservationRecovery(
  readSource: IntentReadSource,
  work: PublishedWork,
) {
  await mountComponent(
    createElement(
      PageReadsOnPage,
      { reads: pageReadsSupplying({ intent: readSource }) },
      createElement(PageIntent, { work }),
    ),
    { viewport: { width: 1280, height: 900 }, fillsViewport: true },
  );
}
