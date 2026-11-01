// Intent opens recorded test locations from a candidate entry into the
// shared Purpose selection and returns to that entry without rereading
// (SEED-192 examples 1 open/return, 2–6; outside-configured of 4).

import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import {
  candidatesRecord,
  expectCandidatesRevision,
} from "./intentPerspectivePage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import {
  doughnutFeaturePath,
  openDoughSpecPaths,
  publishDoughnutWithCandidates,
  publishOpenDoughWithCandidates,
  publishPygardonOutsideConfigured,
  pygardonClipPath,
} from "./intentCandidatesFixtures.ts";
import { doughnut, openDough, pygardon } from "./intentCodeBrowseFixtures.ts";

test("Intent opens a recorded location into Purpose, marks the tree, and returns to the entry without rereading", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await publishOpenDoughWithCandidates(page);

  await openUntilRead(page, "/?project=open-dough");
  const { intent } = parts(page);
  await parts(page).intentChoice.click();

  const record = candidatesRecord(intent);
  await expectCandidatesRevision(intent, openDough.revision);
  const candidatesControl = intent.getByRole("button", {
    name: "Test Optimization Candidates",
  });

  await test.step("Ex 1: open full path from agent-launch-poles; tree and Purpose agree; return keeps entry", async () => {
    const poles = record.getByRole("article", { name: "agent-launch-poles" });
    const readsBefore = await record.getAttribute("data-candidates-reads");
    await poles
      .getByRole("button", {
        name: openDoughSpecPaths.polesSecond,
        exact: true,
      })
      .click();

    await expect(
      intent.getByLabel(`${openDoughSpecPaths.polesSecond} source`),
    ).toContainText('test("browses"');
    await expect(
      intent.getByRole("button", {
        name: openDoughSpecPaths.polesSecond,
        exact: true,
      }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(candidatesControl).toHaveAttribute("aria-pressed", "false");

    await candidatesControl.click();
    await expect(candidatesControl).toHaveAttribute("aria-pressed", "true");
    const returned = candidatesRecord(intent);
    await expect(
      returned.getByRole("article", { name: "agent-launch-poles" }),
    ).toBeVisible();
    await expect(returned).toHaveAttribute(
      "data-candidates-reads",
      readsBefore ?? "",
    );
  });

  await test.step("Ex 2: long-integrated-journeys links four files; others remain after opening one", async () => {
    await candidatesControl.click();
    const family = candidatesRecord(intent).getByRole("article", {
      name: "long-integrated-journeys",
    });
    for (const path of [
      openDoughSpecPaths.attention,
      openDoughSpecPaths.watcher,
      openDoughSpecPaths.watcherUpdates,
      openDoughSpecPaths.watcherFailures,
    ]) {
      await expect(
        family.getByRole("button", { name: path, exact: true }),
      ).toBeVisible();
    }
    await family
      .getByRole("button", {
        name: openDoughSpecPaths.watcher,
        exact: true,
      })
      .click();
    await expect(
      intent.getByLabel(`${openDoughSpecPaths.watcher} source`),
    ).toContainText('test("browses"');
    await candidatesControl.click();
    const after = candidatesRecord(intent).getByRole("article", {
      name: "long-integrated-journeys",
    });
    for (const path of [
      openDoughSpecPaths.attention,
      openDoughSpecPaths.watcherUpdates,
      openDoughSpecPaths.watcherFailures,
    ]) {
      await expect(
        after.getByRole("button", { name: path, exact: true }),
      ).toBeVisible();
    }
  });

  await test.step("Ex 3: ambiguous bare name lists two full paths; neither opens alone", async () => {
    const ambiguous = candidatesRecord(intent).getByRole("article", {
      name: "story-review-completed-journey-landed-runs-tail",
    });
    await expect(ambiguous).toContainText("names several files");
    await expect(
      ambiguous.getByRole("button", {
        name: openDoughSpecPaths.storyReview,
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      ambiguous.getByRole("button", {
        name: openDoughSpecPaths.storyReviewBoundary,
        exact: true,
      }),
    ).toBeVisible();
    await expect(intent.getByLabel(/source$/)).toHaveCount(0);
    await ambiguous
      .getByRole("button", {
        name: openDoughSpecPaths.storyReview,
        exact: true,
      })
      .click();
    await expect(
      intent.getByLabel(`${openDoughSpecPaths.storyReview} source`),
    ).toBeVisible();
  });

  await test.step("Ex 6: moved path is not published; opens nothing", async () => {
    await candidatesControl.click();
    const moved = candidatesRecord(intent).getByRole("article", {
      name: "moved-test-after-record",
    });
    await expect(moved).toContainText("not published at this revision");
    await expect(
      moved.getByRole("button", { name: openDoughSpecPaths.movedAway }),
    ).toHaveCount(0);
    await expect(candidatesControl).toHaveAttribute("aria-pressed", "true");
  });

  await test.step("Evidence Markdown link to a configured Intent file opens in Intent", async () => {
    const poles = candidatesRecord(intent).getByRole("article", {
      name: "agent-launch-poles",
    });
    await poles.getByRole("button", { name: /second-server journey/i }).click();
    await expect(
      intent.getByLabel(`${openDoughSpecPaths.polesSecond} source`),
    ).toBeVisible();
  });
});

test("Intent explains outside configured locations for a Pygardon-shaped python path", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await publishPygardonOutsideConfigured(page);

  await openUntilRead(page, "/?project=pygardon");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  await expectCandidatesRevision(intent, pygardon.revision);

  const entry = candidatesRecord(intent).getByRole("article", {
    name: "real-h264-codec-roundtrip",
  });
  await expect(entry).toContainText(pygardonClipPath);
  await expect(entry).toContainText("outside configured Intent locations");
  await expect(
    entry.getByRole("button", { name: pygardonClipPath }),
  ).toHaveCount(0);
  await expect(intent.getByLabel(/source$/)).toHaveCount(0);
});

test("Intent leaves Doughnut prose without a gap and opens a unique bare feature name", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await publishDoughnutWithCandidates(page);

  await openUntilRead(page, "/?project=doughnut");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  await expectCandidatesRevision(intent, doughnut.revision);

  const prose = candidatesRecord(intent).getByRole("article", {
    name: "frontend-browser-file-isolation",
  });
  await expect(prose).toContainText("no path named here");
  await expect(prose).not.toContainText("not published");
  await expect(prose).not.toContainText("outside configured");
  await expect(prose).not.toContainText("names several files");

  const bare = candidatesRecord(intent).getByRole("article", {
    name: "e2e-batch-cold-start",
  });
  await bare
    .getByRole("button", { name: "cli_notebook_lfs.feature", exact: true })
    .click();
  await expect(
    intent.getByLabel(`${doughnutFeaturePath} source`),
  ).toContainText("Feature: notebook LFS");
});
