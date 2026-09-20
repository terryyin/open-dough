import { expect, test, type Locator, type Page } from "@playwright/test";
import { expectMembership, parts } from "./dashboardPage";
import {
  pathsRead,
  publishMovingOrigin,
  rateLimitedAnswer,
} from "./githubOrigin";
import { box } from "./pageLayout";
import {
  backlogB,
  openAtA,
  revisionA,
  revisionB,
  titlesOfB,
} from "./refreshJourney";

// What the browser draws around the element that holds keyboard focus.
async function focusIndication(page: Page) {
  return page.evaluate<{
    visible: boolean;
    style: string;
    width: number;
  }>(`(() => {
    const focused = document.activeElement;
    const style = getComputedStyle(focused);
    return {
      visible: focused.matches(":focus-visible"),
      style: style.outlineStyle,
      width: parseFloat(style.outlineWidth),
    };
  })()`);
}

async function expectFocusedAndIndicated(page: Page, stop: Locator) {
  await expect(stop).toBeFocused();
  const indication = await focusIndication(page);
  expect(indication.visible).toBe(true);
  expect(indication.style).not.toBe("none");
  expect(indication.width).toBeGreaterThanOrEqual(2);
}

// Whether assistive technology is offered each polite region at all, whatever
// it currently says: rendered, and not hidden by itself or anything around it.
// Each region is marked too, so that later text is known to arrive in the
// same element rather than in one inserted along with its text.
const politeRegionsOfferedThenMarked = `(() =>
  ["[role='status']", "[aria-live='polite']"].map((selector) => {
    const region = document.querySelector(selector);
    region.dataset.known = selector;
    for (let at = region; at; at = at.parentElement) {
      const style = getComputedStyle(at);
      if (
        style.display === "none" ||
        style.visibility !== "visible" ||
        at.hidden ||
        at.getAttribute("aria-hidden") === "true"
      ) {
        return false;
      }
    }
    return true;
  })
)()`;

test("accessible overview is read by keyboard in reading order, with visible focus, and Enter follows a link", async ({
  page,
}) => {
  const origin = await publishMovingOrigin(page);
  origin.push(revisionB, backlogB);
  await page.goto("/");
  await expectMembership(page, titlesOfB);
  const { backlog, taken, refresh } = parts(page);

  // Reading order is the order of the page's source: the read control, then
  // Backlog's links by priority, then Taken's. In a wide window Taken stands
  // beside Backlog's first card, so position on screen would order them
  // differently.
  const stops = [
    refresh,
    ...(await backlog.getByRole("link").all()),
    ...(await taken.getByRole("link").all()),
  ];
  expect(stops).toHaveLength(1 + 2 + 3);

  await test.step("Tab stops at the read control and every recorded link, and nowhere else", async () => {
    for (const stop of stops) {
      await page.keyboard.press("Tab");
      await expectFocusedAndIndicated(page, stop);
    }
    // Cards and the stages take focus only when it is returned to them.
    await expect(page.locator("[tabindex='-1']")).toHaveCount(1 + 4);
    await expect(page.locator("[tabindex='0']")).toHaveCount(0);
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
    await expect(problem).toContainText("GitHub answered HTTP 403");
    expect(pathsRead(origin)).toHaveLength(5);
    await expect(status).toBeEmpty();
    await expect(status).toHaveAttribute("data-known", "[role='status']");
    await expect(status).toHaveCount(1);
    await expect(retry).toBeFocused();
    restore();
  });
});
