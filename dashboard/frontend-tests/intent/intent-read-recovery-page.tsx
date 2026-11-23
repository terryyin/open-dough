// Project Intent and published detail on production ConfiguredDashboard, sharing
// the page-owned transient recovery schedule (../../src/transientRecovery.ts,
// ../../src/intentReadRecovery.tsx, ../../src/limitRecovery.ts).
import { createElement } from "react";
import { expect, onTestFinished, vi } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { readRepositoryFileAt } from "../../src/authenticatedRead.ts";
import { ConfiguredDashboard } from "../../src/ConfiguredDashboard.tsx";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import { ProjectsOnPage } from "../../src/projectList.tsx";
import type { PublishedWork } from "../../src/publishedWork.ts";
import { authenticatedSessionServices } from "../../src/sessionServices.ts";
import { withPagePreferences } from "../../test-support/component-mount/framePreferences.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import {
  boardFrameObservationSupplying,
  forceRevisionStreamDelivery,
} from "../navigation/board-frame-observation-supply.ts";

export const publishedDetailPath = ".planning/seeds/SEED-302-queued.md";
let nextEpoch = Date.parse("2020-01-01T00:00:00.000Z");
let restoringVisibility = false;

export function onRecoveryClock() {
  const now = nextEpoch;
  nextEpoch += 3_600_000;
  vi.useFakeTimers({ now });
  onTestFinished(() => {
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

export function workWithPublishedDetail(revision: string): PublishedWork {
  const base = makeMe.aPublishedWork.ofPygardon.at(revision).please();
  // Backlog hrefs use the planning-relative path; detail reads resolve to
  // `publishedDetailPath` under `.planning/`.
  return {
    ...base,
    backlog: [
      makeMe.aWorkEntry
        .with({
          identity: "SEED-302#queued",
          title: "Queued seed",
          canonical: {
            kind: "snapshot",
            recorded: "seeds/SEED-302-queued.md",
            url: "https://example.test/seeds/SEED-302-queued.md",
            revision,
          },
        })
        .please(),
    ],
  };
}

export async function mountIntentRecovery(
  readSource: IntentReadSource,
  work: PublishedWork,
  detailRead?: typeof readRepositoryFileAt,
) {
  withPagePreferences();
  forceRevisionStreamDelivery();
  const originalUrl = location.href;
  const originalState: unknown = history.state;
  const url = new URL(originalUrl);
  url.searchParams.set("project", work.source.id);
  url.searchParams.set("perspective", "intent");
  history.replaceState(originalState, "", url);
  onTestFinished(() => {
    history.replaceState(originalState, "", originalUrl);
  });

  const supply = boardFrameObservationSupplying([work]);
  const observation =
    detailRead === undefined
      ? supply.observation
      : {
          ...supply.observation,
          readDetailFile: (...args: Parameters<typeof readRepositoryFileAt>) =>
            detailRead(...args),
        };

  await mountComponent(
    createElement(ProjectsOnPage, {
      projects: [work.source],
      replaceProjects: () => {},
      children: createElement(ConfiguredDashboard, {
        reads: pageReadsSupplying({
          sessions: authenticatedSessionServices,
          observation,
          machine: supply.machine,
          intent: readSource,
        }),
        settingsOpen: false,
        onOpenSettings: () => {},
        onDashboardReady: () => {},
      }),
    }),
    { viewport: { width: 1280, height: 600 }, fillsViewport: true },
  );
  await expect
    .element(page.getByRole("main", { name: "Intent", exact: true }))
    .toBeVisible();
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
