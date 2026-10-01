// The observation fields each publication journey derives from its native
// host stream, read through the shared reader (native-host-stream.mjs) from
// the stream and host alone. Fixture state stays with the shell observers,
// which compare these facts with what the fixture expects. Shell callers use
// the CLI, which prints `key: value` lines:
//
//   node tests/support/git-publication-native-stream-fields.mjs \
//     <journey> <host> <stream> [<command-log>]
//
// A <command-log> (the harness's recorded node calls, one per line) adds its
// lines to the commands the preparation-land fields match.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { hosts, readHostStream } from "./native-host-stream.mjs";
import {
  startCommands,
  startPattern,
  withFlag,
} from "./git-publication-native-stream-starts.mjs";
import {
  oneShotFields,
  oneShotJourneys,
} from "./git-publication-native-stream-one-shot.mjs";

const conflictReceipt = /^\{"ok":false,"status":"conflict"/m;
const existingReceipt = /\\?"status\\?": ?\\?"existing/;
const retirement = /worktree-retirement\.mjs +retire( |$)/;
const rawGitRetirement =
  /^([A-Za-z_][A-Za-z0-9_]*=[^ ]* +)*git( +-[Cc] +[^ ]+)* +worktree +remove( |$)/;
const storyBranchPushSource = /([^\s:'"+]+):refs\/heads\/exec\/story/g;
const pushWord = /(^|\s)push(?=\s|$)/g;
const forceFlag = /(^|\s)(--force|-f)([=\s]|$)/;

const flag = (value) => (value ? "true" : "false");

function startupFields(read) {
  return [
    ["startup-cli-count", startCommands(read).length],
    [
      "startup-conflict-observed",
      flag(
        read.calls.some(
          (call) =>
            startPattern.test(call.command) &&
            conflictReceipt.test(call.output ?? ""),
        ),
      ),
    ],
  ];
}

function admissionFields(read) {
  const starts = startCommands(read);
  return [
    ["startup-cli-count", starts.length],
    ["admit-cli-observed", flag(withFlag(starts, "--admit").length > 0)],
    [
      "plain-start-observed",
      flag(starts.some((command) => !command.includes("--admit"))),
    ],
    [
      "existing-receipt-observed",
      flag(read.outputs.some((output) => existingReceipt.test(output))),
    ],
  ];
}

function startupOwnedContextFields(read) {
  const starts = startCommands(read);
  return [
    ["startup-cli-count", starts.length],
    ["integration-flag-count", withFlag(starts, "--integration").length],
    ["repository-flag-count", withFlag(starts, "--repository").length],
  ];
}

// Retirement commands name the identity they retire; quotes are dropped, as
// either the shell or the node call log may keep them.
function preparationLandFields(read, commandLog) {
  const commands = [...commandLog, ...read.segments].map((command) =>
    command.replace(/["']/g, ""),
  );
  const retired = commands
    .filter((command) => retirement.test(command))
    .map((command) => /.* --identity +([^ ]+)/.exec(command)?.[1])
    .filter((identity) => identity !== undefined);
  return [
    ["retired-identities", retired.join(",")],
    [
      "raw-git-retirement",
      flag(commands.some((command) => rawGitRetirement.test(command))),
    ],
  ];
}

// Whether any command retires a worktree, through the installed retirement
// command or raw Git.
function landDefaultCheckoutFields(read, commandLog) {
  const commands = [...commandLog, ...read.segments].map((command) =>
    command.replace(/["']/g, ""),
  );
  return [
    [
      "retirement-command-observed",
      flag(
        commands.some(
          (command) =>
            retirement.test(command) || rawGitRetirement.test(command),
        ),
      ),
    ],
  ];
}

// Pushes of exec/story: every revision pushed to it, and how many push
// commands, forced or not, name it.
function storyBranchIncrementFields(read) {
  const targeted = read.segments.filter((segment) =>
    segment.includes("exec/story"),
  );
  const pushes = targeted.filter((segment) => segment.match(pushWord));
  return [
    [
      "story-branch-push-sources",
      targeted
        .flatMap((segment) =>
          [...segment.matchAll(storyBranchPushSource)].map((match) => match[1]),
        )
        .join(","),
    ],
    [
      "target-push-count",
      pushes.reduce(
        (count, segment) => count + segment.match(pushWord).length,
        0,
      ),
    ],
    [
      "forced-target-push-count",
      pushes.filter((segment) => forceFlag.test(segment)).length,
    ],
  ];
}

const exactJourneys = {
  "startup-owned-context": startupOwnedContextFields,
  "preparation-land": preparationLandFields,
  "land-default-checkout": landDefaultCheckoutFields,
  "story-branch-increment": storyBranchIncrementFields,
  ...oneShotJourneys,
};

const journeyPrefixes = [
  ["startup-", startupFields],
  ["admission-", admissionFields],
  ["one-shot-", oneShotFields],
];

function fieldsFor(journey) {
  return (
    exactJourneys[journey] ??
    journeyPrefixes.find(([prefix]) => journey.startsWith(prefix))?.[1]
  );
}

// Whether `journey` derives any fields from its stream.
export const hasStreamFields = (journey) => fieldsFor(journey) !== undefined;

// The stream-derived fields of `journey` as [key, value] pairs, from `host`'s
// stream at `stream`, plus `commandLog` lines where the journey matches them.
export function publicationStreamFields(
  journey,
  host,
  stream,
  commandLog = [],
) {
  const fields = fieldsFor(journey);
  if (!fields) {
    throw new Error(`no stream fields for publication journey: ${journey}`);
  }
  return fields(readHostStream(host, stream), commandLog);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [journey, host, stream, log] = process.argv.slice(2);
  if (!journey || !fieldsFor(journey) || !hosts.includes(host) || !stream) {
    process.stderr.write(
      `usage: git-publication-native-stream-fields.mjs <journey> <${hosts.join("|")}> <stream> [<command-log>]\n`,
    );
    process.exit(2);
  }
  let commandLog = [];
  if (log) {
    try {
      commandLog = readFileSync(log, "utf8").split("\n");
    } catch {
      commandLog = [];
    }
  }
  const fields = publicationStreamFields(journey, host, stream, commandLog);
  process.stdout.write(
    fields.map(([key, value]) => `${key}: ${value}\n`).join(""),
  );
}
