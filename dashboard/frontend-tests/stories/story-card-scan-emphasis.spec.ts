import { createElement } from "react";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { PageFrame } from "../../src/PageFrame.tsx";
import { ProjectsOnPage } from "../../src/projectList.tsx";
import { sessionKey } from "../../src/sessionReference.ts";
import { StoryCard } from "../../src/StoryCard.tsx";
import { withClosedSessionsSidebar } from "../../test-support/component-mount/framePreferences.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { tabTo } from "../navigation/board-accessibility.ts";
import { noSessions } from "../navigation/board-mount.ts";
import { boardWork, story } from "../navigation/board-work.ts";
import { scanEmphasisCard } from "./scan-emphasis-card-page.ts";

async function mountScanEmphasisCard(width: number) {
  withClosedSessionsSidebar();
  const entry = story("Scan emphasis story", 414, {
    planSlices: {
      status: "interpreted",
      slices: [
        {
          index: 1,
          name: "Publish the first result",
          type: "Behavior",
          status: "done",
        },
        {
          index: 2,
          name: "Keep the current progress",
          type: "Behavior",
          status: "planned",
        },
        {
          index: 3,
          name: "Prove the remaining result",
          type: "Behavior",
          status: "planned",
        },
      ],
    },
  });
  const work = boardWork([], { taken: [entry] });
  const launch = makeMe.aLaunchRecord
    .executing(entry)
    .inClaudeSession({ sessionId: "scan-open-execution" })
    .please();
  const done = makeMe.aLaunchRecord
    .refining(entry)
    .inClaudeSession({ sessionId: "scan-done-refinement" })
    .launchedAt(new Date(Date.now() - 120_000).toISOString())
    .markedDoneAt(new Date(Date.now() - 60_000).toISOString())
    .please();
  const { records, hostOperations } = makeMe.aMachineAnswer
    .observingOpen(launch)
    .observingDone(done)
    .please();
  const launches = {
    ...noSessions,
    records,
    launched: records,
    hostOperations,
  };
  const frame = createElement(PageFrame, {
    sessions: launches,
    stories: {
      selected: work.source.id,
      shown: work.source.id,
      development: true,
      select: () => {},
      show: () => {},
      work,
    },
    children: createElement(StoryCard, {
      work,
      entry,
      priority: undefined,
      showsSliceProgress: true,
      launches,
      doneSessions: records.filter((record) => record.doneAt !== undefined),
      offersStart: false,
      selected: false,
      onSelect: () => {},
      inspected: false,
      onInspect: () => {},
      onOpenRoster: () => {},
    }),
  });
  await mountComponent(
    createElement(ProjectsOnPage, {
      projects: [work.source],
      replaceProjects: () => {},
      children: frame,
    }),
    { viewport: { width, height: 900 }, fillsViewport: true },
  );

  const mounted = page.getByRole("article", { name: entry.title, exact: true });
  await expect
    .element(mounted.getByRole("button", { name: "Open terminal" }))
    .toBeVisible();
  return {
    card: scanEmphasisCard(mounted.element()),
    title: entry.title,
    openSession: sessionKey(launch.session),
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
  const { card, title } = await mountScanEmphasisCard(1280);
  const { parts } = card;
  await tabTo(parts.openTerminal);
  await userEvent.tab();
  await expect
    .element(
      page
        .getByRole("article", { name: title, exact: true })
        .getByRole("button", { name: "Session details" }),
    )
    .toHaveFocus();
  await userEvent.tab();
  expect(document.activeElement).toBe(parts.doneSummary);
  await userEvent.tab();
  expect(document.activeElement).toBe(parts.inspect);
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
