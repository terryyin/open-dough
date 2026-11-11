// @ts-check
// Domain data for Intent locations as `.planning/open-dough.json` declares
// them (`intent.locations`): a location at a folder, declared by a kind with
// optional include patterns or by source entries with optional syntax hints;
// and its answer at a revision, as the Intent locations read gives it: the
// declaration with the files it selects there.

/** @typedef {import("../../dashboard/server/intentLocationsSettings.ts").DeclaredLocation} DeclaredLocation */
/** @typedef {import("../../dashboard/server/intentLocationsSettings.ts").IntentLocation} IntentLocation */
/** @typedef {import("../../dashboard/src/intentLocationSelection.ts").SourceDeclaration} SourceDeclaration */
/** @typedef {{ intent: { locations: DeclaredLocation[] } }} IntentSettings */

export class IntentLocationBuilder {
  /** @type {string | undefined} */
  #path;
  /** @type {string | undefined} */
  #label;
  /** @type {{ kind: string, include?: string[] } | { sources: SourceDeclaration[] } | undefined} */
  #selection;
  /** @type {boolean | undefined} */
  #makeMe;

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

  /** @param {boolean} [enabled] */
  usingMakeMe(enabled = true) {
    this.#makeMe = enabled;
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

  /**
   * The location's answer at a revision: the files it selects there.
   * @param {readonly string[]} files repository paths in listing order
   */
  selecting(...files) {
    return new AnsweredIntentLocationBuilder(this, files);
  }

  /** @returns {DeclaredLocation & { makeMe?: boolean }} */
  please() {
    if (this.#path === undefined) throw new Error("choose .at(path) first");
    if (this.#selection === undefined) {
      throw new Error("choose .ofKind(...) or .withSources(...) first");
    }
    return {
      path: this.#path,
      ...(this.#label === undefined ? {} : { label: this.#label }),
      ...(this.#makeMe === undefined ? {} : { makeMe: this.#makeMe }),
      ...this.#selection,
    };
  }
}

export class AnsweredIntentLocationBuilder {
  /** @type {IntentLocationBuilder} */
  #declaration;
  /** @type {readonly string[]} */
  #files;

  /**
   * @param {IntentLocationBuilder} declaration
   * @param {readonly string[]} files
   */
  constructor(declaration, files) {
    this.#declaration = declaration;
    this.#files = files;
  }

  // Each answer owns its files, as a parsed read answer does.
  /** @returns {IntentLocation & { files: string[] }} */
  please() {
    return { ...this.#declaration.please(), files: [...this.#files] };
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
