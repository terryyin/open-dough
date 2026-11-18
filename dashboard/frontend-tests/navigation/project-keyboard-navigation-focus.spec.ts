// Focus stays usable across keyboard project switches, and a held previous
// read cannot leak into the destination project's observation.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import { answerOnlyPublications } from "../../test-support/support/frontendCatalogProjects.ts";
import { holdProjectReads } from "../../test-support/holdAuthenticatedReads.ts";
import { countProjectReads } from "../../test-support/support/frontendAuthenticatedReadControl.ts";
import { untilPageReadsAnswered } from "../../test-support/pageRequestNotes.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { catalogPublications } from "../../test-support/catalogProjectRecords.ts";
import { describedRevision } from "../../test-support/describedRevisions.ts";
import {
  shortRevision,
  expectMembership,
  parts,
  projectTab,
} from "../../test-support/dashboardPage.ts";
import {
  doughnutProject,
  expectFocusedRadio,
  expectSelectedProject,
  openDoughProject,
  pygardonProject,
} from "../../test-support/projectKeyboardNavigationJourney.ts";
import { focusCanonicalRecord } from "../../test-support/storyCardControls.ts";
import { settings as systemSettings } from "../../test-support/support/systemSettingsPage.ts";

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
    await untilPageReadsAnswered(page);
    await expect(body).not.toContainText(doughnutProject.queued);
    await expect(projectTab(page, "Open Dough")).toBeChecked();
    await expect(readRevision).toContainText(
      shortRevision(nextOpenDoughRevision),
    );
    // Leaving Doughnut already cancelled its held read, so release brings no
    // answer back: with the page's reads answered, the destination still shows
    // no Doughnut story and no further Doughnut read was asked.
    expect(doughnutReads()).toBe(heldReads);
  });
});
