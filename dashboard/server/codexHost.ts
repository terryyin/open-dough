// Public Codex boundary; all vendor transport and input details stay private.
import path from "node:path";
import type { LaunchHost } from "./launchHosts.ts";
import { launchCodex } from "./hosts/codex/launch.ts";
import { closeCodexConnections } from "./hosts/codex/conversation.ts";
import { recoverCodex } from "./hosts/codex/recovery.ts";
import { codexSessions } from "./hosts/codex/sessions.ts";
import { renameCodex, stopCodex } from "./hosts/codex/done.ts";
import { attachCodex } from "./hosts/codex/terminal.ts";
import { codexCreationEvidence } from "./hosts/codex/creation.ts";
import { readCodexResult } from "./hosts/codex/result.ts";
import { daemonEndpoint } from "./hosts/codex/rpc.ts";
import { hostDescriptions } from "../src/hostDescription.ts";

import { codexOptions } from "./hosts/codex/options.ts";

export const codexHost: LaunchHost = {
  name: hostDescriptions.codex.name,
  description: hostDescriptions.codex,
  creationEvidence: codexCreationEvidence,
  installedSkillPath: (project, skill, ...segments) =>
    path.join(project.path, ".agents", "skills", skill, ...segments),
  launch: launchCodex,
  options: codexOptions,
  recover: recoverCodex,
  sessions: (...[records, , signal]) => codexSessions(records, signal),
  readResult: readCodexResult,
  attach: attachCodex,
  rename: renameCodex,
  stop: (...[session, , signal]) => stopCodex(session, signal),
  prepareSavedSessions: async (signal) => {
    await daemonEndpoint(signal);
  },
  close: closeCodexConnections,
};
