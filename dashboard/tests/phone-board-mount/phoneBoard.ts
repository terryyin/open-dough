import { onTestFinished } from "vitest";
import { commands, page } from "vitest/browser";
import { mountDashboard } from "../../src/mountDashboard.tsx";
import type { PhoneBoardOptions } from "../support/mountedPhoneBoardCommands.ts";

const viewport = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
});

async function resize(width: number, height: number) {
  const browser = await commands.phoneBoardResize({ width, height });
  await page.viewport(width, height);
  return { browser, frame: viewport() };
}

function storyCard(title: string) {
  return {
    swipeFromCard: (direction: "left" | "right") =>
      commands.phoneBoardSwipe(direction, { from: { title, target: "card" } }),
    swipeFromStart: (direction: "left" | "right") =>
      commands.phoneBoardSwipe(direction, { from: { title, target: "start" } }),
    showsSelected: (selected: boolean) =>
      commands.phoneBoardStorySelected(title, selected),
    showsInspected: (inspected: boolean) =>
      commands.phoneBoardStoryInspected(title, inspected),
    tapInspect: () => commands.phoneBoardTapInspectStory(title),
    tapEmptyArea: () => commands.phoneBoardTapStoryCard(title),
  };
}

const board = {
  showsPublishedStories: commands.phoneBoardPublishedStories,
  showsPhoneColumn: commands.phoneBoardShowsColumn,
  showsPhone: commands.phoneBoardShowsColumns,
  columnReadingRoom: commands.phoneBoardReadingRoom,
  swipe: commands.phoneBoardSwipe,
  tapIndicator: commands.phoneBoardTapIndicator,
  focusIndicator: commands.phoneBoardFocusIndicator,
  activateIndicator: commands.phoneBoardActivateIndicator,
  indicatorFocused: commands.phoneBoardIndicatorFocused,
  showsNoLaunchDialog: commands.phoneBoardShowsNoLaunchDialog,
  launchAcceptances: commands.phoneBoardLaunchAcceptances,
  countSlides: commands.phoneBoardCountSlides,
  slides: commands.phoneBoardSlides,
  prefersReducedMotion: () =>
    matchMedia("(prefers-reduced-motion: reduce)").matches,
  storyCard,
  resize,
  viewport,
};

export async function mountPhoneBoard(options: PhoneBoardOptions = {}) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const location = window.location.href;
  const historyState: unknown = window.history.state;
  const storage = Object.entries<string>(window.localStorage);
  const { boardPositionKey, startingPosition, phoneBoardViewport, readyStory } =
    await commands.preparePhoneBoard(options);
  const container = document.createElement("div");
  container.id = "root";
  let unmount = (): void => undefined;
  onTestFinished(async () => {
    try {
      unmount();
    } finally {
      container.remove();
      try {
        await commands.releasePhoneBoard();
      } finally {
        window.history.replaceState(historyState, "", location);
        window.localStorage.clear();
        for (const [key, value] of storage) {
          window.localStorage.setItem(key, value);
        }
        await page.viewport(width, height);
      }
    }
  });

  window.history.replaceState(null, "", "/");
  window.localStorage.clear();
  // Supply the starting preference explicitly even when the previous case
  // left the production module's in-memory column preference at the far end.
  window.localStorage.setItem(boardPositionKey, startingPosition);
  await page.viewport(phoneBoardViewport.width, phoneBoardViewport.height);
  document.body.append(container);
  const root = mountDashboard(container);
  unmount = () => {
    root.unmount();
  };
  return { ...board, readyStory };
}
