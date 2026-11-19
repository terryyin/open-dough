// @ts-check
// MakeMe entry a browser (page) case can load: Node-free builders only.
// makeMe.mjs exposes the same builders from the same definitions.
import { storyNoteMakeMeProperties } from "./storyNoteTestData.mjs";
import { ciHistoryAnswerMakeMeProperties } from "./ciHistoryAnswerTestData.mjs";
import { ciProofMakeMeProperties } from "./ciProofTestData.mjs";
import { intentCiStatusMakeMeProperties } from "./comparisonViewTestData.mjs";

/** @typedef {import("./storyNoteTestData.mjs").StoryNoteMakeMe & import("./ciHistoryAnswerTestData.mjs").CiHistoryAnswerMakeMe & import("./ciProofTestData.mjs").CiProofMakeMe & import("./comparisonViewTestData.mjs").IntentCiStatusMakeMe} PageMakeMe */

/** @type {PageMakeMe} */
export const makeMe = Object.defineProperties(/** @type {PageMakeMe} */ ({}), {
  ...storyNoteMakeMeProperties(),
  ...ciHistoryAnswerMakeMeProperties(),
  ...ciProofMakeMeProperties(),
  ...intentCiStatusMakeMeProperties(),
});
