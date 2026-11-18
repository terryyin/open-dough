import type { Page, ViewportSize } from "@playwright/test";
import type {} from "@vitest/browser-playwright";
import type { BrowserCommandContext } from "vitest/node";
import {
  activateColumnIndicator,
  expectColumnIndicatorFocused,
  focusColumnIndicator,
  type ColumnName,
} from "../boardPage.ts";
import { boardView } from "../boardView.ts";
import { expectSettledPage } from "../dashboardPage.ts";
import {
  backlogLaunchers,
  expectNoLaunchDialog,
  takenBacklogStories,
} from "../launchStoryCardPage.ts";
import { tapInspectStory } from "../storyCardControls.ts";
import {
  emptyArea,
  expectInspected,
  expectSelected,
  tapCardEmptyArea,
} from "../storyCardSelection.ts";
import {
  mountedBoard,
  preparePhoneBoard,
  restorePhoneBoard,
} from "./mountedPhoneBoard.ts";

export type { PhoneBoardOptions } from "./mountedPhoneBoard.ts";

const mountedPage = (page: Page) => mountedBoard(page).framedPage;
const storyCard = (page: Page, title: string) =>
  backlogLaunchers(mountedPage(page)).card(title);

type SwipeOptions = {
  distance?: number;
  cancel?: boolean;
  from?: { title: string; target: "card" | "start" };
};

async function swipe(
  { page }: BrowserCommandContext,
  direction: "left" | "right",
  { from, ...stroke }: SwipeOptions = {},
) {
  const framedPage = mountedPage(page);
  if (from === undefined) {
    await boardView(framedPage).swipe(direction, stroke);
    return;
  }
  const launchers = backlogLaunchers(framedPage);
  const target =
    from.target === "card"
      ? emptyArea(launchers.card(from.title))
      : launchers.start(from.title);
  await boardView(framedPage).swipe(direction, { ...stroke, from: target });
}

export const phoneBoardCommands = {
  preparePhoneBoard,
  releasePhoneBoard: ({ page }: BrowserCommandContext) =>
    restorePhoneBoard(page),
  phoneBoardPublishedStories: (
    { page }: BrowserCommandContext,
    membership: Parameters<typeof expectSettledPage>[1] = takenBacklogStories,
  ) => expectSettledPage(mountedPage(page), membership),
  phoneBoardShowsColumn: (
    { page }: BrowserCommandContext,
    shown: ColumnName,
    controls: readonly string[],
  ) =>
    boardView(mountedPage(page))
      .showsPhoneColumn(shown, controls)
      .then(() => undefined),
  phoneBoardReadingRoom: ({ page }: BrowserCommandContext, shown: ColumnName) =>
    boardView(mountedPage(page)).columnReadingRoom(shown),
  phoneBoardSwipe: swipe,
  phoneBoardTapIndicator: (
    { page }: BrowserCommandContext,
    column: ColumnName,
  ) =>
    boardView(mountedPage(page))
      .tapIndicator(column)
      .then(() => undefined),
  phoneBoardFocusIndicator: (
    { page }: BrowserCommandContext,
    column: ColumnName,
  ) => focusColumnIndicator(mountedPage(page), column),
  phoneBoardActivateIndicator: (
    { page }: BrowserCommandContext,
    column: ColumnName,
  ) => activateColumnIndicator(mountedPage(page), column),
  phoneBoardIndicatorFocused: (
    { page }: BrowserCommandContext,
    column: ColumnName,
  ) => expectColumnIndicatorFocused(mountedPage(page), column),
  phoneBoardShowsColumns: async (
    { page }: BrowserCommandContext,
    shown: readonly ColumnName[],
    controls: readonly string[],
  ) => {
    await boardView(mountedPage(page)).showsPhone(shown, controls);
  },
  phoneBoardResize: async (
    { page }: BrowserCommandContext,
    viewport: ViewportSize,
  ) => {
    await page.setViewportSize(viewport);
    return page.viewportSize();
  },
  phoneBoardCountSlides: async ({ page }: BrowserCommandContext) => {
    const board = mountedBoard(page);
    board.recordingSlides = true;
    await boardView(board.framedPage).countSlides();
  },
  phoneBoardSlides: ({ page }: BrowserCommandContext) =>
    boardView(mountedPage(page)).slides(),
  phoneBoardStorySelected: (
    { page }: BrowserCommandContext,
    title: string,
    selected: boolean,
  ) => expectSelected(storyCard(page, title), selected),
  phoneBoardStoryInspected: (
    { page }: BrowserCommandContext,
    title: string,
    inspected: boolean,
  ) => expectInspected(storyCard(page, title), inspected),
  phoneBoardTapInspectStory: ({ page }: BrowserCommandContext, title: string) =>
    tapInspectStory(storyCard(page, title), mountedPage(page)),
  phoneBoardTapStoryCard: ({ page }: BrowserCommandContext, title: string) =>
    tapCardEmptyArea(storyCard(page, title)),
  phoneBoardShowsNoLaunchDialog: ({ page }: BrowserCommandContext) =>
    expectNoLaunchDialog(mountedPage(page)),
  phoneBoardLaunchAcceptances: ({ page }: BrowserCommandContext) => {
    const launch = mountedBoard(page).launch;
    if (launch === undefined) {
      throw new Error("Observe launch requests when mounting the phone board.");
    }
    return launch.acceptances;
  },
};

type CommandCall<T> = T extends (
  context: BrowserCommandContext,
  ...args: infer Args
) => infer Result
  ? (...args: Args) => Promise<Awaited<Result>>
  : never;
type PhoneBoardCommands = {
  [K in keyof typeof phoneBoardCommands]: CommandCall<
    (typeof phoneBoardCommands)[K]
  >;
};

declare module "vitest/browser" {
  // Browser callers receive the command arguments without the provider context.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface BrowserCommands extends PhoneBoardCommands {}
}
