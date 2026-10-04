// Public Cursor boundary. Native commands and prompt spelling stay private.
import path from "node:path";
import type { LaunchHost } from "./launchHosts.ts";
import { launchCursor } from "./hosts/cursor/launch.ts";
import { cursorOptions } from "./hosts/cursor/options.ts";
import { observeCursorSessions } from "./hosts/cursor/sessions.ts";
import { attachCursor } from "./hosts/cursor/terminal.ts";
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
};
