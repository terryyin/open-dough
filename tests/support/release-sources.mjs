// @ts-check
// Release sources that several shell checks build through release-source.mjs.

/** @typedef {import("./release-source.mjs").ReleaseSourceFacts} ReleaseSourceFacts */

/** @type {Readonly<Record<string, ReleaseSourceFacts>>} */
export const releaseSources = {
  // The numerically latest release, 0.1.10, is tagged before 0.1.1 and 0.1.2,
  // under an untagged head whose VERSION is higher still.
  latest: {
    revisions: [
      {
        name: "release 0.1.1",
        release: {
          version: "0.1.1",
          taggedAt: "2026-06-01T00:00:00",
          marker: "payload-0.1.1",
        },
      },
      {
        name: "release 0.1.2",
        release: {
          version: "0.1.2",
          taggedAt: "2026-09-01T00:00:00",
          marker: "payload-0.1.2",
        },
      },
      {
        name: "release 0.1.10",
        release: {
          version: "0.1.10",
          taggedAt: "2020-01-01T00:00:00",
          marker: "payload-0.1.10",
        },
      },
      {
        name: "divergent branch head",
        files: { VERSION: "0.9.9\n", BRANCH_HEAD: "divergent-branch\n" },
      },
    ],
  },
};
