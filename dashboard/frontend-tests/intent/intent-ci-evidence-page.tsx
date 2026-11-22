// A selected story's CI evidence as the page composes it: the actual
// evidence owner (../../src/IntentCiEvidence.tsx) in the production reading
// place, shown by IntentCiStatus, over a typed CI read source
// (../../src/intentCiReadSource.ts) whose answers each case arranges.
import { StrictMode, type ReactElement, type ReactNode } from "react";
import { page } from "vitest/browser";
import {
  IntentReadingPlace,
  IntentReadingProvider,
  IntentReadingScope,
} from "../../src/pageIntentReading.tsx";
import { IntentCiComparisonPreference } from "../../src/IntentCiComparisonPreference.tsx";
import { IntentCiEvidenceProvider } from "../../src/IntentCiEvidence.tsx";
import { IntentCiStatus } from "../../src/IntentCiStatus.tsx";
import type { IntentCiReadSource } from "../../src/intentCiReadSource.ts";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import { PageReadsOnPage } from "../../src/pageReads.tsx";
import {
  pageReadsSupplying,
  unreadCiReads,
} from "../../test-support/component-mount/unreadPageReads.ts";
import type { CiProof, CiProofSubject } from "../../src/ciProof.ts";
import type { IntentCiStatus as Judgment } from "../../src/authenticatedIntentCiStatusRead.ts";
import type { StoryCiComparisonAnswer } from "../../src/storyCiComparison.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { shownComparison } from "./intent-ci-comparison-page.ts";
import type { ComparedStory } from "../../../Distribution/tests/support/comparedStoryTestData.mjs";

type Answer<T> = T | Promise<T>;

// A reply a case holds until it releases it.
export function heldReply<T>() {
  let resolve: (answer: T) => void = () => undefined;
  let reject: (error: Error) => void = () => undefined;
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

// Each read the evidence owner asks, whether it was abandoned, and the answer
// a case gives it; by default the story's own comparison and run proofs.
export function ciReadsOf(story: ComparedStory) {
  const asked = {
    comparisons: [] as { identity: string; aborted: boolean }[],
    proofs: [] as { subject: CiProofSubject; aborted: boolean }[],
    statuses: 0,
  };
  const answers = {
    comparison: (identity: string): Answer<StoryCiComparisonAnswer> => {
      if (identity !== story.identity)
        throw new Error(`No comparison arranged for ${identity}`);
      return story.answer;
    },
    proof: (subject: CiProofSubject): Answer<CiProof> =>
      story.proof(subject.runId as number).proof,
    status: (): Answer<Judgment> => {
      throw new Error("No CI status arranged");
    },
  };
  const watched = <T,>(
    signal: AbortSignal,
    abandoned: () => void,
    answer: () => Answer<T>,
  ) => {
    signal.addEventListener("abort", abandoned);
    return Promise.resolve().then(answer);
  };
  const source: IntentCiReadSource = {
    readComparison: (...[, identity, signal]) => {
      const index = asked.comparisons.push({ identity, aborted: false }) - 1;
      return watched(
        signal,
        () => {
          asked.comparisons[index] = { identity, aborted: true };
        },
        () => answers.comparison(identity),
      );
    },
    readProof: (...[, subject, signal]) => {
      const index = asked.proofs.push({ subject, aborted: false }) - 1;
      return watched(
        signal,
        () => {
          asked.proofs[index] = { subject, aborted: true };
        },
        () => answers.proof(subject),
      );
    },
    readStatus: () => {
      asked.statuses += 1;
      return Promise.resolve().then(answers.status);
    },
    readKeptStatus: () => Promise.resolve({ none: true } as const),
    readHistory: unreadCiReads.readHistory,
  };
  return { source, asked, answers };
}

// The selected story's evidence owner in its production reading place, under
// the one Show % preference, reading CI through READS and Intent through
// INTENT READS when given; or, while the reader
// visits Project Intent, that same reading place's project scope.
export function StoryCiEvidence({
  story,
  reads,
  intentReads,
  children,
  visitingProject = false,
}: {
  readonly story: ComparedStory;
  readonly reads: IntentCiReadSource;
  readonly intentReads?: IntentReadSource;
  readonly children: ReactNode;
  readonly visitingProject?: boolean;
}) {
  return (
    <PageReadsOnPage
      reads={pageReadsSupplying(
        intentReads === undefined
          ? { ci: reads }
          : { ci: reads, intent: intentReads },
      )}
    >
      <IntentReadingProvider project={story.source.id}>
        <IntentReadingPlace project={story.source.id} story={story.identity}>
          {visitingProject ? (
            <IntentReadingScope name="project">
              Project Intent
            </IntentReadingScope>
          ) : (
            <IntentReadingScope name="story">
              <IntentCiComparisonPreference>
                <IntentCiEvidenceProvider
                  source={story.source}
                  work={story.work}
                  selectedIdentity={story.identity}
                  active
                >
                  {children}
                </IntentCiEvidenceProvider>
              </IntentCiComparisonPreference>
            </IntentReadingScope>
          )}
        </IntentReadingPlace>
      </IntentReadingProvider>
    </PageReadsOnPage>
  );
}

function evidenceOf(
  story: ComparedStory,
  reads: IntentCiReadSource,
  strict: boolean,
): ReactElement {
  const shown = (
    <StoryCiEvidence story={story} reads={reads}>
      <IntentCiStatus />
    </StoryCiEvidence>
  );
  return strict ? <StrictMode>{shown}</StrictMode> : shown;
}

export async function mountCiEvidence(
  story: ComparedStory,
  reads: IntentCiReadSource,
  { strict = false } = {},
) {
  const mounted = await mountComponent(evidenceOf(story, reads, strict));
  return {
    checkAgain: page.getByRole("button", { name: "Check again", exact: true }),
    liveStatus: page.getByRole("region", { name: "CI status", exact: true }),
    comparison: () => shownComparison(),
    // Each CI gap explanation shown, wherever the evidence places it.
    gaps: () =>
      [...document.querySelectorAll(".intent-ci-gap")].map((gap) =>
        gap.textContent.trim(),
      ),
    // The page selects another story, or observes another published head.
    selects(next: ComparedStory) {
      mounted.rerender(evidenceOf(next, reads, strict));
    },
    unmount: () => {
      mounted.rerender(<div />);
    },
  };
}
