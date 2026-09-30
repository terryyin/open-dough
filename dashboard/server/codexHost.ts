// Public Codex boundary; all vendor transport and input details stay private.
import path from "node:path";
import type { LaunchHost } from "./launchHosts.ts";
import { launchCodex, closeCodexConnections } from "./hosts/codex/launch.ts";

export const codexHost: LaunchHost = {
  name: "Codex",
  installedSkillPath: (project, skill, ...segments) =>
    path.join(project.path, ".agents", "skills", skill, ...segments),
  launch: launchCodex,
  close: closeCodexConnections,
};
