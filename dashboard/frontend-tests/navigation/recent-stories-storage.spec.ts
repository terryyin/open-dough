import { expect, onTestFinished, test, vi } from "vitest";
import { recentStoriesKey } from "../../src/recentStories.ts";
import { withFramePreference } from "../../test-support/component-mount/framePreferences.ts";
import { mountBoardFrame } from "./board-frame-mount.ts";
import { boardWork, story } from "./board-work.ts";
import {
  activate,
  dismissWithEscape,
  recent,
  selectCard,
  showsBookmark,
  showsEmptyHistory,
  showsHistory,
} from "./recent-stories-frame.ts";

const viewport = { width: 1280, height: 800 };
const openDough = "Open Dough";

test("a fresh frame clears selection and recovers the ten newest entries from browser storage", async () => {
  withFramePreference(recentStoriesKey, null);
  const newest = story("Recent history 11", 920);
  const stories = [
    ...Array.from(Array<unknown>(10).keys(), (index) =>
      story(`Recent history ${index + 1}`, 910 + index),
    ),
    newest,
  ];
  const frame = await mountBoardFrame(
    boardWork(stories, { taken: [] }),
    viewport,
  );
  for (const entry of stories) await selectCard(entry.title);
  await showsBookmark(newest.identity);
  frame.remount();
  await showsBookmark();
  await activate(recent);
  await showsHistory(
    stories
      .slice(1)
      .reverse()
      .map(({ identity }) => [openDough, identity, false]),
  );
});

test("refused browser storage leaves history usable for one frame with no persisted selection or page error", async () => {
  const storage = vi
    .spyOn(window, "localStorage", "get")
    .mockImplementation(() => {
      throw new DOMException("Storage is refused.", "SecurityError");
    });
  const errors: ErrorEvent[] = [];
  const capture = (event: ErrorEvent) => errors.push(event);
  window.addEventListener("error", capture);
  onTestFinished(() => {
    storage.mockRestore();
    window.removeEventListener("error", capture);
  });

  const queued = story("First story selected while storage is refused", 901);
  const taken = story("Second story selected while storage is refused", 902);
  const frame = await mountBoardFrame(
    boardWork([queued, taken], { taken: [] }),
    viewport,
  );
  await activate(recent);
  await showsEmptyHistory();
  await dismissWithEscape();
  await selectCard(queued.title);
  await selectCard(taken.title);
  await activate(recent);
  await showsHistory([
    [openDough, taken.identity, true],
    [openDough, queued.identity, false],
  ]);
  frame.remount();
  await showsBookmark();
  await activate(recent);
  await showsEmptyHistory();
  expect(errors).toEqual([]);
});
