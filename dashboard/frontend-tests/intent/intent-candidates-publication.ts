// A project's published features beside its Test Optimization Candidates
// record, read through one source that counts each record and file read, and
// the production Intent body mounted on that source through the page entry.
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { PublishedFiles } from "../../../Distribution/tests/support/publishedFilesTestData.mjs";
import type { IntentCandidatesReadResult } from "../../src/authenticatedIntentCandidatesRead.ts";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import type { PublishedSource } from "../../src/publishedSource.ts";
import type { PublishedWork } from "../../src/publishedWork.ts";
import { unreadCiReads } from "../../test-support/component-mount/unreadPageReads.ts";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";
import { mountIntentRecovery } from "./intent-read-recovery-page.tsx";
import {
  featuresOpening,
  fixtureFor,
  readsOf,
  type FeaturePublication,
} from "./intent-revision-fixtures.ts";

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
  const readSource: IntentReadSource = makeMe.anIntentReadSource
    .reading({
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
    })
    .please();
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

// Project Intent on ConfiguredDashboard's page-owned recovery schedule.
export const mountIntentOnConfiguredDashboard = (
  readSource: IntentReadSource,
  work: PublishedWork,
) => mountIntentRecovery(readSource, work);
