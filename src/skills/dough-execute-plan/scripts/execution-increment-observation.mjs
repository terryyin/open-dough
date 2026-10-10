// Establish or reuse the publishing coordinator's CI observation for managed
// delivery: its owner, the live observer that owner claimed, host-bridge
// readiness, start, and coordinator binding. A Cursor or Claude Code
// coordinator's owner is resolved before any observer is considered, so a
// sibling's observer of the same repository and target is never reused.
// Codex is observed only by the yielded stream its coordinator armed at
// execution start. Resume recovers only an unambiguous live owner; it never
// starts a replacement.
import {
  bindHostObserver,
  hostSessionOwner,
  resolveHostSession,
  verifyHostBridge,
} from "./ci-host-bridge.mjs";
import { receiptPrefix, startExecutionMailbox } from "./ci-mailbox.mjs";
import {
  classifyMatchingObservationOwnership,
  classifyOwnedObservation,
  findLiveMatchingMailbox,
} from "./ci-mailbox-match.mjs";

function coverageGap(reason, extras = {}) {
  return {
    state: "unobserved",
    pendingCi: "unobserved",
    reason,
    ...extras,
  };
}

function observationAttached(directory, { reused = false } = {}) {
  return {
    state: reused ? "reused" : "attached",
    directory,
    reused,
  };
}

// Resume-only recovery: attach when exactly one live match exists. Ended,
// lost, ambiguous, or missing owners become actionable coverage gaps.
export function recoverObservationForResume({
  repo,
  branch,
  root,
  storage,
} = {}) {
  const ownership = classifyMatchingObservationOwnership({
    repo,
    branch,
    root,
    storage,
  });
  if (ownership.kind === "live") {
    return {
      observation: {
        state: "recovered",
        directory: ownership.directory,
        reused: true,
      },
      ownership,
    };
  }
  return {
    observation: coverageGap(ownership.reason, {
      directory: ownership.directory,
      ownership: ownership.kind,
    }),
    ownership,
  };
}

// Managed delivery never starts a Codex observer: the coordinator's own
// yielded stream is the one it reuses.
function codexStreamMissingReason({ repo, branch }) {
  return `no live Codex yielded stream observes ${repo} ${branch}; arm \`ci-mailbox.mjs stream --execution ${repo} ${branch}\` in a yielded cell as references/ci-notify-codex.md describes, and later deliveries reuse it`;
}

// One coordinator holding several live observers of a target cannot say which
// one a registration belongs on; none is chosen for it.
function ambiguousOwnerReason({ repo, branch }, directories) {
  return `this coordinator owns ${directories.length} live observers of ${repo} ${branch} (${directories.join(", ")}); keep the one whose directory it retained, stop the others with \`ci-mailbox.mjs stop <directory>\`, and the next deliver reuses it`;
}

export async function establishObservation({
  repo,
  branch,
  host,
  session,
  workspace,
  runtime,
  maxDurationMs,
  env,
  root,
  storage,
}) {
  // A Codex stream is found by repository and target; it carries no host
  // session claim.
  if (host === "codex") {
    const stream = findLiveMatchingMailbox({ repo, branch, root, storage });
    return {
      observation: stream
        ? observationAttached(stream, { reused: true })
        : coverageGap(codexStreamMissingReason({ repo, branch })),
      startReceipt: null,
    };
  }

  // One resolved owner for selection, readiness, and binding.
  const hostSession = resolveHostSession({ host, session, env });
  const owner = hostSessionOwner({ host, session: hostSession, root });
  const owned = classifyOwnedObservation({
    repo,
    branch,
    owner,
    root,
    storage,
  });
  if (owned.kind === "live") {
    return {
      observation: observationAttached(owned.directory, { reused: true }),
      startReceipt: null,
    };
  }
  if (owned.kind === "ambiguous") {
    return {
      observation: coverageGap(
        ambiguousOwnerReason({ repo, branch }, owned.directories),
        { ownership: owned.kind, directories: owned.directories },
      ),
      startReceipt: null,
    };
  }

  const bridge = await verifyHostBridge({
    host,
    session: hostSession,
    workspace,
    hookPath: runtime.hookEntrypoint,
    env,
    root,
    storage,
  });
  if (!bridge.ready) {
    return {
      observation: coverageGap(
        bridge.reason ?? "host bridge unavailable",
        owner ? {} : { ownership: "unidentified" },
      ),
      startReceipt: null,
    };
  }

  const directory = await startExecutionMailbox(
    {
      mode: "execution",
      repo,
      branch,
      maxDurationMs,
    },
    { root, storage, env },
  );
  const startReceipt = `${receiptPrefix}${JSON.stringify({ directory })}\n`;
  const binding = await bindHostObserver({
    host,
    session: hostSession,
    receipt: startReceipt,
    workspace,
    hookPath: runtime.hookEntrypoint,
    env,
  });
  if (!binding.attached) {
    return {
      observation: coverageGap(
        binding.context || "host bridge did not attach the observer",
      ),
      directory,
      startReceipt,
    };
  }
  return {
    observation: observationAttached(directory),
    startReceipt,
  };
}
