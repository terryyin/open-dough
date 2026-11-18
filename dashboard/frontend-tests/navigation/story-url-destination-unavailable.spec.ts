// A story URL the page cannot show explains why, keeping the requested
// identity: an unknown project, a story its project does not list, and a
// failed read each read differently, and Retry recovers the failed read. A
// project choice made meanwhile, or the named project's removal in settings,
// clears the target without a late reveal. Doughnut and Open Dough both tell
// the shared identity. Nothing here launches or attaches an agent.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import { controlFrontendAuthenticatedRead } from "../../test-support/support/frontendAuthenticatedReadControl.ts";
import { holdProjectReads } from "../../test-support/holdAuthenticatedReads.ts";
import { recordHostRequests } from "../../test-support/support/frontendHostRequests.ts";
import { answerSharedStoryProjects } from "../../test-support/support/frontendStoryUrlDestination.ts";
import { installFrontendSettingsSubstitutes } from "../../test-support/support/frontendSettingsSubstitutes.ts";
import {
  back,
  removeDialog,
  removeProject,
  settings,
} from "../../test-support/support/systemSettingsPage.ts";
import {
  doughnutPublication,
  doughnutSharedTitle,
  openDoughPublication,
  openDoughSharedTitle,
  sharedStoryIdentity,
} from "../../test-support/projectSelectionProjects.ts";
import {
  chooseProject,
  expectProjectChoice,
} from "../../test-support/dashboardPage.ts";
import { expectRoute } from "../../test-support/agentRosterRecords.ts";
import {
  recordReveals,
  revealsOf,
} from "../../test-support/sessionNavigationJourney.ts";
import {
  expectNoCardFocused,
  storyDestination,
  storyUrl,
} from "../../test-support/notificationStoryJourney.ts";

const releases: (() => void)[] = [];
test.afterEach(() => {
  releases.splice(0).forEach((release) => {
    release();
  });
});

test("an unknown project retains its requested target and explains how to return to configured projects", async ({
  page,
  frontendServices,
}) => {
  await answerSharedStoryProjects(page, frontendServices);
  const hostRequests = recordHostRequests(page);
  await page.goto(storyUrl("retired-project"));
  const destination = storyDestination(page);
  await expect(destination).toContainText(
    "Project retired-project is not configured",
  );
  await expect(destination).toContainText(sharedStoryIdentity);
  expectRoute(page, { project: "retired-project" });
  await expectNoCardFocused(page);
  await destination
    .getByRole("button", { name: "Show project stories" })
    .click();
  await expect(destination).toHaveCount(0);
  expectRoute(page, { story: null });
  await expect(
    page.getByRole("article", { name: openDoughSharedTitle }),
  ).toBeVisible();
  expect(hostRequests()).toEqual([]);
});

test("an absent story is distinct from failed reading, and retry can resolve a failed target", async ({
  page,
  frontendServices,
}) => {
  await answerSharedStoryProjects(page, frontendServices);
  const doughnutReads = await controlFrontendAuthenticatedRead(
    page,
    (params) => params.get("source") === "doughnut",
  );
  const hostRequests = recordHostRequests(page);
  const destination = storyDestination(page);

  await test.step("a story Doughnut does not list is absent", async () => {
    await page.goto(storyUrl("doughnut", "SEED-404#gone"));
    await expect(destination).toContainText(
      "is not listed in Doughnut's published work",
    );
    await expect(destination).toContainText("SEED-404#gone");
    await expect(
      destination.getByRole("button", { name: "Retry story destination" }),
    ).toHaveCount(0);
    await expectNoCardFocused(page);
  });

  await test.step("an unread Doughnut is a failed read, not an absence", async () => {
    doughnutReads.unreachable();
    await page.goto(storyUrl());
    await expect(destination).toContainText("could not be read");
    await expect(destination).not.toContainText("is not listed");
    await expect(destination).toContainText(sharedStoryIdentity);
    await expectNoCardFocused(page);
  });

  await test.step("Retry, once Doughnut answers, arrives at its card", async () => {
    doughnutReads.pass();
    await destination
      .getByRole("button", { name: "Retry story destination" })
      .click();
    await expect(
      page.getByRole("article", { name: doughnutSharedTitle }),
    ).toBeFocused();
    await expect(destination).toHaveCount(0);
  });
  expect(hostRequests()).toEqual([]);
});

test("a project choice supersedes a pending story destination without a late reveal", async ({
  page,
  frontendServices,
}) => {
  await answerSharedStoryProjects(page, frontendServices);
  const held = await holdProjectReads(page, "doughnut", releases);
  const hostRequests = recordHostRequests(page);
  await recordReveals(page);
  await page.goto(storyUrl());
  await expect.poll(held.held).toBeGreaterThan(0);
  await chooseProject(page, "Open Dough");
  await expect(
    page.getByRole("article", { name: openDoughSharedTitle }),
  ).toBeVisible();
  held.release();
  await expectProjectChoice(page, "Open Dough");
  expectRoute(page, { story: null });
  expect(await revealsOf(page)).toEqual([]);
  await expect(
    page.getByRole("article", { name: doughnutSharedTitle }),
  ).toHaveCount(0);
  expect(hostRequests()).toEqual([]);
});

test("ordinary project replacement in settings clears the pending story target before returning", async ({
  page,
  frontendServices,
}) => {
  await installFrontendSettingsSubstitutes(page, frontendServices, {
    projects: [openDoughPublication, doughnutPublication].map((project) => ({
      ...project,
      localPath: `~/work/${project.id}`,
    })),
  });
  await answerSharedStoryProjects(page, frontendServices);
  const hostRequests = recordHostRequests(page);
  await page.goto(storyUrl());
  await expect(
    page.getByRole("article", { name: doughnutSharedTitle }),
  ).toBeFocused();
  await settings(page).click();
  await removeProject(page, "Doughnut");
  await expect(removeDialog(page, "Doughnut")).toBeHidden();
  expectRoute(page, { story: null });
  await back(page).click();
  await expectProjectChoice(page, "Open Dough");
  await expect(storyDestination(page)).toHaveCount(0);
  expectRoute(page, { story: null });
  expect(hostRequests()).toEqual([]);
});
