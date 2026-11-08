// @ts-check
// The host session a kept launch names, as the dashboard's machine store holds
// it (`./launchTestData.mjs`): a `claude` session, a Codex thread or a Cursor
// session, each named after the launch's title.

/** @typedef {import("../../dashboard/src/launchRecord.ts").LaunchRecord} LaunchRecord */
/** @typedef {(name: string) => LaunchRecord["session"]} NamedSession */

/**
 * A `claude` session, by its ID and short ID, which is otherwise the ID's
 * first eight characters.
 * @param {{ sessionId: string, shortId?: string }} session
 * @returns {NamedSession}
 */
export function claudeSession({ sessionId, shortId = sessionId.slice(0, 8) }) {
  return (name) => ({ host: "claude", sessionId, shortId, name });
}

/**
 * A Codex thread and, when it was saved, where it continues: the workspace
 * and the app-server endpoint.
 * @param {{ sessionId: string, continuation?: { workspace: string, endpoint: string, args?: string[] } }} session
 * @returns {NamedSession}
 */
export function codexSession({ sessionId, continuation }) {
  return (name) => ({
    host: "codex",
    sessionId,
    name,
    ...(continuation && {
      continuation: {
        workspace: continuation.workspace,
        endpoint: continuation.endpoint,
        args: continuation.args ?? [],
      },
    }),
  });
}

/**
 * A Cursor session and where it continues: the saved workspace, the
 * `cursor-agent` arguments and, for a chosen model, its configuration scope.
 * @param {{ sessionId: string, continuation: { workspace: string, args?: string[], configScope?: string } }} session
 * @returns {NamedSession}
 */
export function cursorSession({
  sessionId,
  continuation: { workspace, args = [], configScope },
}) {
  return (name) => ({
    host: "cursor",
    sessionId,
    name,
    continuation: {
      workspace,
      args,
      ...(configScope !== undefined && { configScope }),
    },
  });
}
