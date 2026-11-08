// What the Recently done sessions selection journeys
// (./sessions/recently-done-sessions-select*.spec.ts) publish, keep and open
// the page on: Open Dough with Intent locations and a spec to read, Pygardon
// with one published done story beside its Taken story, and Doughnut with
// none; and four retained Done sessions, newest completion first: Pygardon's
// done story's session, Open Dough's session whose workspace is gone so it
// opens its final report, a session of Pygardon's Taken story that no done
// record matches, and a Doughnut ad hoc session. The Pygardon sessions are ones the synthetic
// `claude` lists, so Open reaches their terminal. A case can keep more ad hoc
// sessions in Doughnut or Pygardon, done after that project's own entry, so
// the entry stands beyond the first ten its Board Recently done shows.

import path from "node:path";
import type { Locator, Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { makeMe } from "../../tests/support/makeMe.mjs";
import { renderDoneRecord } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { catalogPublications } from "./catalogProjectRecords.ts";
import { parts } from "./dashboardPage.ts";
import { withDoneCatalog } from "./doneCatalogAnswers.ts";
import {
  browseSpec,
  openDough,
  openDoughSettings,
  publishIntentProject,
} from "./intentCodeBrowseFixtures.ts";
import { publishFiles } from "./publishedFiles.ts";
import { doneDirectory, doneRecordAt } from "./recentlyDoneRecords.ts";
import { recentlyDoneParts } from "./recentlyDoneSessionsSidebarPage.ts";
import type { tapWhereShown } from "./pageLayout.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { keepProjectLaunchRecords } from "./support/storyLaunchRecord.ts";

const minute = 60_000;

export const linked = {
  identity: "SEED-501#finished-in-pygardon",
  title: "Pygardon finished story",
};
export const report = {
  identity: "SEED-301#queued",
  title: "Open Dough reported session",
  message: "Landed the reported change on main.",
};
// Pygardon's Taken story (./catalogProjectRecords.ts), still active.
export const takenElsewhere = {
  identity: "slice-plans/303-taken",
  title: "Pygardon's taken story session",
};
export const adHoc = {
  instruction: "Tidy Doughnut's notes",
  title: "Doughnut ad hoc session",
};
// Open Dough's Taken story the journeys select, and the spec they read.
export const openDoughTaken = {
  identity: "slice-plans/301-taken",
  title: "Open Dough's own taken story",
};
export const readSpec = "dashboard/tests/browse.spec.ts";

export async function publishSelectionProjects(page: Page, now: number) {
  await publishIntentProject(page, openDough, openDoughSettings, {
    [readSpec]: browseSpec,
  });
  const { pygardon, doughnut } = catalogPublications;
  await publishFiles(page, {
    repository: pygardon.repository,
    revision: pygardon.revision,
    files: withDoneCatalog(
      {
        ...pygardon.files,
        [doneRecordAt(linked.identity)]: renderDoneRecord(
          makeMe.aDoneRecord
            .completed({
              ...linked,
              completedAt: new Date(now - 60 * minute).toISOString(),
            })
            .please(),
        ),
      },
      doneDirectory,
    ),
  });
  await publishFiles(page, {
    repository: doughnut.repository,
    revision: doughnut.revision,
    files: doughnut.files,
  });
}

// How many more ad hoc sessions a case keeps in each project, each launched
// and done after the selection journeys' own Recently done entry there.
export type NewerSessions = {
  readonly doughnut?: number;
  readonly pygardon?: number;
};

// The `count` more ad hoc sessions a case keeps in `project`, each launched
// half a minute before it was done, between `from` and `to` minutes before
// `at(0)`; Board Recently done places a session by its launch.
function newerIn(
  project: keyof NewerSessions,
  count: number,
  { from, to }: { readonly from: number; readonly to: number },
  at: (minutes: number) => string,
) {
  return Array.from(Array(count).keys(), (index) => {
    const title = `${project} newer session ${String(index + 1)}`;
    const done = from - ((from - to) * index) / count;
    return makeMe.aLaunchRecord
      .adHoc({ instruction: title, title, source: project })
      .launchedAt(at(done + 0.5))
      .markedDoneAt(at(done))
      .please();
  });
}

export async function keepSelectionSessions(
  dashboard: DashboardServer,
  now: number,
  newer: NewerSessions = {},
) {
  const at = (minutes: number) =>
    new Date(now - minutes * minute).toISOString();
  const listed = (name: string) => ({
    sessionId: dashboard.claudeListsSession({
      name,
      cwd: dashboard.home,
      startedAt: now - 90 * minute,
    }),
  });
  await keepProjectLaunchRecords(dashboard, {
    pygardon: [
      makeMe.aLaunchRecord
        .executing({ ...linked, source: "pygardon" })
        .inClaudeSession(listed(linked.title))
        .launchedAt(at(90))
        .markedDoneAt(at(1))
        .please(),
      makeMe.aLaunchRecord
        .executing({ ...takenElsewhere, source: "pygardon" })
        .inClaudeSession(listed(takenElsewhere.title))
        .launchedAt(at(80))
        .markedDoneAt(at(3))
        .please(),
      // Done after the done story, before every row above.
      ...newerIn("pygardon", newer.pygardon ?? 0, { from: 50, to: 10 }, at),
    ],
    "open-dough": [
      makeMe.aLaunchRecord
        .executing({ identity: report.identity, title: report.title })
        .onStoryBranch({
          workspace: path.join(dashboard.home, "retired-workspace"),
          branch: "claude/reported",
        })
        .inClaudeSession({ sessionId: "reported-session", shortId: "reported" })
        .completedWith({ message: report.message })
        .launchedAt(at(70))
        .markedDoneAt(at(2))
        .please(),
    ],
    doughnut: [
      makeMe.aLaunchRecord
        .adHoc({ ...adHoc, source: "doughnut" })
        .launchedAt(at(60))
        .markedDoneAt(at(4))
        .please(),
      // Done after the ad hoc session above.
      ...newerIn("doughnut", newer.doughnut ?? 0, { from: 3.5, to: 1.25 }, at),
    ],
  });
}

// What a chosen row says while its done story is unread or unknown.
export const choiceStatus = (row: Locator) =>
  row.locator(".sessions-sidebar-session-entry-choice");

// The page opened on Open Dough, at `address` when given, with Recently
// done sessions expanded, by pointer or, given `tap`, by touch at the
// viewport the case uses, keeping the `newer` sessions the case asks for.
export async function openSelectionPage(
  page: Page,
  dashboard: DashboardServer,
  tap?: typeof tapWhereShown,
  {
    newer = {},
    address,
  }: { readonly newer?: NewerSessions; readonly address?: string } = {},
) {
  const now = Date.now();
  if (tap === undefined)
    await page.setViewportSize({ width: 1600, height: 900 });
  await publishSelectionProjects(page, now);
  await keepSelectionSessions(dashboard, now, newer);
  await openUntilRead(page, address);
  const shown = recentlyDoneParts(page);
  if (tap === undefined) await shown.button.click();
  else await tap(shown.button);
  // The section header is a disclosure row, not a 44px touch control.
  await shown.header.click();
  await expect(shown.entries).toHaveCount(
    4 + (newer.doughnut ?? 0) + (newer.pygardon ?? 0),
  );
  const row = (title: string) =>
    shown.entries.filter({ has: page.getByRole("heading", { name: title }) });
  return { shown, row };
}

// Opens the reported session's final report through its row's Open.
export async function showReport(
  page: Page,
  shown: ReturnType<typeof recentlyDoneParts>,
) {
  await shown.open(report.title).click();
  const panel = page.getByRole("region", { name: "Final report" });
  await expect(panel.locator(".final-report-text")).toHaveText(report.message);
  await expect(shown.entry(report.title)).toHaveAttribute(
    "aria-current",
    "true",
  );
  return panel;
}

// Development as it was: still chosen, Intent unopened, nothing attached, and
// the Side panel still showing the report in `panel`, or, without one, empty.
export async function expectDevelopmentKept(
  page: Page,
  dashboard: DashboardServer,
  panel?: Locator,
) {
  const { development, intent } = parts(page);
  await expect(development).toBeChecked();
  await expect(intent).toHaveCount(0);
  expect(new URL(page.url()).searchParams.get("perspective")).toBeNull();
  if (panel === undefined) {
    await expect(
      page.getByRole("region", { name: /^(Terminal|Final report)$/ }),
    ).toHaveCount(0);
  } else {
    await expect(panel.locator(".final-report-text")).toHaveText(
      report.message,
    );
    await expect(page.getByRole("region", { name: "Terminal" })).toHaveCount(0);
  }
  expect(dashboard.claudeAttaches()).toEqual([]);
}
