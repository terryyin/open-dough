// A story review reads Git's unified diff of one file into hunks and lines
// (../src/unifiedDiff.ts): Git's file headers are not lines, a removed line
// that reads like a header stays a removal, Git's no-newline note marks the
// line before it, and a binary or mode-only change has no hunks.

import { expect, test } from "@playwright/test";
import { parsedUnifiedDiff } from "../src/unifiedDiff.ts";

test("hunks keep their headers and lines with additions, removals, and context", () => {
  const printed = [
    "diff --git a/notes.txt b/notes.txt",
    "index 1111111..2222222 100644",
    "--- a/notes.txt",
    "+++ b/notes.txt",
    "@@ -1,3 +1,3 @@ heading",
    " kept",
    "-gone",
    "+came",
    "@@ -10,2 +10,3 @@",
    " ",
    "--- looks like a header",
    "+++ looks like a header",
    "+last",
    "",
  ].join("\n");
  expect(parsedUnifiedDiff(printed)).toEqual({
    binary: false,
    hunks: [
      {
        header: "@@ -1,3 +1,3 @@ heading",
        lines: [
          { kind: "context", text: "kept" },
          { kind: "removed", text: "gone" },
          { kind: "added", text: "came" },
        ],
      },
      {
        header: "@@ -10,2 +10,3 @@",
        lines: [
          { kind: "context", text: "" },
          { kind: "removed", text: "-- looks like a header" },
          { kind: "added", text: "++ looks like a header" },
          { kind: "added", text: "last" },
        ],
      },
    ],
  });
});

test("Git's no-newline note marks the line it follows", () => {
  const printed = [
    "diff --git a/end.txt b/end.txt",
    "--- a/end.txt",
    "+++ b/end.txt",
    "@@ -1 +1 @@",
    "-before",
    "\\ No newline at end of file",
    "+after",
    "\\ No newline at end of file",
    "",
  ].join("\n");
  expect(parsedUnifiedDiff(printed).hunks).toEqual([
    {
      header: "@@ -1 +1 @@",
      lines: [
        { kind: "removed", text: "before", noNewlineAtEnd: true },
        { kind: "added", text: "after", noNewlineAtEnd: true },
      ],
    },
  ]);
});

test("a binary or mode-only change has no hunks, and only a binary one says so", () => {
  expect(
    parsedUnifiedDiff(
      [
        "diff --git a/image.png b/image.png",
        "index 3333333..4444444 100644",
        "Binary files a/image.png and b/image.png differ",
        "",
      ].join("\n"),
    ),
  ).toEqual({ binary: true, hunks: [] });
  expect(
    parsedUnifiedDiff(
      [
        "diff --git a/run.sh b/run.sh",
        "old mode 100644",
        "new mode 100755",
        "",
      ].join("\n"),
    ),
  ).toEqual({ binary: false, hunks: [] });
  expect(parsedUnifiedDiff("")).toEqual({ binary: false, hunks: [] });
});
