import {
  agentIdentity,
  renderAgentProfile,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { projectFile } from "./product-backlog-fixture.mjs";

export function plantAgentProfile(project, profile) {
  const text = renderAgentProfile(profile);
  projectFile(project, agentIdentity(profile.name).path, text);
  return text;
}
