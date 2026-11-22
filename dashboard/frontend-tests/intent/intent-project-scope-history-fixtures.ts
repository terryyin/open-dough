// Project Intent over one configured location whose live Proof is unread, so
// each scope's history stands beside Scope Proof as the case answers it.
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { IntentCiStatus } from "../../src/authenticatedIntentCiStatusRead.ts";
import type { IntentLocation } from "../../src/authenticatedIntentRead.ts";
import type { IntentCiReadSource } from "../../src/intentCiReadSource.ts";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import type { PublishedSource } from "../../src/publishedSource.ts";
import type { PublishedWork } from "../../src/publishedWork.ts";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";
import { inertCiReads } from "./intent-ci-status-fixtures.ts";

// Intent reads of a project configured with LOCATION, each selected file
// reading as its own path.
export const configuredIntentReads = (
  location: IntentLocation,
): IntentReadSource => ({
  readLocations: () =>
    Promise.resolve({ status: "configured", locations: [location] }),
  readFile: (...[, path]) => Promise.resolve(`${path}\n`),
  readCandidates: () => Promise.resolve({ status: "absent" }),
});

// An older main observation whose live Proof is unavailable, so scope
// histories stand without live Proof.
export const unreadLiveProof: IntentCiStatus = makeMe.anIntentCiStatus
  .with({
    branch: "main",
    revision: "a".repeat(40),
    subject: "Older CI observation",
    state: "unread",
    reason: "Live proof unavailable",
    laterWithoutResult: 1,
    runBranch: "main",
    checkedAt: "2026-11-11T07:00:00Z",
    freshness: "fresh",
  })
  .please();

// A scope's history through REVISION, its endpoint taking MS per test case.
export const caseTimingHistory = (path: string, ms: number, revision: string) =>
  makeMe.aScopeHistoryGlance
    .at(path)
    .timing("case", [], ms)
    .through(revision)
    .please();

// Project Intent of WORK over dashboard/tests and its example.spec.ts, live
// Proof absent in every one of PROJECTS, each scope's history answered by
// READSCOPEHISTORY.
export const mountUnprovenScopeHistory = ({
  work,
  projects = [work.source],
  viewport,
  readScopeHistory,
}: {
  readonly work: PublishedWork;
  readonly projects?: readonly PublishedSource[];
  readonly viewport?: { readonly width: number; readonly height: number };
  readonly readScopeHistory: IntentCiReadSource["readScopeHistory"];
}) =>
  mountIntentCiPage({
    work,
    projects,
    ...(viewport && { viewport }),
    reads: {
      intent: configuredIntentReads(
        makeMe.anIntentLocation
          .at("dashboard/tests")
          .ofKind("typescript", ["**/*.spec.ts"])
          .selecting("dashboard/tests/example.spec.ts")
          .please(),
      ),
      ci: inertCiReads({
        readStatus: () => Promise.resolve(unreadLiveProof),
        readScopeHistory,
      }),
    },
  });
