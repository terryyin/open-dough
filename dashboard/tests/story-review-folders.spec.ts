// A story review arranges its changed files under their folders
// (../src/reviewFileTree.ts): files nest under each folder of their path,
// root files sit at the top level, single-folder chains are one folder, a
// rename sits at its new path only, each folder counts its files at any
// depth, and folders come before files in name order whatever the input order.

import { expect, test } from "./support/pageTest.ts";
import { reviewFileTree, type ReviewTreeNode } from "../src/reviewFileTree.ts";
import type { ReviewedFile } from "../src/storyReview.ts";

// Each node as `name (count)` for a folder or `name` for a file, its rows
// indented beneath it.
const outline = (nodes: readonly ReviewTreeNode[], depth = 0): string[] =>
  nodes.flatMap((node) => {
    const indent = "  ".repeat(depth);
    return node.kind === "folder"
      ? [
          `${indent}${node.name}/ (${String(node.fileCount)}) at ${node.path}`,
          ...outline(node.children, depth + 1),
        ]
      : [`${indent}${node.name}`];
  });

const files: readonly ReviewedFile[] = [
  { kind: "modified", path: "README.md" },
  { kind: "deleted", path: "dashboard/server/c.ts" },
  { kind: "modified", path: "dashboard/src/b.ts" },
  { kind: "added", path: "dashboard/src/a.tsx" },
  { kind: "added", path: "docs/adrs/drafts/0009-tree.md" },
  { kind: "renamed", path: "new/a.ts", oldPath: "old/a.ts" },
  { kind: "added", path: "AGENTS.md" },
  { kind: "modified", path: "dashboard/index.html" },
];

test("files nest under their folders with root files at the top level", () => {
  expect(outline(reviewFileTree(files))).toEqual([
    "dashboard/ (4) at dashboard",
    "  server/ (1) at dashboard/server",
    "    c.ts",
    "  src/ (2) at dashboard/src",
    "    a.tsx",
    "    b.ts",
    "  index.html",
    "docs/adrs/drafts/ (1) at docs/adrs/drafts",
    "  0009-tree.md",
    "new/ (1) at new",
    "  a.ts",
    "AGENTS.md",
    "README.md",
  ]);
});

test("a file node keeps its snapshot file", () => {
  const [newFolder] = reviewFileTree([
    { kind: "renamed", path: "new/a.ts", oldPath: "old/a.ts" },
  ]);
  expect(newFolder).toEqual({
    kind: "folder",
    name: "new",
    path: "new",
    fileCount: 1,
    children: [
      {
        kind: "file",
        name: "a.ts",
        file: { kind: "renamed", path: "new/a.ts", oldPath: "old/a.ts" },
      },
    ],
  });
});

test("a chain compacts only while each folder holds just one folder", () => {
  expect(
    outline(
      reviewFileTree([
        { kind: "added", path: "a/b/c/d/deep.ts" },
        { kind: "added", path: "a/b/top.ts" },
        { kind: "modified", path: "x/y/one.ts" },
        { kind: "modified", path: "x/z/two.ts" },
      ]),
    ),
  ).toEqual([
    "a/b/ (2) at a/b",
    "  c/d/ (1) at a/b/c/d",
    "    deep.ts",
    "  top.ts",
    "x/ (2) at x",
    "  y/ (1) at x/y",
    "    one.ts",
    "  z/ (1) at x/z",
    "    two.ts",
  ]);
});

test("the same files arrange the same way in any order", () => {
  const arranged = reviewFileTree(files);
  expect(reviewFileTree([...files].reverse())).toEqual(arranged);
  expect(reviewFileTree([])).toEqual([]);
});
