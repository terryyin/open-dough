#!/usr/bin/env node
// Compare or copy declared payload files in one process.
// match: exit 0 when every listed file has identical bytes at the destination,
// exit 1 when any file is missing or differs, exit 2 on usage or unexpected reads.
// copy: replace files in listed order. An existing destination keeps its mode,
// matching cp. Exit 1 if a file cannot be written after earlier files were replaced.
// copy-then-match: copy as above, then match the written files; that match
// exits 3 on a difference and 4 on an unexpected read.
import { chmodSync, copyFileSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const [mode, sourceRoot, destRoot] = process.argv.slice(2);
if (
  !["match", "copy", "copy-then-match"].includes(mode) ||
  !sourceRoot ||
  !destRoot ||
  process.argv.length !== 5
) {
  console.error(
    "Usage: open-dough-payload-bytes.mjs <match|copy|copy-then-match> <source-skills> <dest-root>",
  );
  process.exit(2);
}

const files = readFileSync(0, "utf8")
  .split("\n")
  .filter((line) => line.length > 0);

function readBytes(path, unexpectedStatus) {
  try {
    return readFileSync(path);
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }
    console.error(error.message);
    process.exit(unexpectedStatus);
  }
}

function copyFiles() {
  for (const relative of files) {
    const sourcePath = join(sourceRoot, relative);
    const destPath = join(destRoot, relative);
    let previousMode = null;
    try {
      previousMode = statSync(destPath).mode & 0o777;
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.error(error.message);
        process.exit(1);
      }
    }
    try {
      copyFileSync(sourcePath, destPath);
      if (previousMode !== null) {
        chmodSync(destPath, previousMode);
      }
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  }
}

function matchFiles(differenceStatus, unexpectedStatus) {
  for (const relative of files) {
    const source = readBytes(join(sourceRoot, relative), unexpectedStatus);
    const dest = readBytes(join(destRoot, relative), unexpectedStatus);
    if (source === null || dest === null || !source.equals(dest)) {
      process.exit(differenceStatus);
    }
  }
}

if (mode === "match") {
  matchFiles(1, 2);
} else {
  copyFiles();
  if (mode === "copy-then-match") {
    matchFiles(3, 4);
  }
}
