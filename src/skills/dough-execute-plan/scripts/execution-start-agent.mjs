// The agent a new Take names: chosen from profiles held on fetched trunk, and
// chosen again when a rival publishes the same name first.
import { basename, dirname, join } from "node:path";
import {
  agentProfileDirectory,
  heldAgentName,
  selectAgentName,
} from "../../dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { git, revParse } from "./publication-git.mjs";
import { commitWorkspaceClaim } from "./workspace-publication-select.mjs";
import { stopped } from "./workspace-publication-ownership.mjs";

// Agent names whose profiles exist beside the backlog at `rev`.
async function heldAgentNames(cwd, rev, backlogPath) {
  const directory = join(dirname(backlogPath), agentProfileDirectory);
  const listed = (
    await git(cwd, "ls-tree", "--name-only", rev, "--", `${directory}/`)
  ).stdout
    .split("\n")
    .filter(Boolean);
  return listed.map((path) => heldAgentName(basename(path))).filter(Boolean);
}

function unavailable(extra = {}) {
  return stopped("agent-unavailable", {
    ...extra,
    error: "every agent name is held on remote trunk",
  });
}

// The first name not held at `rev`, carrying what the agent reported about
// itself. The rotation cursor follows in a later change.
export async function selectClaimAgent(request, rev, backlogPath, fetched) {
  const name = selectAgentName(
    await heldAgentNames(request.integration, rev, backlogPath),
  );
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
// the next free name instead of replaying it; otherwise leave the replay alone.
// `onAgent` learns the name that was actually committed.
export function reselectClaimAgent(claimRequest, agent, onAgent) {
  const { workspace, backlogPath, startingRevision } = claimRequest;
  return async ({ onto, candidateSha }) => {
    const held = await heldAgentNames(workspace, onto, backlogPath);
    if (!held.includes(agent.name)) return undefined;
    const isolated =
      (await revParse(workspace, "HEAD")) === candidateSha &&
      (await revParse(workspace, `${candidateSha}^`)) === startingRevision &&
      (await git(workspace, "status", "--porcelain")).stdout === "";
    if (!isolated) return undefined;
    const name = selectAgentName(held);
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
