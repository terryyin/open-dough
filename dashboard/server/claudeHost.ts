// The public Claude Code boundary. Native commands, instruction grammar,
// listing parsing and rename interaction remain private to this host.
import path from "node:path";
import type { HostSession } from "../src/agentLaunch.ts";
import type { LaunchHost } from "./launchHosts.ts";
import { launchClaude } from "./hosts/claude/launch.ts";
import {
  attachClaude,
  observeClaudeSessions,
  stopClaude,
} from "./hosts/claude/runtime.ts";
import { renameInClaudeCode } from "./hosts/claude/rename.ts";
import { hostDescriptions } from "../src/hostDescription.ts";

function nativeAlias(session: HostSession): string {
  if (session.host !== "claude") {
    throw new Error("This is not a Claude Code session.");
  }
  return session.shortId;
}

export const claudeHost: LaunchHost = {
  name: hostDescriptions.claude.name,
  description: hostDescriptions.claude,
  installedSkillPath: (project, skill, ...segments) =>
    path.join(project.path, ".claude", "skills", skill, ...segments),
  launch: launchClaude,
  sessions: observeClaudeSessions,
  attach: (session, folder, size) => ({
    pty: attachClaude(nativeAlias(session), folder, size),
  }),
  rename: renameInClaudeCode,
  stop: (session, folder, signal) =>
    stopClaude(nativeAlias(session), folder, signal),
};
