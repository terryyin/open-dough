// On a phone, the answer beside Start session and the Near-future direction
// label both read in whole words: neither takes the other's room. The answer
// stays with Start session, the direction opens beneath the row, and rotating
// keeps every part of the row readable and reachable.
import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./support/preparationPage.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import {
  startSession,
  startSessionDialog,
  startSessionField,
} from "./launchStoryCardPage.ts";
import { parts } from "./dashboardPage.ts";
import {
  box,
  closeSidePanel,
  expectEveryControlReachable,
  expectInside,
  expectNoSidewaysScrollIn,
  tapWhereShown,
} from "./pageLayout.ts";
import { phoneLaunchTouchViewport } from "./touchLaunchPage.ts";
import { lettersBrokenApart } from "./wholeWords.ts";

type Viewport = { readonly width: number; readonly height: number };

const phone = phoneLaunchTouchViewport;
const largePhone = { width: 430, height: 932 };
const rotated = ({ width, height }: Viewport) => ({
  width: height,
  height: width,
});

const answers = [
  {
    scenario: "launched",
    words: "Ad hoc session started",
    answer: (page: Page) => parts(page).adHocStarted,
  },
  {
    scenario: "refused",
    words:
      "Launch failed: Claude Code refused to start a session in ~/git/open-dough. Run claude in that folder once to see why.",
    answer: (page: Page) =>
      parts(page).projectActions.locator(".launch-problem"),
  },
] as const;

// Where the Backlog heading lies in the Board, wherever the Board is scrolled.
const backlogHeadingTop = (page: Page) =>
  parts(page)
    .backlog.getByRole("heading", { name: "Backlog", exact: true })
    .evaluate(
      (heading) =>
        heading.getBoundingClientRect().top +
        (heading.closest(".board-scroll")?.scrollTop ?? 0),
    );

async function rowAt(page: Page, viewport: Viewport) {
  await page.setViewportSize(viewport);
  return {
    label: await box(parts(page).directionToggle),
    backlogTop: await backlogHeadingTop(page),
  };
}

// The row with its answer, against the same row before any answer showed.
async function expectRowReadsWhole(
  page: Page,
  answer: Locator,
  words: string,
  before: Awaited<ReturnType<typeof rowAt>>,
) {
  const { directionToggle, preparationHelp, projectActions } = parts(page);
  const end = projectActions.locator(".project-actions-end");
  const start = startSession(page, "Open Dough");

  await expect(answer).toHaveText(words);
  await answer.scrollIntoViewIfNeeded();
  await expect(answer).toBeInViewport({ ratio: 1 });
  expect(await lettersBrokenApart(answer), "answer words").toEqual([]);
  // Next to the control that produced it: beside it on its line, or beneath.
  await expectInside(answer, end);
  const answerBox = await box(answer);
  const startBox = await box(start);
  const endBox = await box(end);
  expect(
    answerBox.x >= startBox.x + startBox.width - 0.5 ||
      answerBox.y >= startBox.y + startBox.height - 0.5,
    "the answer reads beside or beneath Start session",
  ).toBe(true);

  await expect(directionToggle.getByRole("heading")).toHaveText(
    "Near-future direction",
  );
  expect(await lettersBrokenApart(directionToggle), "label words").toEqual([]);
  const label = await box(directionToggle);
  expect(label.height, "label height").toBeLessThanOrEqual(
    before.label.height + 0.5,
  );
  expect(label.height, "label touch height").toBeGreaterThanOrEqual(44);
  expect(label.width, "label width").toBeGreaterThanOrEqual(
    before.label.width - 0.5,
  );
  expect(
    label.x + label.width,
    "the label ends before Start session's end begins",
  ).toBeLessThanOrEqual(endBox.x + 0.5);

  const help = await box(preparationHelp);
  expect(help.width, "help touch width").toBeGreaterThanOrEqual(44);
  expect(help.height, "help touch height").toBeGreaterThanOrEqual(44);
  await expectEveryControlReachable(projectActions);
  await expectNoSidewaysScrollIn(page, projectActions);

  expect(
    (await backlogHeadingTop(page)) - before.backlogTop,
    "the Backlog heading moves down by no more than about the answer's height",
  ).toBeLessThanOrEqual(answerBox.height + 8);
}

// The direction opens beneath the whole row, the answer staying with Start
// session above it, and closes to the row as it was.
async function expectDirectionOpensBeneath(
  page: Page,
  answer: Locator,
  words: string,
) {
  const { directionToggle, directionText, projectActions } = parts(page);
  const end = projectActions.locator(".project-actions-end");
  const rowParts = [directionToggle, end, answer];
  await directionToggle.scrollIntoViewIfNeeded();
  const closed = await Promise.all(rowParts.map(box));

  await tapWhereShown(directionToggle);
  await expect(directionText).toBeVisible();
  expect(await Promise.all(rowParts.map(box))).toEqual(closed);
  const text = await box(directionText);
  const row = await box(projectActions);
  expect(Math.abs(text.x - row.x)).toBeLessThan(1);
  expect(Math.abs(text.width - row.width)).toBeLessThan(1);
  for (const part of closed)
    expect(text.y).toBeGreaterThanOrEqual(part.y + part.height - 0.5);
  await expect(answer).toHaveText(words);
  expect(await lettersBrokenApart(answer), "answer words").toEqual([]);
  await expectNoSidewaysScrollIn(page, projectActions);

  await directionToggle.scrollIntoViewIfNeeded();
  await tapWhereShown(directionToggle);
  await expect(directionText).toBeHidden();
  expect(await Promise.all(rowParts.map(box))).toEqual(closed);
  await expectNoSidewaysScrollIn(page, projectActions);
}

async function startWithTypedText(page: Page) {
  await tapWhereShown(startSession(page, "Open Dough"));
  const dialog = startSessionDialog(page, "Open Dough");
  await startSessionField(dialog).fill("Review the current work.");
  await tapWhereShown(
    dialog.getByRole("button", { name: "Start", exact: true }),
  );
  await expect(dialog).toBeHidden();
}

test.describe("390×844 touch, held", () => {
  test.use({ viewport: phone.portrait, hasTouch: true });

  test("the progress answer and the direction label read in whole words while the startup goes on", async ({
    page,
    origin,
    dashboard,
  }) => {
    test.setTimeout(120_000);
    dashboard.claudeScenario("held");
    await openBacklog(page, origin);
    const launcher = startSession(page, "Open Dough");
    await expect(launcher).toBeVisible();
    const before = await rowAt(page, phone.portrait);

    await startWithTypedText(page);
    const progress = parts(page).projectActions.locator(
      ".start-session-answer",
    );
    await expect(launcher).toBeDisabled();
    await expectRowReadsWhole(
      page,
      progress,
      "Starting a session in Open Dough… Local startup in progress.",
      before,
    );

    dashboard.releaseHeldClaude();
    const terminal = page.getByRole("region", { name: "Terminal" });
    await expect(terminal).toBeVisible({ timeout: 30_000 });
    await closeSidePanel(terminal);
    await expect(parts(page).adHocStarted).toBeVisible({ timeout: 30_000 });
  });
});

for (const viewport of [phone.portrait, largePhone]) {
  for (const { scenario, words, answer } of answers) {
    test.describe(`${viewport.width}×${viewport.height} touch, ${scenario}`, () => {
      test.use({ viewport, hasTouch: true });

      test("the answer and the direction label read in whole words, opened, closed, and rotated", async ({
        page,
        origin,
        dashboard,
      }) => {
        test.setTimeout(120_000);
        dashboard.claudeScenario(scenario);
        await openBacklog(page, origin);
        const launcher = startSession(page, "Open Dough");
        await expect(launcher).toBeVisible();
        const turned = rotated(viewport);
        const before = {
          turned: await rowAt(page, turned),
          upright: await rowAt(page, viewport),
        };

        await startWithTypedText(page);
        const shown = answer(page);
        if (scenario === "launched") {
          const terminal = page.getByRole("region", { name: "Terminal" });
          await expect(terminal).toBeVisible({ timeout: 30_000 });
          // Covering hides the Board answer; Close then read it.
          await tapWhereShown(terminal.getByRole("button", { name: "Close" }));
          await expect(terminal).toHaveCount(0);
        }
        await expect(shown).toBeVisible({ timeout: 30_000 });

        await expectRowReadsWhole(page, shown, words, before.upright);
        await expectDirectionOpensBeneath(page, shown, words);

        await page.setViewportSize(turned);
        await expectRowReadsWhole(page, shown, words, before.turned);
        await expectDirectionOpensBeneath(page, shown, words);
        await page.setViewportSize(viewport);
        await expectRowReadsWhole(page, shown, words, before.upright);
      });
    });
  }
}
