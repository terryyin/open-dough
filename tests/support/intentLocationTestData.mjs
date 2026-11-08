// @ts-check
// Domain data for Intent locations as `.planning/open-dough.json` declares
// them (`intent.locations`): a location at a folder, declared by a kind with
// optional include patterns or by source entries with optional syntax hints.

/** @typedef {import("../../dashboard/server/intentLocationsSettings.ts").DeclaredLocation} DeclaredLocation */
/** @typedef {import("../../dashboard/src/intentLocationSelection.ts").SourceDeclaration} SourceDeclaration */
/** @typedef {{ intent: { locations: DeclaredLocation[] } }} IntentSettings */

export class IntentLocationBuilder {
  /** @type {string | undefined} */
  #path;
  /** @type {string | undefined} */
  #label;
  /** @type {{ kind: string, include?: string[] } | { sources: SourceDeclaration[] } | undefined} */
  #selection;

  /** @param {string} path the location's repository folder */
  at(path) {
    this.#path = path;
    return this;
  }

  /** @param {string} label */
  labelled(label) {
    this.#label = label;
    return this;
  }

  /**
   * @param {string} kind
   * @param {readonly string[]} [include]
   */
  ofKind(kind, include) {
    this.#selection =
      include === undefined ? { kind } : { kind, include: [...include] };
    return this;
  }

  /** @param {readonly SourceDeclaration[]} sources in declaration order */
  withSources(...sources) {
    this.#selection = {
      sources: sources.map((source) => ({
        ...source,
        include: [...source.include],
      })),
    };
    return this;
  }

  /** @returns {DeclaredLocation} */
  please() {
    if (this.#path === undefined) throw new Error("choose .at(path) first");
    if (this.#selection === undefined) {
      throw new Error("choose .ofKind(...) or .withSources(...) first");
    }
    return {
      path: this.#path,
      ...(this.#label === undefined ? {} : { label: this.#label }),
      ...this.#selection,
    };
  }
}

export class IntentSettingsBuilder {
  /** @type {DeclaredLocation[]} */
  #locations = [];

  /** @param {readonly DeclaredLocation[]} locations in declaration order */
  withLocations(...locations) {
    this.#locations = [...locations];
    return this;
  }

  /** @returns {IntentSettings} */
  please() {
    return { intent: { locations: [...this.#locations] } };
  }
}
