// @ts-check
// Native settings documents consumed by the installation hook merger. Host
// identity comes from its inventory; handler shapes follow mergeDocument's
// flat Cursor entries and command-wrapper Codex/Claude entries.
import { HOSTS } from "../../src/install/open-dough-register-hooks-fragments.mjs";

/** @typedef {{ command: string, timeout?: number, matcher?: string }} HostHandler */
/** @typedef {{ hooks: Record<string, object[]>, version?: number } & Record<string, unknown>} HostSettings */
/** @typedef {{ hooks: Record<string, object[]>, version?: number }} HookFragment */

export class HostHookSettingsBuilder {
  /** @type {string | undefined} */
  #host;
  /** @type {HostSettings} */
  #settings = { hooks: {} };

  /** @param {string} host */
  forHost(host) {
    if (!HOSTS.some(({ id }) => id === host)) {
      throw new Error(`Unknown hook-settings host: ${host}`);
    }
    this.#host = host;
    return this;
  }

  /** @param {Record<string, unknown>} settings unrelated native settings */
  with(settings) {
    Object.assign(this.#settings, structuredClone(settings));
    return this;
  }

  /**
   * @param {string} event
   * @param {HostHandler} handler
   */
  handling(event, handler) {
    if (!this.#host) throw new Error("choose .forHost(host) first");
    const { matcher, ...command } = handler;
    const entry =
      this.#host === "cursor"
        ? structuredClone(handler)
        : {
            ...(matcher === undefined ? {} : { matcher }),
            hooks: [{ type: "command", ...command }],
          };
    (this.#settings.hooks[event] ??= []).push(entry);
    return this;
  }

  /**
   * Arrange an already registered document from authoritative native fragments.
   * This only appends the supplied entries; it never invokes the merge under test.
   * @param {(HookFragment | null)[]} fragments
   */
  registeredWith(...fragments) {
    if (!this.#host) throw new Error("choose .forHost(host) first");
    for (const fragment of fragments) {
      if (fragment === null) continue;
      for (const [event, entries] of Object.entries(fragment.hooks)) {
        (this.#settings.hooks[event] ??= []).push(...structuredClone(entries));
      }
    }
    return this;
  }

  /** @returns {HostSettings} */
  please() {
    if (!this.#host) throw new Error("choose .forHost(host) first");
    return structuredClone(this.#settings);
  }
}
