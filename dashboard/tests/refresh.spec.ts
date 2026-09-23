import { expect, test } from "@playwright/test";
import { expectWholeSnapshot, parts } from "./dashboardPage";
import { pathsRead } from "./githubOrigin";
import {
  backlogB,
  backlogC,
  dashboardStory,
  openAtA,
  revisionA,
  revisionB,
  revisionC,
  titlesOfA,
  titlesOfB,
  workspaceStory,
} from "./refreshJourney";

test("refresh published work replaces revision A with revision B as one result", async ({
  page,
}) => {
  const retrievedA = new Date("2026-09-20T08:30:00.000Z");
  const retrievedB = new Date("2026-09-20T09:45:00.000Z");
  await page.clock.setFixedTime(retrievedA);
  const origin = await openAtA(page);
  const { stages, taken, refresh, status } = parts(page);
  const snapshotA = {
    revision: revisionA,
    titles: titlesOfA,
    retrievedAt: retrievedA,
  };
  await expectWholeSnapshot(page, snapshotA, [revisionB]);
  await expect(refresh).toBeEnabled();

  origin.push(revisionB, backlogB);
  await page.clock.setFixedTime(retrievedB);
  const releaseRef = origin.hold("main");
  await refresh.click();

  await test.step("while reading, A stays shown as A and Refresh is unavailable", async () => {
    await expect(status).toContainText(
      "Reading published work… What is shown is still the snapshot retrieved earlier.",
    );
    await expect(refresh).toBeDisabled();
    await expect(refresh).toBeFocused();
    await page.keyboard.press("Enter");
    // Forced: an unavailable control must ignore a real press too.
    await refresh.click({ force: true });
    await expectWholeSnapshot(page, snapshotA, [revisionB]);
    expect(pathsRead(origin).slice(2)).toEqual(["main"]);
    releaseRef();
  });

  await test.step("B's membership, order, links, revision, and time arrive together", async () => {
    await expectWholeSnapshot(
      page,
      { revision: revisionB, titles: titlesOfB, retrievedAt: retrievedB },
      [revisionA],
    );
    const moved = stages.getByRole("article", { name: dashboardStory });
    await expect(moved).toHaveCount(1);
    await expect(
      taken.getByRole("article", { name: dashboardStory }),
    ).toHaveCount(1);
    await expect(moved.getByRole("link", { name: /^Plan/ })).toHaveAttribute(
      "href",
      `https://github.com/terryyin/open-dough/blob/${revisionB}/.planning/quick/061-published-story-dashboard/PLAN.md`,
    );
  });

  await test.step("removed work leaves; no further stage or reading state remains", async () => {
    await expect(page.getByText(workspaceStory)).toHaveCount(0);
    await expect(stages.getByRole("region")).toHaveCount(2);
    await expect(parts(page).reading).toHaveCount(0);
    await expect(page.getByRole("alert")).toHaveCount(0);
    await expect(refresh).toBeEnabled();
    await expect(refresh).toBeFocused();
  });

  await test.step("one refresh read main once and the file once, at B", () => {
    expect(pathsRead(origin)).toEqual([
      "main",
      `PRODUCT-BACKLOG.md?ref=${revisionA}`,
      "main",
      `PRODUCT-BACKLOG.md?ref=${revisionB}`,
    ]);
  });
});

test("refresh published work still describes B entirely when main advances to C during B's file read", async ({
  page,
}) => {
  const origin = await openAtA(page);
  origin.push(revisionB, backlogB);
  const releaseFileAtB = origin.hold(revisionB);
  await parts(page).refresh.click();
  await expect
    .poll(() => pathsRead(origin))
    .toContain(`PRODUCT-BACKLOG.md?ref=${revisionB}`);

  origin.push(revisionC, backlogC);
  releaseFileAtB();

  await expectWholeSnapshot(page, { revision: revisionB, titles: titlesOfB }, [
    revisionA,
    revisionC,
  ]);
  expect(pathsRead(origin)).toHaveLength(4);
  expect(pathsRead(origin)).not.toContain(
    `PRODUCT-BACKLOG.md?ref=${revisionC}`,
  );
});

test("refresh published work reads only when asked, and an unchanged revision changes only the retrieval time", async ({
  page,
}) => {
  const retrievedA = new Date("2026-09-20T08:30:00.000Z");
  const retrievedAgain = new Date("2026-09-20T12:00:00.000Z");
  await page.clock.install({ time: retrievedA });
  await page.clock.setFixedTime(retrievedA);
  const origin = await openAtA(page);
  const { source, refresh, notice } = parts(page);

  await test.step("time passing and returning to the page read nothing", async () => {
    await page.clock.fastForward("03:00:00");
    await page.evaluate(
      "window.dispatchEvent(new Event('focus')); window.dispatchEvent(new Event('online')); document.dispatchEvent(new Event('visibilitychange'))",
    );
    await page.clock.fastForward("00:30:00");
    expect(pathsRead(origin)).toHaveLength(2);
    await expect(source.locator("time")).toHaveAttribute(
      "datetime",
      retrievedA.toISOString(),
    );
  });

  const body = page.locator("body");
  await parts(page).sourceEvidence.click();
  const textAtFirstRead = await body.innerText();
  const timeAtFirstRead = await source.locator("time").innerText();
  await page.clock.setFixedTime(retrievedAgain);
  await refresh.click();

  await expectWholeSnapshot(
    page,
    { revision: revisionA, titles: titlesOfA, retrievedAt: retrievedAgain },
    [],
  );
  await expect(parts(page).reading).toHaveCount(0);
  await expect(notice).toBeEmpty();
  // Nothing else is said: the page reads as before, but for the time.
  const timeAtSecondRead = await source.locator("time").innerText();
  expect(timeAtSecondRead).not.toBe(timeAtFirstRead);
  expect(await body.innerText()).toBe(
    textAtFirstRead.replaceAll(timeAtFirstRead, timeAtSecondRead),
  );
  expect(pathsRead(origin)).toHaveLength(4);
});
