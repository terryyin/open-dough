// Published Intent locations for the summary proof-cost journey
// (`./intent-summary-proof-cost.spec.ts`): a Doughnut-like Gherkin location
// of nine feature files whose committed proof mixes times, commits, a retried
// row, and scenarios without successful proof, plus a packaged location with
// one observation.

import { filesOf } from "./catalogProjectRecords.ts";
import { gitBlobSha } from "./listingAnswers.ts";
import { doughnut } from "./intentEntryFolderSummariesFixtures.ts";

export { doughnut };

export const featuresPath = "e2e_test/features";
export const packagedPath = "e2e_test/packaged/features";
const notebookPath = `${featuresPath}/cli/cli_notebook_lfs.feature`;
const loginPath = `${featuresPath}/cli/cli_login.feature`;
const helpPath = `${featuresPath}/cli/cli_help.feature`;
const recallNotePath = `${featuresPath}/recall/recall_note.feature`;
const recallAgainPath = `${featuresPath}/recall/recall_again.feature`;
const recallMorePath = `${featuresPath}/recall/recall_more.feature`;
const assessPath = `${featuresPath}/assessment/assess.feature`;
const assessMorePath = `${featuresPath}/assessment/assess_more.feature`;
export const topPath = `${featuresPath}/top.feature`;
const packagedFeaturePath = `${packagedPath}/packaged.feature`;
const proofPath = "e2e_test/proof/latest.json";
export const laterRunPath = "e2e_test/proof/20261102T114500Z-cli-login.json";

const feature = (name: string, body: string) => `Feature: ${name}\n${body}`;
const scenarios = (...names: string[]) =>
  names.map((name) => `  Scenario: ${name}\n    Given ${name}\n`).join("");

const features: Readonly<Record<string, string>> = {
  [notebookPath]: feature(
    "Notebook LFS",
    `${scenarios("Push a large notebook", "Pull a notebook")}  Scenario Outline: Sync <size>
    Given a <size> notebook
    Examples:
      | size |
      | 1MB  |
      | 5MB  |
`,
  ),
  [loginPath]: feature("Login", scenarios("Log in", "Log out")),
  [helpPath]: feature("Help", scenarios("Show help")),
  [recallNotePath]: feature("Recall", scenarios("Recall", "Recall later")),
  [recallAgainPath]: feature("Recall again", scenarios("Recall again")),
  [recallMorePath]: feature("Recall more", scenarios("Recall more")),
  [assessPath]: feature("Assess", scenarios("Assess", "Reassess")),
  [assessMorePath]: feature("Assess more", scenarios("Assess more")),
  [topPath]: feature("Top", scenarios("Top level")),
};

const packagedFeature = feature(
  "Packaged",
  scenarios("Packaged case", "Packaged other"),
);

const commitA = "a1".repeat(20);
const commitB = "b2".repeat(20);
const commitC = "c3".repeat(20);
const commitD = "d4".repeat(20);

const observed = (
  path: string,
  text: string,
  scenario: string,
  durationMs: number,
  finishedAt: string,
  commit: string,
  more: {
    readonly example?: readonly string[];
    readonly attempts?: number;
  } = {},
) => ({
  feature: path,
  scenario,
  ...(more.example === undefined ? {} : { example: more.example }),
  outcome: "passed",
  attempts: more.attempts ?? 1,
  durationMs,
  finishedAt,
  commit,
  featureBlob: gitBlobSha(text),
});

const proofFile = (observations: readonly Record<string, unknown>[]) =>
  `${JSON.stringify({ version: 1, observations }, null, 2)}\n`;

const at = (time: string) => `2026-11-02T${time}:00.000Z`;
const of = (path: string) => features[path] ?? "";

// cli: 12 s retried + 3 s outline row + 1.5 s + 0.5 s = 17.0 s over 4 of 7;
// assessment: 4 s + 2.5 s = 6.5 s over 2 of 3; recall and top unproven.
// Location: 23.5 s over 6 of 15, 04:52 to 10:30 UTC, from 3 commits.
const latestProof = proofFile([
  observed(
    notebookPath,
    of(notebookPath),
    "Push a large notebook",
    12_000,
    at("04:52"),
    commitA,
    { attempts: 2 },
  ),
  observed(
    notebookPath,
    of(notebookPath),
    "Sync <size>",
    3000,
    at("06:10"),
    commitB,
    { example: ["1MB"] },
  ),
  observed(loginPath, of(loginPath), "Log in", 1500, at("06:10"), commitB),
  observed(loginPath, of(loginPath), "Log out", 500, at("08:00"), commitC),
  observed(assessPath, of(assessPath), "Assess", 4000, at("10:30"), commitC),
  observed(
    assessMorePath,
    of(assessMorePath),
    "Assess more",
    2500,
    at("09:00"),
    commitA,
  ),
]);

// A later focused recording of cli_login.feature only: 0.9 s + 0.7 s.
export const laterLoginProof = proofFile([
  observed(loginPath, of(loginPath), "Log in", 900, at("11:45"), commitD),
  observed(loginPath, of(loginPath), "Log out", 700, at("11:45"), commitD),
]);

const packagedProof = proofFile([
  observed(
    packagedFeaturePath,
    packagedFeature,
    "Packaged case",
    800,
    at("07:15"),
    commitB,
  ),
]);

const settings = JSON.stringify(
  {
    intent: {
      locations: [
        { path: featuresPath, kind: "gherkin", proof: "e2e_test/proof" },
        {
          path: packagedPath,
          kind: "gherkin",
          proof: "e2e_test/packaged/proof",
        },
      ],
    },
  },
  null,
  2,
);

export const publishedFiles: Readonly<Record<string, string>> = {
  ...filesOf(doughnut),
  ".planning/open-dough.json": `${settings}\n`,
  ...features,
  [packagedFeaturePath]: packagedFeature,
  [proofPath]: latestProof,
  "e2e_test/packaged/proof/latest.json": packagedProof,
};
