// Selecting a project starts one read that only that selection may complete.
// This is the cross-project analog of ./refresh.spec.ts and
// ./refresh-focus.spec.ts, which already prove the same-project overlapping
// read case (a second refresh outrunning or replacing an earlier one); this
// file proves the same `../src/publishedObservation.ts` rule -- one
// `AbortController` per read, an abort-check before every `setRetrieval`, and
// a synchronous state-clear in `selectSource` -- also holds when the overlap
// crosses a *project* switch, not just a same-project refresh, including when
// the deselected project's read answers late with success, answers late with
// failure, or when the person returns to a project whose earlier read is
// still outstanding elsewhere.
//
// Each held answer is released only after the newly selected project's own
// work is already shown, and every assertion of "nothing changed" runs
// immediately after that release rather than after an arbitrary wait: a
// probe run while writing this spec (temporarily instrumented, not kept)
// confirmed that once a read is aborted by switching projects, the browser
// discards the underlying request outright -- a `page.waitForResponse` for
// it never fires, even seconds later -- so there is no later moment at which
// a late answer could still take effect. Releasing the held mock only lets
// this suite's own test-side route handler finish; it reaches nothing on the
// page. This matches ./refresh.spec.ts's own held-response races, which also
// assert immediately after release.

import { expect, test } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import {
  doughnutBacklog,
  doughnutRepository,
  doughnutSharedTitle,
  revisionDoughnut,
  sharedStoryIdentity,
} from "./doughnutProject.ts";
import {
  pathsRead,
  publishMovingOrigin,
  rateLimitedAnswer,
  type MovingOrigin,
} from "./publishedOrigin.ts";

const revisionOpenDoughFirst = "a1".repeat(20);
const revisionOpenDoughSecond = "a2".repeat(20);
const revisionOpenDoughThird = "a3".repeat(20);

// Doughnut's telling of the shared identity is in ./doughnutProject.ts; Open
// Dough's tellings differ, and neither may appear under the other's label.
const openDoughSharedTitleFirst =
  "Open Dough's first telling of the shared story";
const openDoughSharedTitleSecond =
  "Open Dough's second telling of the shared story";
const openDoughSharedTitleThird =
  "Open Dough's third telling of the shared story";

function openDoughBacklogWith(title: string): string {
  return `# Product backlog

## Taken

## Backlog list

- [${title}](seeds/SEED-777-shared.md#shared-story) — ${sharedStoryIdentity}
`;
}

async function openBothOrigins(
  page: Parameters<typeof publishMovingOrigin>[0],
): Promise<{ openDough: MovingOrigin; doughnut: MovingOrigin }> {
  const openDough = await publishMovingOrigin(page);
  const doughnut = await publishMovingOrigin(page, doughnutRepository);
  openDough.push(
    revisionOpenDoughFirst,
    openDoughBacklogWith(openDoughSharedTitleFirst),
  );
  doughnut.push(revisionDoughnut, doughnutBacklog);
  await page.goto("/");
  await expectMembership(page, {
    taken: [],
    backlog: [openDoughSharedTitleFirst],
  });
  return { openDough, doughnut };
}

test.describe("project read isolation", () => {
  test("a late success from a deselected project's outstanding read never replaces the newly selected project's shown work, and the selector stays keyboard-operable throughout", async ({
    page,
  }) => {
    const { openDough, doughnut } = await openBothOrigins(page);
    const { project, backlog, source } = parts(page);

    const releaseDoughnut = doughnut.hold("main");
    await project.getByRole("radio", { name: "Doughnut", exact: true }).check();
    await expect.poll(() => doughnut.requests.length).toBeGreaterThan(0);

    await test.step("the selector is never blocked while Doughnut's read is outstanding", async () => {
      const selectedProject = project.getByRole("radio", { checked: true });
      await expect(selectedProject).toBeEnabled();
      await selectedProject.focus();
      await expect(selectedProject).toBeFocused();
    });

    openDough.push(
      revisionOpenDoughSecond,
      openDoughBacklogWith(openDoughSharedTitleSecond),
    );
    await page.keyboard.press("ArrowLeft");

    await test.step("Open Dough's fresh read is shown; Doughnut's outstanding read is not waited on or shown", async () => {
      await expectMembership(page, {
        taken: [],
        backlog: [openDoughSharedTitleSecond],
      });
      await expect(source).toContainText(revisionOpenDoughSecond);
      await expect(page.locator("body")).not.toContainText(doughnutSharedTitle);
    });

    const secondCard = backlog.getByRole("article", {
      name: openDoughSharedTitleSecond,
    });
    const secondLink = secondCard.getByRole("link", {
      name: /^Canonical record/,
    });
    await secondLink.focus();
    await expect(secondLink).toBeFocused();

    await test.step("Doughnut's held read answers late with success, after Open Dough is already shown", async () => {
      releaseDoughnut();
      // Immediate assertions, matching ./refresh.spec.ts's own held-response
      // races: nothing about the page depends on this release, so there is
      // no later moment at which it could still take effect.
      await expect(page.locator("body")).not.toContainText(doughnutSharedTitle);
      await expect(source).toContainText(revisionOpenDoughSecond);
      await expect(
        project.getByRole("radio", { name: "Open Dough", exact: true }),
      ).toBeChecked();
      expect(doughnut.requests).toHaveLength(1);
    });

    await test.step("focus stayed in the selection context: the late response did not pull it onto Doughnut's cards or the stages", async () => {
      await expect(secondLink).toBeFocused();
      await expect(parts(page).notice).toBeEmpty();
    });
  });

  test("a late failure from a deselected project's outstanding read never surfaces as the newly selected project's failure", async ({
    page,
  }) => {
    const { openDough, doughnut } = await openBothOrigins(page);
    const { project, refresh, source } = parts(page);

    const releaseDoughnut = doughnut.hold("main");
    await project.getByRole("radio", { name: "Doughnut", exact: true }).check();
    await expect.poll(() => doughnut.requests.length).toBeGreaterThan(0);
    doughnut.answerWith("main", rateLimitedAnswer());

    openDough.push(
      revisionOpenDoughSecond,
      openDoughBacklogWith(openDoughSharedTitleSecond),
    );
    await project
      .getByRole("radio", { name: "Open Dough", exact: true })
      .check();
    await expectMembership(page, {
      taken: [],
      backlog: [openDoughSharedTitleSecond],
    });

    await test.step("Doughnut's held read answers late with a failure, after Open Dough is already shown", async () => {
      releaseDoughnut();
      await expect(page.getByRole("alert")).toHaveCount(0);
      await expectMembership(page, {
        taken: [],
        backlog: [openDoughSharedTitleSecond],
      });
      await expect(source).toContainText(revisionOpenDoughSecond);
      await expect(refresh).toHaveAccessibleName("Refresh");
      expect(doughnut.requests).toHaveLength(1);
    });
  });

  test("returning to a project whose read is still outstanding elsewhere starts a third, fresh read rather than replaying its first snapshot, even with a shared work identity", async ({
    page,
  }) => {
    const { openDough, doughnut } = await openBothOrigins(page);
    const { project, backlog, source } = parts(page);

    const releaseDoughnut = doughnut.hold("main");
    await project.getByRole("radio", { name: "Doughnut", exact: true }).check();
    await expect.poll(() => doughnut.requests.length).toBeGreaterThan(0);

    // Returning to Open Dough while Doughnut's read is still outstanding.
    // Its own backlog changed underneath it since the first read (the same
    // "returning to a project starts a fresh read" rule ./project-selection.spec.ts
    // proves for the sequential case), so a cached replay of the first
    // snapshot would show the wrong title.
    openDough.push(
      revisionOpenDoughThird,
      openDoughBacklogWith(openDoughSharedTitleThird),
    );
    await project
      .getByRole("radio", { name: "Open Dough", exact: true })
      .check();

    await test.step("the third, fresh Open Dough read is shown -- not the first snapshot, and not Doughnut's", async () => {
      await expectMembership(page, {
        taken: [],
        backlog: [openDoughSharedTitleThird],
      });
      await expect(source).toContainText(revisionOpenDoughThird);
      await expect(page.locator("body")).not.toContainText(
        openDoughSharedTitleFirst,
      );
      await expect(page.locator("body")).not.toContainText(doughnutSharedTitle);
      // Two Open Dough reads (main+file each): the first at mount, the
      // second (fresh, not cached) on returning. Only one Doughnut request:
      // its held read was never retried.
      expect(pathsRead(openDough)).toEqual([
        "main",
        `PRODUCT-BACKLOG.md?ref=${revisionOpenDoughFirst}`,
        "main",
        `PRODUCT-BACKLOG.md?ref=${revisionOpenDoughThird}`,
      ]);
      expect(doughnut.requests).toHaveLength(1);
    });

    const thirdCard = backlog.getByRole("article", {
      name: openDoughSharedTitleThird,
    });
    await thirdCard.getByRole("link", { name: /^Canonical record/ }).focus();

    await test.step("Doughnut's stale first-round read answers even later; the third Open Dough read still stands", async () => {
      releaseDoughnut();
      await expectMembership(page, {
        taken: [],
        backlog: [openDoughSharedTitleThird],
      });
      await expect(
        thirdCard.getByRole("link", { name: /^Canonical record/ }),
      ).toBeFocused();
    });
  });
});
