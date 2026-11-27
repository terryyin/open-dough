// The Recently done review cue cases' frame: one story identity completed in
// both Pygardon and Open Dough (reviewed only in Open Dough), its Pygardon and
// Open Dough Done rows, a Pygardon Taken story row and a Doughnut ad hoc row,
// over each project's review states and done catalog the case answers, holds
// or fails.
import { expect, onTestFinished, vi } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { minutesAgo } from "../../../Distribution/tests/support/testDataDefaults.mjs";
import type { DoneCatalog } from "../../src/authenticatedDoneRead.ts";
import type { SessionServices } from "../../src/sessionServices.ts";
import type { StoryReviewStatesReadSource } from "../../src/storyReviewStatesReadSource.ts";
import { reviewStateStore } from "../stories/recently-done-review-state-mount-page.ts";
import {
  adHocRecord,
  adHocTitle,
  catalogued,
  linked,
  takenRecord,
} from "./recently-done-selection-mount-page.ts";
import { mountSessions } from "./recently-done-sidebar-mount-page.ts";

export const localTitle = "The same story identity completed in Open Dough";
export const localSessionTitle =
  "Open Dough session of the identical story identity";
export const duplicateTitle = "Another Pygardon session of the finished story";

// A Done session of the linked identity in `source`, `minutes` old.
export function cueSession(
  title: string,
  minutes: number,
  source = "pygardon",
) {
  return makeMe.aLaunchRecord
    .executing({ identity: linked.identity, title, source })
    .inClaudeSession({
      sessionId: `cue-${source}-${title.replaceAll(" ", "-")}`,
    })
    .launchedAt(minutesAgo(minutes + 30))
    .markedDoneAt(minutesAgo(minutes))
    .please();
}

const rows = [
  cueSession(linked.title, 1),
  cueSession(duplicateTitle, 2),
  cueSession(localSessionTitle, 3, "open-dough"),
  takenRecord,
];

const catalogOf = (title: string) =>
  makeMe.aDoneCatalog
    .holding([
      makeMe.aDoneRecord
        .completed({
          identity: linked.identity,
          title,
          completedAt: minutesAgo(60),
        })
        .please(),
    ])
    .please();
const pygardon = catalogOf(linked.title);
const openDough = catalogOf(localTitle);

type Next<T> = () => Promise<T>;
// A read the case answers, holds until released, or fails, per call.
function steered<T>(answered: Next<T>) {
  let next = answered;
  return {
    next: () => next(),
    hold: () => {
      let release = () => {};
      let wasAsked = false;
      const asked = new Promise<void>((askedNow) => {
        const held = next;
        next = () => {
          askedNow();
          wasAsked = true;
          next = answered;
          // Answers as it would have when asked.
          const answer = held();
          return new Promise<T>((resolve, reject) => {
            release = () => {
              answer.then(resolve, reject);
            };
          });
        };
      });
      return {
        asked,
        wasAsked: () => wasAsked,
        release: () => {
          release();
        },
      };
    },
    fail: () => {
      next = () => Promise.reject(new Error("Evidence unavailable."));
    },
    answer: () => {
      next = answered;
    },
  };
}

export function openReviewCue({
  extra = [],
  reported = [],
  sessions,
  openDoughMarkedAt,
}: {
  extra?: ReturnType<typeof cueSession>[];
  // When Open Dough's linked story was marked reviewed; now by default.
  openDoughMarkedAt?: string;
  // Retained sessions whose Open reads their final report.
  reported?: ReturnType<typeof cueSession>[];
  // The shown session's final report, host status and terminal.
  sessions?: SessionServices;
} = {}) {
  const store = reviewStateStore(
    { "open-dough": [linked.identity] },
    openDoughMarkedAt === undefined
      ? {}
      : { [linked.identity]: openDoughMarkedAt },
  );
  const pygardonReview = steered(() => store.read("pygardon"));
  const reviewStates: StoryReviewStatesReadSource = (project, change) =>
    change === undefined && project === "pygardon"
      ? pygardonReview.next()
      : store.read(project, change);
  let pygardonCatalogReads = 0;
  const pygardonCatalog = steered(() => Promise.resolve(catalogued(pygardon)));
  const doneCatalog = (source: { id: string }): Promise<DoneCatalog> => {
    if (source.id === "pygardon") {
      pygardonCatalogReads += 1;
      return pygardonCatalog.next();
    }
    return Promise.resolve(
      source.id === "open-dough"
        ? catalogued(openDough)
        : { status: "catalogued", records: [], unreadable: [] },
    );
  };
  const mount = async () => {
    const shown = await mountSessions(
      reported
        .reduce(
          (answer, record) =>
            answer.observing(
              makeMe.anObservedLaunch
                .of(record)
                .withSessionState(
                  makeMe.aSessionState.retained("review").please(),
                )
                .withWorkspace("missing")
                .please(),
            ),
          makeMe.aMachineAnswer
            .observingDone(...rows, ...extra)
            .observingUnavailable(adHocRecord),
        )
        .please(),
      {
        doneCatalog,
        doneBodies: {
          readBodies: (source, ...rest) =>
            (source.id === "pygardon"
              ? pygardon
              : openDough
            ).doneReads.readBodies(source, ...rest),
        },
        reviewStates,
        ...(sessions === undefined ? {} : { sessions }),
      },
    );
    await shown.header.click();
    await expect.poll(shown.titles).toContain(adHocTitle);
    return shown;
  };
  return {
    mount,
    pygardonReview,
    pygardonCatalog,
    pygardonCatalogReads: () => pygardonCatalogReads,
    reviewed: store.reviewed,
  };
}

// A shown row's Needs review cue, if it carries one.
export const cueIn = (row: HTMLElement | undefined) =>
  [...(row?.querySelectorAll("*") ?? [])].find(
    (element) =>
      element.childElementCount === 0 && element.textContent === "Needs review",
  );

// Whether a shown row carries its Needs review cue.
export const cueOf = (row: HTMLElement | undefined) => cueIn(row) !== undefined;

// Operates the Board's cards with the Sessions sidebar closed, then reopens it.
export async function onTheBoard(act: () => Promise<void>) {
  const sessions = page.getByRole("button", { name: /^Sessions/ });
  await sessions.click();
  await act();
  await sessions.click();
}

// Lets a case advance the machine's polls itself, for this case alone.
export function pollWithFakeTimers() {
  vi.useFakeTimers({
    toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
  });
  onTestFinished(() => {
    vi.useRealTimers();
  });
}
