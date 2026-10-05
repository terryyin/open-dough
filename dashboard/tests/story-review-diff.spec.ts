// A story review reads Git's unified diff of one file into hunks and lines
// (../src/unifiedDiff.ts): Git's file headers are not lines, a removed line
// that reads like a header stays a removal, Git's no-newline note marks the
// line before it, each line is numbered from its hunk's header in the old
// and new file, and a binary or mode-only change has no hunks.

import { expect, test } from "./support/pageTest.ts";
import { parsedUnifiedDiff } from "../src/unifiedDiff.ts";

test("hunks keep their headers and lines with additions, removals, and unchanged lines", () => {
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
          { kind: "unchanged", text: "kept", oldNumber: 1, newNumber: 1 },
          { kind: "removed", text: "gone", oldNumber: 2 },
          { kind: "added", text: "came", newNumber: 2 },
        ],
      },
      {
        header: "@@ -10,2 +10,3 @@",
        lines: [
          { kind: "unchanged", text: "", oldNumber: 10, newNumber: 10 },
          { kind: "removed", text: "-- looks like a header", oldNumber: 11 },
          { kind: "added", text: "++ looks like a header", newNumber: 11 },
          { kind: "added", text: "last", newNumber: 12 },
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
        {
          kind: "removed",
          text: "before",
          oldNumber: 1,
          noNewlineAtEnd: true,
        },
        {
          kind: "added",
          text: "after",
          newNumber: 1,
          noNewlineAtEnd: true,
        },
      ],
    },
  ]);
});

// A no-newline note takes no number, and a header may omit a count of one.
test("each line carries its old and new numbers from its hunk's header", () => {
  const printed = [
    "diff --git a/old.txt b/new.txt",
    "similarity index 92%",
    "rename from old.txt",
    "rename to new.txt",
    "--- a/old.txt",
    "+++ b/new.txt",
    "@@ -10,3 +10,4 @@",
    " old 9",
    " old 10",
    " old 11",
    "+renamed",
    "@@ -20,2 +21,2 @@ second",
    " kept",
    "-gone",
    "\\ No newline at end of file",
    "+came",
    "\\ No newline at end of file",
    "@@ -30 +31 @@",
    "-one",
    "+uno",
    "",
  ].join("\n");
  const numbers = parsedUnifiedDiff(printed).hunks.map(({ lines }) =>
    lines.map(({ oldNumber, newNumber }) => [oldNumber, newNumber]),
  );
  expect(numbers).toEqual([
    [
      [10, 10],
      [11, 11],
      [12, 12],
      [undefined, 13],
    ],
    [
      [20, 21],
      [21, undefined],
      [undefined, 22],
    ],
    [
      [30, undefined],
      [undefined, 31],
    ],
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
