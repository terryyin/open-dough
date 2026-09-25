// Which preparation assignment a workspace owns, and ending it. An assignment
// is identified by its profile path plus the commit that added it (its
// allocation), read from Git history, never by story identity, timestamps, or
// tool/model alone. The workspace names its assignment through its configured
// agent authorship, the same way an execution workspace does.
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import {
  agentIdentity,
  agentNameOf,
  agentReportError,
  parseAgentProfile,
} from "../../dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { profileAllocation } from "../../dough-execute-plan/scripts/execution-start-agent.mjs";
import { git } from "../../dough-execute-plan/scripts/publication-git.mjs";
import {
  backlogPath,
  fileAt,
} from "../../dough-execute-plan/scripts/workspace-publication-ownership.mjs";

export function stop(status, fields) {
  return { ok: false, status, ...fields };
}

export const errorText = (error) => error.stderr || error.message;

// Repository path of a rotation name's profile beside the backlog.
export const profilePathOf = (name) =>
  join(dirname(backlogPath), agentIdentity(name).path);

// The validated request for `start` or `release`, or a stop saying why not.
export function requestOf(operation, input) {
  const required = ["workspace", "identity", "target"];
  if (operation === "start") required.push("integration");
  for (const field of required)
    if (!input[field])
      return stop("invalid-request", { error: `missing ${field}` });
  const request = {
    ...input,
    remote: input.remote ?? "origin",
    workspace: resolve(input.workspace),
    ...(input.integration ? { integration: resolve(input.integration) } : {}),
  };
  const reportError = agentReportError(request);
  if (reportError) return stop("invalid-request", { error: reportError });
  if (request.agent !== undefined && agentNameOf(request.agent) === undefined)
    return stop("invalid-request", {
      error: `unknown agent: ${request.agent}`,
    });
  if (operation === "start") {
    if (request.pushAuthorized !== true)
      return stop("authority-required", {
        error: "trunk publication authority must be established",
      });
    if (request.integration === request.workspace)
      return stop("invalid-request", {
        error: "preparation requires a separate owned workspace",
      });
  }
  return { ok: true, request };
}

// The agent this workspace authors as, or the one its caller names when the
// workspace cannot record authorship.
async function workspaceAgent(request) {
  let configured;
  try {
    configured = (
      await git(request.workspace, "config", "--get", "author.name")
    ).stdout.trim();
  } catch {
    configured = undefined;
  }
  return agentNameOf(configured) ?? agentNameOf(request.agent);
}

// This workspace's preparation assignment for the identity, when the fetched
// trunk still holds it: the profile its agent is published under, recording
// preparation of this identity, and added by the same commit this
// workspace's own history added it with.
export async function ownAssignment(request, ref) {
  const name = await workspaceAgent(request);
  if (name === undefined) return undefined;
  const path = profilePathOf(name);
  const text = await fileAt(request.workspace, ref, path);
  if (text === null) return undefined;
  const read = parseAgentProfile(text);
  if (
    !read.ok ||
    read.profile.activity !== "preparation" ||
    read.profile.identity !== request.identity
  )
    return undefined;
  const allocation = await profileAllocation(request.workspace, ref, path);
  const own = await profileAllocation(request.workspace, "HEAD", path);
  if (allocation === undefined || allocation !== own) return undefined;
  return { name, path, allocation, profile: read.profile };
}

export function assignmentFields(request, { name, path, allocation, profile }) {
  return {
    activity: "preparation",
    identity: request.identity,
    agent: agentIdentity(name).agent,
    profile: path,
    allocation,
    ...(profile.host === undefined ? {} : { host: profile.host }),
    ...(profile.model === undefined ? {} : { model: profile.model }),
  };
}

// Stages `git rm` of exactly this workspace's own assignment beside its
// retained result, so the landing that publishes the result also ends it.
export async function releasePreparation(input) {
  const requested = requestOf("release", input);
  if (!requested.ok) return requested;
  const { request } = requested;
  const { workspace, remote, target } = request;
  const ref = `${remote}/${target}`;
  try {
    await git(workspace, "fetch", "--quiet", remote);
  } catch (error) {
    return stop("source-refused", { workspace, error: errorText(error) });
  }
  const own = await ownAssignment(request, ref);
  if (!own)
    return stop("no-assignment", {
      workspace,
      error: `${ref} holds no preparation assignment of ${request.identity} announced from this workspace; nothing was staged`,
    });
  let staged = "already-staged";
  try {
    await git(workspace, "ls-files", "--error-unmatch", "--", own.path);
    staged = "staged";
  } catch {
    // The index no longer holds the profile: an earlier release staged it.
  }
  if (staged === "staged") {
    await git(workspace, "rm", "--quiet", "--", own.path);
  } else if (existsSync(join(workspace, own.path))) {
    return stop("release-conflict", {
      workspace,
      error: `${own.path} is untracked yet present; inspect it before landing`,
    });
  }
  return {
    ok: true,
    status: "release-staged",
    staged,
    ...assignmentFields(request, own),
    workspace,
  };
}
