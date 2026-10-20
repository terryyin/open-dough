// A chosen-model Cursor launch's own configuration scope: a clone of the
// developer's current effective Cursor configuration, held under the
// dashboard machine home and remembered on the session's continuation.
// Cursor's own model persistence for that session (CURSOR_CONFIG_DIR)
// lands in the scope, never in the shared configuration. Chat storage
// follows the config directory, so the scope's `chats` is a symlink to
// the shared chats instead of a copy: the saved conversation stays shared.
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { machineDashboardPath } from "../../machineHome.ts";

// The developer's current effective Cursor configuration directory.
function effectiveCursorConfigDirectory(
  environment: NodeJS.ProcessEnv = process.env,
): string {
  const configured = environment["CURSOR_CONFIG_DIR"];
  return configured === undefined || configured === ""
    ? path.join(homedir(), ".cursor")
    : path.resolve(configured);
}

// Establishes one new session scope cloned from the current effective
// configuration. Undefined when that configuration cannot be read or
// cloned; the caller refuses rather than launching against the shared
// configuration. A partial scope is removed before returning undefined.
export async function establishCursorSessionScope(): Promise<
  string | undefined
> {
  const source = effectiveCursorConfigDirectory();
  const scope = machineDashboardPath("cursor-session-scopes", randomUUID());
  try {
    const config = await readFile(path.join(source, "cli-config.json"));
    await mkdir(scope, { recursive: true });
    await writeFile(path.join(scope, "cli-config.json"), config);
    const sharedChats = path.join(source, "chats");
    await mkdir(sharedChats, { recursive: true });
    await symlink(sharedChats, path.join(scope, "chats"), "dir");
    return scope;
  } catch {
    await rm(scope, { recursive: true, force: true }).catch(() => undefined);
    return undefined;
  }
}

// Removes one scope without following its `chats` symlink (Node's rm
// unlinks a symlink inside a removed directory instead of following it).
export async function removeCursorSessionScope(scope: string): Promise<void> {
  await rm(scope, { recursive: true, force: true });
}

// The environment a process running a scoped session inherits.
export function cursorSessionScopeEnvironment(
  scope: string,
): Readonly<Record<string, string>> {
  return { CURSOR_CONFIG_DIR: scope };
}
