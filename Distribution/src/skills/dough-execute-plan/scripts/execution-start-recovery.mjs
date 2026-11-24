import { realpath } from "node:fs/promises";
import { posix } from "node:path";
import { agentProfileDirectory } from "../../dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { ongoingOperation } from "./maintain-default-checkout.mjs";
import {
  git,
  lsRemoteSha,
  managementContext,
  revParse,
} from "./publication-git.mjs";
import { mainWorktreeError } from "./workspace-publication-select.mjs";
import {
  backlogPath,
  claimProvenance,
  isAncestor,
  remoteOf,
  remoteRef,
  stopped,
  trailers,
} from "./workspace-publication-ownership.mjs";

export function recovery(request, selected, candidateSha) {
  return {
    workspace: selected.workspace,
    branch: selected.branch,
    startingRevision: selected.startingRevision,
    candidateSha,
    identity: request.identity,
    publisherId: request.publisherId,
  };
}

export function sameSelectedSource(a, b) {
  return (
    a.selectedSource === b.selectedSource &&
    a.planSource === b.planSource &&
    a.planTarget === b.planTarget
  );
}

export async function retainedCandidate(request, selected) {
  const sha = request.retained.candidateSha;
  if (!sha)
    return stopped("invalid-request", {
      error: "retained candidate SHA is required",
    });
  const message = (
    await git(selected.workspace, "log", "-1", "--format=%B", sha)
  ).stdout;
  const claim = trailers(message);
  const head = await revParse(selected.workspace, "HEAD");
  if (
    claim.identity !== request.identity ||
    claim.publisher !== request.publisherId ||
    sha !== head ||
    (
      await git(
        selected.workspace,
        "status",
        "--porcelain",
        "--untracked-files=all",
      )
    ).stdout !== ""
  ) {
    return stopped("setup-failed", {
      recovery: recovery(request, selected, sha),
      error: "retained candidate or workspace is not the isolated owned claim",
    });
  }
  return { ok: true, candidateSha: sha };
}

// A caller may draft again only after this exact losing local Take has a
// recoverable ref and its original checkout can continue from trunk.
export async function stoppedClaim(request, checked) {
  const { ownership, provenance } = checked;
  const recoveryFacts = {
    ...recovery(request, request, request.retained?.candidateSha),
    provenance,
  };
  const conflict = stopped("conflict", {
    ownership,
    workspace: request.workspace,
    branch: request.branch,
    provenance,
    recovery: recoveryFacts,
  });
  if (
    !request.retryAdmission ||
    ownership !== "other" ||
    checked.candidateIsAncestor ||
    provenance?.identity !== request.identity ||
    !provenance.sha
  )
    return conflict;
  try {
    return (await retireLosingCandidate(request, recoveryFacts)) ?? conflict;
  } catch (error) {
    return {
      ...conflict,
      recovery: { ...recoveryFacts, error: error.stderr || error.message },
    };
  }
}

async function retireLosingCandidate(request, recoveryFacts) {
  const { workspace, branch, startingRevision, candidateSha } = recoveryFacts;
  if (
    branch === request.target ||
    (await mainWorktreeError(workspace)) ||
    (await realpath(await revParse(workspace, "--show-toplevel"))) !==
      (await realpath(workspace)) ||
    (await realpath(await managementContext(workspace))) !==
      (await realpath(await managementContext(request.repository))) ||
    (
      await git(workspace, "remote", "get-url", remoteOf(request))
    ).stdout.trim() !== request.origin
  )
    return undefined;

  const ref = remoteRef(request);
  const tip = await revParse(workspace, ref);
  const winner = await claimProvenance(workspace, tip, request.identity);
  const [commit, parent, ...extraParents] = (
    await git(workspace, "rev-list", "--parents", "-1", candidateSha)
  ).stdout
    .trim()
    .split(" ");
  if (
    winner?.sha !== recoveryFacts.provenance.sha ||
    winner.publisher !== recoveryFacts.provenance.publisher ||
    winner.identity !== request.identity ||
    commit !== candidateSha ||
    !parent ||
    extraParents.length > 0 ||
    !(await isAncestor(workspace, startingRevision, parent)) ||
    !(await isAncestor(workspace, parent, winner.sha)) ||
    (await isAncestor(workspace, candidateSha, tip)) ||
    !(await changesOnlyAdmission(request, parent, candidateSha)) ||
    tip !==
      (await lsRemoteSha(request.origin, `refs/heads/${request.target}`)) ||
    (await git(workspace, "branch", "--show-current")).stdout.trim() !==
      branch ||
    (await ongoingOperation(workspace))
  )
    return undefined;

  const preserved = `refs/worktree/dough/rejected-admission/${candidateSha}`;
  const prior = await git(
    workspace,
    "rev-parse",
    "--verify",
    "--quiet",
    preserved,
  ).then(
    ({ stdout }) => stdout.trim(),
    (error) => {
      if (error.code === 1) return "";
      throw error;
    },
  );
  if (prior && prior !== candidateSha) return undefined;
  const alreadyRetired =
    prior === candidateSha &&
    (await revParse(workspace, "HEAD")) === parent &&
    (await git(workspace, "status", "--porcelain", "--untracked-files=all"))
      .stdout === "";
  if (!alreadyRetired) {
    if (!(await retainedCandidate(request, request)).ok) return undefined;
    await git(
      workspace,
      "update-ref",
      preserved,
      candidateSha,
      prior || "0".repeat(candidateSha.length),
    );
    await git(workspace, "reset", "--keep", parent);
  }
  return stopped("retry-admission", {
    recovery: { ...recoveryFacts, preserved },
  });
}

async function changesOnlyAdmission({ workspace, link }, base, candidate) {
  const directory = posix.dirname(backlogPath);
  const seed = posix.join(directory, link.split("#")[0]);
  const { stdout } = await git(
    workspace,
    "diff",
    "--no-renames",
    "--name-only",
    "-z",
    base,
    candidate,
    "--",
  );
  const paths = stdout.split("\0").filter(Boolean);
  const other = paths.filter((file) => file !== backlogPath && file !== seed);
  return (
    paths.includes(backlogPath) &&
    paths.includes(seed) &&
    other.length <= 1 &&
    other.every(
      (file) =>
        posix.dirname(file) === posix.join(directory, agentProfileDirectory),
    )
  );
}
