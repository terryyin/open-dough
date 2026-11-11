// @ts-check
// One row of Claude Code's native session listing (`claude agents --json
// --all`), as the fake writes it and the dashboard parses it
// (`../../dashboard/server/hosts/claude/listing.ts`). Background rows carry a
// short `id` and `state`; interactive terminal rows omit both. Process
// `status` is present only while the process runs. Keep fake process and
// agents.json transport in the harness.

/**
 * How a listed background session appears: working with its process busy or
 * idle; blocked and waiting; done with the process still idle or exited;
 * failed or stopped with the process exited; or a state this dashboard does
 * not recognize.
 * @typedef {"working" | "working-idle" | "blocked" | "done-live" | "done-exited" | "failed" | "stopped" | "unrecognized"} ClaudeListingAppearance
 */

/**
 * Identity and placement facts a background listing row states. `cwd` is
 * omitted when the listing does not say where the session started.
 * @typedef {{
 *   sessionId: string,
 *   name: string,
 *   startedAt: number,
 *   cwd?: string,
 *   shortId?: string,
 *   pid?: number,
 * }} ClaudeBackgroundListingFacts
 */

/**
 * An interactive terminal session listing: no short `id` and no `state`.
 * @typedef {{
 *   sessionId: string,
 *   name: string,
 *   cwd: string,
 *   startedAt: number,
 *   pid?: number,
 *   status?: string,
 * }} ClaudeInteractiveListingFacts
 */

/** @type {Record<ClaudeListingAppearance, { state: string, status?: string }>} */
export const claudeListingAppearance = {
  working: { state: "working", status: "busy" },
  "working-idle": { state: "working", status: "idle" },
  blocked: { state: "blocked", status: "waiting" },
  "done-live": { state: "done", status: "idle" },
  "done-exited": { state: "done" },
  failed: { state: "failed" },
  stopped: { state: "stopped" },
  unrecognized: { state: "napping" },
};

const replacedFields = new Set(["state", "status", "waitingFor"]);

/**
 * @param {Record<string, unknown>} listed
 * @returns {Record<string, unknown>}
 */
function withoutReplaced(listed) {
  return Object.fromEntries(
    Object.entries(listed).filter(([key]) => !replacedFields.has(key)),
  );
}

/**
 * A Claude listing row. Choose `.background(...)` or `.interactive(...)`,
 * then appearance when a background row is not already working/busy.
 */
export class ClaudeListingRowBuilder {
  /** @type {Record<string, unknown> | undefined} */
  #row;
  /** @type {string | undefined} */
  #waitingFor;

  /**
   * A background session as `claude agents` lists it.
   * @param {ClaudeBackgroundListingFacts} facts
   */
  background({
    sessionId,
    name,
    cwd,
    startedAt,
    shortId = sessionId.slice(0, 8),
    pid,
  }) {
    this.#row = {
      ...(pid === undefined ? {} : { pid }),
      id: shortId,
      ...(cwd === undefined ? {} : { cwd }),
      kind: "bg",
      startedAt,
      sessionId,
      name,
      ...claudeListingAppearance.working,
    };
    return this;
  }

  /**
   * An interactive session running in a terminal: no short `id`, no `state`.
   * @param {ClaudeInteractiveListingFacts} facts
   */
  interactive({ sessionId, name, cwd, startedAt, pid, status = "busy" }) {
    this.#row = {
      ...(pid === undefined ? {} : { pid }),
      cwd,
      kind: "interactive",
      startedAt,
      sessionId,
      name,
      status,
    };
    return this;
  }

  /**
   * Rebuild from an already-listed row, replacing only appearance fields.
   * @param {Record<string, unknown>} listed
   */
  fromListed(listed) {
    this.#row = withoutReplaced(listed);
    return this;
  }

  /**
   * How the background session appears in the listing. Replaces `state`,
   * `status`, and `waitingFor` whole, as Claude Code's listing does.
   * @param {ClaudeListingAppearance} appearance
   */
  as(appearance) {
    const row = this.#row;
    if (row === undefined)
      throw new Error("choose .background(...) or .fromListed(...) first");
    if (row["kind"] === "interactive")
      throw new Error("an interactive listing has no background appearance");
    this.#row = {
      ...withoutReplaced(row),
      ...claudeListingAppearance[appearance],
    };
    return this;
  }

  /**
   * What a blocked session waits for, as Claude Code words it.
   * @param {string} waitingFor
   */
  waitingFor(waitingFor) {
    this.#waitingFor = waitingFor;
    return this;
  }

  /** @returns {Record<string, unknown>} */
  please() {
    if (this.#row === undefined)
      throw new Error(
        "choose .background(...), .interactive(...), or .fromListed(...) first",
      );
    if (this.#waitingFor !== undefined) {
      if (this.#row["state"] !== "blocked")
        throw new Error("A non-blocked session waits for nothing.");
      return { ...this.#row, waitingFor: this.#waitingFor };
    }
    return { ...this.#row };
  }
}
