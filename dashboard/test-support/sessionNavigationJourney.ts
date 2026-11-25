// The sessions a developer goes to from the Sessions sidebar, across three
// catalog projects: Open Dough's story-columns journey (./launchJourney.ts),
// Doughnut's one story (./doughnutProject.ts), and a Pygardon backlog whose
// story with a session is listed last (./pygardonProject.ts). Kept sessions
// are composed before the page opens. The page records what it brings into
// view (`revealsOf`).

import type { Locator, Page } from "@playwright/test";
import { identityB } from "../../Distribution/tests/skills/dough-execute-plan/workspace-publication-fixtures.mjs";
import { expect } from "./dashboardTest.ts";
import { doughnutSharedTitle, sharedStoryIdentity } from "./doughnutProject.ts";
import {
  notRefinedStory,
  readyStory,
  takenStory,
  type StoryColumnsJourney,
} from "./launchJourney.ts";
import { composeSession } from "./agentTerminalBoundary.ts";
import { publishMovingHistory } from "./publishedMovingOrigin.ts";
import {
  pygardonHistory,
  pygardonRepository,
  pygardonStory,
} from "./pygardonProject.ts";
import { keyboardWithin } from "./pageShortcutsPage.ts";
import { openStoryColumnsJourney } from "./storyColumnsPage.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";

// Open Dough's stories as the journey first shows them.
export const openDoughStories = {
  taken: [],
  backlog: [takenStory, readyStory, notRefinedStory],
};

// An Open Dough story whose session is kept but which origin lists nowhere,
// as once removed from the backlog.
export const removedStory = {
  identity: "SEED-404#removed",
  title: "A story removed from the backlog",
};

export type NavigationSessions = {
  readonly pygardon: string;
  readonly storyB: string;
  readonly removed: string;
  readonly doughnut: string;
};

// Records every part of the page brought into view, with how, from before
// the page opens.
export async function recordReveals(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const reveals: { name: string; behavior: string }[] = [];
    (window as unknown as { reveals: typeof reveals }).reveals = reveals;
    const { scrollIntoView: scroll } = Object.getOwnPropertyDescriptors(
      Element.prototype,
    );
    Element.prototype.scrollIntoView = function (
      this: Element,
      options?: boolean | ScrollIntoViewOptions,
    ) {
      reveals.push({
        name: this.getAttribute("aria-label") ?? "",
        behavior: typeof options === "object" ? (options.behavior ?? "") : "",
      });
      (scroll.value as Element["scrollIntoView"]).call(this, options);
    };
  });
}

// What the page brought into view so far, by accessible name, and how.
export const revealsOf = (page: Page) =>
  page.evaluate(
    () =>
      (window as unknown as { reveals: { name: string; behavior: string }[] })
        .reveals,
  );

// How many entries the page's browser history holds.
export const historyLength = (page: Page) =>
  page.evaluate(() => history.length);

// Whether the keyboard is inside the named region.
export const keyboardInside = (page: Page, name: string) =>
  keyboardWithin(page.getByRole("region", { name }));

// Clicks `control` and returns how many reveals the page had made at its
// pointer press, the developer's own move that ends an earlier part's keeping
// in view (`keepInView`, ../src/pageMovement.ts): reveals after it belong to
// what the click shows.
export async function revealsAtClick(
  page: Page,
  control: Locator,
): Promise<number> {
  await page.evaluate(() => {
    const at = window as unknown as {
      reveals: unknown[];
      revealsAtPress?: number;
    };
    delete at.revealsAtPress;
    window.addEventListener(
      "pointerdown",
      () => {
        at.revealsAtPress = at.reveals.length;
      },
      { capture: true, once: true },
    );
  });
  await control.click();
  const count = await page.evaluate(
    () => (window as unknown as { revealsAtPress?: number }).revealsAtPress,
  );
  if (count === undefined) throw new Error("No pointer press was observed.");
  return count;
}

// What the page brought into view after its first `since` reveals: at least
// one, every one this part, this way.
export async function expectRevealsSince(
  page: Page,
  since: number,
  name: string,
  behavior: "smooth" | "auto",
): Promise<void> {
  const reveals = (await revealsOf(page)).slice(since);
  expect(reveals.length).toBeGreaterThan(0);
  for (const reveal of reveals) {
    expect(reveal).toEqual({ name, behavior });
  }
}

// Composes the sessions, publishes Pygardon, records reveals, and opens the
// page on Open Dough's stories.
export async function openNavigationJourney(
  page: Page,
  dashboard: DashboardServer,
  columnsJourney: StoryColumnsJourney,
  afterGitHubStops: (cleanup: () => Promise<void>) => void,
) {
  const sessions: NavigationSessions = {
    doughnut: (
      await composeSession(dashboard, "doughnut", {
        identity: sharedStoryIdentity,
        title: doughnutSharedTitle,
      })
    ).sessionId,
    removed: (await composeSession(dashboard, "open-dough", removedStory))
      .sessionId,
    storyB: (
      await composeSession(dashboard, "open-dough", {
        identity: identityB,
        title: readyStory,
      })
    ).sessionId,
    pygardon: (
      await composeSession(dashboard, "pygardon", {
        ...pygardonStory,
        workflow: "refinement",
      })
    ).sessionId,
  };
  dashboard.claudeSessionBecomes(sessions.doughnut, "forgotten");
  const pygardon = await publishMovingHistory(
    page,
    pygardonHistory,
    "published",
    afterGitHubStops,
    pygardonRepository,
  );
  await recordReveals(page);
  const journey = await openStoryColumnsJourney(page, columnsJourney, {
    home: dashboard.home,
    afterGitHubStops,
  });
  await journey.settled();
  return {
    ...journey,
    sessions,
    pygardon,
    // Holds Pygardon's stories back until the returned release is called.
    holdPygardonStories: () => pygardon.hold(pygardon.revisions.published),
  };
}

// The synthetic `claude`'s attaches to the session so far.
export const attachesOf = (dashboard: DashboardServer, sessionId: string) =>
  dashboard.claudeAttaches().filter(({ id }) => id === sessionId.slice(0, 8));

// Whether the part lies wholly inside the window once the page has settled:
// its preparation facts are read, so no card changes size any more, and the
// page has rendered since, so the part's keeping in view (`keepInView`) has
// answered the last change. Measured sooner, a card lengthened or shortened
// by a preparation read can leave it out of view until the next frame.
export async function expectWhollyInView(page: Page, name: string) {
  await expect(page.getByText("Reading preparation…")).toHaveCount(0);
  expect(
    await page.evaluate(
      (label) =>
        new Promise<boolean>((answer) => {
          // A task queued from a frame callback runs after that frame's
          // layout, resize observations, and paint.
          requestAnimationFrame(() => {
            setTimeout(() => {
              const shown = document.querySelector(`[aria-label="${label}"]`);
              const box = shown?.getBoundingClientRect();
              const region = shown
                ?.closest(".board-scroll")
                ?.getBoundingClientRect();
              answer(
                box !== undefined &&
                  region !== undefined &&
                  box.top >= region.top &&
                  box.bottom <= region.bottom,
              );
            });
          });
        }),
      name,
    ),
  ).toBe(true);
}
