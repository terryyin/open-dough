// What the Recently done sessions selection journeys
// (./sessions/recently-done-sessions-select*.spec.ts) publish, keep and open
// the page on: Open Dough with Intent locations and a spec to read, Pygardon
// with one published done story beside its Taken story, and Doughnut with
// none; and four retained Done sessions, newest completion first: Pygardon's
// done story's session, Open Dough's session whose workspace is gone so it
// opens its final report, a session of Pygardon's Taken story that no done
// record matches, and a Doughnut ad hoc session. The Pygardon sessions are ones the synthetic
// `claude` lists, so Open reaches their terminal.

import path from "node:path";
import type { Locator, Page, Route } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { makeMe } from "../../tests/support/makeMe.mjs";
import { renderDoneRecord } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { authenticatedReadEndpoint } from "../src/authenticatedReadRules.ts";
import { catalogPublications } from "./catalogProjectRecords.ts";
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

export async function keepSelectionSessions(
  dashboard: DashboardServer,
  now: number,
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
    ],
    "open-dough": [
      makeMe.aLaunchRecord
        .executing({ identity: report.identity, title: report.title })
        .onStoryBranch({
          workspace: path.join(dashboard.home, "retired-workspace"),
          branch: "claude/reported",
        })
        .inClaudeSession({ sessionId: "reported-session", shortId: "reported" })
        .reporting({ message: report.message })
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
    ],
  });
}

// Holds Pygardon's done catalog reads from now on: `asked` resolves once one
// reaches the page's boundary, and `release` lets every held one through.
export async function holdPygardonCatalog(page: Page) {
  let asked: () => void = () => undefined;
  const askedOnce = new Promise<void>((resolve) => {
    asked = resolve;
  });
  let release: () => void = () => undefined;
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(isPygardonCatalog, async (route: Route) => {
    asked();
    await released;
    // The page may have abandoned the read meanwhile.
    await route.fallback().catch(() => undefined);
  });
  return { asked: askedOnce, release };
}

export const isPygardonCatalog = (url: URL) =>
  url.pathname === authenticatedReadEndpoint &&
  url.searchParams.get("source") === "pygardon" &&
  url.searchParams.get("done") === "catalog";

// What a chosen row says while its done story is unread or unknown.
export const choiceStatus = (row: Locator) =>
  row.locator(".sessions-sidebar-session-entry-choice");

// The page opened on Open Dough with Recently done sessions expanded, by
// pointer or, given `tap`, by touch at the viewport the case uses.
export async function openSelectionPage(
  page: Page,
  dashboard: DashboardServer,
  tap?: typeof tapWhereShown,
) {
  const now = Date.now();
  if (tap === undefined)
    await page.setViewportSize({ width: 1600, height: 900 });
  await publishSelectionProjects(page, now);
  await keepSelectionSessions(dashboard, now);
  await openUntilRead(page);
  const shown = recentlyDoneParts(page);
  if (tap === undefined) await shown.button.click();
  else await tap(shown.button);
  // The section header is a disclosure row, not a 44px touch control.
  await shown.header.click();
  await expect(shown.entries).toHaveCount(4);
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

// Resolves once the page has read Pygardon's done catalog.
export const pygardonCatalogRead = (page: Page) =>
  page.waitForResponse((response) =>
    isPygardonCatalog(new URL(response.url())),
  );
