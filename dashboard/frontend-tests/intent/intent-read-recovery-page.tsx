// Project Intent mounted with the page's published-read status and shared
// recovery owners (../../src/intentReadRecovery.tsx, ../../src/limitRecovery.ts,
// ../../src/PublishedReadStatus.tsx, ../../src/repositoryFileReads.ts).
import { useEffect, useState } from "react";
import { expect, onTestFinished, vi } from "vitest";
import { page } from "vitest/browser";
import type { readRepositoryFileAt } from "../../src/authenticatedRead.ts";
import { IntentReadRecovery } from "../../src/intentReadRecovery.tsx";
import {
  IntentReadSourceOnPage,
  type IntentReadSource,
} from "../../src/intentReadSource.ts";
import {
  recordSettledOutcomes,
  useLimitRecovery,
} from "../../src/limitRecovery.ts";
import { ObservationOutcomes } from "../../src/observationOutcomes.ts";
import { usePageVisibility } from "../../src/pageVisibility.ts";
import { ProjectIntentReading } from "../../src/ProjectIntentReading.tsx";
import { PublishedReadStatus } from "../../src/PublishedReadStatus.tsx";
import type { PublishedWork } from "../../src/publishedWork.ts";
import { loadRepositoryTexts } from "../../src/repositoryFileReads.ts";
import { clearAllTransientFailures } from "../../src/transientRecovery.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";

export const publishedDetailPath = ".planning/seeds/SEED-302-queued.md";
let nextEpoch = Date.parse("2020-01-01T00:00:00.000Z");
let restoringVisibility = false;

export function onRecoveryClock() {
  const now = nextEpoch;
  nextEpoch += 3_600_000;
  clearAllTransientFailures();
  vi.useFakeTimers({ now });
  onTestFinished(() => {
    clearAllTransientFailures();
    vi.useRealTimers();
  });
}

export function setDocumentVisibility(state: "hidden" | "visible") {
  if (!restoringVisibility) {
    restoringVisibility = true;
    onTestFinished(() => {
      restoringVisibility = false;
      Reflect.deleteProperty(document, "visibilityState");
      Reflect.deleteProperty(document, "hidden");
      document.dispatchEvent(new Event("visibilitychange"));
    });
  }
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => state,
  });
  Object.defineProperty(document, "hidden", {
    configurable: true,
    get: () => state === "hidden",
  });
  document.dispatchEvent(new Event("visibilitychange"));
}

function PageIntentRecovery({
  work,
  detailRead,
}: {
  readonly work: PublishedWork;
  readonly detailRead?: typeof readRepositoryFileAt;
}) {
  const { visibility } = usePageVisibility();
  const [outcomes] = useState(() => {
    const current = new ObservationOutcomes();
    current.pinRevision(work.revision);
    return current;
  });
  const [asked, setAsked] = useState(1);
  const [readSettled, setReadSettled] = useState(detailRead === undefined);
  useEffect(() => {
    if (detailRead === undefined) return;
    const reading = new AbortController();
    const bound = new AbortController();
    void loadRepositoryTexts(
      work.source,
      work.revision,
      [publishedDetailPath],
      reading.signal,
      "The canonical record could not be read for preparation facts.",
      outcomes,
      bound.signal,
      detailRead,
    ).then(() => {
      if (reading.signal.aborted) return;
      setReadSettled(true);
      recordSettledOutcomes(outcomes);
    });
    return () => {
      reading.abort();
    };
  }, [asked, detailRead, outcomes, work.revision, work.source]);

  const { recoversAt, limitedUntil } = useLimitRecovery({
    withheld: false,
    readSettled,
    visibility,
    readAfresh: () => {
      if (detailRead === undefined) return;
      setReadSettled(false);
      setAsked((last) => last + 1);
    },
  });

  return (
    <div>
      <PublishedReadStatus
        attempt={{ status: "read" }}
        reading={!readSettled}
        work={work}
        withheld={false}
        recoversAt={recoversAt}
        limitedUntil={limitedUntil}
        notice=""
      />
      <IntentReadRecovery
        visibility={visibility}
        limitStands={limitedUntil !== undefined}
      >
        <ProjectIntentReading
          source={work.source}
          work={work}
          project={{
            mode: "ci",
            modeIdPrefix: "project-intent",
            onModeChange: () => undefined,
          }}
          projectShown
        />
      </IntentReadRecovery>
    </div>
  );
}

export async function mountIntentRecovery(
  readSource: IntentReadSource,
  work: PublishedWork,
  detailRead?: typeof readRepositoryFileAt,
) {
  await mountComponent(
    <IntentReadSourceOnPage value={readSource}>
      <PageIntentRecovery
        work={work}
        {...(detailRead === undefined ? {} : { detailRead })}
      />
    </IntentReadSourceOnPage>,
    { viewport: { width: 1280, height: 600 }, fillsViewport: true },
  );
}

export function publishedReadStatus() {
  const unansweredDetail = page
    .getByRole("alert")
    .filter({ hasText: "Reading unanswered detail again" });
  const rateLimit = page
    .getByRole("alert")
    .filter({ hasText: "Reading waits for GitHub's rate limit" });

  return {
    async showsUnansweredDetail() {
      await expect.element(unansweredDetail).toBeVisible();
    },
    async showsNoUnansweredDetail() {
      await expect.element(unansweredDetail).not.toBeInTheDocument();
    },
    async noticedLimitUntil(): Promise<number> {
      await expect.element(rateLimit).toBeVisible();
      const iso =
        rateLimit.element().querySelector("time")?.getAttribute("datetime") ??
        "";
      return Date.parse(iso);
    },
    async showsNoRateLimit() {
      await expect.element(rateLimit).not.toBeInTheDocument();
    },
  };
}
