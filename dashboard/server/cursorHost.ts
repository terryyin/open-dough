// Public Cursor boundary. Native commands and prompt spelling stay private.
import path from "node:path";
import type { LaunchRecord } from "../src/agentLaunch.ts";
import type { LaunchHost } from "./launchHosts.ts";
import { launchCursor } from "./hosts/cursor/launch.ts";
import { removeCursorSessionScope } from "./hosts/cursor/sessionScope.ts";
import { cursorOptions } from "./hosts/cursor/options.ts";
import { observeCursorSessions } from "./hosts/cursor/sessions.ts";
import { attachCursor } from "./hosts/cursor/terminal.ts";
import { stopCursor } from "./hosts/cursor/stop.ts";
import { hostDescriptions } from "../src/hostDescription.ts";

export const cursorHost: LaunchHost = {
  name: hostDescriptions.cursor.name,
  description: hostDescriptions.cursor,
  installedSkillPath: (project, skill, ...segments) =>
    path.join(project.path, ".agents", "skills", skill, ...segments),
  launch: launchCursor,
  options: cursorOptions,
  sessions: observeCursorSessions,
  attach: attachCursor,
  stop: (...[session, , signal]) => stopCursor(session, signal),
  localDone: true,
  // The record is already gone: retire exactly the scope it remembered.
  // Scope removal unlinks its `chats` symlink instead of following it, so
  // the shared configuration and saved conversation stay untouched.
  recordRemoved: async (record: LaunchRecord) => {
    if (record.session.host !== "cursor") return;
    const scope = record.session.continuation.configScope;
    if (scope !== undefined) await removeCursorSessionScope(scope);
  },
};
