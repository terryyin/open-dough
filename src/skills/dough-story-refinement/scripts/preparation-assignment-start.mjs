// Publishes a queued story's preparation announcement before substantive
// preparation, or continues the workspace's existing one. The announcement
// commit adds only the assignment profile; the draft stays in the workspace.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  agentIdentity,
  renderAgentProfile,
} from "../../dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  parseBacklog,
  queueHeading,
} from "../../dough-product-backlog/scripts/product-backlog-document.mjs";
import {
  profileAllocation,
  selectClaimAgent,
} from "../../dough-execute-plan/scripts/execution-start-agent.mjs";
import { maintenance } from "../../dough-execute-plan/scripts/execution-start-maintenance.mjs";
import {
  git,
  lsRemoteSha,
  revParse,
  tryPushExactRef,
} from "../../dough-execute-plan/scripts/publication-git.mjs";
import {
  configureAgentAuthorship,
  workspaceAuthorship,
} from "../../dough-execute-plan/scripts/workspace-agent-authorship.mjs";
import {
  backlogPath,
  fileAt,
  isAncestor,
} from "../../dough-execute-plan/scripts/workspace-publication-ownership.mjs";
import {
  assignmentFields,
  errorText,
  ownAssignment,
  profilePathOf,
  requestOf,
  stop,
} from "./preparation-assignment-ownership.mjs";

async function queuedAt(cwd, ref, identity) {
  const text = await fileAt(cwd, ref, backlogPath);
  if (text === null) return false;
  const entry = parseBacklog(text).entries.find(
    (each) => each.identity === identity,
  );
  return entry?.list === queueHeading;
}

// Commits only the new profile on top of fetched trunk, from a clean
// workspace whose history trunk already contains; nothing else is staged.
async function commitAnnouncement(request, base, agent) {
  const { workspace } = request;
  await git(workspace, "merge", "--ff-only", "--quiet", base);
  const path = profilePathOf(agent.name);
  mkdirSync(dirname(join(workspace, path)), { recursive: true });
  writeFileSync(
    join(workspace, path),
    renderAgentProfile({
      name: agent.name,
      identity: request.identity,
      activity: "preparation",
      host: agent.host,
      model: agent.model,
    }),
  );
  await git(workspace, "add", "--", path);
  const { agent: author, email } = agentIdentity(agent.name);
  await git(
    workspace,
    "commit",
    "--quiet",
    `--author=${author} <${email}>`,
    "-m",
    `Announce preparation: ${request.identity}\n\nPreparation-Identity: ${request.identity}\n`,
  );
  return { path, sha: await revParse(workspace, "HEAD") };
}

// Whether remote trunk contains `sha` and still records it as the profile's
// allocation, read from a fresh fetch and the remote's own tip.
async function acceptedOnRemote(request, ref, sha, path) {
  const { workspace, remote, target } = request;
  await git(workspace, "fetch", "--quiet", remote);
  const url = (await git(workspace, "remote", "get-url", remote)).stdout.trim();
  const tip = await lsRemoteSha(url, `refs/heads/${target}`);
  if (!tip || !(await isAncestor(workspace, sha, tip))) return false;
  return (await profileAllocation(workspace, ref, path)) === sha;
}

export async function startPreparation(input) {
  const requested = requestOf("start", input);
  if (!requested.ok) return requested;
  const { request } = requested;
  const { workspace, remote, target, identity } = request;
  const ref = `${remote}/${target}`;
  let base;
  try {
    await git(workspace, "fetch", "--quiet", remote);
    base = await revParse(workspace, ref);
  } catch (error) {
    return stop("source-refused", { workspace, error: errorText(error) });
  }
  if (!(await queuedAt(workspace, ref, identity)))
    return stop("not-queued", {
      workspace,
      fetched: base,
      error: `${identity} is not queued on ${ref}`,
    });
  const existing = await ownAssignment(request, ref);
  if (existing)
    return {
      ok: true,
      status: "continued",
      ...assignmentFields(request, existing),
      workspace,
      fetched: base,
    };
  const startHead = await revParse(workspace, "HEAD");
  if (
    (await git(workspace, "status", "--porcelain")).stdout !== "" ||
    !(await isAncestor(workspace, startHead, ref))
  )
    return stop("workspace-not-isolated", {
      workspace,
      fetched: base,
      error:
        "a new announcement needs a clean workspace whose commits trunk already contains; nothing was published",
    });
  let agent, announced;
  for (let attempt = 1; ; attempt += 1) {
    const chosen = await selectClaimAgent(
      { ...request, integration: workspace },
      base,
      backlogPath,
    );
    if (!chosen.ok)
      return stop(chosen.status, {
        workspace,
        fetched: base,
        error: chosen.error,
      });
    agent = chosen.agent;
    announced = await commitAnnouncement(request, base, agent);
    let rejected = false;
    try {
      ({ rejected } = await tryPushExactRef(
        workspace,
        announced.sha,
        remote,
        `refs/heads/${target}`,
      ));
    } catch {
      // The response is lost or refused; the remote itself decides below.
    }
    if (!rejected) break;
    await git(workspace, "fetch", "--quiet", remote);
    const moved = await revParse(workspace, ref);
    if (moved === base || attempt === 2) break;
    // Trunk moved: rebuild the isolated announcement on it, choosing again.
    await git(workspace, "reset", "--keep", "--quiet", moved);
    base = moved;
  }
  let accepted;
  try {
    accepted = await acceptedOnRemote(
      request,
      ref,
      announced.sha,
      announced.path,
    );
  } catch (error) {
    return stop("unpublished", {
      workspace,
      candidateSha: announced.sha,
      error: `announcement acceptance is unconfirmed: ${errorText(error)}`,
    });
  }
  if (!accepted) {
    // Remote trunk has not taken the announcement: leave the workspace as it
    // was found, with no coordination commit to mistake for a published one.
    await git(workspace, "reset", "--keep", "--quiet", startHead);
    return stop("unpublished", {
      workspace,
      error: "remote trunk did not accept the preparation announcement",
    });
  }
  await configureAgentAuthorship(workspace, agentIdentity(agent.name));
  const refresh = await maintenance(request);
  return {
    ok: true,
    status: "announced",
    ...assignmentFields(request, {
      name: agent.name,
      path: announced.path,
      allocation: announced.sha,
      profile: agent,
    }),
    publishedSha: announced.sha,
    workspace,
    workspaceAuthorship: await workspaceAuthorship(workspace),
    refresh,
  };
}
