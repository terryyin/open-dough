import { type Locator } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import {
  expectFocusedAndIndicated,
  politeRegionsOfferedThenMarked,
} from "./accessibleReading.ts";
import {
  enabledCardLaunchActions,
  expectMembership,
  parts,
} from "./dashboardPage.ts";
import {
  pathsRead,
  publishMovingOrigin,
  rateLimitedAnswer,
} from "./publishedOrigin.ts";
import { box } from "./pageLayout.ts";
import { pausePageClock, passTimeUntilChecked } from "./autoRefreshJourney.ts";
import {
  backlogB,
  openAtA,
  revisionA,
  revisionB,
  titlesOfB,
} from "./refreshJourney.ts";

test("accessible overview is read by keyboard in reading order, with visible focus, and Enter follows a link", async ({
  page,
}) => {
  const origin = await publishMovingOrigin(page);
  origin.push(revisionB, backlogB);
  await page.goto("/");
  await expectMembership(page, titlesOfB);
  const { project, sourceEvidence, directionToggle, backlog, taken } =
    parts(page);

  // Reading order is the order of the page's source: Sessions, the project
  // selector, System settings, then source evidence, direction, Start session
  // and the badge legend, then each card's controls and recorded links by
  // stage (Backlog, then Taken): a Backlog card's enabled launch actions, then
  // Inspect. In a wide window Taken stands beside Backlog's first card, so
  // position on screen would order them differently.
  const stopsFor = async (stage: Locator) => {
    const stops: Locator[] = [];
    for (const card of await stage.getByRole("article").all()) {
      if (stage === backlog) {
        // This overview publishes backlog bytes only: execution stays gated
        // while canonical dependency facts are unavailable; refinement is a stop.
        await expect(
          card.getByRole("button", { name: "Start execution" }),
        ).toBeDisabled();
        await expect(
          card.getByRole("button", { name: "Start execution" }),
        ).toHaveAccessibleDescription(/dependency facts could not be read/);
        await expect(
          card.getByRole("button", { name: "Start refinement" }),
        ).toBeEnabled();
        stops.push(...(await enabledCardLaunchActions(card)));
      }
      stops.push(card.getByRole("button", { name: "Inspect story" }));
      stops.push(...(await card.getByRole("link").all()));
    }
    return stops;
  };
  const selectedProject = project.getByRole("radio", { checked: true });
  const stops = [
    page.getByRole("button", { name: "Sessions", exact: true }),
    selectedProject,
    page.getByRole("button", { name: "System settings", exact: true }),
    sourceEvidence,
    directionToggle,
    page.getByRole("button", { name: "Start session in Open Dough" }),
    parts(page).preparationHelp,
    ...(await stopsFor(backlog)),
    ...(await stopsFor(taken)),
  ];
  // Sessions + selected project radio + System settings + Source evidence +
  // Direction + Start session + Legend + two Backlog cards' enabled launch
  // actions + four Inspect + five recorded links.
  expect(stops).toHaveLength(7 + 2 + 4 + 5);

  await test.step("Tab stops at Sessions, the banner's controls, each card's controls, and every recorded link, and nowhere else", async () => {
    for (const stop of stops) {
      await page.keyboard.press("Tab");
      await expectFocusedAndIndicated(page, stop);
    }
    // Cards, the stages, and Recent sessions take focus only when it is
    // returned to them.
    await expect(page.locator("[tabindex='-1']")).toHaveCount(1 + 4 + 1);
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
    // The selected project radio already holds focus after the reverse walk;
    // Tab walks on in reading order to the first card's Canonical link.
    const canonical = backlog
      .getByRole("article")
      .first()
      .getByRole("link", { name: /^Canonical record/ });
    for (let stop = 1; stop < stops.length; stop += 1) {
      await page.keyboard.press("Tab");
      if (await canonical.evaluate((link) => link === document.activeElement)) {
        break;
      }
    }
    await expect(canonical).toBeFocused();
    const [popup, leaving] = await Promise.all([
      page.waitForEvent("popup"),
      page
        .context()
        .waitForEvent("request", (request) => request.isNavigationRequest()),
      page.keyboard.press("Enter"),
    ]);
    expect(new URL(leaving.url()).pathname).toBe(
      `/terryyin/open-dough/blob/${revisionB}/.planning/seeds/SEED-008-sync.md`,
    );
    await popup.close();
  });
});

test("accessible overview announces reading, the read result, and a failure while focus stays where it is", async ({
  page,
}) => {
  await pausePageClock(page);
  const origin = await openAtA(page);
  const { source, status, notice, problem } = parts(page);
  const retrievedA =
    (await source.locator("time").getAttribute("datetime")) ?? "";

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

  // Sessions, the project, then System settings.
  const settings = page.getByRole("button", {
    name: "System settings",
    exact: true,
  });
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(settings).toBeFocused();

  await test.step("a check that finds B starts a read, which the known status region reports as under way", async () => {
    origin.push(revisionB, backlogB);
    const releaseFileAtB = origin.hold(revisionB);
    await passTimeUntilChecked(page);
    await expect(status).toHaveText(
      "Reading published work… What is shown is still the snapshot retrieved earlier.",
    );
    await expect(status).toHaveAttribute("data-known", "[role='status']");
    // A read under way is said nowhere else, so it is said in sight.
    await expect(status).toBeInViewport({ ratio: 1 });
    expect((await box(status)).height).toBeGreaterThanOrEqual(16);
    await expect(settings).toBeFocused();
    releaseFileAtB();
  });

  await test.step("the result names the revision read and when, and claims nothing more", async () => {
    await expectMembership(page, titlesOfB);
    await expect(status).toHaveText(
      new RegExp(
        `^Published work read at revision ${revisionB.slice(0, 7)}, retrieved [^.]+\\.$`,
      ),
    );
    const retrievedB = await source.locator("time").getAttribute("datetime");
    expect(retrievedB).not.toBe(retrievedA);
    await expect(status.locator("time")).toHaveAttribute(
      "datetime",
      retrievedB ?? "",
    );
    await expect(status).toHaveAttribute("data-known", "[role='status']");
    await expect(notice).toHaveAttribute("data-known", "[aria-live='polite']");
    await expect(notice).toBeEmpty();
    expect(await box(status)).toMatchObject({ width: 1, height: 1 });
    expect(await page.evaluate(politeRegionsOfferedThenMarked)).toEqual([
      true,
      true,
    ]);
    await expect(settings).toBeFocused();
  });

  await test.step("a failed check is an alert, and focus stays where it is", async () => {
    const readsBefore = pathsRead(origin).length;
    const restore = origin.answerWith("main", rateLimitedAnswer());
    await passTimeUntilChecked(page, 502);
    await expect(problem).toContainText(
      "GitHub limited the rate of the local GitHub CLI's requests (HTTP 403)",
    );
    expect(pathsRead(origin)).toHaveLength(readsBefore);
    await expect(status).toBeEmpty();
    await expect(status).toHaveAttribute("data-known", "[role='status']");
    await expect(status).toHaveCount(1);
    await expect(settings).toBeFocused();
    restore();
  });
});
