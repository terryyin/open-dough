import { expect, githubFor } from "./dashboardTest.ts";
import { test } from "./storyDependencyFixture.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import { expectEntries } from "./recentlyDoneColumn.ts";
import { recordsAsked } from "./recentlyDoneProgressivePage.ts";
import { noConnection } from "./originAnswers.ts";
import { expectReadingTop } from "./readingPlace.ts";
import {
  doneEntries,
  donePathsThrough,
  farDone,
  nearDone,
  publishDoneReferences,
} from "./storyReferenceDone.ts";

test.setTimeout(120_000);
test.use({ hasTouch: true });

test("a Done reference without sessions reveals exactly through its existing destination and keeps a longer range", async ({
  page,
  origin,
  dashboard,
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
  expect(recordsAsked(githubFor(page)).toSorted()).toEqual(
    donePathsThrough(10).toSorted(),
  );
  const consumer = backlog.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  await consumer.locator(".story-dependencies summary").click();
  const near = recent.getByRole("article", {
    name: nearDone.title,
    exact: true,
  });
  await consumer
    .getByRole("link", { name: nearDone.identity, exact: true })
    .click();
  await expect(near).toBeFocused();
  await expect(near).toBeInViewport({ ratio: 0.5 });
  await expectReadingTop(near);
  await expectEntries(
    recent,
    doneEntries.slice(0, 10).map(({ title }) => title),
  );
  expect(recordsAsked(githubFor(page)).toSorted()).toEqual(
    donePathsThrough(10).toSorted(),
  );
  await consumer
    .getByRole("link", { name: farDone.identity, exact: true })
    .click();
  const destination = recent.getByRole("article", {
    name: farDone.title,
    exact: true,
  });
  await expect(destination).toBeFocused();
  await expect(destination).toBeInViewport({ ratio: 0.5 });
  await expectEntries(
    recent,
    doneEntries.slice(0, 27).map(({ title }) => title),
  );
  await expect(recent).toContainText("Showing 27 of 35 entries.");
  expect(recordsAsked(githubFor(page)).toSorted()).toEqual(
    donePathsThrough(27).toSorted(),
  );
  await consumer
    .getByRole("link", { name: farDone.identity, exact: true })
    .click();
  await expect(destination).toBeFocused();
  await expect(destination).toBeInViewport({ ratio: 0.5 });
  await consumer
    .getByRole("link", { name: nearDone.identity, exact: true })
    .click();
  await expect(
    recent.getByRole("article", { name: nearDone.title, exact: true }),
  ).toBeFocused();
  await expect(recent).toContainText("Showing 27 of 35 entries.");
  expect(recordsAsked(githubFor(page)).toSorted()).toEqual(
    donePathsThrough(27).toSorted(),
  );
  await expect(recent.locator(".session-entry")).toHaveCount(0);
  await expect(page.locator(".story-reference-notice")).toBeEmpty();
  expect(new URL(page.url()).hostname).toBe("127.0.0.1");
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(dashboard.claudeAttaches()).toEqual([]);
});

test("a delayed Done detail keeps the destination pending and keyboard activation reaches it at a narrow reduced-motion viewport", async ({
  page,
  origin,
}) => {
  await page.setViewportSize({ width: 390, height: 740 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const revision = await publishDoneReferences(origin);
  const published = await publishCommittedOrigin(page, {
    repoDir: origin.project,
    revision,
    repository: "terryyin/open-dough",
  });
  const release = published.hold(farDone.path);
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
  await consumer.locator(".story-dependencies summary").tap();
  const link = consumer.getByRole("link", {
    name: farDone.identity,
    exact: true,
  });
  await link.focus();
  await page.keyboard.press("Enter");
  const destination = recent.locator(`[data-done-story="${farDone.identity}"]`);
  const notice = page.getByRole("status", {
    name: "Story reference navigation",
  });
  await expect(destination).toContainText("Reading done story…");
  await expect(destination).not.toBeFocused();
  await expect(notice).toContainText(
    `Reading Open Dough to find ${farDone.identity}`,
  );
  await expect(notice).not.toContainText("unavailable");
  await expect
    .poll(() => recordsAsked(githubFor(page)).toSorted())
    .toEqual(donePathsThrough(27).toSorted());
  release();
  await expect(destination).toHaveAccessibleName(farDone.title);
  await expect(destination).toBeFocused();
  await expect(destination).toBeInViewport({ ratio: 0.5 });
  await expect(notice).toBeEmpty();
  expect(recordsAsked(githubFor(page)).toSorted()).toEqual(
    donePathsThrough(27).toSorted(),
  );
});

test("a failed Done detail reveals its identified gap and the existing Done retry recovers without reading older stories", async ({
  page,
  origin,
}) => {
  const revision = await publishDoneReferences(origin);
  const published = await publishCommittedOrigin(page, {
    repoDir: origin.project,
    revision,
    repository: "terryyin/open-dough",
  });
  const restore = published.answerWith(farDone.path, noConnection);
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
  await consumer
    .getByRole("link", { name: farDone.identity, exact: true })
    .click();
  const destination = recent.locator(`[data-done-story="${farDone.identity}"]`);
  await expect(destination).toContainText("This done story could not be read.");
  await expect(destination).toHaveAccessibleName(farDone.identity);
  await expect(destination).toBeFocused();
  await expect(destination).toBeInViewport({ ratio: 0.5 });
  await expect(page.locator(".story-reference-notice")).toBeEmpty();
  restore();
  await recent.getByRole("button", { name: "Retry done stories" }).click();
  await expectEntries(
    recent,
    doneEntries.slice(0, 27).map(({ title }) => title),
  );
  await expect(recent).not.toContainText("could not be read");
  expect(
    recordsAsked(githubFor(page)).filter(
      (path) => !donePathsThrough(27).includes(path),
    ),
  ).toEqual([]);
  expect(
    recordsAsked(githubFor(page)).filter((path) => path === farDone.path),
  ).toHaveLength(2);
  await consumer
    .getByRole("link", { name: farDone.identity, exact: true })
    .click();
  await expect(destination).toBeFocused();
});
