// On a phone, against a controlled launch boundary and machine read, the
// answer beside Start session and the Near-future direction label both read
// in whole words: neither takes the other's room. The answer stays with Start
// session, the direction opens beneath the row, and rotating keeps every part
// of the row readable and reachable. The real refusal's words are
// ../../../e2e/launches/agent-launch-ad-hoc-problems.spec.ts.
import type { Locator, Page } from "@playwright/test";
import {
  closeTerminal,
  terminalPanel,
} from "../../tests/terminalScreenPage.ts";
import {
  startSession,
  startSessionDialog,
  startSessionField,
} from "../../tests/launchStoryCardPage.ts";
import { parts, sessionEntriesIn } from "../../tests/dashboardPage.ts";
import {
  box,
  expectEveryControlReachable,
  expectInside,
  expectNoSidewaysScrollIn,
  tapWhereShown,
} from "../../tests/pageLayout.ts";
import { phoneLaunchTouchViewport } from "../../tests/touchLaunchPage.ts";
import { lettersBrokenApart } from "../../tests/wholeWords.ts";
import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../tests/support/frontendApp.ts";
import { frontendAttempt } from "../../tests/support/frontendLaunchAttempts.ts";
import { installFrontendLaunchBoundary } from "../../tests/support/frontendLaunchSubstitutes.ts";
import { installAttachedTerminalSubstitute } from "../../tests/support/frontendServiceSubstitutes.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

type Viewport = { readonly width: number; readonly height: number };

const phone = phoneLaunchTouchViewport;

const refusedWords =
  "Launch failed: Claude Code refused to start a session in ~/git/open-dough. Run claude in that folder once to see why.";

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

// Starts a session from the dialog. One with no typed text opens in the
// terminal once it starts.
async function startSessionWith(page: Page, text: string) {
  await tapWhereShown(startSession(page, "Open Dough"));
  const dialog = startSessionDialog(page, "Open Dough");
  await startSessionField(dialog).fill(text);
  await tapWhereShown(
    dialog.getByRole("button", { name: "Start", exact: true }),
  );
  await expect(dialog).toBeHidden();
}

test.describe(`${phone.portrait.width}×${phone.portrait.height} touch`, () => {
  test.use({ viewport: phone.portrait, hasTouch: true });

  test("the progress answer and the direction label read in whole words while the startup goes on", async ({
    page,
    frontendServices,
  }) => {
    const attempt = frontendAttempt(frontendServices);
    const boundary = await installFrontendLaunchBoundary(page, {
      accept: attempt.accept,
    });
    await installAttachedTerminalSubstitute(page);
    await openFrontendTakenBacklog(page);
    const launcher = startSession(page, "Open Dough");
    await expect(launcher).toBeVisible();
    const before = await rowAt(page, phone.portrait);

    await startSessionWith(page, "");
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

    attempt.launch(
      makeMe.aLaunchRecord.adHoc({ title: "Open Dough · Ad hoc" }).please(),
    );
    await boundary.tellChanged();
    const terminal = terminalPanel(page);
    await expect(terminal).toBeVisible();
    await closeTerminal(terminal);
    await expect(sessionEntriesIn(parts(page).taken)).toHaveCount(1);
    await expect(parts(page).adHocStarted).toHaveCount(0);
    await expect(progress).toHaveCount(0);
  });

  test("a refusal and the direction label read in whole words, opened, closed, and rotated", async ({
    page,
    frontendServices,
  }) => {
    const attempt = frontendAttempt(frontendServices);
    const boundary = await installFrontendLaunchBoundary(page, {
      accept: attempt.accept,
    });
    await openFrontendTakenBacklog(page);
    const launcher = startSession(page, "Open Dough");
    await expect(launcher).toBeVisible();
    const before = {
      turned: await rowAt(page, phone.landscape),
      upright: await rowAt(page, phone.portrait),
    };

    await startSessionWith(page, "Review the current work.");
    // Claude Code refused to start the accepted session.
    attempt.settle({
      kind: "failed",
      reason: "refused",
      explanation:
        "Claude Code refused to start a session in ~/git/open-dough. Run `claude` in that folder once to see why.",
    });
    await boundary.tellChanged();
    const shown = parts(page).projectActions.locator(".launch-problem");
    await expect(shown).toBeVisible();

    await expectRowReadsWhole(page, shown, refusedWords, before.upright);
    await expectDirectionOpensBeneath(page, shown, refusedWords);

    await page.setViewportSize(phone.landscape);
    await expectRowReadsWhole(page, shown, refusedWords, before.turned);
    await expectDirectionOpensBeneath(page, shown, refusedWords);
    await page.setViewportSize(phone.portrait);
    await expectRowReadsWhole(page, shown, refusedWords, before.upright);
  });
});
