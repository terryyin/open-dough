#!/usr/bin/env node
// Maintainer entry point kept for this repository's own backlog. It owns no
// backlog rules: it derives the identities named by the supplied bullets and
// delegates the change to the shared operation in
// src/skills/dough-product-backlog/scripts/.

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { addQueueEntry } from "../src/skills/dough-product-backlog/scripts/product-backlog-add.mjs";
import { parseEntryLine } from "../src/skills/dough-product-backlog/scripts/product-backlog-document.mjs";
import { BacklogError } from "../src/skills/dough-product-backlog/scripts/product-backlog-refusal.mjs";
import {
  applyToBacklog,
  defaultBacklogPath,
} from "../src/skills/dough-product-backlog/scripts/product-backlog-store.mjs";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const usage =
  "Usage: product-backlog-insert.mjs --entry <bullet> --after <existing bullet> [--file <path>]";

// Bullets start with a dash, so each option takes the argument that follows it.
function parseArguments(argv) {
  const values = { file: defaultBacklogPath };
  const known = new Set(["--entry", "--after", "--file"]);

  for (let index = 0; index < argv.length; index += 2) {
    const option = argv[index];
    const value = argv[index + 1];
    if (!known.has(option) || value === undefined) {
      throw new BacklogError(
        `Unsupported argument: ${option ?? "(none)"}\n\n${usage}`,
      );
    }
    values[option.slice(2)] = value;
  }
  if (!values.entry || !values.after) {
    throw new BacklogError(
      `Both --entry and --after are required.\n\n${usage}`,
    );
  }
  return values;
}

async function main(argv) {
  const values = parseArguments(argv);
  const entry = parseEntryLine(values.entry);
  const anchor = parseEntryLine(values.after);
  const file = resolve(repositoryRoot, values.file);

  await applyToBacklog(file, (source) =>
    addQueueEntry(source, {
      identity: entry.identity,
      title: entry.title,
      href: entry.href,
      after: anchor.identity,
      backlogDirectory: dirname(file),
    }),
  );
  console.log(
    `Inserted backlog entry after the requested anchor in ${values.file}.`,
  );
}

try {
  await main(process.argv.slice(2));
} catch (error) {
  if (error instanceof BacklogError) {
    console.error(error.refusal);
    process.exit(1);
  }
  throw error;
}
