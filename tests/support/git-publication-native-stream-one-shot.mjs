// The stream fields of the one-shot publication journeys, read from a host
// stream by the shared reader for git-publication-native-stream-fields.mjs:
// how the installed start ran (its tracking, workspace, landing and push
// authority flags), the preparation ownership recheck, the receipt that
// marks escalation, and the CI coverage delivery and CI observation reported
// for each landed revision.
import {
  preparationStartPattern,
  startCommands,
  withFlag,
} from "./git-publication-native-stream-starts.mjs";

const restoredCarry = /\\?"carried\\?": ?\{\\?"restored\\?": ?true/;

const flag = (value) => (value ? "true" : "false");

export function oneShotFields(read) {
  return [
    [
      "one-shot-start-observed",
      flag(withFlag(startCommands(read), "--one-shot").length > 0),
    ],
  ];
}

// Delivery and CI observation commands, whose own outputs report CI coverage.
const ciCommand =
  /execution-increment-(delivery|resume)\.mjs|ci-mailbox(-cli)?\.mjs/;
const quote = '\\\\?"';
const sha = "([0-9a-f]{40})";
// A delivery receipt: the accepted SHA, then the coverage its observation
// reports, on one output line.
const deliveryReceipt = new RegExp(
  `${quote}receipt${quote}: ?\\{${quote}sha${quote}: ?${quote}${sha}${quote}.*?${quote}observation${quote}: ?\\{${quote}state${quote}: ?${quote}([a-z-]+)`,
  "g",
);
// An observer's revision entry: registered, discovered or completed coverage.
const observedRevision = new RegExp(
  `${quote}revision${quote}: ?\\{${quote}sha${quote}: ?${quote}${sha}${quote}`,
  "g",
);

// The SHAs CI observation covered (a delivery receipt attached to or reusing
// an observer, or an observer's revision entry) and those whose delivery
// receipt reported coverage unobserved, each comma-separated.
function ciCoverageFields(read) {
  const observed = new Set();
  const unobserved = new Set();
  for (const call of read.calls) {
    if (!ciCommand.test(call.command)) {
      continue;
    }
    const output = call.output ?? "";
    for (const [, accepted, state] of output.matchAll(deliveryReceipt)) {
      (state === "unobserved" ? unobserved : observed).add(accepted);
    }
    for (const [, revision] of output.matchAll(observedRevision)) {
      observed.add(revision);
    }
  }
  return [
    ["ci-observed-shas", [...observed].sort().join(",")],
    ["ci-unobserved-shas", [...unobserved].sort().join(",")],
  ];
}

// The one-shot fields plus CI coverage, for journeys that land their result.
function oneShotLandingFields(read) {
  return [...oneShotFields(read), ...ciCoverageFields(read)];
}

// Whether a one-shot start claimed trunk publication authority.
function oneShotReviewFields(read) {
  const oneShotStarts = withFlag(startCommands(read), "--one-shot");
  return [
    ...oneShotFields(read),
    [
      "one-shot-push-authorized",
      flag(withFlag(oneShotStarts, "--push-authorized").length > 0),
    ],
  ];
}

// The review fields, plus whether a one-shot start selected the default
// checkout or automatic landing.
function oneShotPolicyFields(read) {
  const oneShotStarts = withFlag(startCommands(read), "--one-shot");
  return [
    ...oneShotReviewFields(read),
    [
      "one-shot-default-main",
      flag(withFlag(oneShotStarts, "--default-main").length > 0),
    ],
    [
      "one-shot-auto-land",
      flag(withFlag(oneShotStarts, "--auto-land").length > 0),
    ],
  ];
}

// The policy fields plus CI coverage, for automatic landing.
function oneShotAutoLandFields(read) {
  return [...oneShotPolicyFields(read), ...ciCoverageFields(read)];
}

// How many execution starts ran in a session handed an established start.
function oneShotEstablishedFields(read) {
  return [["startup-cli-count", startCommands(read).length]];
}

function oneShotRefinementFields(read) {
  const starts = startCommands(read, preparationStartPattern);
  return [
    [
      "one-shot-preparation-start-observed",
      flag(withFlag(starts, "--one-shot").length > 0),
    ],
  ];
}

const recheck = /preparation-assignment\.mjs["']?\s+["']?recheck["']?(\s|$)/;

// The refinement fields, plus whether its one-shot start selected automatic
// landing with push authority and whether any command ran, or handed Dough
// Land, the preparation ownership recheck.
function oneShotRefinementAutoLandFields(read) {
  const starts = withFlag(
    startCommands(read, preparationStartPattern),
    "--one-shot",
  );
  return [
    ...oneShotRefinementFields(read),
    [
      "one-shot-preparation-auto-land",
      flag(
        withFlag(withFlag(starts, "--auto-land"), "--push-authorized").length >
          0,
      ),
    ],
    [
      "ownership-recheck-observed",
      flag(read.segments.some((segment) => recheck.test(segment))),
    ],
  ];
}

function oneShotEscalationFields(read) {
  const admissions = withFlag(startCommands(read), "--admit");
  return [
    ...oneShotFields(read),
    [
      "carry-admission-observed",
      flag(withFlag(admissions, "--carry").length > 0),
    ],
    [
      "edits-carried",
      flag(read.outputs.some((output) => restoredCarry.test(output))),
    ],
  ];
}

// The one-shot journeys whose fields differ from oneShotFields.
export const oneShotJourneys = {
  "one-shot-result": oneShotLandingFields,
  "one-shot-queued": oneShotLandingFields,
  "one-shot-auto-land": oneShotAutoLandFields,
  "one-shot-escalation": oneShotEscalationFields,
  "one-shot-review": oneShotReviewFields,
  "one-shot-refinement": oneShotRefinementFields,
  "one-shot-refinement-auto-land": oneShotRefinementAutoLandFields,
  "one-shot-default-main": oneShotPolicyFields,
  "one-shot-auto-land-blocked": oneShotPolicyFields,
  "one-shot-established": oneShotEstablishedFields,
};
