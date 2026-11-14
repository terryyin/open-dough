// @ts-check
// The retained resolution of one landing observation.
/** @typedef {import("../../../dashboard/server/landedCiHistoryStore.ts").ProjectHistory} ProjectHistory */

export class LandedCiResolutionBuilder {
  /** @type {import("../../../dashboard/server/landedCiHistoryStore.ts").LandedResolution} */
  #resolution = {
    kind: "build",
    state: "pass",
    revision: "a".repeat(40),
    subject: "CI build",
    selection: "exact",
    laterWithoutResult: 0,
  };
  /** @param {ProjectHistory["builds"][string]} build @param {"exact"|"equivalent"|"later"} [selection] */
  measuring(build, selection = "exact") {
    const measured = Object.fromEntries(
      Object.entries(build).filter(
        ([key, value]) => key !== "proof" && value !== undefined,
      ),
    );
    this.#resolution = {
      kind: "build",
      subject: "CI build",
      laterWithoutResult: 0,
      ...measured,
      revision: build.revision,
      state: build.state,
      selection,
    };
    return this;
  }
  /** @returns {import("../../../dashboard/server/landedCiHistoryStore.ts").LandedResolution} */
  please() {
    return structuredClone(this.#resolution);
  }
}
