// The agent a Take names, beyond the shared rotation reading in
// agent-assignments.mjs: chosen again when a rival publishes the same name
// first, read back from the claim commit when an existing claim resumes, and
// reported with the workspace's authorship on the receipt.
import { agentIdentity } from "../../dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  addedProfile,
  agentUnavailable,
  nextAgentName,
} from "./agent-assignments.mjs";
import { git, revParse } from "./publication-git.mjs";
import { commitWorkspaceClaim } from "./workspace-publication-select.mjs";
import {
  configureAgentAuthorship,
  workspaceAuthorship,
} from "./workspace-agent-authorship.mjs";

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
    if (!name) return agentUnavailable(workspace, onto, backlogPath);
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

// A resumed claim keeps the agent its claim commit named: the execution
// profile that commit added for `identity`. A preparation profile naming the
// same identity is never the claim's agent. Restores that agent's authorship
// in the reused workspace and returns its name, or undefined for a claim made
// without a profile. No new name is chosen and no profile is written.
async function resumeClaimAgent(workspace, claimSha, identity, backlogPath) {
  const added = await addedProfile(
    workspace,
    claimSha,
    backlogPath,
    (profile) =>
      profile.activity === "execution" && profile.identity === identity,
  );
  if (!added) return undefined;
  const agent = agentIdentity(added.profile.name);
  await configureAgentAuthorship(workspace, agent);
  return agent.agent;
}

// The receipt's agent for the claim at `claimSha`: the agent this Take chose,
// or else the one the claim commit names, with whether its workspace authors
// ordinary commits as that agent; nothing for a claim made without an agent.
export async function claimReceiptAgent(claimRequest, chosen, claimSha) {
  const { workspace, identity, backlogPath } = claimRequest;
  const agent = chosen
    ? agentIdentity(chosen.name).agent
    : await resumeClaimAgent(workspace, claimSha, identity, backlogPath);
  if (!agent) return {};
  return { agent, workspaceAuthorship: await workspaceAuthorship(workspace) };
}
