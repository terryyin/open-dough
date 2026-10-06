// The sessions a developer goes to from the Sessions sidebar, across three
// catalog projects: Open Dough's story-stages journey (./launchJourney.ts),
// Doughnut's one story (./doughnutProject.ts), and a Pygardon backlog whose
// story with a session is listed last, below enough other stories that its
// card starts out of view. Sessions are launched through the real launch
// boundary before the page opens, for Pygardon's story, Open Dough's Story B,
// an Open Dough story in no list, and Doughnut's story, whose session Claude
// Code then no longer lists; the page's own dashboard server launches and
// attaches the synthetic `claude` (./fixtures/fake-claude). The page records
// what it brings into view (`revealsOf`).

import type { Page } from "@playwright/test";
import { identityB } from "../../src/skills/dough-execute-plan/scripts/workspace-publication-fixtures.mjs";
import { expect } from "./dashboardTest.ts";
import { doughnutSharedTitle, sharedStoryIdentity } from "./doughnutProject.ts";
import { readyStory, type StoryStagesJourney } from "./launchJourney.ts";
import { launched } from "./agentTerminalBoundary.ts";
import { publishMovingOrigin } from "./publishedOrigin.ts";
import { openStoryStagesJourney } from "./storyStagesPage.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";

export const pygardonStory = {
  identity: "SEED-031#telegram-qr-diagnosis",
  title: "Correct the Telegram IBKR QR login's diagnosis and representations",
};

// Pygardon's stories above the one with a session.
const pygardonOthers = [...Array(12).keys()].map(
  (index) => `Pygardon's queued story ${String(index + 1)}`,
);
export const pygardonBacklogTitles = [...pygardonOthers, pygardonStory.title];

const pygardonRevision = "e5".repeat(20);

const pygardonBacklog = `# Product backlog

## Taken

## Backlog list

${pygardonOthers
  .map(
    (title, index) =>
      `- [${title}](seeds/SEED-3${String(index).padStart(2, "0")}.md#s) — SEED-3${String(index).padStart(2, "0")}#s`,
  )
  .join("\n")}
- [${pygardonStory.title}](seeds/SEED-031.md#telegram-qr-diagnosis) — ${pygardonStory.identity}
`;

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

// Launches the sessions, publishes Pygardon, records reveals, and opens the
// page on Open Dough's stories.
export async function openNavigationJourney(
  page: Page,
  dashboard: DashboardServer,
  stagesJourney: StoryStagesJourney,
) {
  const sessions: NavigationSessions = {
    doughnut: (
      await launched(dashboard, "doughnut", {
        identity: sharedStoryIdentity,
        title: doughnutSharedTitle,
      })
    ).sessionId,
    removed: (await launched(dashboard, "open-dough", removedStory)).sessionId,
    storyB: (
      await launched(dashboard, "open-dough", {
        identity: identityB,
        title: readyStory,
      })
    ).sessionId,
    pygardon: (
      await launched(dashboard, "pygardon", {
        ...pygardonStory,
        workflow: "refinement",
      })
    ).sessionId,
  };
  dashboard.claudeSessionBecomes(sessions.doughnut, "forgotten");
  const pygardon = await publishMovingOrigin(page, "terryyin/pygardon");
  pygardon.push(pygardonRevision, pygardonBacklog);
  await recordReveals(page);
  const journey = await openStoryStagesJourney(page, stagesJourney);
  await journey.settled();
  return {
    ...journey,
    sessions,
    // Holds Pygardon's stories back until the returned release is called.
    holdPygardonStories: () => pygardon.hold(pygardonRevision),
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
              answer(
                box !== undefined &&
                  box.top >= 0 &&
                  box.bottom <= window.innerHeight,
              );
            });
          });
        }),
      name,
    ),
  ).toBe(true);
}
