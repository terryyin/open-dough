// @ts-check
// A story result's admitted tree held in memory (makeMe.aStoryResultTree):
// its revision, the files it tracks and whether each reads as text, as the
// result's answer reads them (dashboard/server/storyReviewResultAnswer.ts).
import { agentSettingsPath } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  IntentLocationBuilder,
  IntentSettingsBuilder,
} from "./intentLocationTestData.mjs";

/** @typedef {import("../../../dashboard/server/storyReviewResultAnswer.ts").ResultTree} ResultTree */
/** @typedef {import("../../../dashboard/server/gitTreeFiles.ts").SideRead} SideRead */

const unreadable = /** @type {const} */ ({
  kind: "unavailable",
  explanation: "The file has no textual content at that revision.",
});

export class StoryResultTreeBuilder {
  #revision = "7".repeat(40);
  /** @type {Map<string, SideRead>} */
  #files = new Map();
  /** @type {string | undefined} */
  #listingProblem;

  /** @param {string} path @param {string} [text] */
  withFile(path, text = `${path}\n`) {
    this.#files.set(path, { kind: "text", text });
    return this;
  }

  /** @param {string} path */
  withUnreadableFile(path) {
    this.#files.set(path, unreadable);
    return this;
  }

  /** @param {string} text the Intent settings file's exact text */
  withIntentSettings(text) {
    return this.withFile(agentSettingsPath, text);
  }

  withUnreadableIntentSettings() {
    return this.withUnreadableFile(agentSettingsPath);
  }

  // Named example: settings declaring one TypeScript location at `root`,
  // which holds one spec the location selects.
  /** @param {string} root */
  declaringTypeScriptAt(root) {
    const location = new IntentLocationBuilder()
      .at(root)
      .ofKind("typescript")
      .please();
    const settings = new IntentSettingsBuilder()
      .withLocations(location)
      .please();
    return this.withIntentSettings(
      `${JSON.stringify(settings, null, 2)}\n`,
    ).withFile(`${root}/${root}.spec.ts`);
  }

  /** @param {string} problem what Git said */
  thatCannotBeListed(problem) {
    this.#listingProblem = problem;
    return this;
  }

  /** @returns {ResultTree} */
  please() {
    const files = new Map(this.#files);
    const problem = this.#listingProblem;
    return {
      revision: this.#revision,
      paths: () =>
        problem === undefined
          ? Promise.resolve([...files.keys()].sort())
          : Promise.reject(new Error(problem)),
      text: (path) => Promise.resolve(files.get(path) ?? { kind: "absent" }),
    };
  }
}
