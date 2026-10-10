// The execution's own CI observers for Trunk Mode `finish`. Closure consumes
// the owner evidence delivery and resume do: a Cursor or Claude Code
// coordinator's session, or a Codex coordinator's retained stream. That owner
// filters the observers before coverage or liveness is read, so closure never
// registers on, completes, or stops another coordinator's observer. The owner
// is computed from the execution checkout as delivery computes it. Once that
// worktree was retired, the repository's common Git directory, the identity
// its worktrees shared, names the same owner from the recorded management
// context, and reaches that owner's observer whichever worktree armed it.
import { existsSync, realpathSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import {
  eventRecipient,
  hostSessionOwner,
  missingIdentityReason,
  resolveHostSession,
} from "../../dough-execute-plan/scripts/ci-host-bridge.mjs";
import {
  classifyOwnedObservation,
  isLiveMatchingMailbox,
  listOwnedMailboxes,
} from "../../dough-execute-plan/scripts/ci-mailbox-match.mjs";
import { listRegisteredRevisions } from "../../dough-execute-plan/scripts/ci-mailbox-revision-coverage.mjs";
import {
  coverageGap,
  retainedStream,
} from "../../dough-execute-plan/scripts/execution-increment-observation.mjs";
import { ownerGapReason } from "../../dough-execute-plan/scripts/execution-increment-observation-gaps.mjs";
import { managementContext } from "../../dough-execute-plan/scripts/publication-git.mjs";

// Why none of a host coordinator's observers carries the final closure, by
// their classification. Several `candidates` that are not its several live
// observers each registered the final closure and are no longer live.
function hostGap({ target, host, owner, candidates }) {
  const owned = classifyOwnedObservation({ ...target, owner });
  if (candidates.length > 1 && owned.kind !== "ambiguous") {
    return coverageGap(
      `this coordinator owns ${candidates.length} observers of ${target.repo} ${target.branch} that could carry the final closure (${candidates.join(", ")}); none is chosen for it`,
      { ownership: "ambiguous", directories: candidates },
    );
  }
  return coverageGap(ownerGapReason("finish", { ...target, host, owned }), {
    ownership: owned.kind,
    directories: owned.directories ?? (owned.directory && [owned.directory]),
  });
}

// `directories` are the owner's observers in any state. `select` returns the
// one that covers `sha`, preferring a live one; else the owner's one live
// observer, which has yet to register it; otherwise the coverage `gap`.
// `notifies` is the host session that receives a selected observer's events.
function ownedObservers(directories, target, gap, notifies) {
  return {
    directories,
    select(sha) {
      const live = directories.filter((directory) =>
        isLiveMatchingMailbox(directory, target),
      );
      const covering = directories.filter((directory) =>
        listRegisteredRevisions(directory).includes(sha.toLowerCase()),
      );
      const candidates =
        [
          covering.filter((directory) => live.includes(directory)),
          covering,
          covering.length ? [] : live,
        ].find((found) => found.length > 0) ?? [];
      return candidates.length === 1
        ? { directory: candidates[0], ...(notifies && { notifies }) }
        : { gap: gap(candidates) };
    },
  };
}

// Where closure reads its observers from and computes their owner. While the
// execution checkout exists, both are that checkout, as in delivery. Once it
// is gone, `repository`'s common Git directory stands for the identity it
// shared with the repository's other worktrees: observers are read through
// it and through the retired path, which is its own identity now and still
// the root of the observers started there.
export async function observerAccess(workspace, repository) {
  if (existsSync(workspace)) {
    const root = realpathSync(workspace);
    return { root, ownerRoot: root };
  }
  // The retired path's parent still resolves as it did for its observers.
  const retired = join(realpathSync(dirname(workspace)), basename(workspace));
  const ownerRoot = realpathSync(await managementContext(repository));
  return { root: [retired, ownerRoot], ownerRoot };
}

// The observers of `repo` and target `branch` this execution's owner evidence
// names, read through `root` and claimed for `ownerRoot` as `observerAccess`
// gives them.
export function closureObservers({
  repo,
  branch,
  host,
  session,
  coordinator,
  observerDirectory,
  env,
  root,
  ownerRoot,
  storage,
}) {
  const target = { repo, branch, root, storage };
  if (host === "codex") {
    const stream = retainedStream({
      ...target,
      ownerRoot,
      coordinator,
      observerDirectory,
      command: "finish",
    });
    // Only this coordinator's own stream carries a directory, in any state.
    return ownedObservers(
      stream.directory ? [stream.directory] : [],
      target,
      stream.gap,
    );
  }
  const owner = hostSessionOwner({
    host,
    session: resolveHostSession({ host, session, env }),
    root: ownerRoot,
  });
  if (!owner) {
    return ownedObservers([], target, () =>
      coverageGap(missingIdentityReason(host, "finish"), {
        ownership: "unidentified",
      }),
    );
  }
  return ownedObservers(
    listOwnedMailboxes({ ...target, owner }),
    target,
    (candidates) => hostGap({ target, host, owner, candidates }),
    eventRecipient({ host, session, env }),
  );
}
