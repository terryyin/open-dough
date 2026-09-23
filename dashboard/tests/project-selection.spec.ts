// Two synthetic public origins, each with its own revision and its own
// telling of a story identity the two projects happen to share. Selecting a
// project shows only that project's overview, through the same reader and
// presentation Open Dough already used when it was the only source.

import { expect, test } from "@playwright/test";
import { expectMembership, openDirection, parts } from "./dashboardPage";
import {
  commitAnswer,
  emptyBacklog,
  publishOrigin,
  rawFileAnswer,
} from "./githubOrigin";

const openDoughRepository = "terryyin/open-dough";
const doughnutRepository = "nerds-odd-e/doughnut";

const revisionOpenDough = "d0".repeat(20);
const revisionDoughnut = "9f".repeat(20);

// The same recorded identity, told differently by each project: it must not
// be merged into one entry or carried from one project's snapshot to the
// other's.
const sharedStoryIdentity = "SEED-777#shared-story";
const openDoughSharedTitle = "Open Dough's telling of the shared story";
const doughnutSharedTitle = "Doughnut's telling of the shared story";

const openDoughTakenTitle = "Open Dough's own taken story";
const openDoughQueuedTitle = "Open Dough's own queued story";
const doughnutTakenTitle = "Doughnut's own taken story";
const doughnutQueuedTitle = "Doughnut's own queued story";

const openDoughBacklog = `# Product backlog

## Near-future direction

Show Open Dough's own published direction, distinct from any other project.

## Taken

- [${openDoughTakenTitle}](quick/900-open-dough-story/PLAN.md) — OD-1#story

## Backlog list

- [${openDoughSharedTitle}](seeds/SEED-777-shared.md#shared-story) — ${sharedStoryIdentity}
- [${openDoughQueuedTitle}](seeds/SEED-901-open-dough.md#queued) — OD-2#queued
`;

const doughnutBacklog = `# Product backlog

## Near-future direction

Show Doughnut's own published direction, distinct from Open Dough's.

## Taken

- [${doughnutTakenTitle}](quick/500-doughnut-story/PLAN.md) — DN-1#story

## Backlog list

- [${doughnutSharedTitle}](seeds/SEED-777-shared.md#shared-story) — ${sharedStoryIdentity}
- [${doughnutQueuedTitle}](seeds/SEED-600-doughnut.md#queued) — DN-2#queued
`;

const titlesOfOpenDough = {
  taken: [openDoughTakenTitle],
  backlog: [openDoughSharedTitle, openDoughQueuedTitle],
};
const titlesOfDoughnut = {
  taken: [doughnutTakenTitle],
  backlog: [doughnutSharedTitle, doughnutQueuedTitle],
};

test("project selection shows each public project's own overview, and returning to a project reads it again", async ({
  page,
}) => {
  const openDoughRequests = await publishOrigin(
    page,
    {
      ref: commitAnswer(revisionOpenDough),
      backlog: {
        revision: revisionOpenDough,
        answer: rawFileAnswer(openDoughBacklog),
      },
    },
    openDoughRepository,
  );
  const doughnutRequests = await publishOrigin(
    page,
    {
      ref: commitAnswer(revisionDoughnut),
      backlog: {
        revision: revisionDoughnut,
        answer: rawFileAnswer(doughnutBacklog),
      },
    },
    doughnutRepository,
  );

  await page.goto("/");
  const { project, source, direction } = parts(page);

  await test.step("Open Dough is the default selection, read once, and Doughnut is not requested", async () => {
    await expect(
      project.getByRole("radio", { name: "Open Dough", exact: true }),
    ).toBeChecked();
    await expectMembership(page, titlesOfOpenDough);
    await openDirection(page);
    await expect(direction).toContainText(
      "Show Open Dough's own published direction",
    );
    await expect(source).toContainText(openDoughRepository);
    await expect(source).toContainText(revisionOpenDough);
    expect(openDoughRequests).toHaveLength(2);
    expect(doughnutRequests).toHaveLength(0);
  });

  await test.step("selecting Doughnut shows only Doughnut's overview; Open Dough is not read again", async () => {
    await project.getByRole("radio", { name: "Doughnut", exact: true }).check();
    await expectMembership(page, titlesOfDoughnut);
    await openDirection(page);
    await expect(direction).toContainText(
      "Show Doughnut's own published direction",
    );
    await expect(source).toContainText(doughnutRepository);
    await expect(source).toContainText(revisionDoughnut);
    await expect(page.locator("body")).not.toContainText(openDoughTakenTitle);
    await expect(page.locator("body")).not.toContainText(openDoughSharedTitle);
    expect(doughnutRequests).toHaveLength(2);
    expect(openDoughRequests).toHaveLength(2);
  });

  await test.step("the shared story identity is Doughnut's own entry, linked into Doughnut's snapshot", async () => {
    const sharedCard = page.getByRole("article", {
      name: doughnutSharedTitle,
    });
    await expect(sharedCard).toContainText(sharedStoryIdentity);
    const link = sharedCard.getByRole("link", { name: /^Canonical record/ });
    await expect(link).toHaveAttribute(
      "href",
      `https://github.com/${doughnutRepository}/blob/${revisionDoughnut}/.planning/seeds/SEED-777-shared.md#shared-story`,
    );
  });

  await test.step("returning to Open Dough shows its overview again, read afresh", async () => {
    await project
      .getByRole("radio", { name: "Open Dough", exact: true })
      .check();
    await expectMembership(page, titlesOfOpenDough);
    await openDirection(page);
    await expect(direction).toContainText(
      "Show Open Dough's own published direction",
    );
    await expect(source).toContainText(revisionOpenDough);
    await expect(page.locator("body")).not.toContainText(doughnutSharedTitle);
    await expect(page.locator("body")).not.toContainText(doughnutTakenTitle);
    // A fresh read, not a cached replay: ref and file are asked again.
    expect(openDoughRequests).toHaveLength(4);
    expect(doughnutRequests).toHaveLength(2);
  });

  await test.step("the shared story identity is again Open Dough's own entry, linked into Open Dough's snapshot", async () => {
    const sharedCard = page.getByRole("article", {
      name: openDoughSharedTitle,
    });
    const link = sharedCard.getByRole("link", { name: /^Canonical record/ });
    await expect(link).toHaveAttribute(
      "href",
      `https://github.com/${openDoughRepository}/blob/${revisionOpenDough}/.planning/seeds/SEED-777-shared.md#shared-story`,
    );
  });
});

test("project selection preserves empty Taken/Backlog groups and no-direction handling for the newly selected project", async ({
  page,
}) => {
  await publishOrigin(
    page,
    {
      ref: commitAnswer(revisionOpenDough),
      backlog: {
        revision: revisionOpenDough,
        answer: rawFileAnswer(openDoughBacklog),
      },
    },
    openDoughRepository,
  );
  await publishOrigin(
    page,
    {
      ref: commitAnswer(revisionDoughnut),
      backlog: {
        revision: revisionDoughnut,
        answer: rawFileAnswer(emptyBacklog),
      },
    },
    doughnutRepository,
  );

  await page.goto("/");
  await expectMembership(page, titlesOfOpenDough);
  const { project, backlog, taken, direction, source } = parts(page);

  await project.getByRole("radio", { name: "Doughnut", exact: true }).check();

  await expect(taken).toContainText("No Taken entries are recorded.");
  await expect(taken).toContainText("0 entries");
  await expect(backlog).toContainText("No Backlog entries are recorded.");
  await expect(backlog).toContainText("0 entries");
  await openDirection(page);
  await expect(direction).toContainText(
    "No near-future direction is recorded.",
  );
  await expect(source).toContainText(doughnutRepository);
  await expect(source).toContainText(revisionDoughnut);
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText(openDoughSharedTitle);
  await expect(page.locator("body")).not.toContainText(openDoughTakenTitle);
});
