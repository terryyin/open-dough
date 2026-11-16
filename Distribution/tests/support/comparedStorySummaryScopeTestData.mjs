// @ts-check
// The Summary scope of a compared story (./comparedStoryTestData.mjs): its
// location, the files the story changed, and the per-file proof each endpoint
// published for them.
import { CiProofEntryBuilder } from "./ciProofEntryTestData.mjs";
import { CiProofEvidenceBuilder } from "./ciProofEvidenceTestData.mjs";
import { IntentLocationBuilder } from "./intentLocationTestData.mjs";
import { endpoints, revisions } from "./comparedStoryAnswerTestData.mjs";

/** @typedef {import("./comparedStoryEvidenceTestData.mjs").EndpointEntries} EndpointEntries */
/** @typedef {import("./comparedStoryEvidenceTestData.mjs").ComparisonScope} ComparisonScope */

// The Summary scope's files: one folder with a nested file, a root file, and
// an added, a deleted and a renamed spec, under `dashboard/tests` and `tests`.
/** @returns {EndpointEntries} */
export function summaryScopeEntries() {
  /** @param {string} path @param {number} durationMs */
  const file = (path, durationMs, passed = 1) => ({
    path,
    passed,
    durationMs,
  });
  return /** @type {EndpointEntries} */ (
    endpoints.map((at) => [
      new CiProofEntryBuilder()
        .at("dashboard/tests")
        .holding(
          new CiProofEvidenceBuilder()
            .brokenDown(
              at === "baseline"
                ? file("dashboard/tests/folder/a.spec.ts", 10_000)
                : at === "branch"
                  ? file("dashboard/tests/folder/a.spec.ts", 17_000, 2)
                  : file("dashboard/tests/folder/a.spec.ts", 14_000),
              file(
                "dashboard/tests/folder/nested/c.spec.ts",
                at === "baseline" ? 340 : 410,
              ),
              file("dashboard/tests/root.spec.ts", 1_200),
              ...(at === "baseline"
                ? [file("dashboard/tests/gone.spec.ts", 500)]
                : [
                    file("dashboard/tests/added.spec.ts", 800),
                    file("dashboard/tests/renamed.spec.ts", 2_100),
                  ]),
            )
            .please(),
        )
        .please(),
      new CiProofEntryBuilder()
        .at("tests")
        .holding(
          new CiProofEvidenceBuilder()
            .inUnit("file")
            .brokenDown(
              file("tests/check.sh", 500),
              ...(at === "baseline" ? [file("tests/old.sh", 2_000)] : []),
            )
            .please(),
        )
        .please(),
    ])
  );
}

/** @returns {ComparisonScope} */
export function summaryScope() {
  const location = new IntentLocationBuilder()
    .at("dashboard/tests")
    .ofKind("typescript", ["**/*.spec.ts"])
    .selecting(
      "dashboard/tests/folder/a.spec.ts",
      "dashboard/tests/folder/nested/c.spec.ts",
      "dashboard/tests/root.spec.ts",
      "dashboard/tests/added.spec.ts",
      "dashboard/tests/renamed.spec.ts",
    )
    .please();
  return {
    locations: [location],
    changed: [
      { kind: "modified", path: "dashboard/tests/folder/a.spec.ts" },
      { kind: "added", path: "dashboard/tests/added.spec.ts" },
      { kind: "deleted", path: "dashboard/tests/gone.spec.ts" },
      {
        kind: "renamed",
        path: "dashboard/tests/renamed.spec.ts",
        oldPath: "tests/old.sh",
      },
    ],
    revision: revisions[2],
    selection: { path: location.path, scope: "location" },
  };
}
