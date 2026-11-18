import type { Page } from "@playwright/test";
import type {} from "@vitest/browser-playwright";
import type { BrowserCommandContext } from "vitest/node";
import {
  activateColumnIndicator,
  boardPositionKey,
  columns,
  expectColumnIndicatorFocused,
  focusColumnIndicator,
  type ColumnName,
} from "../boardPage.ts";
import { boardView } from "../boardView.ts";
import { expectSettledPage } from "../dashboardPage.ts";
import { takenBacklogStories } from "../launchStoryCardPage.ts";
import { installFrontendServiceSubstitutes } from "./frontendServiceSubstitutes.ts";
import {
  defaultFrontendServiceState,
  putFrontendStories,
  type FrontendStories,
} from "./frontendServiceState.ts";
import { mountedPhoneBoardPage } from "./mountedPhoneBoardPage.ts";

const phoneBoardViewport = { width: 390, height: 844 };

export type PhoneBoardOptions = Readonly<{
  column?: ColumnName;
  stories?: FrontendStories;
}>;

const openBoards = new WeakMap<
  Page,
  ReturnType<typeof mountedPhoneBoardPage> & {
    readonly viewport: NonNullable<ReturnType<Page["viewportSize"]>>;
  }
>();

function mountedPage(page: Page): Page {
  const board = openBoards.get(page);
  if (board === undefined) {
    throw new Error("Mount the phone board first.");
  }
  return board.framedPage;
}

async function preparePhoneBoard(
  context: BrowserCommandContext,
  options: PhoneBoardOptions,
) {
  const { page } = context;
  if (openBoards.has(page)) {
    throw new Error("A phone board is already mounted.");
  }
  const viewport = page.viewportSize();
  if (viewport === null) {
    throw new Error("The phone board requires a Chromium viewport.");
  }
  const board = mountedPhoneBoardPage(page, await context.frame());
  openBoards.set(page, { ...board, viewport });
  try {
    const services = defaultFrontendServiceState();
    if (options.stories) {
      putFrontendStories(services, options.stories);
    }
    await installFrontendServiceSubstitutes(board.framedPage, services);
    await page.setViewportSize(phoneBoardViewport);
    return {
      boardPositionKey,
      startingPosition: String(columns.indexOf(options.column ?? "Backlog")),
      phoneBoardViewport,
    };
  } catch (error) {
    await restorePhoneBoard(page);
    throw error;
  }
}

async function restorePhoneBoard(page: Page) {
  const board = openBoards.get(page);
  if (board === undefined) {
    return;
  }
  openBoards.delete(page);
  try {
    await board.release();
  } finally {
    await page.setViewportSize(board.viewport);
  }
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
  phoneBoardSwipe: (
    { page }: BrowserCommandContext,
    direction: "left" | "right",
  ) =>
    boardView(mountedPage(page))
      .swipe(direction)
      .then(() => undefined),
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
