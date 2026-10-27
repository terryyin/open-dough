import { expect } from "./dashboardTest.ts";
import { test } from "./storyDependencyFixture.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import { expectEntries } from "./recentlyDoneColumn.ts";
import { settle } from "./recentlyDoneProgressivePage.ts";
import { showColumn } from "./boardPage.ts";
import {
  doneEntries,
  farDone,
  publishDoneReferences,
} from "./storyReferenceDone.ts";

test.setTimeout(120_000);
test.use({ hasTouch: true });

test("a developer's later move or latest-ten choice supersedes a pending Done reference", async ({
  page,
  origin,
}) => {
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
  await consumer.locator(".story-dependencies summary").click();
  await consumer
    .getByRole("link", { name: farDone.identity, exact: true })
    .click();
  const destination = recent.locator(`[data-done-story="${farDone.identity}"]`);
  await expect(destination).toContainText("Reading done story…");
  await consumer.getByRole("button", { name: "Inspect story" }).click();
  const ownChoice = consumer.getByRole("button", { name: "Hide detail" });
  await expect(ownChoice).toBeFocused();
  await expect(page.locator(".story-reference-notice")).toBeEmpty();
  // A repeated reference is a new destination; explicitly returning to ten
  // supersedes it too, even when the old record subsequently answers.
  await consumer
    .getByRole("link", { name: farDone.identity, exact: true })
    .click();
  await expect(page.locator(".story-reference-notice")).toContainText(
    "Reading Open Dough",
  );
  await showColumn(page, "Recently done");
  const latest = recent.getByRole("button", { name: "Show latest 10" });
  await latest.click();
  await expect(recent.locator(":scope > ol > li > article")).toHaveCount(10);
  release();
  await settle(page);
  await expectEntries(
    recent,
    doneEntries.slice(0, 10).map(({ title }) => title),
  );
  await expect(destination).toHaveCount(0);
  await expect(latest).toHaveCount(0);
  await expect(page.locator(".story-reference-notice")).toBeEmpty();
  await expect(
    consumer.getByRole("region", { name: "Detail for Story A" }),
  ).toBeVisible();
});

test("pointer down stops a pending Done jump while its data arrives and the pointer's chosen action still clicks", async ({
  page,
  origin,
}) => {
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
  await consumer.locator(".story-dependencies summary").click();
  await consumer
    .getByRole("link", { name: farDone.identity, exact: true })
    .click();
  const destination = recent.locator(`[data-done-story="${farDone.identity}"]`);
  await expect(destination).toContainText("Reading done story…");
  const ownAction = consumer.getByRole("button", { name: "Inspect story" });
  await ownAction.scrollIntoViewIfNeeded();
  const at = await ownAction.boundingBox();
  if (at === null) throw new Error("Inspect action has no box");
  await page.mouse.move(at.x + at.width / 2, at.y + at.height / 2);
  await page.mouse.down();
  release();
  await expect(destination).toHaveAccessibleName(farDone.title);
  await expect(destination).not.toBeFocused();
  await expect(ownAction).toBeFocused();
  await page.mouse.up();
  await expect(
    consumer.getByRole("region", { name: "Detail for Story A" }),
  ).toBeVisible();
  await expect(
    consumer.getByRole("button", { name: "Hide detail" }),
  ).toBeFocused();
  await expect(page.locator(".story-reference-notice")).toBeEmpty();
});

test("Tab away from a pending reference's Dismiss action supersedes its jump before held Done detail arrives", async ({
  page,
  origin,
}) => {
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
  await consumer.locator(".story-dependencies summary").click();
  await consumer
    .getByRole("link", { name: farDone.identity, exact: true })
    .click();
  const destination = recent.locator(`[data-done-story="${farDone.identity}"]`);
  await expect(destination).toContainText("Reading done story…");
  const dismiss = page.getByRole("button", { name: "Dismiss story reference" });
  await dismiss.focus();
  await page.keyboard.press("Tab");
  const moved = await page.locator(":focus").elementHandle();
  expect(await moved.evaluate((element) => element.tagName)).not.toBe("BODY");
  release();
  await expect(destination).toHaveAccessibleName(farDone.title);
  expect(
    await moved.evaluate((element) => element === document.activeElement),
  ).toBe(true);
  await expect(destination).not.toBeFocused();
  await expect(page.locator(".story-reference-notice")).toBeEmpty();
});
