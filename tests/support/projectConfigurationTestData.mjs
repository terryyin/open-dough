// @ts-check
// Project configuration as a dashboard server keeps it: each configured
// project selects a published source, which browser and server read, and
// supplies the checkout this machine uses for it
// (../../dashboard/server/projectConfiguration.ts).

/** @typedef {import("../../dashboard/src/publishedSource.ts").PublishedSource} PublishedSource */
/** @typedef {import("../../dashboard/server/projectConfiguration.ts").ConfiguredProject} ConfiguredProject */

/**
 * The facts a test states for a published source; it reads
 * `.planning/PRODUCT-BACKLOG.md` on `main` unless the case states its backlog
 * path or ref.
 * @typedef {Omit<PublishedSource, "ref" | "backlogPath"> & Partial<Pick<PublishedSource, "ref" | "backlogPath">>} PublishedSourceFacts
 */

/** @param {PublishedSourceFacts} facts */
function publishedSource({
  ref = "main",
  backlogPath = ".planning/PRODUCT-BACKLOG.md",
  ...facts
}) {
  return { ...facts, ref, backlogPath };
}

export class PublishedSourceBuilder {
  /** @param {PublishedSourceFacts} facts */
  with(facts) {
    return { please: () => publishedSource(facts) };
  }
}

// A project this machine configures: the published source it reads and the
// checkout it uses here.
export class ConfiguredProjectBuilder {
  /** @param {PublishedSourceFacts & Pick<ConfiguredProject, "localPath">} facts */
  with({ localPath, ...source }) {
    return {
      /** @returns {ConfiguredProject} */
      please: () => ({ ...publishedSource(source), localPath }),
    };
  }
}
