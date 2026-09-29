#!/usr/bin/env node
// Story wrap-up's Trunk Mode closure after the before-cleanup commit was
// accepted: confirm the target holds that commit, publish the committed final
// closure through managed delivery on the recovered or armed observer, run
// completion once for the accepted SHA, attempt the optional default-checkout
// refresh, and only after a receipt with confirmed shutdown retire the worktree
// and branch through Dough Land's retirement core. Any stop preserves the
// worktree, branch, and both closure commits and names the unfinished step.
import { realpathSync } from "node:fs";
import { resolve } from "node:path";
import { completeRevision } from "../../dough-execute-plan/scripts/ci-mailbox-complete.mjs";
import { isDirectCliEntry } from "../../dough-execute-plan/scripts/ci-direct-entry.mjs";
import { deliverManagedExecutionIncrement } from "../../dough-execute-plan/scripts/execution-increment-delivery.mjs";
import { refreshDefaultCheckout } from "../../dough-execute-plan/scripts/maintain-default-checkout.mjs";
import {
  git,
  originTrackingRef,
  resolveManagementContext,
  targetBranchName,
} from "../../dough-execute-plan/scripts/publication-git.mjs";
import {
  isAncestor,
  retireWorktree,
} from "../../dough-land/scripts/worktree-retirement.mjs";

const recoveries = {
  "before-cleanup":
    "publish the before-cleanup commit through deliver until it is accepted, then rerun finish",
  conflict:
    "resolve the rebase stopped in the worktree under Resolve a publication rebase conflict, then rerun finish with the rebased tip as --final and the fetched target tip it extends as --previously-published-base",
  "candidate-mismatch":
    "the branch tip is not --final; commit the final closure or name the branch tip as --final, then rerun finish",
  observation:
    "report the lost coverage; the worktree and branch stay until a completion receipt confirms shutdown",
  completion:
    "report the completion receipt; the worktree and branch stay for diagnosis or a later completion",
};

function stop(step, detail) {
  return {
    ok: false,
    step,
    cleanup: "not-performed",
    recovery: recoveries[step] ?? null,
    ...detail,
  };
}

// A receipt permits retirement only when it is not a CI failure and its
// observer shutdown is confirmed; failure and retained observation keep all.
function receiptPermitsRetirement(completion) {
  return (
    completion?.verdict !== "failure" &&
    completion?.shutdown?.status === "confirmed"
  );
}

export async function finishTrunkClosure({
  workspace,
  branch,
  beforeCleanup,
  final,
  previouslyPublishedBase,
  targetRef,
  repo,
  host,
  remote = "origin",
  identity,
  createdForWork = false,
  session,
  preferredAlias,
  defaultCheckout,
  env = process.env,
}) {
  // Recorded while the worktree exists, so a rerun can retire from it.
  const repository = await resolveManagementContext(undefined, workspace);
  const where = { repository, beforeCleanup, final };
  await git(workspace, "fetch", remote);
  const tracking = originTrackingRef(targetRef, remote);
  if (!(await isAncestor(workspace, beforeCleanup, tracking))) {
    return stop("before-cleanup", {
      ...where,
      publication: "not-attempted",
      reason: `${tracking} does not contain the before-cleanup commit`,
    });
  }
  const delivered = await deliverManagedExecutionIncrement({
    workspace,
    branch,
    previouslyPublishedBase,
    targetRef,
    repo,
    host,
    remote,
    session,
    preferredAlias,
    env,
    validatedCandidate: final,
  });
  const observation = delivered.observation;
  const startReceipt = delivered.startReceipt ?? null;
  if (!delivered.ok) {
    return stop(delivered.status === "conflict" ? "conflict" : "publish", {
      ...where,
      publication: delivered.publication,
      status: delivered.status,
      candidate: delivered.candidate ?? null,
      remoteTip: delivered.remoteTip ?? null,
      error: delivered.error,
      recovery:
        recoveries[delivered.status] ??
        `publication stopped with ${delivered.status}; recover it under Resume an interrupted publication, then rerun finish`,
      observation,
      startReceipt,
    });
  }
  const acceptedSha = delivered.receipt.sha;
  const accepted = {
    ...where,
    publication: "accepted",
    acceptedSha,
    target: delivered.receipt.target,
    observation,
    startReceipt,
  };
  let completion = null;
  if (observation?.directory && observation.state !== "unobserved") {
    try {
      completion = await completeRevision(observation.directory, acceptedSha, {
        root: realpathSync(workspace),
      });
    } catch (error) {
      completion = { error: String(error.message ?? error).slice(0, 600) };
    }
  }
  const refresh = await refreshDefaultCheckout({
    checkout: defaultCheckout,
    remote,
    integrationBranch: targetBranchName(targetRef),
  });
  if (!completion) {
    return stop("observation", { ...accepted, completion, refresh });
  }
  if (!receiptPermitsRetirement(completion)) {
    return stop("completion", { ...accepted, completion, refresh });
  }
  const cleanup = await retireWorktree({
    repository,
    worktree: workspace,
    branch,
    remote,
    targetRef,
    identity,
    createdForWork,
    contained: [beforeCleanup, acceptedSha],
  });
  return {
    ok: cleanup.removed === true,
    step: cleanup.removed === true ? "done" : "retire",
    ...accepted,
    completion,
    refresh,
    cleanup,
  };
}

const required = [
  "workspace",
  "branch",
  "beforeCleanup",
  "final",
  "previouslyPublishedBase",
  "targetRef",
  "repo",
  "host",
];
const usage =
  "usage: trunk-closure.mjs finish --workspace PATH --branch NAME --before-cleanup SHA --final SHA --previously-published-base SHA --target-ref REF --repo OWNER/REPO --host cursor|claude|codex [--remote NAME] [--identity WORK] [--created-for-work] [--session-json JSON] [--preferred-alias .agents|.claude] [--default-checkout PATH]";

function argumentsOf(argv) {
  if (argv[0] !== "finish") {
    throw new Error(usage);
  }
  const result = {};
  for (let index = 1; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === "--created-for-work") {
      result.createdForWork = true;
      continue;
    }
    if (!flag.startsWith("--") || index + 1 >= argv.length) {
      throw new Error(`invalid argument ${flag}\n${usage}`);
    }
    const key = flag
      .slice(2)
      .replace(/-[a-z]/g, (match) => match[1].toUpperCase());
    result[key] = argv[++index];
  }
  for (const field of required) {
    if (!result[field]) {
      throw new Error(`missing ${field}\n${usage}`);
    }
  }
  targetBranchName(result.targetRef);
  if (result.sessionJson) {
    result.session = JSON.parse(result.sessionJson);
    delete result.sessionJson;
  }
  return result;
}

if (isDirectCliEntry(import.meta.url, process.argv[1])) {
  let args;
  try {
    args = argumentsOf(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 2;
  }
  if (args) {
    let result;
    try {
      result = await finishTrunkClosure({
        ...args,
        workspace: resolve(args.workspace),
        defaultCheckout: args.defaultCheckout
          ? resolve(args.defaultCheckout)
          : undefined,
      });
    } catch (error) {
      // A failed Git step stops closure; nothing after it ran.
      result = stop("git", { reason: "git error", error: error.message });
    }
    if (result.startReceipt) process.stdout.write(result.startReceipt);
    process.stdout.write(`${JSON.stringify(result)}\n`);
    if (!result.ok) process.exitCode = 1;
  }
}
