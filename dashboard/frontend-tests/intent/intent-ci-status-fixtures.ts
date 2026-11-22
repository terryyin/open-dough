// Typed CI read collaborators and minimal mounts for Intent CI status specs.
import { createElement } from "react";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { IntentCiStatus as Judgment } from "../../src/authenticatedIntentCiStatusRead.ts";
import type { CiProofEntry } from "../../src/ciProof.ts";
import { IntentCiEvidenceProvider } from "../../src/IntentCiEvidence.tsx";
import { JudgedBranch } from "../../src/IntentCiJudgedBranch.tsx";
import "../../src/intent-ci-status.css";
import { IntentCiStatus } from "../../src/IntentCiStatus.tsx";
import type { IntentCiReadSource } from "../../src/intentCiReadSource.ts";
import { PageReadsOnPage } from "../../src/pageReads.tsx";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import { measuredHistoryOf } from "../../src/landedCiHistory.ts";
import {
  IntentReadingPlaceOfItsOwn,
  IntentReadingProvider,
} from "../../src/pageIntentReading.tsx";
import type { PublishedSource } from "../../src/publishedSource.ts";
import type { PublishedWork } from "../../src/publishedWork.ts";
import type { ReviewSource } from "../../src/reviewSource.ts";
import { shownRunOf } from "../../src/shownCiProofRun.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";

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
  let asked = false;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return {
    ask() {
      asked = true;
      return promise;
    },
    asked: () => asked,
    resolve,
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

// The review a case leaves unavailable, as with no local review workspace.
export const unavailableReviewSource: ReviewSource = {
  review: () =>
    Promise.resolve({
      kind: "unavailable",
      explanation: "No local review workspace is available.",
    }),
  range: () => Promise.reject(new Error("Unexpected review range read")),
  fileDiff: () => Promise.reject(new Error("Unexpected review file diff read")),
  fileText: () => Promise.reject(new Error("Unexpected review file text read")),
};

export function inertCiReads(
  overrides: Partial<IntentCiReadSource> = {},
): IntentCiReadSource {
  const emptyHistory = measuredHistoryOf(makeMe.aCiHistoryAnswer.please());
  if (emptyHistory === undefined) {
    throw new Error("Expected valid empty CI history");
  }
  return {
    readStatus: () =>
      Promise.reject(new Error("Unexpected fresh CI status read")),
    readKeptStatus: () => Promise.resolve({ none: true }),
    readProof: () =>
      Promise.resolve(makeMe.aCiProof.unavailable("none").please()),
    readHistory: () => Promise.resolve(emptyHistory),
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

export type EvidenceMountState = {
  readonly source?: PublishedSource | undefined;
  readonly work?: PublishedWork | undefined;
  readonly selectedIdentity?: string | undefined;
  readonly active?: boolean | undefined;
};

export async function mountIntentCiEvidence({
  source = openDoughSource,
  work = makeMe.aPublishedWork.of(source).at(fullSha("4774f60")).please(),
  selectedIdentity,
  active = true,
  ciReads,
}: EvidenceMountState & {
  readonly ciReads: IntentCiReadSource;
}) {
  const render = (next: EvidenceMountState) => {
    const nextSource = next.source ?? source;
    const nextWork = next.work ?? work;
    return createElement(
      PageReadsOnPage,
      { reads: pageReadsSupplying({ ci: ciReads }) },
      createElement(IntentReadingProvider, {
        project: nextSource.id,
        children: createElement(IntentReadingPlaceOfItsOwn, {
          project: nextSource.id,
          children: createElement(IntentCiEvidenceProvider, {
            source: nextSource,
            work: nextWork,
            selectedIdentity: next.selectedIdentity,
            active: next.active ?? true,
            children: createElement(IntentCiStatus),
          }),
        }),
      }),
    );
  };
  const mounted = await mountComponent(
    render({ source, work, selectedIdentity, active }),
    { viewport: { width: 1280, height: 800 } },
  );
  return {
    update: (next: EvidenceMountState) => {
      mounted.rerender(render(next));
    },
  };
}

export async function mountJudgedRunProof(
  entries: readonly CiProofEntry[],
  extra: Partial<Judgment> = {},
) {
  const revision = fullSha("a1b2c3d");
  const run = { revision, runId: 41, runAttempt: 1 };
  const shown = judgedStatus("main", "pass", revision, "Add login", {
    ...run,
    runBranch: "main",
    runUrl: "https://ci.invalid/runs/41",
    ...extra,
  });
  await mountComponent(
    createElement(JudgedBranch, {
      branch: "main",
      story: undefined,
      judged: {
        shown,
        reading: false,
        previouslyRetrieved: false,
        refreshFailed: undefined,
        checkAgain: () => {},
        round: undefined,
      },
      proof: {
        run: shownRunOf(shown),
        read: makeMe.aCiProof
          .forRun({ repository: openDoughSource.repository, ...run })
          .entries([...entries])
          .please(),
      },
    }),
    { viewport: { width: 1280, height: 800 } },
  );
}
