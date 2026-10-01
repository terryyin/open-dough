// Public Codex boundary; all vendor transport and input details stay private.
import path from "node:path";
import type { LaunchHost } from "./launchHosts.ts";
import { launchCodex } from "./hosts/codex/launch.ts";
import { closeCodexConnections } from "./hosts/codex/conversation.ts";
import { recoverCodex } from "./hosts/codex/recovery.ts";
import { codexSessions } from "./hosts/codex/sessions.ts";

export const codexHost: LaunchHost = {
  name: "Codex",
  installedSkillPath: (project, skill, ...segments) =>
    path.join(project.path, ".agents", "skills", skill, ...segments),
  launch: launchCodex,
  recover: recoverCodex,
  sessions: (...[records, , signal]) => codexSessions(records, signal),
  close: closeCodexConnections,
};
