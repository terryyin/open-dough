// @ts-check
// A host's native conversation and how it continues, as a kept launch records
// it (`./launchTestData.mjs`) or as a terminal or runner consumes it on its
// own (`makeMe.aHostSession`). Each host keeps its own identity and
// continuation: a Claude alias, a Codex thread's saved workspace and
// app-server endpoint.

/** @typedef {import("../../dashboard/src/hostSession.ts").ClaudeSession} ClaudeSession */
/** @typedef {import("../../dashboard/src/hostSession.ts").CodexSession} CodexSession */
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
 *   continuation: { workspace: string, endpoint: string, args?: string[], notice?: string },
 * }} CodexFacts
 */

/**
 * @param {ClaudeFacts} facts
 * @returns {(name: string) => ClaudeSession}
 */
export function claudeSession({ sessionId, shortId = sessionId.slice(0, 8) }) {
  return (name) => ({ host: "claude", sessionId, shortId, name });
}

/**
 * @param {CodexFacts} facts
 * @returns {(name: string) => SavedCodexSession}
 */
export function codexSession({
  sessionId,
  continuation: {
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
  },
}) {
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
 * A host session on its own, named by its ID unless stated.
 * @template {ClaudeSession | SavedCodexSession} Session
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
  /** @param {CodexFacts} facts */
  codex: (facts) =>
    new HostSessionBuilder(codexSession(facts), facts.sessionId),
};
