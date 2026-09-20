import { expect, test, type Page } from "@playwright/test";
import { expectMembership, parts } from "./dashboardPage";
import {
  backlogB,
  dashboardStory,
  openAtA,
  revisionB,
  titlesOfB,
  workspaceStory,
} from "./refreshJourney";

const canonical = { name: /^Canonical record/ };

// A refresh from A towards B is held at B's file read while the canonical
// record link of one Backlog work takes keyboard focus. The returned release
// lets B arrive.
async function refreshToBWithFocusOn(
  page: Page,
  title: string,
): Promise<() => void> {
  const origin = await openAtA(page);
  const { backlog, refresh } = parts(page);
  origin.push(revisionB, backlogB);
  const releaseFileAtB = origin.hold(revisionB);
  await refresh.click();
  await backlog
    .getByRole("article", { name: title })
    .getByRole("link", canonical)
    .focus();
  return releaseFileAtB;
}

test("refresh published work keeps keyboard focus on the same work's link when it moves to Taken", async ({
  page,
}) => {
  const releaseFileAtB = await refreshToBWithFocusOn(page, dashboardStory);
  const { taken, notice } = parts(page);
  releaseFileAtB();

  await expectMembership(page, titlesOfB);
  await expect(
    taken
      .getByRole("article", { name: dashboardStory })
      .getByRole("link", canonical),
  ).toBeFocused();
  await expect(notice).toBeEmpty();
});

test("refresh published work announces that the focused work is no longer listed and moves focus to the stages", async ({
  page,
}) => {
  const releaseFileAtB = await refreshToBWithFocusOn(page, workspaceStory);
  const { stages, refresh, notice } = parts(page);
  await expect(notice).toBeEmpty();
  releaseFileAtB();

  await expectMembership(page, titlesOfB);
  await expect(stages).toBeFocused();
  await expect(notice).toHaveText(
    `${workspaceStory} is no longer listed in the published work.`,
  );

  await test.step("the next read withdraws the message", async () => {
    await refresh.click();
    await expect(page.getByRole("status")).toHaveCount(0);
    await expect(notice).toBeEmpty();
    await expectMembership(page, titlesOfB);
    await expect(refresh).toBeFocused();
  });
});
