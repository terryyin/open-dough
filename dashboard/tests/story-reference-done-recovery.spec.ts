import { expect, githubFor, pausePageClockAt } from "./dashboardTest.ts";
import { test } from "./storyDependencyFixture.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { shortRevision, parts } from "./dashboardPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import { expectEntries } from "./recentlyDoneColumn.ts";
import { recordsAsked, settle } from "./recentlyDoneProgressivePage.ts";
import { noConnection } from "./originAnswers.ts";
import { passTimeUntilChecked } from "./autoRefreshJourney.ts";
import {
  doneEntries,
  donePathsThrough,
  farDone,
  expiredDone,
  unlisted,
  publishDoneReferences,
} from "./storyReferenceDone.ts";

test.setTimeout(120_000);
test.use({ hasTouch: true });

test("expired and unlisted references remain unavailable without fabricated blocks or history reads", async ({
  page,
  origin,
}) => {
  const revision = await publishDoneReferences(origin);
  await publishCommittedOrigin(page, {
    repoDir: origin.project,
    revision,
    repository: "terryyin/open-dough",
  });
  await openUntilRead(page);
  const { backlog, recentlyDone: recent } = parts(page);
  await expectEntries(
    recent,
    doneEntries.slice(0, 10).map(({ title }) => title),
  );
  const consumer = backlog.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  await consumer.locator(".story-dependencies summary").click();
  const before = githubFor(page).calls.length;
  for (const entry of [expiredDone, unlisted]) {
    await consumer
      .getByRole("link", { name: entry.identity, exact: true })
      .click();
    await expect(page.locator(".story-reference-notice")).toContainText(
      `${entry.identity} is unavailable in Open Dough's dashboard`,
    );
    await expect(
      recent.locator(`[data-done-story="${entry.identity}"]`),
    ).toHaveCount(0);
  }
  await settle(page);
  expect(githubFor(page).calls.slice(before)).toEqual([]);
  expect(recordsAsked(githubFor(page)).toSorted()).toEqual(
    donePathsThrough(10).toSorted(),
  );
  await consumer.getByRole("button", { name: "Inspect story" }).click();
  await expect(
    consumer.getByRole("region", { name: "Detail for Story A" }),
  ).toBeVisible();
});

test("Done catalog loading and failure stay distinct from absence and story retry reaches the recovered catalog", async ({
  page,
  origin,
}) => {
  const revision = await publishDoneReferences(origin);
  const published = await publishCommittedOrigin(page, {
    repoDir: origin.project,
    revision,
    repository: "terryyin/open-dough",
  });
  const catalog = ".planning/done/.catalog.json";
  const release = published.hold(catalog);
  const restore = published.answerWith(catalog, noConnection);
  await pausePageClockAt(page, new Date());
  await page.goto("/");
  const { backlog, recentlyDone: recent } = parts(page);
  const consumer = backlog.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  await expect(consumer.locator(".story-dependencies summary")).toBeVisible();
  await consumer.locator(".story-dependencies summary").click();
  await consumer
    .getByRole("link", { name: farDone.identity, exact: true })
    .click();
  const notice = page.getByRole("status", {
    name: "Story reference navigation",
  });
  await expect(notice).toContainText(
    `Reading Open Dough to find ${farDone.identity}`,
  );
  await expect(notice).not.toContainText("unavailable");
  expect(recordsAsked(githubFor(page))).toEqual([]);
  release();
  await expect(notice).toContainText(
    `Could not read Open Dough to find ${farDone.identity}`,
  );
  await expect(notice).not.toContainText("unavailable");
  await expect(recent).toContainText("Done stories could not be read.");
  restore();
  await notice.getByRole("button", { name: "Retry story reference" }).click();
  // The existing published-observation owner retains its announced recovery
  // wait; story navigation neither resets nor bypasses that read policy.
  const recovery = page.getByRole("alert").filter({
    has: page.getByRole("heading", {
      name: "Reading unanswered detail again",
    }),
  });
  const when = Date.parse(
    (await recovery.locator("time").getAttribute("datetime")) ?? "",
  );
  await page.clock.fastForward(when - (await page.evaluate(() => Date.now())));
  const destination = recent.getByRole("article", {
    name: farDone.title,
    exact: true,
  });
  await expect(destination).toBeFocused();
  await expect(destination).toBeInViewport({ ratio: 0.5 });
  await expect(notice).toBeEmpty();
  expect(recordsAsked(githubFor(page)).toSorted()).toEqual(
    donePathsThrough(27).toSorted(),
  );
});

for (const observation of ["unavailable", "failed"] as const) {
  test(`a later inspection supersedes a ${observation} Done reference when its catalog subsequently heals`, async ({
    page,
    origin,
  }) => {
    const revision = await publishDoneReferences(origin, {
      omitDestination: observation === "unavailable",
    });
    const published = await publishCommittedOrigin(page, {
      repoDir: origin.project,
      revision,
      repository: "terryyin/open-dough",
      follows: true,
    });
    const restore =
      observation === "failed"
        ? published.answerWith(".planning/done/.catalog.json", noConnection)
        : () => undefined;
    await pausePageClockAt(page, new Date());
    await openUntilRead(page);
    const { backlog, recentlyDone: recent } = parts(page);
    const consumer = backlog.getByRole("article", {
      name: "Story A",
      exact: true,
    });
    await consumer.locator(".story-dependencies summary").click();
    await consumer
      .getByRole("link", { name: farDone.identity, exact: true })
      .click();
    const notice = page.getByRole("status", {
      name: "Story reference navigation",
    });
    await expect(notice).toContainText(
      observation === "failed"
        ? "Could not read Open Dough"
        : `${farDone.identity} is unavailable`,
    );
    await consumer.getByRole("button", { name: "Inspect story" }).click();
    const ownChoice = consumer.getByRole("button", { name: "Hide detail" });
    await expect(ownChoice).toBeFocused();
    await expect(notice).toBeEmpty();
    if (observation === "failed") {
      restore();
      const recovery = page.getByRole("alert").filter({
        has: page.getByRole("heading", {
          name: "Reading unanswered detail again",
        }),
      });
      const when = Date.parse(
        (await recovery.locator("time").getAttribute("datetime")) ?? "",
      );
      await page.clock.fastForward(
        when - (await page.evaluate(() => Date.now())),
      );
    } else {
      const healed = await publishDoneReferences(origin);
      await passTimeUntilChecked(page);
      await expect(parts(page).readRevision).toContainText(
        shortRevision(healed),
      );
    }
    await expect(recent.locator(".column-count")).toHaveText("35 entries");
    await expect(recent.locator(":scope > ol > li > article")).toHaveCount(10);
    await expect(
      recent.locator(`[data-done-story="${farDone.identity}"]`),
    ).toHaveCount(0);
    await expect(
      consumer.getByRole("region", { name: "Detail for Story A" }),
    ).toBeVisible();
    await expect(ownChoice).toBeFocused();
    await expect(notice).toBeEmpty();
  });
}
