#!/usr/bin/env node
// One installed boundary for an authorized queued claim. Project command
// preparation and implementation remain with execution-location guidance.
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { git, lsRemoteSha, revParse } from "./publication-git.mjs";
import { refreshDefaultCheckout } from "./maintain-default-checkout.mjs";
import { readPublishedExecutionSource } from "./execution-source.mjs";
import {
  commitWorkspaceClaim,
  selectOwnedWorkspace,
} from "./workspace-publication-select.mjs";
import {
  claimMembership,
  publishClaimSha,
} from "./workspace-publication-push.mjs";
import {
  backlogPath,
  claimProvenance,
  isAncestor,
  remoteOf,
  stopped,
} from "./workspace-publication-ownership.mjs";

async function maintenance(request) {
  try {
    return await refreshDefaultCheckout({
      checkout: request.integration,
      declaredOwner: request.declaredOwner,
      requester: request.requester,
      remote: remoteOf(request),
      integrationBranch: request.target,
    });
  } catch (error) {
    return {
      result: "deferred",
      reason: "refresh-failed",
      error: error.stderr || error.message,
    };
  }
}

export async function startQueuedExecution(requestInput) {
  const required = [
    "integration",
    "workspace",
    "branch",
    "identity",
    "publisherId",
    "mode",
    "target",
  ];
  for (const field of required)
    if (!requestInput[field])
      return stopped("invalid-request", { error: `missing ${field}` });
  const request = {
    ...requestInput,
    integration: resolve(requestInput.integration),
    workspace: resolve(requestInput.workspace),
  };
  if (
    !["trunk", "story-branch"].includes(request.mode) ||
    request.pushAuthorized !== true ||
    request.workspaceAuthorized !== true
  ) {
    return stopped("authority-required", {
      error:
        "mode, workspace and trunk publication authority must be established",
    });
  }
  if (resolve(request.integration) === resolve(request.workspace))
    return stopped("invalid-request", {
      error: "queued work requires a separate owned workspace",
    });
  const remote = remoteOf(request);
  const ref = `${remote}/${request.target}`;
  let selectedSource, fetched, origin;
  try {
    origin = (
      await git(request.integration, "remote", "get-url", remote)
    ).stdout.trim();
    await git(request.integration, "fetch", remote);
    fetched = await revParse(request.integration, ref);
    selectedSource = await readPublishedExecutionSource(request, ref);
  } catch (error) {
    return stopped("source-refused", { error: error.stderr || error.message });
  }
  const beforeMaintenance = await maintenance(request);
  const selected = await selectOwnedWorkspace({ ...request, origin });
  if (!selected.ok) return { ...selected, fetched, beforeMaintenance };
  const claimRequest = {
    ...request,
    ...selected,
    origin,
    plan: selectedSource.planTarget,
    backlogPath,
  };
  let checked;
  try {
    checked = await claimMembership(claimRequest);
  } catch (error) {
    return stopped("unpublished", {
      workspace: selected.workspace,
      branch: selected.branch,
      beforeMaintenance,
      error: error.stderr || error.message,
    });
  }
  if (checked.ownership !== "absent") {
    return stopped("conflict", {
      ownership: checked.ownership,
      workspace: selected.workspace,
      branch: selected.branch,
      beforeMaintenance,
      provenance: checked.provenance,
    });
  }
  let committed;
  try {
    committed = await commitWorkspaceClaim(claimRequest);
  } catch (error) {
    return stopped("claim-failed", {
      workspace: selected.workspace,
      branch: selected.branch,
      beforeMaintenance,
      error: error.stderr || error.message,
    });
  }
  if (!committed.ok) return { ...committed, beforeMaintenance };
  const published = await publishClaimSha({
    ...claimRequest,
    candidateSha: committed.candidateSha,
  });
  if (!published.ok) return { ...published, beforeMaintenance };
  // Independent remote acceptance: containment plus current provenance.
  try {
    await git(selected.workspace, "fetch", remote);
    const remoteTip = await lsRemoteSha(origin, `refs/heads/${request.target}`);
    const contained = await isAncestor(
      selected.workspace,
      published.publishedSha,
      remoteTip,
    );
    const provenance = await claimProvenance(
      selected.workspace,
      ref,
      request.identity,
      backlogPath,
    );
    if (
      !contained ||
      provenance?.publisher !== request.publisherId ||
      provenance?.identity !== request.identity
    ) {
      return stopped("unpublished", {
        workspace: selected.workspace,
        candidateSha: committed.candidateSha,
        beforeMaintenance,
        error: "remote containment or claim ownership is unconfirmed",
      });
    }
  } catch (error) {
    return stopped("unpublished", {
      workspace: selected.workspace,
      candidateSha: committed.candidateSha,
      beforeMaintenance,
      error: error.stderr || error.message,
    });
  }
  const afterMaintenance = await maintenance(request);
  return {
    ok: true,
    status: "published",
    mode: request.mode,
    identity: request.identity,
    publisherId: request.publisherId,
    remote,
    target: `refs/heads/${request.target}`,
    fetched,
    publishedSha: published.publishedSha,
    candidateSha: committed.candidateSha,
    workspace: selected.workspace,
    branch: selected.branch,
    startingRevision: selected.startingRevision,
    created: selected.created,
    plan: selectedSource.planTarget,
    preparation: "ready",
    beforeMaintenance,
    afterMaintenance,
    projectSetupRequired: true,
  };
}

function argumentsOf(argv) {
  if (argv[0] !== "start")
    throw new Error(
      "usage: execution-start.mjs start --integration PATH --workspace PATH --branch NAME --identity ID --publisher-id ID --mode trunk|story-branch --remote NAME --target BRANCH --push-authorized --workspace-authorized [--plan PATH] [--declared-owner ID --requester ID]",
    );
  const result = {};
  for (let index = 1; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === "--push-authorized" || flag === "--workspace-authorized") {
      result[
        flag === "--push-authorized" ? "pushAuthorized" : "workspaceAuthorized"
      ] = true;
      continue;
    }
    if (!flag.startsWith("--") || index + 1 >= argv.length)
      throw new Error(`invalid argument ${flag}`);
    const key = flag
      .slice(2)
      .replace(/-[a-z]/g, (match) => match[1].toUpperCase());
    result[key] = argv[++index];
  }
  return result;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const result = await startQueuedExecution(
      argumentsOf(process.argv.slice(2)),
    );
    process.stdout.write(`${JSON.stringify(result)}\n`);
    if (!result.ok) process.exitCode = 1;
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 2;
  }
}
