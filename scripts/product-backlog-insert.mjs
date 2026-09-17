#!/usr/bin/env node

import { readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function fail(message) {
  console.error(message);
  process.exit(1);
}

function parseArguments(arguments_) {
  const options = {
    file: ".planning/PRODUCT-BACKLOG.md",
  };

  for (let index = 0; index < arguments_.length; index += 2) {
    const option = arguments_[index];
    const value = arguments_[index + 1];

    if (!option?.startsWith("--") || value === undefined) {
      fail(
        "Usage: product-backlog-insert.mjs --entry <bullet> --after <existing bullet> [--file <path>]",
      );
    }

    if (!new Set(["--entry", "--after", "--file"]).has(option)) {
      fail(`Unknown option: ${option}`);
    }

    const key = option.slice(2);
    if (options[key] !== undefined && key !== "file") {
      fail(`Option supplied more than once: ${option}`);
    }
    options[key] = value;
  }

  if (!options.entry || !options.after) {
    fail("Both --entry and --after are required.");
  }
  if (!options.entry.startsWith("- [") || options.entry.includes("\n")) {
    fail("--entry must be one single-line Markdown link bullet.");
  }
  if (!options.after.startsWith("- [") || options.after.includes("\n")) {
    fail("--after must be one existing single-line Markdown link bullet.");
  }

  return options;
}

function findSingleLine(lines, expected, description, start, end) {
  const matches = [];
  for (let index = start; index < end; index += 1) {
    if (lines[index] === expected) {
      matches.push(index);
    }
  }

  if (matches.length !== 1) {
    fail(
      `${description} must appear exactly once in Backlog list; found ${matches.length}.`,
    );
  }
  return matches[0];
}

const options = parseArguments(process.argv.slice(2));
const backlogPath = resolve(repositoryRoot, options.file);
const source = readFileSync(backlogPath, "utf8");
const newline = source.includes("\r\n") ? "\r\n" : "\n";
const hasFinalNewline = source.endsWith(newline);
const lines = source.split(/\r?\n/);
if (hasFinalNewline) {
  lines.pop();
}

const backlogHeadings = lines
  .map((line, index) => (line === "## Backlog list" ? index : -1))
  .filter((index) => index >= 0);
if (backlogHeadings.length !== 1) {
  fail(
    `Expected exactly one Backlog list heading; found ${backlogHeadings.length}.`,
  );
}

const sectionStart = backlogHeadings[0] + 1;
const nextHeadingOffset = lines
  .slice(sectionStart)
  .findIndex((line) => line.startsWith("## "));
const sectionEnd =
  nextHeadingOffset === -1 ? lines.length : sectionStart + nextHeadingOffset;

if (lines.includes(options.entry)) {
  fail("The backlog already contains the requested entry.");
}

const anchorIndex = findSingleLine(
  lines,
  options.after,
  "The --after anchor",
  sectionStart,
  sectionEnd,
);
lines.splice(anchorIndex + 1, 0, options.entry);

const nextSource = `${lines.join(newline)}${hasFinalNewline ? newline : ""}`;
const temporaryPath = `${backlogPath}.tmp-${process.pid}`;
writeFileSync(temporaryPath, nextSource, "utf8");
renameSync(temporaryPath, backlogPath);

console.log(
  `Inserted backlog entry after the requested anchor in ${options.file}.`,
);
