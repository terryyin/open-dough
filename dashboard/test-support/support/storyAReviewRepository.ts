// Story A's committed history as its review finds it: trunk files, Story A's
// worktree renaming, adding, deleting and redrawing files, another
// developer's trunk revision merged into it, and a later trunk revision the
// checkout has not fetched. Revision `merged` is the review's baseline.
// `test` starts every origin from it.

import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { test as base } from "./preparationPage.ts";
import type { StartRepository } from "./startOriginPreparation.ts";
import { branch, lines } from "./storyReviewWorktree.ts";

// PNG bytes whose last byte tells one drawing from another.
const image = (last: number) =>
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, last]);

const anotherDeveloper = {
  name: "Another Developer",
  email: "another@example.test",
};

export const storyARepository: StartRepository = queuedReadyRepository()
  .withRevision("trunk files", {
    files: {
      "old.txt": lines("old"),
      "staged.txt": lines("staged"),
      "unstaged.txt": lines("unstaged"),
      "gone.txt": lines("gone", 3),
      "image.png": image(1),
    },
  })
  .withRevision("merged", {
    message: "another story",
    author: anotherDeveloper,
    committer: anotherDeveloper,
    files: { "other.txt": "other story\n" },
  })
  .withRevision("later", {
    message: "later trunk",
    fetched: false,
    author: anotherDeveloper,
    committer: anotherDeveloper,
    files: { "other2.txt": "later trunk\n" },
  })
  .withWorkspace(branch, { from: "trunk files" })
  .withUnpublishedRevision("renamed", {
    message: "rename with a small edit",
    remove: ["old.txt"],
    files: { "new.txt": `${lines("old")}renamed\n` },
  })
  .withUnpublishedRevision("story file", { files: { "story.txt": "story\n" } })
  .withUnpublishedRevision("redrawn", {
    message: "delete a file and redraw the image",
    remove: ["gone.txt"],
    files: { "image.png": image(2) },
  })
  .withUnpublishedRevision("merge trunk", {
    parents: ["redrawn", "merged"],
    files: { "other.txt": "other story\n" },
  })
  .please();

export { expect } from "./preparationPage.ts";
export const test = base.extend({
  originRepository: storyARepository,
});
