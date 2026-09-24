// Who holds Taken work: the agent name rotation, the agent's Git identity, and
// its published profile under the backlog directory. Profile spelling has one
// owner here. No filesystem, Git, or Node-only imports.

// Fixed rotation, in order. A prime count keeps the cycle even.
export const agentNames = Object.freeze([
  "Yui",
  "Akiho",
  "Yuma",
  "Sola",
  "Yua",
  "Ai",
  "Kirara",
  "Mana",
  "Tsubomi",
  "Yumi",
  "Julia",
  "Tsukasa",
  "Kaoru",
  "Nao",
  "Maria",
  "Mihiro",
  "Aino",
  "Rio",
  "Airi",
  "Shunka",
  "Eimi",
  "Hitomi",
  "Hibiki",
  "Maki",
  "Nana",
  "Honoka",
  "Anri",
  "Koharu",
  "Rina",
]);

export const agentHosts = Object.freeze(["claude", "codex", "cursor"]);
const agentModes = Object.freeze(["trunk", "story-branch"]);

// Profiles live beside the backlog, one file per active agent.
export const agentProfileDirectory = "agents";

export function agentIdentity(name) {
  if (!agentNames.includes(name))
    throw new Error(`unknown agent name: ${name}`);
  const lower = name.toLowerCase();
  return {
    name,
    agent: `agent-${name}`,
    email: `agent-${lower}@example.org`,
    path: `${agentProfileDirectory}/agent-${lower}.json`,
  };
}

// The rotation name a profile file is held under, or undefined when the file
// name is not an agent profile.
export function heldAgentName(fileName) {
  const path = `${agentProfileDirectory}/${fileName}`;
  return agentNames.find((name) => agentIdentity(name).path === path);
}

// First name in rotation order not held on trunk; undefined when all are held.
export function selectAgentName(held) {
  return agentNames.find((name) => !held.includes(name));
}

// Host and model are what the agent reports; either may be unrecorded. Returns
// why a reported value cannot be recorded, or undefined when both can.
export function agentReportError({ host, model }) {
  if (host !== undefined && !agentHosts.includes(host))
    return `host must be one of ${agentHosts.join(", ")}`;
  if (model !== undefined && (typeof model !== "string" || model.trim() === ""))
    return "model must be non-empty text when recorded";
  return undefined;
}

export function renderAgentProfile({
  name,
  identity,
  mode,
  branch,
  host,
  model,
}) {
  const { agent, email } = agentIdentity(name);
  if (!identity) throw new Error("agent profile requires a work item identity");
  if (!agentModes.includes(mode))
    throw new Error(`unknown execution mode: ${mode}`);
  if (!branch) throw new Error("agent profile requires branch context");
  const reportError = agentReportError({ host, model });
  if (reportError) throw new Error(reportError);
  const profile = {
    schemaVersion: 1,
    agent,
    email,
    identity,
    mode,
    branch,
    ...(host === undefined ? {} : { host }),
    ...(model === undefined ? {} : { model }),
  };
  return `${JSON.stringify(profile, null, 2)}\n`;
}
