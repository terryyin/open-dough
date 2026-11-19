// @ts-check
// MakeMe entry a browser (page) case can load: Node-free builders only.
// makeMe.mjs exposes the same builders from the same definitions.
import { storyNoteMakeMeProperties } from "./storyNoteTestData.mjs";

/** @type {import("./storyNoteTestData.mjs").StoryNoteMakeMe} */
export const makeMe = Object.defineProperties(
  /** @type {import("./storyNoteTestData.mjs").StoryNoteMakeMe} */ ({}),
  storyNoteMakeMeProperties(),
);
