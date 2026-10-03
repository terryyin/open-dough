// Focus stays usable across keyboard project switches, and a held previous
// read cannot leak into the destination project's observation.

import { expect, test } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import { filesOf } from "./catalogProjectRecords.ts";
import {
  pathsRead,
  publishMovingOrigin,
  type MovingOrigin,
} from "./publishedOrigin.ts";
import {
  doughnutProject,
  expectFocusedRadio,
  expectSelectedProject,
  openDoughProject,
  pygardonProject,
} from "./projectKeyboardNavigationJourney.ts";

test("focus stays useful across switches and held previous reads stay isolated", async ({
  page,
}) => {
  const origins = new Map<string, MovingOrigin>();
  for (const published of [
    openDoughProject,
    doughnutProject,
    pygardonProject,
  ]) {
    const origin = await publishMovingOrigin(page, published.repository);
    const backlogText = filesOf(published)[".planning/PRODUCT-BACKLOG.md"];
    if (backlogText === undefined) {
      throw new Error(`Missing backlog fixture for ${published.label}.`);
    }
    origin.push(published.revision, backlogText);
    origins.set(published.repository, origin);
  }

  await page.goto("/");
  await expectSelectedProject(page, openDoughProject);
  const { banner, project, backlog, source } = parts(page);
  const settings = banner.getByRole("button", {
    name: "System settings",
    exact: true,
  });

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
    await card.getByRole("link", { name: /^Canonical record/ }).focus();
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
    await project.getByRole("radio", { name: "Doughnut", exact: true }).check();
    await expect.poll(doughnutRefReads).toBe(heldRead);

    const nextOpenDoughRevision = "e2".repeat(20);
    openDoughOrigin.push(
      nextOpenDoughRevision,
      `# Product backlog

## Taken

## Backlog list

- [Open Dough after held switch](seeds/SEED-303-queued.md#queued) — SEED-303#queued
`,
    );
    await settings.focus();
    await page.keyboard.press("ArrowLeft");
    await expectMembership(page, {
      taken: [],
      backlog: ["Open Dough after held switch"],
    });
    await expect(source).toContainText(nextOpenDoughRevision);
    await expect(page.locator("body")).not.toContainText(doughnutProject.taken);
    await expect(page.locator("body")).not.toContainText(
      doughnutProject.queued,
    );
    await expect(settings).toBeFocused();
    releaseDoughnut();
    await expect(page.locator("body")).not.toContainText(
      doughnutProject.queued,
    );
    await expect(source).toContainText(nextOpenDoughRevision);
    expect(doughnutRefReads()).toBe(heldRead);
  });
});
