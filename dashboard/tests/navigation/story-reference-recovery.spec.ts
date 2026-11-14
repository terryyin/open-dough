import { direction } from "../../../Distribution/tests/support/product-backlog-fixture.mjs";
import {
  queuedReadyRepository,
  roughStoryC,
  storyA,
  storyB,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import { expect } from "../dashboardTest.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import {
  shownProjectControl,
  chooseProject,
  expectProjectChoice,
  parts,
} from "../dashboardPage.ts";
import { openUntilRead } from "../pageRequestNotes.ts";
import { test, twoDependencies } from "../storyDependencyFixture.ts";
import { startOrigin } from "../support/startOrigin.ts";
import { notFoundAnswer } from "../originAnswers.ts";
import { pausePageClock } from "../autoRefreshJourney.ts";
import { storyCard } from "../storyCardControls.ts";
import {
  followReference,
  openDependencies,
  referenceNotice,
  retryReference,
  storyReference,
} from "../storyReference.ts";

// Story A waits on Story B and needs a decision about Story C, whose seed is
// published while it is not yet queued.
test.use({
  hasTouch: true,
  originRepository: queuedReadyRepository()
    .withRevision("dependencies", twoDependencies())
    .please(),
});

// Story C joins the queue after its reference was first followed.
const queueStoryC = {
  message: "Queue Story C",
  backlog: { direction, queued: [storyA, storyB, roughStoryC] },
};

test("missing, reading and failed reference destinations stay distinct and retry reaches a newly published block", async ({
  page,
  origin,
}) => {
  const revision = (await origin.originGit("rev-parse", "main")).trim();
  const published = await publishCommittedOrigin(page, {
    repoDir: origin.project,
    revision,
    repository: "terryyin/open-dough",
    follows: true,
  });
  await pausePageClock(page);
  await openUntilRead(page);
  const consumer = storyCard(parts(page).backlog, "Story A");
  // The same live region announces each outcome: it is marked while empty.
  const notice = referenceNotice(page);
  await expect(notice).toBeEmpty();
  await notice.evaluate((element) => {
    element.setAttribute("data-known", "true");
  });
  await openDependencies(consumer);
  await expect(storyReference(consumer, "SEED-C#c")).toBeVisible();
  await followReference(consumer, "SEED-C#c");
  await expect(notice).toHaveAttribute("data-known", "true");
  await expect(notice).toContainText(
    "SEED-C#c is unavailable in Open Dough's dashboard",
  );
  await expect(
    consumer.getByRole("button", { name: "Inspect story" }),
  ).toBeEnabled();
  await origin.publishRevision(queueStoryC);
  const release = published.hold(".planning/PRODUCT-BACKLOG.md");
  const restore = published.answerWith(
    ".planning/PRODUCT-BACKLOG.md",
    notFoundAnswer(),
  );
  await retryReference(page);
  await expect(notice).toContainText("Reading Open Dough to find SEED-C#c");
  const destination = storyCard(parts(page).backlog, "Story C");
  await expect(destination).toHaveCount(0);
  release();
  await expect(notice).toContainText(
    "Could not read Open Dough to find SEED-C#c",
  );
  await expect(notice).not.toContainText("unavailable");
  restore();
  await retryReference(page);
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
  const revision = (await origin.originGit("rev-parse", "main")).trim();
  const published = await publishCommittedOrigin(page, {
    repoDir: origin.project,
    revision,
    repository: "terryyin/open-dough",
    follows: true,
  });
  const pygardon = await startOrigin(queuedReadyRepository().please(), {
    repository: "terryyin/pygardon",
    projectId: "pygardon",
  });
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
  const consumer = storyCard(parts(page).backlog, "Story A");
  await openDependencies(consumer);
  await followReference(consumer, "SEED-C#c");
  const notice = referenceNotice(page);
  await expect(notice).toContainText("unavailable");
  await origin.publishRevision(queueStoryC);
  const release = published.hold(".planning/PRODUCT-BACKLOG.md");
  await retryReference(page);
  await expect(notice).toContainText("Reading Open Dough");
  await chooseProject(page, "Pygardon");
  await expectProjectChoice(page, "Pygardon");
  release();
  await expectProjectChoice(page, "Pygardon");
  await expect(notice).toBeEmpty();
  await expect(page.getByRole("region", { name: /^Detail for/ })).toHaveCount(
    0,
  );
  await expect(shownProjectControl(page)).toBeFocused();
});

test("choosing another inspection during a pending reference keeps that choice when its destination arrives", async ({
  page,
  origin,
}) => {
  const revision = (await origin.originGit("rev-parse", "main")).trim();
  const published = await publishCommittedOrigin(page, {
    repoDir: origin.project,
    revision,
    repository: "terryyin/open-dough",
    follows: true,
  });
  await pausePageClock(page);
  await openUntilRead(page);
  const consumer = storyCard(parts(page).backlog, "Story A");
  await openDependencies(consumer);
  await followReference(consumer, "SEED-C#c");
  const notice = referenceNotice(page);
  await expect(notice).toContainText("unavailable");
  await origin.publishRevision(queueStoryC);
  const release = published.hold(".planning/PRODUCT-BACKLOG.md");
  await retryReference(page);
  await expect(notice).toContainText("Reading Open Dough");
  await consumer.getByRole("button", { name: "Inspect story" }).click();
  await expect(
    consumer.getByRole("region", { name: "Detail for Story A" }),
  ).toBeVisible();
  release();
  const destination = storyCard(parts(page).backlog, "Story C");
  await expect(destination).toBeVisible();
  await expect(
    destination.getByRole("region", { name: "Detail for Story C" }),
  ).toHaveCount(0);
  await expect(
    consumer.getByRole("button", { name: "Hide detail" }),
  ).toBeFocused();
  await expect(notice).toBeEmpty();
});
