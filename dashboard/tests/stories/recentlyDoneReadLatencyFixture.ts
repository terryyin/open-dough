// Slow done-record reads leave Taken owners, preparation, and slice clocks
// readable. The catalog places done cards and local sessions before their
// records arrive; cards fill when answered and keep their place on timeout.
// Timed-out record/catalog reads are Recently done gaps, retried on the detail
// recovery schedule, without failing project membership. Fake GitHub publishes
// sliceClockRecords.ts plus two rendered done records/catalog and holds the
// selected read. Synthetic Claude supplies sessions, page time is paused, and
// the real local read boundary and page determine every displayed result.

import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { Page } from "@playwright/test";
import { renderDoneRecord } from "../../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { expect, githubFor, pausePageClockAt } from "../dashboardTest.ts";
import { expectMembership, parts, shortRevision } from "../dashboardPage.ts";
import { publishes } from "../support/fakeGitHub.ts";
import type { GhRequest } from "../support/ghRequest.ts";
import { holdingAnswer } from "../support/heldGitHubAnswer.ts";
import { keepLaunchRecords } from "../support/storyLaunchRecord.ts";
import type { DashboardServer } from "../support/dashboardServer.ts";
import {
  afterTake,
  committed,
  files,
  history,
  opened,
  repository,
  revision,
  stories,
} from "../sliceClockRecords.ts";
import {
  doneDirectory,
  doneRecordAt,
  executed,
  removedQueued,
} from "../recentlyDoneRecords.ts";
import { withDoneCatalog } from "../doneCatalogAnswers.ts";
import { sessionsOutsideDoneStories } from "../recentlyDoneColumn.ts";

const hour = 60 * 60_000;
// The done record whose content read GitHub answers only once released.
const heldRecord = doneRecordAt(executed.identity);
const isHeldRecord = (request: GhRequest) =>
  request.kind === "content" && request.path === heldRecord;
// The done catalog, whose content read GitHub answers only once released.
export const isHeldCatalog = (request: GhRequest) =>
  request.kind === "content" &&
  request.path === `${doneDirectory}/.catalog.json`;
const doneRecords = {
  [heldRecord]: renderDoneRecord(
    makeMe.aDoneRecord
      .with({
        ...executed,
        completedAt: new Date(opened.getTime() - 2 * hour).toISOString(),
        developer: "Terry Yin",
      })
      .please(),
  ),
  [doneRecordAt(removedQueued.identity)]: renderDoneRecord(
    makeMe.aDoneRecord
      .with({
        ...removedQueued,
        completedAt: new Date(opened.getTime() - 24 * hour).toISOString(),
        developer: "Terry Yin",
      })
      .please(),
  ),
};

export async function openedWithHeldDoneRecord(
  page: Page,
  dashboard: DashboardServer,
  isHeld: (request: GhRequest) => boolean = isHeldRecord,
) {
  const closedId = dashboard.claudeListsSession({
    name: executed.title,
    cwd: dashboard.home,
    startedAt: opened.getTime() - 4 * hour,
  });
  await keepLaunchRecords(dashboard, [
    ...sessionsOutsideDoneStories(dashboard, opened.getTime(), {
      adHoc: true,
      queued: true,
    }),
    {
      request: {
        source: "open-dough",
        workflow: "execution",
        host: "claude",
        ...executed,
      },
      session: {
        host: "claude",
        sessionId: closedId,
        shortId: closedId.slice(0, 8),
        name: executed.title,
      },
      launchedAt: new Date(opened.getTime() - 4 * hour).toISOString(),
      doneAt: new Date(opened.getTime() - hour).toISOString(),
    },
  ]);
  await pausePageClockAt(page, opened);
  const published = publishes({
    revision,
    files: withDoneCatalog({ ...files, ...doneRecords }, doneDirectory),
    committed,
    history,
  });
  const { answer, release } = holdingAnswer(published, isHeld);
  const github = githubFor(page);
  github.serve(repository, answer);
  await page.goto("/");
  await expectMembership(page, {
    taken: stories.map(({ title }) => title),
    backlog: [],
  });
  // The held read has reached GitHub through the local `gh`.
  await expect
    .poll(() => github.calls.some(({ request }) => isHeld(request)))
    .toBe(true);
  const { taken, recentlyDone, problem, readRevision } = parts(page);
  // Every Taken card's detail has answered, so the held read is the only one
  // a run to the wait bound can leave unanswered.
  await expect(taken.getByText(/^Reading .*…$/)).toHaveCount(0);
  // Holding a done-record body leaves membership free to finish. Wait for that
  // settle before a later `clock.runFor` of the shared wait bound: otherwise a
  // still-open observation's bound fires and arms project detail recovery even
  // though only the column's record read was meant to time out. A held catalog
  // is part of the observation, so settle waits for the bound instead.
  if (isHeld !== isHeldCatalog) {
    await expect(readRevision).toContainText(
      `Published work read at revision ${shortRevision(revision)}`,
    );
    await expect(problem).toHaveCount(0);
  }
  return {
    card: taken.getByRole("article", { name: afterTake }),
    recent: recentlyDone,
    closed: recentlyDone.locator(`[data-shows-session="claude:${closedId}"]`),
    problem,
    release,
  };
}
