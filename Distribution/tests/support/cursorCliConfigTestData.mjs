// @ts-check
// Cursor's shared `cli-config.json` facts as a fake Cursor seeds or changes
// them for session-scope cloning. Directory layout, chats, and file
// transport stay in the harness.

/**
 * @typedef {{
 *   model: string,
 *   hasChangedDefaultModel: boolean,
 *   fixtureSetting: string,
 * }} CursorCliConfig
 */

/**
 * Shared Cursor CLI configuration. Unless stated, the model is `auto` and
 * the default-model flag is unchanged; the fixture setting distinguishes the
 * shared source for scope-clone assertions.
 */
export class CursorCliConfigBuilder {
  /** @type {string} */
  #model = "auto";
  /** @type {boolean} */
  #hasChangedDefaultModel = false;
  /** @type {string} */
  #fixtureSetting = "from-shared-config";

  /**
   * A deliberate model choice, as the developer making it in Cursor between
   * a launch and its resumption.
   * @param {string} model
   */
  withModel(model) {
    this.#model = model;
    this.#hasChangedDefaultModel = true;
    return this;
  }

  /** @returns {CursorCliConfig} */
  please() {
    return {
      model: this.#model,
      hasChangedDefaultModel: this.#hasChangedDefaultModel,
      fixtureSetting: this.#fixtureSetting,
    };
  }
}
