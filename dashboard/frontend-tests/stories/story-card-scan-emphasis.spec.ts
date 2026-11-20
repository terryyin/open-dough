// Scan emphasis on a Taken card with current work: title and compact slice
// progress lead in the meta line; the open session carries the accent wash;
// Done and Inspect stay quieter and keyboard-reachable at wide and narrow
// viewports.

import { expect, test } from "vitest";
import { commands } from "vitest/browser";
import { mountAnsweredDashboard } from "../../test-support/mounted-dashboard/mountedDashboard.ts";
import { scanEmphasisCard } from "./scan-emphasis-card-page.ts";

async function mountScanEmphasisCard(width: number) {
  const { answers, boardPositionKey, title, openSession } =
    await commands.scanEmphasisBoard();
  const dashboard = await mountAnsweredDashboard({
    answers,
    boardPositionKey,
    viewport: { width, height: 900 },
  });
  return {
    card: scanEmphasisCard(dashboard.container, title),
    title,
    openSession,
  };
}

test("a Taken card leads with title and compact progress, then the current session, Done and Inspect", async () => {
  const { card, title, openSession } = await mountScanEmphasisCard(1280);
  const { parts } = card;
  expect(parts.heading.textContent).toBe(title);
  expect(card.sliceCount()).toBe("1 of 3 slices recorded complete");
  expect(card.sliceStatuses()).toEqual(["done", "planned", "planned"]);
  expect(parts.openSession.getAttribute("data-shows-session")).toBe(
    openSession,
  );
  card.expectStackedInOrder([
    parts.heading,
    parts.progress,
    parts.openSession,
    parts.doneDisclosure,
    parts.inspectionGroup,
  ]);
});

test("the current session carries the accent wash while Done and Inspect stay quiet", async () => {
  const { card } = await mountScanEmphasisCard(1280);
  card.expectEmphasis();
});

test("Open terminal, Done and Inspect take keyboard focus in turn", async () => {
  const { card } = await mountScanEmphasisCard(1280);
  const { parts } = card;
  card.expectFocusedInTurn([
    parts.openTerminal,
    parts.doneSummary,
    parts.inspect,
  ]);
});

test("at 360 pixels wide the card keeps its scan facts visible and its meta line fits", async () => {
  const { card } = await mountScanEmphasisCard(360);
  const { parts } = card;
  card.expectVisible([
    parts.heading,
    parts.progress,
    parts.openSession,
    parts.openTerminal,
    parts.doneDisclosure,
    parts.inspect,
  ]);
  expect(parts.meta.getBoundingClientRect().width).toBeLessThanOrEqual(360);
});
