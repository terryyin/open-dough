#!/usr/bin/env node
// Applies one explicitly selected product backlog change to the project's
// backlog file. It applies a decision; it never decides value, priority,
// prerequisites, completion, or who may execute the work.

import { parseArgs } from "node:util";
import {
  catalogDone,
  complete,
} from "./product-backlog-completion-command.mjs";
import {
  readConsumers,
  visitConsumers,
} from "./product-backlog-dependency-consumers.mjs";
import { resolveDependency } from "./product-backlog-dependency-resolution.mjs";
import { direction, refresh } from "./product-backlog-edit-command.mjs";
import { printIdentityEvidence } from "./product-backlog-identity-evidence.mjs";
import { add, place, take } from "./product-backlog-queue-command.mjs";
import { BacklogError } from "./product-backlog-refusal.mjs";
import { options, resolvePath } from "./product-backlog-request.mjs";
import {
  readDependencies,
  updateDependency,
} from "./product-backlog-story-dependencies-command.mjs";
import {
  readState,
  recordState,
} from "./product-backlog-story-state-command.mjs";
import { preparationRefusal } from "./product-backlog-story-state-home.mjs";
import { usage } from "./product-backlog-usage.mjs";

// Operations on canonical story homes; their refusals say nothing was
// written rather than that the backlog was unchanged.
const preparationOperations = {
  "record-state": recordState,
  "read-state": readState,
  "discover-consumers": readConsumers,
  "visit-consumers": visitConsumers,
  "resolve-dependency": resolveDependency,
  "read-dependencies": readDependencies,
  "update-dependency": updateDependency,
};

const operations = {
  add,
  place,
  take,
  complete,
  "catalog-done": catalogDone,
  refresh,
  direction,
  "identity-evidence": printIdentityEvidence,
  ...preparationOperations,
};

function unknownOperation(name) {
  return new BacklogError(`Unknown operation: ${name || "(none)"}\n\n${usage}`);
}

async function main(argv) {
  let parsed;
  try {
    parsed = parseArgs({ args: argv, options, allowPositionals: true });
  } catch (error) {
    const [command] = argv;
    if (
      command &&
      !command.startsWith("-") &&
      !Object.hasOwn(operations, command)
    ) {
      throw unknownOperation(command);
    }
    throw new BacklogError(`${error.message}\n\n${usage}`);
  }
  const { values, positionals } = parsed;

  if (values.help) {
    console.log(usage);
    return;
  }
  const named = positionals.length === 1 ? positionals[0] : "";
  if (!Object.hasOwn(operations, named)) {
    throw unknownOperation(positionals.join(" "));
  }
  await operations[named](resolvePath(values.file), values);
}

try {
  await main(process.argv.slice(2));
} catch (error) {
  if (error instanceof BacklogError) {
    const refusal = Object.hasOwn(preparationOperations, process.argv[2])
      ? preparationRefusal(error)
      : error.refusal;
    console.error(refusal);
    process.exit(1);
  }
  throw error;
}
