// A done record read that failed is known only at the revision it was asked
// at: a refresh of the same project to a newer revision asks again, once, for
// the failed records the shown entries still need, while records already read
// and a record file the shared reader refuses keep what they said, unread
// again. A read failing again at the newer revision says so, with Retry. The
// same revision asks nothing new on its own. Publications and refreshes:
// ./recentlyDoneRefresh.ts; the `gh` calls reaching the fake GitHub show which
// records were read, and at which revision.

import { basename } from "node:path";
import type { Page } from "@playwright/test";
import {
  doneRecordFileName,
  renderDoneRecord,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { checkIntervalMs } from "../src/revisionCheckSchedule.ts";
import { expect, test } from "./dashboardTest.ts";
import { rem } from "./dashboardColumnsPage.ts";
import { expectEntries } from "./recentlyDoneColumn.ts";
import { noConnection } from "./originAnswers.ts";
import { doneDirectory } from "./recentlyDoneProgressive.ts";
import {
  isRecord,
  opened,
  revealAction,
  settle,
} from "./recentlyDoneProgressivePage.ts";
import { entries, entryAt, names } from "./recentlyDoneProgressiveJourney.ts";
import {
  laterStory,
  movingMain,
  namesOf,
  newest,
  recordsAskedAt,
  refreshedTo,
} from "./recentlyDoneRefresh.ts";
import { answeringFirst } from "./support/heldGitHubAnswer.ts";

test.use({ projectFolders: ["open-dough"] });

const newer = laterStory(0.5, "01", "Finish a newer progressive story");

// A record file published beside the list whose text names another identity,
// which the shared reader refuses.
const misnamed = `${doneDirectory}/${doneRecordFileName("SEED-399#progressive-misnamed")}`;
const refusal = `Done record ${basename(misnamed)} is unreadable: done record names another identity.`;
const beside = {
  [misnamed]: renderDoneRecord({
    identity: "SEED-398#named-inside",
    title: "Named for another identity",
    completedAt: "2026-01-01T00:00:00.000Z",
    developer: "Terry Yin",
  }),
};

// The stories among entries `from` to `to`.
const storiesFrom = (from: number, to: number) =>
  entries
    .slice(from - 1, to)
    .flatMap((entry) => (entry.kind === "story" ? [entry.path] : []));

// The done records the page asks the local read boundary for, by path, with
// the revision each is asked at, in order. The boundary reaches GitHub only
// for records it has not read before.
function demandedBy(page: Page) {
  const demanded: { readonly revision: string; readonly path: string }[] = [];
  page.on("request", (request) => {
    const query = new URL(request.url()).searchParams;
    if (query.get("done") !== "bodies") return;
    const revision = query.get("revision") ?? "";
    for (const file of query.getAll("file")) {
      demanded.push({ revision, path: `${doneDirectory}/${file}` });
    }
  });
  return {
    count: () => demanded.length,
    at: (revision: string) =>
      demanded.flatMap((each) =>
        each.revision === revision ? [each.path] : [],
      ),
  };
}

test("a newer revision asks once again for the failed records still shown, not for read or refused ones, and a read failing again there says so with Retry", async ({
  page,
  dashboard,
}) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 80 * rem, height: 900 });
  await page.clock.install();
  const demanded = demandedBy(page);
  const main = movingMain(beside);
  // The thirteenth entry's record fails once at the first revision, and once
  // at the second.
  const failing = entryAt(13);
  if (failing.kind !== "story") throw new Error("No story at 13");
  const failingPath = failing.path;
  let failingAgainAt = "";
  const view = await opened(page, dashboard, entries, {
    beside,
    answering: (published) =>
      answeringFirst(
        answeringFirst(
          main.answering(published),
          isRecord(failingPath),
          noConnection,
        ),
        (request) =>
          isRecord(failingPath)(request) &&
          request.kind === "content" &&
          request.revision === failingAgainAt,
        noConnection,
      ),
  });
  const { github, recent, now } = view;
  const failed = recent.getByRole("article", { name: failing.identity });
  const retry = recent.getByRole("button", { name: "Retry done stories" });

  await test.step("the first ten and the refused record file are read; the next ten's read fails, and the same revision asks nothing more on its own", async () => {
    await expectEntries(recent, names(10));
    await expect(recent).toContainText(refusal);
    await revealAction(recent).click();
    await expect(recent).toContainText("Done stories could not be read.");
    await expect(retry).toBeVisible();
    await expect(failed).toContainText("This done story could not be read.");
    const before = demanded.count();
    await page.clock.fastForward(checkIntervalMs);
    await settle(page);
    await page.clock.fastForward(checkIntervalMs);
    await settle(page);
    expect(demanded.count()).toBe(before);
    await expect(failed).toContainText("This done story could not be read.");
  });

  const atB = [newest, ...entries];
  await test.step("a newer revision with unchanged records asks once for the new record and the failed ones still shown, not the read or refused ones; failing again, it says so with Retry", async () => {
    failingAgainAt = "01".repeat(20);
    const revisionB = main.publish(now, atB);
    expect(revisionB).toBe(failingAgainAt);
    await refreshedTo(page, revisionB);
    // The first revision's failure still shows until the newer read answers,
    // so the failed record's read reaching GitHub is what this step waits on.
    await expect
      .poll(() => recordsAskedAt(github, revisionB))
      .toContain(failingPath);
    await expect(failed).toContainText("This done story could not be read.");
    await expect(recent).toContainText("Done stories could not be read.");
    await expect(retry).toBeVisible();
    await expect(recent).toContainText(refusal);
    const askedAtB = [newest.path, ...storiesFrom(11, 19)].toSorted();
    await expect
      .poll(() => demanded.at(revisionB).toSorted())
      .toEqual(askedAtB);
    await settle(page);
    expect(demanded.at(revisionB).toSorted()).toEqual(askedAtB);
  });

  const atC = [newer, ...atB];
  await test.step("the next revision asks once for the failed records still shown and their cards show; read and refused records are not asked again", async () => {
    const revisionC = main.publish(now, atC);
    await refreshedTo(page, revisionC);
    await expectEntries(recent, namesOf(atC, 20));
    await expect(recent).not.toContainText("could not be read");
    await expect(retry).toHaveCount(0);
    await expect(recent).toContainText(refusal);
    await settle(page);
    const asked = [newer.path, newest.path, ...storiesFrom(11, 18)];
    expect(demanded.at(revisionC).toSorted()).toEqual(asked.toSorted());
    expect(recordsAskedAt(github, revisionC)).toContain(failingPath);
    expect(
      recordsAskedAt(github, revisionC).filter((path) => !asked.includes(path)),
    ).toEqual([]);
  });
});
