// Typed CI read collaborators and the production page mounts of Intent CI
// status specs.
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { IntentCiStatus as Judgment } from "../../src/authenticatedIntentCiStatusRead.ts";
import type { CiProofEntry } from "../../src/ciProof.ts";
import "../../src/intent-ci-status.css";
import type { IntentCiReadSource } from "../../src/intentCiReadSource.ts";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import type { PublishedSource } from "../../src/publishedSource.ts";
import { unanswered } from "../../test-support/support/waitUntil.ts";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";

export const openDoughSource: PublishedSource = makeMe.aPublishedSource
  .with({
    id: "open-dough",
    label: "Open Dough",
    repository: "terryyin/open-dough",
    ref: "main",
  })
  .please();

export const fullSha = (short: string) => short.padEnd(40, "0");

export function judgedStatus(
  branch: string,
  state: Judgment["state"],
  shortOrFullSha: string,
  subject: string,
  extra: Partial<Judgment> = {},
): Judgment {
  return makeMe.anIntentCiStatus
    .with({
      branch,
      checkedAt: "2026-11-05T12:00:00.000Z",
      freshness: "fresh",
      state,
      revision: fullSha(shortOrFullSha),
      subject,
      laterWithoutResult: 0,
      ...extra,
    })
    .please();
}

export function heldRead<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  let asked = false;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return {
    ask() {
      asked = true;
      return promise;
    },
    asked: () => asked,
    resolve,
    reject,
  };
}

export const failingStory = {
  identity: "SEED-219#failing",
  title: "Story whose branch fails",
  branch: "codex/example-story",
};

export const runningStory = {
  identity: "SEED-219#running",
  title: "Story whose run is in progress",
  branch: "codex/running-story",
};

// Main's work at 4774f60 with the failing and running stories Taken.
export const storiesTakenWork = makeMe.aPublishedWork
  .of(openDoughSource)
  .at(fullSha("4774f60"))
  .retrievedAt(new Date("2026-11-05T12:00:00.000Z"))
  .taking({ ...failingStory, agent: "Akiho" })
  .taking({ ...runningStory, agent: "Sola" })
  .please();

// Each branch's fresh CI answer in the Taken stories' cases.
export const mainPassed = judgedStatus("main", "pass", "4774f60", "Add login");
export const failingFailed = judgedStatus(
  failingStory.branch,
  "failed",
  "fa11ed0",
  "Break the login",
);
export const runningInProgress = judgedStatus(
  runningStory.branch,
  "running",
  "70a0001",
  "Start the story",
);

export function inertCiReads(
  overrides: Partial<IntentCiReadSource> = {},
): IntentCiReadSource {
  return {
    readStatus: () =>
      Promise.reject(new Error("Unexpected fresh CI status read")),
    readKeptStatus: () => Promise.resolve({ none: true }),
    readProof: () =>
      Promise.resolve(makeMe.aCiProof.unavailable("none").please()),
    readHistory: () =>
      Promise.resolve(makeMe.aCiHistoryAnswer.pleaseMeasured()),
    // Collected Done wall-time and scope history stay pending unless a case
    // answers them.
    readDoneWallTimeHistory: unanswered,
    readScopeHistory: unanswered,
    readComparison: (source, identity) =>
      Promise.resolve({
        kind: "unavailable",
        identity,
        explanation: `${identity} on ${source.id} has no published completion record.`,
        checkedAt: "2026-11-05T12:00:00.000Z",
      }),
    ...overrides,
  };
}

// Intent reads of a project without configured Intent locations.
export const unconfiguredIntentReads: IntentReadSource =
  makeMe.anIntentReadSource
    .reading({
      readLocations: () => Promise.resolve({ status: "not-configured" }),
      readFile: () => Promise.resolve(""),
      readCandidates: () => Promise.resolve({ status: "absent" }),
    })
    .please();

// Main's run 41 at a1b2c3d, the run `mountJudgedRunProof` judges.
export const judgedRun = {
  revision: fullSha("a1b2c3d"),
  runId: 41,
  runAttempt: 1,
};

// Intent's CI status homepage judging main's run 41 passed at a1b2c3d, its
// proof answered with `entries`, its judgment amended by `judgment`; `viewport`
// sizes the page and `ci` answers the page's other CI reads.
export async function mountJudgedRunProof({
  entries,
  judgment = {},
  viewport,
  ci = {},
  intent = unconfiguredIntentReads,
}: {
  readonly entries: readonly CiProofEntry[];
  readonly intent?: IntentReadSource;
  readonly judgment?: Partial<Judgment>;
  readonly viewport?: { readonly width: number; readonly height: number };
  readonly ci?: Partial<IntentCiReadSource>;
}) {
  const { revision } = judgedRun;
  const judged = judgedStatus("main", "pass", revision, "Add login", {
    ...judgedRun,
    runBranch: "main",
    runUrl: "https://ci.invalid/runs/41",
    ...judgment,
  });
  const proof = makeMe.aCiProof
    .forRun({ repository: openDoughSource.repository, ...judgedRun })
    .entries([...entries])
    .please();
  await mountIntentCiPage({
    work: makeMe.aPublishedWork.of(openDoughSource).at(revision).please(),
    ...(viewport && { viewport }),
    reads: {
      intent,
      ci: inertCiReads({
        readStatus: () => Promise.resolve(judged),
        readProof: () => Promise.resolve(proof),
        ...ci,
      }),
    },
  });
}
