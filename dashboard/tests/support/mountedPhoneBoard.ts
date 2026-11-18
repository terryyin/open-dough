import type { Page } from "@playwright/test";
import type {} from "@vitest/browser-playwright";
import type { BrowserCommandContext } from "vitest/node";
import {
  boardPositionKey,
  columns,
  stopRecordingSlides,
  type ColumnName,
} from "../boardPage.ts";
import { readyStory } from "../launchJourney.ts";
import {
  installFrontendLaunchBoundary,
  type FrontendLaunchBoundary,
} from "./frontendLaunchSubstitutes.ts";
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
  observeLaunch?: boolean;
  reducedMotion?: "reduce";
}>;

type MountedPhoneBoard = ReturnType<typeof mountedPhoneBoardPage> & {
  readonly viewport: NonNullable<ReturnType<Page["viewportSize"]>>;
  readonly reducedMotion: PhoneBoardOptions["reducedMotion"];
  launch?: FrontendLaunchBoundary;
  recordingSlides: boolean;
};

const openBoards = new WeakMap<Page, MountedPhoneBoard>();

export function mountedBoard(page: Page): MountedPhoneBoard {
  const board = openBoards.get(page);
  if (board === undefined) {
    throw new Error("Mount the phone board first.");
  }
  return board;
}

export async function preparePhoneBoard(
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
  const board: MountedPhoneBoard = {
    ...mountedPhoneBoardPage(page, await context.frame()),
    viewport,
    reducedMotion: options.reducedMotion,
    recordingSlides: false,
  };
  openBoards.set(page, board);
  try {
    const services = defaultFrontendServiceState();
    if (options.stories) {
      putFrontendStories(services, options.stories);
    }
    await installFrontendServiceSubstitutes(board.framedPage, services);
    if (options.observeLaunch) {
      board.launch = await installFrontendLaunchBoundary(board.framedPage);
    }
    if (options.reducedMotion) {
      await page.emulateMedia({ reducedMotion: options.reducedMotion });
    }
    await page.setViewportSize(phoneBoardViewport);
    return {
      boardPositionKey,
      startingPosition: String(columns.indexOf(options.column ?? "Backlog")),
      phoneBoardViewport,
      readyStory,
    };
  } catch (error) {
    await restorePhoneBoard(page);
    throw error;
  }
}

async function restoreViewport(page: Page, board: MountedPhoneBoard) {
  try {
    if (board.reducedMotion) {
      await page.emulateMedia({ reducedMotion: null });
    }
  } finally {
    await page.setViewportSize(board.viewport);
  }
}

export async function restorePhoneBoard(page: Page) {
  const board = openBoards.get(page);
  if (board === undefined) {
    return;
  }
  openBoards.delete(page);
  try {
    if (board.recordingSlides) {
      await stopRecordingSlides(board.framedPage);
    }
  } finally {
    try {
      await board.release();
    } finally {
      await restoreViewport(page, board);
    }
  }
}
