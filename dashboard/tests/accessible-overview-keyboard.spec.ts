import { type Locator } from "@playwright/test";
import { expect, test } from "./dashboardTest";
import {
  expectFocusedAndIndicated,
  politeRegionsOfferedThenMarked,
} from "./accessibleReading";
import { expectMembership, parts } from "./dashboardPage";
import {
  pathsRead,
  publishMovingOrigin,
  rateLimitedAnswer,
} from "./publishedOrigin";
import { box } from "./pageLayout";
import {
  backlogB,
  openAtA,
  revisionA,
  revisionB,
  titlesOfB,
} from "./refreshJourney";

test("accessible overview is read by keyboard in reading order, with visible focus, and Enter follows a link", async ({
  page,
}) => {
  const origin = await publishMovingOrigin(page);
  origin.push(revisionB, backlogB);
  await page.goto("/");
  await expectMembership(page, titlesOfB);
  const { project, sourceEvidence, directionToggle, backlog, taken, refresh } =
    parts(page);

  // Reading order is the order of the page's source: the project selector,
  // then the read control, source evidence, direction and badge legend, then each card's Inspect and recorded
  // links by stage (Backlog, then Taken). In a wide window Taken stands beside
  // Backlog's first card, so position on screen would order them differently.
  const stopsFor = async (stage: Locator) => {
    const stops: Locator[] = [];
    for (const card of await stage.getByRole("article").all()) {
      stops.push(card.getByRole("button", { name: "Inspect story" }));
      stops.push(...(await card.getByRole("link").all()));
    }
    return stops;
  };
  const selectedProject = project.getByRole("radio", { checked: true });
  const stops = [
    selectedProject,
    refresh,
    sourceEvidence,
    directionToggle,
    parts(page).preparationHelp,
    ...(await stopsFor(backlog)),
    ...(await stopsFor(taken)),
  ];
  // The selected project radio + Refresh + Source evidence + Direction + Legend + four Inspect + five recorded links.
  expect(stops).toHaveLength(1 + 1 + 1 + 1 + 1 + 4 + 5);

  await test.step("Tab stops at the read control, Inspect, and every recorded link, and nowhere else", async () => {
    for (const stop of stops) {
      await page.keyboard.press("Tab");
      await expectFocusedAndIndicated(page, stop);
    }
    // Cards and the stages take focus only when it is returned to them.
    await expect(page.locator("[tabindex='-1']")).toHaveCount(1 + 4);
    await expect(page.locator("[tabindex='0']:visible")).toHaveCount(0);
  });

  await test.step("the keyboard is not held: Tab leaves the page and Shift+Tab walks back", async () => {
    await page.keyboard.press("Tab");
    for (const stop of stops) {
      await expect(stop).not.toBeFocused();
    }
    for (const stop of [...stops].reverse()) {
      await page.keyboard.press("Shift+Tab");
      await expect(stop).toBeFocused();
    }
  });

  await test.step("Enter on a focused link leaves for its record at the inspected revision", async () => {
    // The selected project radio already holds focus after the reverse walk; Refresh, evidence and the
    // direction disclosure, badge legend and first card's Inspect precede its Canonical link.
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    const [leaving] = await Promise.all([
      page.waitForRequest((request) => request.isNavigationRequest()),
      page.keyboard.press("Enter"),
    ]);
    expect(new URL(leaving.url()).pathname).toBe(
      `/terryyin/open-dough/blob/${revisionB}/.planning/seeds/SEED-008-sync.md`,
    );
  });
});

test("accessible overview announces reading, the read result, and a failure while focus stays on the read control", async ({
  page,
}) => {
  const retrievedB = new Date("2026-09-20T12:00:00.000Z");
  const origin = await openAtA(page);
  const { refresh, retry, status, notice, problem } = parts(page);

  await test.step("both polite regions are offered before they have anything new to say", async () => {
    await expect(status).toContainText(
      `Published work read at revision ${revisionA.slice(0, 7)}, retrieved `,
    );
    await expect(notice).toBeEmpty();
    expect(await page.evaluate(politeRegionsOfferedThenMarked)).toEqual([
      true,
      true,
    ]);
    // The source evidence already shows the result, so it is not shown twice.
    expect(await box(status)).toMatchObject({ width: 1, height: 1 });
  });

  // Project then the read control.
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(refresh).toBeFocused();

  await test.step("Space asks for a read, which the known status region reports as under way", async () => {
    origin.push(revisionB, backlogB);
    const releaseFileAtB = origin.hold(revisionB);
    await page.clock.setFixedTime(retrievedB);
    await page.keyboard.press("Space");
    await expect(status).toHaveText(
      "Reading published work… What is shown is still the snapshot retrieved earlier.",
    );
    await expect(status).toHaveAttribute("data-known", "[role='status']");
    // A read under way is said nowhere else, so it is said in sight.
    await expect(status).toBeInViewport({ ratio: 1 });
    expect((await box(status)).height).toBeGreaterThanOrEqual(16);
    await expect(refresh).toHaveAttribute("aria-disabled", "true");
    await expect(refresh).toBeFocused();
    releaseFileAtB();
  });

  await test.step("the result names the revision read and when, and claims nothing more", async () => {
    await expectMembership(page, titlesOfB);
    await expect(status).toHaveText(
      new RegExp(
        `^Published work read at revision ${revisionB.slice(0, 7)}, retrieved [^.]+\\.$`,
      ),
    );
    await expect(status.locator("time")).toHaveAttribute(
      "datetime",
      retrievedB.toISOString(),
    );
    await expect(status).toHaveAttribute("data-known", "[role='status']");
    await expect(notice).toHaveAttribute("data-known", "[aria-live='polite']");
    await expect(notice).toBeEmpty();
    expect(await box(status)).toMatchObject({ width: 1, height: 1 });
    expect(await page.evaluate(politeRegionsOfferedThenMarked)).toEqual([
      true,
      true,
    ]);
    await expect(refresh).toBeFocused();
  });

  await test.step("Enter asks again; a failure is an alert, and focus stays on the same control", async () => {
    const restore = origin.answerWith("main", rateLimitedAnswer());
    await page.keyboard.press("Enter");
    await expect(problem).toContainText(
      "GitHub limited the rate of the local GitHub CLI's requests (HTTP 403)",
    );
    expect(pathsRead(origin)).toHaveLength(5);
    await expect(status).toBeEmpty();
    await expect(status).toHaveAttribute("data-known", "[role='status']");
    await expect(status).toHaveCount(1);
    await expect(retry).toBeFocused();
    restore();
  });
});
