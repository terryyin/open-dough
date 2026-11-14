// Focus stays usable across keyboard project switches, and a held previous
// read cannot leak into the destination project's observation.

import { expect, test } from "../dashboardTest.ts";
import {
  shortRevision,
  expectMembership,
  parts,
  projectTab,
} from "../dashboardPage.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { catalogPublications } from "../catalogProjectRecords.ts";
import { describedBacklog } from "../describedRevisions.ts";
import {
  pathsRead,
  publishMovingOrigin,
  type MovingOrigin,
} from "../publishedOrigin.ts";
import {
  doughnutProject,
  expectFocusedRadio,
  expectSelectedProject,
  openDoughProject,
  pygardonProject,
} from "../projectKeyboardNavigationJourney.ts";
import { focusCanonicalRecord } from "../storyCardControls.ts";
import { settings as systemSettings } from "../support/systemSettingsPage.ts";

test("focus stays useful across switches and held previous reads stay isolated", async ({
  page,
}) => {
  const origins = new Map<string, MovingOrigin>();
  for (const published of [
    catalogPublications.openDough,
    catalogPublications.doughnut,
    catalogPublications.pygardon,
  ]) {
    const origin = await publishMovingOrigin(page, published.repository);
    const backlogText = published.files[published.backlogPath];
    if (backlogText === undefined) {
      throw new Error(`Missing backlog fixture for ${published.label}.`);
    }
    origin.push(published.revision, backlogText);
    origins.set(published.repository, origin);
  }

  await page.goto("/");
  await expectSelectedProject(page, openDoughProject);
  const { backlog, readRevision } = parts(page);
  const settings = systemSettings(page);

  await test.step("banner control focus survives a keyboard project switch", async () => {
    await settings.focus();
    await page.keyboard.press("ArrowRight");
    await expect(settings).toBeFocused();
    await expectSelectedProject(page, doughnutProject);
  });

  await test.step("focus moves to the selected radio when project content disappears", async () => {
    const card = backlog.getByRole("article", {
      name: doughnutProject.queued,
    });
    await focusCanonicalRecord(card);
    await page.keyboard.press("ArrowRight");
    await expectFocusedRadio(page, "Pygardon");
    await expectSelectedProject(page, pygardonProject);
  });

  await test.step("keyboard switch while a previous read is held shows only the destination", async () => {
    const doughnut = origins.get(doughnutProject.repository);
    const openDoughOrigin = origins.get(openDoughProject.repository);
    if (doughnut === undefined || openDoughOrigin === undefined) {
      throw new Error(
        "Catalog origins were not published for the held-read step.",
      );
    }
    // Doughnut's ref was already read when the first step selected it, so
    // the held read is the one read of `main` beyond those.
    const doughnutRefReads = () =>
      pathsRead(doughnut).filter((path) => path === "main").length;
    const heldRead = doughnutRefReads() + 1;
    const releaseDoughnut = doughnut.hold("main");
    await projectTab(page, "Doughnut").check();
    await expect.poll(doughnutRefReads).toBe(heldRead);

    const nextOpenDoughRevision = "e2".repeat(20);
    openDoughOrigin.push(
      nextOpenDoughRevision,
      describedBacklog(
        makeMe.aRepository
          .withRevision("after held switch", {
            backlog: {
              queued: [
                makeMe.aBacklogEntry
                  .with({
                    identity: "SEED-303#queued",
                    title: "Open Dough after held switch",
                    href: "seeds/SEED-303-queued.md#queued",
                  })
                  .please(),
              ],
            },
          })
          .please(),
      ),
    );
    await settings.focus();
    await page.keyboard.press("ArrowLeft");
    await expectMembership(page, {
      taken: [],
      backlog: ["Open Dough after held switch"],
    });
    await expect(readRevision).toContainText(
      shortRevision(nextOpenDoughRevision),
    );
    await expect(page.locator("body")).not.toContainText(doughnutProject.taken);
    await expect(page.locator("body")).not.toContainText(
      doughnutProject.queued,
    );
    await expect(settings).toBeFocused();
    releaseDoughnut();
    await expect(page.locator("body")).not.toContainText(
      doughnutProject.queued,
    );
    await expect(readRevision).toContainText(
      shortRevision(nextOpenDoughRevision),
    );
    expect(doughnutRefReads()).toBe(heldRead);
  });
});
