import { expect } from "./dashboardTest.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import {
  test,
  twoDependencies,
  publishDependencies,
} from "./storyDependencyFixture.ts";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { startOrigin } from "./support/startOrigin.ts";
import { notFoundAnswer } from "./originAnswers.ts";
import { pausePageClock } from "./autoRefreshJourney.ts";

test.setTimeout(120_000);
test.use({ hasTouch: true });

test("missing, reading and failed reference destinations stay distinct and retry reaches a newly published block", async ({
  page,
  origin,
}) => {
  const revision = await twoDependencies(origin);
  const published = await publishCommittedOrigin(page, {
    repoDir: origin.project,
    revision,
    repository: "terryyin/open-dough",
    follows: true,
  });
  await pausePageClock(page);
  await openUntilRead(page);
  const consumer = parts(page).backlog.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  const knownNotice = page.getByRole("status", {
    name: "Story reference navigation",
  });
  await expect(knownNotice).toBeEmpty();
  await knownNotice.evaluate((element) => {
    element.setAttribute("data-known", "true");
  });
  await consumer.locator(".story-dependencies summary").click();
  await consumer.getByRole("link", { name: "SEED-C#c", exact: true }).click();
  const notice = page.locator(".story-reference-notice");
  await expect(notice).toHaveAttribute("data-known", "true");
  await expect(notice).toContainText(
    "SEED-C#c is unavailable in Open Dough's dashboard",
  );
  await expect(
    consumer.getByRole("button", { name: "Inspect story" }),
  ).toBeEnabled();
  const backlog = path.join(origin.project, ".planning/PRODUCT-BACKLOG.md");
  writeFileSync(
    backlog,
    `${readFileSync(backlog, "utf8")}\n- [Story C](seeds/C.md#c) — SEED-C#c\n`,
  );
  await publishDependencies(origin);
  const release = published.hold(".planning/PRODUCT-BACKLOG.md");
  const restore = published.answerWith(
    ".planning/PRODUCT-BACKLOG.md",
    notFoundAnswer(),
  );
  await notice.getByRole("button", { name: "Retry story reference" }).click();
  await expect(notice).toContainText("Reading Open Dough to find SEED-C#c");
  await expect(
    parts(page).backlog.getByRole("article", { name: "Story C", exact: true }),
  ).toHaveCount(0);
  release();
  await expect(notice).toContainText(
    "Could not read Open Dough to find SEED-C#c",
  );
  await expect(notice).not.toContainText("unavailable");
  restore();
  await notice.getByRole("button", { name: "Retry story reference" }).click();
  const destination = parts(page).backlog.getByRole("article", {
    name: "Story C",
    exact: true,
  });
  await expect(
    destination.getByRole("region", { name: "Detail for Story C" }),
  ).toBeVisible();
  await expect(destination).toBeFocused();
  await expect(destination).toBeInViewport({ ratio: 0.5 });
  await expect(notice).toBeEmpty();
});

test("leaving during a pending reference prevents the delayed read from moving focus or opening inspection", async ({
  page,
  origin,
  afterGitHubStops,
}) => {
  const revision = await twoDependencies(origin);
  const published = await publishCommittedOrigin(page, {
    repoDir: origin.project,
    revision,
    repository: "terryyin/open-dough",
    follows: true,
  });
  const pygardon = await startOrigin("terryyin/pygardon", "pygardon");
  afterGitHubStops(() => {
    pygardon.cleanup();
  });
  await publishCommittedOrigin(page, {
    repoDir: pygardon.project,
    revision: (await pygardon.originGit("rev-parse", "main")).trim(),
    repository: "terryyin/pygardon",
  });
  await pausePageClock(page);
  await openUntilRead(page);
  const consumer = parts(page).backlog.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  await consumer.locator(".story-dependencies summary").click();
  await consumer.getByRole("link", { name: "SEED-C#c", exact: true }).click();
  const notice = page.locator(".story-reference-notice");
  await expect(notice).toContainText("unavailable");
  const backlog = path.join(origin.project, ".planning/PRODUCT-BACKLOG.md");
  writeFileSync(
    backlog,
    `${readFileSync(backlog, "utf8")}\n- [Story C](seeds/C.md#c) — SEED-C#c\n`,
  );
  await publishDependencies(origin);
  const release = published.hold(".planning/PRODUCT-BACKLOG.md");
  await notice.getByRole("button", { name: "Retry story reference" }).click();
  await expect(notice).toContainText("Reading Open Dough");
  const project = parts(page).project.getByRole("radio", {
    name: "Pygardon",
    exact: true,
  });
  await project.click();
  await expect(project).toBeChecked();
  release();
  await expect(parts(page).projectTitle).toHaveText("Pygardon");
  await expect(notice).toBeEmpty();
  await expect(page.getByRole("region", { name: /^Detail for/ })).toHaveCount(
    0,
  );
  await expect(project).toBeFocused();
});

test("choosing another inspection during a pending reference keeps that choice when its destination arrives", async ({
  page,
  origin,
}) => {
  const revision = await twoDependencies(origin);
  const published = await publishCommittedOrigin(page, {
    repoDir: origin.project,
    revision,
    repository: "terryyin/open-dough",
    follows: true,
  });
  await pausePageClock(page);
  await openUntilRead(page);
  const consumer = parts(page).backlog.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  await consumer.locator(".story-dependencies summary").click();
  await consumer.getByRole("link", { name: "SEED-C#c", exact: true }).click();
  const notice = page.locator(".story-reference-notice");
  await expect(notice).toContainText("unavailable");
  const backlog = path.join(origin.project, ".planning/PRODUCT-BACKLOG.md");
  writeFileSync(
    backlog,
    `${readFileSync(backlog, "utf8")}\n- [Story C](seeds/C.md#c) — SEED-C#c\n`,
  );
  await publishDependencies(origin);
  const release = published.hold(".planning/PRODUCT-BACKLOG.md");
  await notice.getByRole("button", { name: "Retry story reference" }).click();
  await expect(notice).toContainText("Reading Open Dough");
  await consumer.getByRole("button", { name: "Inspect story" }).click();
  await expect(
    consumer.getByRole("region", { name: "Detail for Story A" }),
  ).toBeVisible();
  release();
  const destination = parts(page).backlog.getByRole("article", {
    name: "Story C",
    exact: true,
  });
  await expect(destination).toBeVisible();
  await expect(
    destination.getByRole("region", { name: "Detail for Story C" }),
  ).toHaveCount(0);
  await expect(
    consumer.getByRole("button", { name: "Hide detail" }),
  ).toBeFocused();
  await expect(notice).toBeEmpty();
});
