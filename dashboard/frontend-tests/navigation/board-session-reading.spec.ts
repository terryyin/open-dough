// A story reached by URL or by its Session entry is read from its top within
// the Board: a card taller than the Board keeps its reading edge, through
// height-only resizes, beside the terminal, and after Close where the panel
// covered a narrow Board; one that fits stays wholly in view. The document
// itself stays still throughout.

import type { Page } from "@playwright/test";
import { expect, test } from "../../tests/support/frontendApp.ts";
import { installAttachedTerminalSubstitute } from "../../tests/support/frontendServiceSubstitutes.ts";
import {
  putFrontendPublished,
  type FrontendServiceState,
} from "../../tests/support/frontendServiceState.ts";
import {
  largeBacklog,
  queuedTitle,
  revision,
} from "../../tests/accessibleBoard.ts";
import { boardScroll } from "../../tests/boardPage.ts";
import { expectDocumentStill } from "../../tests/boardReading.ts";
import { expectSettledPage, parts } from "../../tests/dashboardPage.ts";
import { readyStory } from "../../tests/launchJourney.ts";
import { expectReadingTop } from "../../tests/readingPlace.ts";
import { expectWhollyInView } from "../../tests/sessionNavigationJourney.ts";
import { sessionsSidebarParts } from "../../tests/sessionsSidebarPage.ts";
import { expectCovering } from "../../tests/sidePanelWidthPage.ts";
import {
  closeTerminal,
  terminalPanel,
  terminalScreenParts,
} from "../../tests/terminalScreenPage.ts";
import { cardSession } from "../../tests/support/frontendCardSessions.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

const working = () => makeMe.aSessionState.loaded("working").please();

// The machine observes an open execution session for `identity`'s story.
function observeSession(
  services: FrontendServiceState,
  identity: string,
  title: string,
) {
  services.answerMachine(
    makeMe.aMachineAnswer
      .observing(
        makeMe.anObservedLaunch
          .of(makeMe.aLaunchRecord.executing({ identity, title }).please())
          .withSessionState(working())
          .please(),
      )
      .please(),
  );
}

// Opens `title`'s session from the Sessions sidebar until it attaches.
async function openSessionEntry(page: Page, title: string) {
  const sidebar = sessionsSidebarParts(page);
  await sidebar.button.click();
  await sidebar.entry(title).click();
  const terminal = terminalPanel(page);
  await expect(terminalScreenParts(terminal).rows).toContainText("attached");
  return { sidebar, terminal };
}

for (const viewport of [
  { width: 1400, height: 360 },
  { width: 700, height: 800 },
]) {
  test(`URL and Session entry reveal a tall card's top within the Board at ${viewport.width}×${viewport.height}`, async ({
    page,
    frontendServices,
  }) => {
    await page.setViewportSize(viewport);
    const identity = "SEED-18#story";
    const title = queuedTitle(8);
    observeSession(frontendServices, identity, title);
    await installAttachedTerminalSubstitute(page);
    putFrontendPublished(frontendServices, {
      revision,
      backlog: largeBacklog,
      files: {
        ".planning/seeds/SEED-18-queued.md": `---\nid: SEED-18\n---\n\n# Seed\n\n<a id="story"></a>\n\n### ${title}\n\n**Identity:** ${identity}\n\n**Goal:** ${"Read a long published goal without losing its beginning. ".repeat(80)}`,
      },
    });
    await page.goto(
      `/?${new URLSearchParams({ project: "open-dough", story: identity })}`,
    );
    await expectSettledPage(page);
    const card = parts(page).backlog.getByRole("article", {
      name: title,
      exact: true,
    });
    await expect(card).toBeFocused();
    await expectReadingTop(card);
    // A height-only resize can change sticky-heading clearance without
    // changing the row's content size. The reveal follows its own viewport.
    await page.setViewportSize({ ...viewport, height: viewport.height + 200 });
    await expectReadingTop(card);
    await page.setViewportSize(viewport);
    await expectReadingTop(card);
    const { terminal } = await openSessionEntry(page, title);
    // Covering hides the Board; Close first, then read the revealed card.
    // Beside, the Board stays readable.
    if (viewport.width <= 800) {
      await expectCovering(terminal);
      await closeTerminal(terminal);
      await expectReadingTop(card);
    } else {
      await expect(terminal.locator("textarea")).toBeFocused();
      await expectReadingTop(card);
      // Short beside window: the card still exceeds the Board's room.
      expect((await card.boundingBox())?.height).toBeGreaterThan(
        await boardScroll(page).evaluate((region) => region.clientHeight),
      );
    }
    await expectDocumentStill(page);
  });
}

for (const height of [800, 900, 1600]) {
  test(`the Session entry reveals the same story on the Board after Close at 700×${height}`, async ({
    page,
    frontendServices,
  }) => {
    frontendServices.answerMachine(
      makeMe.aMachineAnswer
        .observing(cardSession("Execution", readyStory, working()))
        .please(),
    );
    await installAttachedTerminalSubstitute(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 700, height });
    await page.goto("/");
    await expectSettledPage(page);
    const { sidebar, terminal } = await openSessionEntry(page, readyStory);
    await expect(sidebar.sidebar).toBeHidden();
    await expect(terminal.locator("textarea")).toBeFocused();
    await expectCovering(terminal);
    await closeTerminal(terminal);
    const card = parts(page).backlog.getByRole("article", {
      name: readyStory,
      exact: true,
    });
    // Full Board after Close: a card taller than the Board keeps the reading
    // edge; one that fits stays wholly in view.
    const room = await boardScroll(page).evaluate(
      (region) => region.clientHeight,
    );
    if (((await card.boundingBox())?.height ?? 0) > room) {
      await expectReadingTop(card);
    } else {
      await expectWhollyInView(page, readyStory);
    }
    await expectDocumentStill(page);
  });
}
