// Scan emphasis on a Taken card with current work: title and compact slice
// progress lead in the meta line; the open session and its primary action
// carry the strongest wash; Done and Inspect stay quieter and keyboard-
// reachable at wide and narrow viewports.

import type { Locator } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { renderSlicePlan } from "../../../Distribution/tests/support/published-plan.mjs";
import { renderStorySection } from "../../../Distribution/tests/support/published-seed.mjs";
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { putFrontendPublished } from "../../test-support/support/frontendServiceState.ts";
import {
  expectMembership,
  parts,
  sessionEntriesIn,
  storyCardDoneDisclosure,
} from "../../test-support/dashboardPage.ts";
import {
  backlogApart,
  describedRevisions,
} from "../../test-support/describedRevisions.ts";
import { expectStackedInOrder } from "../../test-support/pageLayout.ts";
import { storyCard } from "../../test-support/storyCardControls.ts";
import { expectSliceBar } from "../../test-support/storyCardFacts.ts";
import { sessionKey } from "../../src/sessionReference.ts";

const seedPath = ".planning/seeds/SEED-414-scan.md";
const planPath = ".planning/slice-plans/414-scan/PLAN.md";
const title = "Scan emphasis story";
const identity = "SEED-414#scan-emphasis";
const story = makeMe.aBacklogEntry
  .with({
    title,
    identity,
    href: "seeds/SEED-414-scan.md#scan-emphasis",
  })
  .please();

const { A } = describedRevisions(
  makeMe.aRepository
    .withRevision("A", {
      backlog: { taken: [story], queued: [] },
      files: {
        [seedPath]: `---
id: SEED-414
---

# Scan emphasis

${renderStorySection(story)}`,
        [planPath]: renderSlicePlan(
          makeMe.aSlicePlan
            .withStatuses(["done", "planned", "planned"])
            .please(),
        ),
      },
      storyStates: [
        {
          identity,
          href: story.href,
          ...makeMe.aStoryPreparation
            .plannedIn(`../slice-plans/414-scan/PLAN.md`)
            .please(),
        },
      ],
    })
    .please(),
  { A: "a1".repeat(20) },
);

const openRecord = makeMe.aLaunchRecord
  .executing({ identity, title })
  .inClaudeSession({ sessionId: "scan-open-execution" })
  .please();
const doneRecord = makeMe.aLaunchRecord
  .refining({ identity, title })
  .inClaudeSession({ sessionId: "scan-done-refinement" })
  .launchedAt(new Date(Date.now() - 120_000).toISOString())
  .markedDoneAt(new Date(Date.now() - 60_000).toISOString())
  .please();

async function computedStyle(locator: Locator, prop: string) {
  return locator.evaluate(
    (node, property) => getComputedStyle(node).getPropertyValue(property),
    prop,
  );
}

async function expectAccentWashDistinctFrom(
  session: Locator,
  quieter: Locator,
) {
  const wash = await computedStyle(session, "background-color");
  expect(wash).not.toBe("rgba(0, 0, 0, 0)");
  expect(await computedStyle(quieter, "color")).not.toBe(wash);
}

async function expectFocusedInTurn(controls: Locator[]) {
  for (const each of controls) {
    await each.focus();
    await expect(each).toBeFocused();
  }
}

async function expectVisible(parts: Locator[]) {
  for (const each of parts) await expect(each).toBeVisible();
}

test("a Taken card leads with title and compact progress, emphasizes the current session, and keeps Done and Inspect quieter", async ({
  page,
  frontendServices,
}) => {
  await test.step("a Taken card with current and Done work is on the Board", async () => {
    putFrontendPublished(frontendServices, backlogApart(A));
    frontendServices.answerMachine(
      makeMe.aMachineAnswer
        .observingOpen(openRecord)
        .observingDone(doneRecord)
        .please(),
    );
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await expectMembership(page, { taken: [title], backlog: [] });
  });

  const card = storyCard(parts(page).taken, title);
  const heading = card.locator("h3");
  const progress = card.locator(".story-card-meta .story-card-progress");
  const openSession = sessionEntriesIn(card).first();
  const disclosure = storyCardDoneDisclosure(card);
  const inspect = card.getByRole("button", { name: "Inspect story" });
  const primary = openSession.getByRole("button", { name: /Open terminal/i });

  await test.step("title and compact progress lead above the current session, Done, and Inspect", async () => {
    await expect(heading).toHaveText(title);
    await expectSliceBar(card, "1 of 3 slices recorded complete", [
      "done",
      "planned",
      "planned",
    ]);
    await expectStackedInOrder([
      heading,
      progress,
      openSession,
      disclosure,
      card.locator(".story-card-inspection-group"),
    ]);
  });

  await test.step("the current session carries an accent wash distinct from quieter Done and Inspect", async () => {
    await expect(openSession).toHaveAttribute(
      "data-shows-session",
      sessionKey(openRecord.session),
    );
    await expect(primary).toBeVisible();
    await expectAccentWashDistinctFrom(
      openSession,
      disclosure.locator("summary"),
    );
    expect(await computedStyle(inspect, "color")).toMatch(/rgb/);
  });

  await test.step("Open terminal, Done, and Inspect stay keyboard-reachable", async () => {
    await expectFocusedInTurn([
      primary,
      disclosure.locator("summary"),
      inspect,
    ]);
  });

  await test.step("at a narrow viewport the same scan facts remain visible and the meta line fits", async () => {
    await page.setViewportSize({ width: 360, height: 800 });
    await expectVisible([
      heading,
      progress,
      openSession,
      primary,
      disclosure,
      inspect,
    ]);
    expect(
      (await card.locator(".story-card-meta").boundingBox())?.width,
    ).toBeLessThanOrEqual(360);
  });
});
