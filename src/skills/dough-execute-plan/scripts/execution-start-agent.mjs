// The agent a new Take names: chosen from profiles held on fetched trunk, and
// chosen again when a rival publishes the same name first.
import { basename, dirname, join } from "node:path";
import {
  agentProfileDirectory,
  profileAgentName,
  selectAgentName,
} from "../../dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { git, revParse } from "./publication-git.mjs";
import { commitWorkspaceClaim } from "./workspace-publication-select.mjs";
import { stopped } from "./workspace-publication-ownership.mjs";

// Agent names of the profile paths a Git command lists under the profile
// directory beside the backlog, in listed order.
async function listedAgentNames(cwd, backlogPath, ...args) {
  const directory = join(dirname(backlogPath), agentProfileDirectory);
  const { stdout } = await git(cwd, ...args, "--", `${directory}/`);
  return stdout
    .split("\n")
    .filter(Boolean)
    .map((path) => profileAgentName(basename(path)))
    .filter(Boolean);
}

// Agent names whose profiles exist beside the backlog at `rev`.
function heldAgentNames(cwd, rev, backlogPath) {
  return listedAgentNames(cwd, backlogPath, "ls-tree", "--name-only", rev);
}

// The agent name whose profile was most recently added beside the backlog in
// `rev`'s first-parent history, released or not; undefined when none ever was.
async function mostRecentAgentName(cwd, rev, backlogPath) {
  const added = await listedAgentNames(
    cwd,
    backlogPath,
    "log",
    "--first-parent",
    "--diff-filter=A",
    "--name-only",
    "--format=",
    rev,
  );
  return added[0];
}

// The rotation's next name at `rev`, or undefined when every name is held.
async function nextAgentName(cwd, rev, backlogPath) {
  const [mostRecent, held] = await Promise.all([
    mostRecentAgentName(cwd, rev, backlogPath),
    heldAgentNames(cwd, rev, backlogPath),
  ]);
  return { name: selectAgentName(mostRecent, held), held };
}

function unavailable(extra = {}) {
  return stopped("agent-unavailable", {
    ...extra,
    error: "every agent name is held on remote trunk",
  });
}

// The rotation's next name at `rev`, carrying what the agent reported about
// itself.
export async function selectClaimAgent(request, rev, backlogPath, fetched) {
  const { name } = await nextAgentName(request.integration, rev, backlogPath);
  if (!name) return unavailable({ fetched });
  return {
    ok: true,
    agent: {
      name,
      ...(request.host === undefined ? {} : { host: request.host }),
      ...(request.model === undefined ? {} : { model: request.model }),
    },
  };
}

// publishClaimSha's reselection hook. When the rejected push's trunk already
// holds the selected name, rebuild the still-isolated Take on that trunk under
// the rotation's next name instead of replaying it; otherwise leave the replay alone.
// `onAgent` learns the name that was actually committed.
export function reselectClaimAgent(claimRequest, agent, onAgent) {
  const { workspace, backlogPath, startingRevision } = claimRequest;
  return async ({ onto, candidateSha }) => {
    const { name, held } = await nextAgentName(workspace, onto, backlogPath);
    if (!held.includes(agent.name)) return undefined;
    const isolated =
      (await revParse(workspace, "HEAD")) === candidateSha &&
      (await revParse(workspace, `${candidateSha}^`)) === startingRevision &&
      (await git(workspace, "status", "--porcelain")).stdout === "";
    if (!isolated) return undefined;
    if (!name) return unavailable();
    await git(workspace, "reset", "--hard", onto);
    const next = { ...agent, name };
    const recreated = await commitWorkspaceClaim({
      ...claimRequest,
      startingRevision: onto,
      agent: next,
    });
    if (recreated.ok) onAgent(next);
    return recreated;
  };
}
