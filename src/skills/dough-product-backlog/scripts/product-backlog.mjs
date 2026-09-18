#!/usr/bin/env node
// Applies one explicitly selected product backlog change to the project's
// backlog file. It applies a decision; it never decides value, priority,
// prerequisites, completion, or who may execute the work.

import { dirname, resolve } from "node:path";
import { parseArgs } from "node:util";
import { addQueueEntry } from "./product-backlog-add.mjs";
import { adoptIdentities } from "./product-backlog-adopt.mjs";
import { completeEntry } from "./product-backlog-complete.mjs";
import {
  BacklogError,
  queueHeading,
  takenHeading,
} from "./product-backlog-document.mjs";
import {
  applyToBacklog,
  defaultBacklogPath,
} from "./product-backlog-store.mjs";
import { takeEntry } from "./product-backlog-take.mjs";

const usage = `Usage: product-backlog.mjs add --identity <id> --title <title> --link <href>
                             (--after <id> | --before <id> | --position first|last)
                             [--file <path>]
       product-backlog.mjs take --identity <id> (--plan <path> | --no-plan)
                             [--file <path>]
       product-backlog.mjs complete --identity <id> [--file <path>]
       product-backlog.mjs adopt --all [--file <path>]

add adds one already identified entry to "## ${queueHeading}" at the requested
relative position. Identities are supplied, never allocated there.

take moves one identified entry to the end of "## ${takenHeading}", keeping its
identity and adding the selected plan link; an entry already there is resumed in
place. The plan decision is always stated: --plan names the active plan, and
--no-plan takes a quick story, or a correction whose canonical home is already
its plan. Taking work does not decide or grant execution authority.

complete removes one identified entry from whichever active list holds it,
applying a completion the caller has already decided. It never decides whether
work is complete, and it never deletes a story or plan file: closing those
canonical homes stays with the caller's wrap-up. Removal happens only on this
explicit request naming the identity.

adopt records one identity for every active entry in the canonical homes its
links name, reusing the ID each home already carries. It changes no membership,
order, or direction, and never runs implicitly: --all is required.

Paths are resolved against the current directory; --file defaults to
${defaultBacklogPath}.`;

const options = {
  identity: { type: "string" },
  title: { type: "string" },
  link: { type: "string" },
  after: { type: "string" },
  before: { type: "string" },
  position: { type: "string" },
  plan: { type: "string" },
  "no-plan": { type: "boolean", default: false },
  all: { type: "boolean", default: false },
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

async function add(file, values) {
  const request = {
    identity: values.identity,
    title: values.title,
    href: values.link,
    ...readPlacement(values),
  };
  await applyToBacklog(file, (source) => addQueueEntry(source, request));
  console.log(
    `Added "${request.identity}" to "## ${queueHeading}" in ${values.file}.`,
  );
}

// Applies one change whose report needs more than the published bytes. The
// operation returns the backlog to publish alongside what it did; only the
// bytes reach the write boundary, and the outcome comes back here so that the
// report is written from a change already on disk.
async function applyReportedChange(file, operate) {
  let outcome;
  await applyToBacklog(file, (source) => {
    outcome = operate(source);
    return outcome.source;
  });
  return outcome;
}

// The caller always states whether the work has an active plan, so a planned
// story can never be taken without its link by leaving an option out.
function readPlan(values) {
  if ((values.plan !== undefined) === values["no-plan"]) {
    throw new BacklogError(
      `Supply exactly one of --plan <path> or --no-plan, so that taking work ` +
        `always states whether it has an active plan.`,
    );
  }
  return values.plan;
}

function reportTake(outcome, file) {
  const { identity } = outcome.entry;
  if (outcome.result === "taken") {
    return `Took "${identity}" into "## ${takenHeading}" in ${file}.`;
  }
  const ending =
    outcome.result === "linked"
      ? "; its plan link was added and its place kept."
      : ", unchanged.";
  return `"${identity}" is already in "## ${takenHeading}" in ${file}${ending}`;
}

async function take(file, values) {
  const request = {
    identity: values.identity,
    plan: readPlan(values),
    backlogDirectory: dirname(file),
  };
  const outcome = await applyReportedChange(file, (source) =>
    takeEntry(source, request),
  );

  console.log(reportTake(outcome, values.file));
}

async function complete(file, values) {
  const outcome = await applyReportedChange(file, (source) =>
    completeEntry(source, { identity: values.identity }),
  );

  const { identity, list, href } = outcome.entry;
  console.log(
    `Removed "${identity}" from "## ${list}" in ${values.file}. ` +
      `Its canonical home ${href} was not changed.`,
  );
}

function reportAdopt(outcome, file) {
  if (outcome.written.length === 0) {
    return (
      `All ${outcome.entries} active entries already record their identity; ` +
      `${file} is unchanged.`
    );
  }
  const report = [
    `Recorded ${outcome.written.length} identities for ${outcome.entries} active entries:`,
    ...outcome.written.map((home) => `  ${home.identity} in ${home.relative}`),
  ];
  if (outcome.relabelled.length > 0) {
    report.push(
      `Entries now naming their identity in ${file}:`,
      ...outcome.relabelled.map(
        (entry) => `  ${entry.identity} — ${entry.title}`,
      ),
    );
  }
  return report.join("\n");
}

async function adopt(file, values) {
  if (!values.all) {
    throw new BacklogError(
      `adopt needs --all, so that recording identities for every active ` +
        `entry is always an explicit request.\n\n${usage}`,
    );
  }
  const outcome = await applyReportedChange(file, (source) =>
    adoptIdentities(source, dirname(file)),
  );

  console.log(reportAdopt(outcome, values.file));
}

const operations = { add, take, complete, adopt };

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
  const named = positionals.length === 1 ? positionals[0] : "";
  if (!Object.hasOwn(operations, named)) {
    throw new BacklogError(
      `Unknown operation: ${positionals.join(" ") || "(none)"}\n\n${usage}`,
    );
  }
  await operations[named](resolve(process.cwd(), values.file), values);
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
