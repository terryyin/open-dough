// The coverage gap a Cursor or Claude Code coordinator's own observers leave,
// in one vocabulary for `deliver`, `resume`, and `finish`: what each
// classification of those observers means, then the step the command names to
// recover observation. Only that coordinator's observers are named.
import { ownObserverRecovery } from "./ci-host-bridge.mjs";

// A host coordinator's observer is established only by its own `deliver`,
// which does so itself wherever `resume` and `finish` report these gaps.
const establishesOwn = {
  resume:
    "resume starts no observer: this coordinator's next `deliver` establishes its own, and rerunning this resume then registers the accepted revision on it",
  finish:
    "this coordinator's next `deliver` from the execution worktree establishes its own, and rerunning this finish then completes the final closure on it; once that worktree is gone, report the final closure's coverage as lost",
};
const establish = (command) => establishesOwn[command];

// Each kind `classifyOwnedObservation` returns: its reason, and its recovery
// step for a command.
const ownerGaps = {
  missing: {
    reason: ({ repo, branch, host, others }) =>
      `this coordinator holds no observer of ${repo} ${branch}${
        others > 0
          ? `, and the ${others} unclaimed or other coordinators' observer${others > 1 ? "s" : ""} of it ${others > 1 ? "are" : "is"} not adopted`
          : ""
      }; ${ownObserverRecovery(host)}`,
    recovery: establish,
  },
  ended: {
    reason: ({ owned: { directory, terminal } }) =>
      `this coordinator's observer at ${directory} ended (${terminal.status})`,
    recovery: establish,
  },
  lost: {
    reason: ({ owned: { directory, terminal } }) =>
      `this coordinator's observer at ${directory} lost its worker (${terminal.coverage?.reason ?? "no terminal result"})`,
    recovery: establish,
  },
  unavailable: {
    reason: ({ owned: { directories } }) =>
      `this coordinator's observer at ${directories.join(", ")} is not live`,
    recovery: establish,
  },
  // One coordinator holding several live observers of a target cannot say
  // which one a registration belongs on; none is chosen for it.
  ambiguous: {
    reason: ({ repo, branch, owned: { directories } }) =>
      `this coordinator owns ${directories.length} live observers of ${repo} ${branch} (${directories.join(", ")})`,
    recovery: (command) =>
      `keep the one whose directory it retained, stop the others with \`ci-mailbox.mjs stop <directory>\`, and the next ${command} reuses it`,
  },
  // Classified live only after its command had found no live observer.
  live: {
    reason: ({ owned: { directory }, command }) =>
      `this coordinator's observer at ${directory} went live while this ${command} ran`,
    recovery: (command) => `rerunning this ${command} registers on it`,
  },
};

// Why `command` leaves the target `repo` `branch` unobserved when `owned`
// classifies its `host` coordinator's observers. `others` counts the
// observers of that target the coordinator does not own.
export function ownerGapReason(
  command,
  { repo, branch, host, owned, others = 0 },
) {
  const { reason, recovery } = ownerGaps[owned.kind];
  return `${reason({ repo, branch, host, owned, others, command })}; ${recovery(command)}`;
}
