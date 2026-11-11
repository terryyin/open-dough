// @ts-check
// A host's native conversation and how it continues, as a kept launch records
// it (`./launchTestData.mjs`) or as a terminal or runner consumes it on its
// own (`makeMe.aHostSession`). Each host keeps its own identity and
// continuation: a Claude alias, a Codex thread's saved workspace and
// app-server endpoint, a Cursor chat's workspace and saved configuration
// scope.

/** @typedef {import("../../dashboard/src/hostSession.ts").ClaudeSession} ClaudeSession */
/** @typedef {import("../../dashboard/src/hostSession.ts").CodexSession} CodexSession */
/** @typedef {import("../../dashboard/src/hostSession.ts").CursorSession} CursorSession */
/**
 * A Codex session with its saved continuation; only a predecessor record
 * lacks one.
 * @typedef {CodexSession & { continuation: NonNullable<CodexSession["continuation"]> }} SavedCodexSession
 */

/**
 * A `claude` session by its ID and short ID (its native alias), which is
 * otherwise the ID's first eight characters.
 * @typedef {{ sessionId: string, shortId?: string }} ClaudeFacts
 */

/**
 * A Codex thread and where it continues: the saved workspace and app-server
 * endpoint, the resume arguments, which are otherwise the current
 * `codex resume` command for that endpoint, workspace and thread, and the
 * notice kept once native observation ended, when the case needs one.
 * @typedef {{
 *   sessionId: string,
 *   continuation: Omit<NonNullable<CodexSession["continuation"]>, "args"> & { args?: string[] },
 * }} CodexFacts
 */

/**
 * A Cursor chat by its native UUID and where it continues: the saved
 * workspace, the resume arguments, which are otherwise the current
 * `cursor-agent --workspace <workspace> --resume <id>` command, and the
 * session's own configuration scope when a chosen model saved one. The scope
 * is never part of the resume arguments.
 * @typedef {{
 *   sessionId: string,
 *   continuation: { workspace: string, args?: string[], configScope?: string },
 * }} CursorFacts
 */

/**
 * @param {ClaudeFacts} facts
 * @returns {(name: string) => ClaudeSession}
 */
export function claudeSession({ sessionId, shortId = sessionId.slice(0, 8) }) {
  return (name) => ({ host: "claude", sessionId, shortId, name });
}

/**
 * A Codex thread kept by a predecessor record, which saved no continuation.
 * @typedef {{ sessionId: string, continuation?: undefined }} PredecessorCodexFacts
 */

/**
 * @overload
 * @param {CodexFacts} facts
 * @returns {(name: string) => SavedCodexSession}
 */
/**
 * @overload
 * @param {CodexFacts | PredecessorCodexFacts} facts
 * @returns {(name: string) => CodexSession}
 */
/**
 * @param {CodexFacts | PredecessorCodexFacts} facts
 * @returns {(name: string) => CodexSession}
 */
export function codexSession({ sessionId, continuation }) {
  if (!continuation) return (name) => ({ host: "codex", sessionId, name });
  const {
    workspace,
    endpoint,
    args = [
      "codex",
      "resume",
      "--remote",
      endpoint,
      "--cd",
      workspace,
      sessionId,
    ],
    notice,
  } = continuation;
  return (name) => ({
    host: "codex",
    sessionId,
    name,
    continuation: {
      workspace,
      endpoint,
      args,
      ...(notice !== undefined && { notice }),
    },
  });
}

/**
 * @param {CursorFacts} facts
 * @returns {(name: string) => CursorSession}
 */
export function cursorSession({
  sessionId,
  continuation: {
    workspace,
    args = ["cursor-agent", "--workspace", workspace, "--resume", sessionId],
    configScope,
  },
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

/**
 * A host session on its own, named by its ID unless stated.
 * @template {ClaudeSession | CodexSession | CursorSession} Session
 */
export class HostSessionBuilder {
  /** @type {(name: string) => Session} */
  #session;
  /** @type {string} */
  #name;

  /**
   * @param {(name: string) => Session} session
   * @param {string} sessionId
   */
  constructor(session, sessionId) {
    this.#session = session;
    this.#name = sessionId;
  }

  /** @param {string} name the native session's name */
  named(name) {
    this.#name = name;
    return this;
  }

  /** @returns {Session} */
  please() {
    return this.#session(this.#name);
  }
}

// `makeMe.aHostSession`: choose the host and state its session facts.
export const hostSessionChoices = {
  /** @param {ClaudeFacts} facts */
  claude: (facts) =>
    new HostSessionBuilder(claudeSession(facts), facts.sessionId),
  /**
   * A Codex thread with its saved continuation, or a predecessor that kept
   * none.
   * @param {CodexFacts | PredecessorCodexFacts} facts
   */
  codex: (facts) =>
    new HostSessionBuilder(codexSession(facts), facts.sessionId),
  /** @param {CursorFacts} facts */
  cursor: (facts) =>
    new HostSessionBuilder(cursorSession(facts), facts.sessionId),
};
