// Focus stays usable across keyboard project switches, and a held previous
// read cannot leak into the destination project's observation.

import { expect, test } from "../../tests/support/frontendApp.ts";
import { answerOnlyPublications } from "../../tests/support/frontendCatalogProjects.ts";
import { holdProjectReads } from "../../tests/holdAuthenticatedReads.ts";
import { countProjectReads } from "../../tests/support/frontendAuthenticatedReadControl.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { catalogPublications } from "../../tests/catalogProjectRecords.ts";
import { describedRevision } from "../../tests/describedRevisions.ts";
import {
  shortRevision,
  expectMembership,
  parts,
  projectTab,
} from "../../tests/dashboardPage.ts";
import {
  doughnutProject,
  expectFocusedRadio,
  expectSelectedProject,
  openDoughProject,
  pygardonProject,
} from "../../tests/projectKeyboardNavigationJourney.ts";
import { focusCanonicalRecord } from "../../tests/storyCardControls.ts";
import { settings as systemSettings } from "../../tests/support/systemSettingsPage.ts";

const nextOpenDoughRevision = "e2".repeat(20);
const afterHeldSwitch = "Open Dough after held switch";

test("focus stays useful across switches and held previous reads stay isolated", async ({
  page,
  frontendServices,
}) => {
  const { openDough, doughnut, pygardon } = catalogPublications;
  const answers = await answerOnlyPublications(page, frontendServices, [
    openDough,
    doughnut,
    pygardon,
  ]);

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
    // Every Doughnut read from now on is held until released.
    const doughnutReads = countProjectReads(page, doughnut.id);
    const heldDoughnut = await holdProjectReads(page, doughnut.id, []);
    await projectTab(page, "Doughnut").check();
    await expect.poll(heldDoughnut.held).toBeGreaterThan(0);
    const heldReads = doughnutReads();

    // Open Dough moved meanwhile: the destination's own fresh read shows it.
    answers.publish({
      ...openDough,
      ...describedRevision(
        makeMe.aRepository
          .withRevision("after held switch", {
            backlog: {
              queued: [
                makeMe.aBacklogEntry
                  .with({
                    identity: "SEED-303#queued",
                    title: afterHeldSwitch,
                    href: "seeds/SEED-303-queued.md#queued",
                  })
                  .please(),
              ],
            },
          })
          .please(),
        nextOpenDoughRevision,
      ),
    });
    await settings.focus();
    await page.keyboard.press("ArrowLeft");
    await expectMembership(page, { taken: [], backlog: [afterHeldSwitch] });
    await expect(readRevision).toContainText(
      shortRevision(nextOpenDoughRevision),
    );
    const body = page.locator("body");
    await expect(body).not.toContainText(doughnutProject.taken);
    await expect(body).not.toContainText(doughnutProject.queued);
    await expect(settings).toBeFocused();
    heldDoughnut.release();
    await expect(body).not.toContainText(doughnutProject.queued);
    await expect(projectTab(page, "Open Dough")).toBeChecked();
    await expect(readRevision).toContainText(
      shortRevision(nextOpenDoughRevision),
    );
    // Released, the held answer started no further Doughnut read.
    expect(doughnutReads()).toBe(heldReads);
  });
});
