#!/usr/bin/env node
// Applies one explicitly selected product backlog change to the project's
// backlog file. It applies a decision; it never decides value, priority,
// prerequisites, completion, or who may execute the work.

import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { addQueueEntry } from "./product-backlog-add.mjs";
import { BacklogError, queueHeading } from "./product-backlog-document.mjs";
import {
  applyToBacklog,
  defaultBacklogPath,
} from "./product-backlog-store.mjs";

const usage = `Usage: product-backlog.mjs add --identity <id> --title <title> --link <href>
                             (--after <id> | --before <id> | --position first|last)
                             [--file <path>]

Adds one already identified entry to "## ${queueHeading}" at the requested
relative position. Identities are supplied, never allocated here. Paths are
resolved against the current directory; --file defaults to
${defaultBacklogPath}.`;

const options = {
  identity: { type: "string" },
  title: { type: "string" },
  link: { type: "string" },
  after: { type: "string" },
  before: { type: "string" },
  position: { type: "string" },
  file: { type: "string", default: defaultBacklogPath },
  help: { type: "boolean", default: false },
};

function readPlacement(values) {
  const chosen = ["after", "before", "position"].filter(
    (name) => values[name] !== undefined,
  );
  if (chosen.length !== 1) {
    throw new BacklogError(
      `Supply exactly one of --after, --before, or --position; found ${chosen.length}.`,
    );
  }
  if (
    values.position !== undefined &&
    !["first", "last"].includes(values.position)
  ) {
    throw new BacklogError(
      `--position accepts "first" or "last"; found "${values.position}".`,
    );
  }
  return {
    after: values.after,
    before: values.before,
    position: values.position,
  };
}

async function main(argv) {
  let parsed;
  try {
    parsed = parseArgs({ args: argv, options, allowPositionals: true });
  } catch (error) {
    throw new BacklogError(`${error.message}\n\n${usage}`);
  }
  const { values, positionals } = parsed;

  if (values.help) {
    console.log(usage);
    return;
  }
  if (positionals.length !== 1 || positionals[0] !== "add") {
    throw new BacklogError(
      `Unknown operation: ${positionals.join(" ") || "(none)"}\n\n${usage}`,
    );
  }

  const request = {
    identity: values.identity,
    title: values.title,
    href: values.link,
    ...readPlacement(values),
  };
  await applyToBacklog(resolve(process.cwd(), values.file), (source) =>
    addQueueEntry(source, request),
  );
  console.log(
    `Added "${request.identity}" to "## ${queueHeading}" in ${values.file}.`,
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
