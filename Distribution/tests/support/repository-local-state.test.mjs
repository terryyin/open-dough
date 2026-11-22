import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { test } from "node:test";
import { makeMe } from "./makeMe.mjs";
import { materializeLocalCheckout } from "./repository-fixture.mjs";
import { withLocalState } from "./repository-local-state.mjs";

test("declared local state is what Git reports of the index and files", async (t) => {
  const description = withLocalState(
    makeMe.aRepository
      .withRevision("trunk", {
        files: {
          "staged.txt": "a\n",
          "unstaged.txt": "b\n",
          "mode.txt": "c\n",
        },
      })
      .withWorkspace("story", { from: "trunk" })
      .please(),
    {
      staged: { "staged.txt": "a\nmore\n", "added.txt": "new\n" },
      unstaged: { "unstaged.txt": "b\nmore\n" },
      untracked: { "fresh/new.txt": "untracked\n" },
      ignored: { "ignored.log": "ignored\n" },
      modes: { "mode.txt": 0o755 },
    },
  );
  const { execution } = await materializeLocalCheckout(t, description);
  const git = (/** @type {string[]} */ ...args) =>
    execFileSync("git", ["-C", String(execution), ...args], {
      encoding: "utf8",
    });

  assert.equal(
    git("status", "--porcelain=v1", "--ignored").trim(),
    [
      "A  added.txt",
      " M mode.txt",
      "M  staged.txt",
      " M unstaged.txt",
      "?? fresh/",
      "!! ignored.log",
    ].join("\n"),
  );
  assert.equal(
    git("diff", "--cached", "--name-status").trim(),
    "A\tadded.txt\nM\tstaged.txt",
  );
  assert.equal(
    git("diff", "--summary", "mode.txt").trim(),
    "mode change 100644 => 100755 mode.txt",
  );
});
