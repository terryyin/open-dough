// Committed Doughnut Cypress-Cucumber proof bytes and the feature text they
// observed, pinned for Intent's Doughnut proof regression
// (`./intent-doughnut-cucumber-proof.spec.ts`). Note-creation proof matches
// Doughnut `e2e_test/proof/20261102T030305438Z-d4182692-ae90-4ae0-981d-a993fec40c59.json`
// on `origin/main` at `6c045ccfd5` (Git blob `2f4f918bd3efe54e1cbf4b8c615a35bd0fb48a4e`).
// Outline proof matches
// `e2e_test/proof/20261102T064803493Z-e248a161-1d96-4341-b228-5e2723cdd0d3.json`
// on Doughnut main via PR #1651 (Git blob `90ca341db4…`).
// Retry-assisted proof matches
// `e2e_test/proof/20261102T070001761Z-49dd375b-a1e7-46d9-a5b1-5a67b567e939.json`
// on Doughnut main via PR #1652 (Git blob `c20e0ed517…`). Live Intent on
// project Doughnut owns first observation of each published file.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const fixtureRoot = fileURLToPath(
  new URL("./fixtures/doughnut-cucumber-proof/", import.meta.url),
);

export const noteCreationPath =
  "e2e_test/features/note_creation_and_update/note_creation.feature";
export const noteDeletionPath =
  "e2e_test/features/note_creation_and_update/note_deletion.feature";
export const accountControlPath =
  "e2e_test/features/users/account_control.feature";
export const cypressRetryPath =
  "e2e_test/features/testability/cypress_retry.feature";
export const proofDirectory = "e2e_test/proof";
export const proofFileName =
  "20261102T030305438Z-d4182692-ae90-4ae0-981d-a993fec40c59.json";
export const outlineProofFileName =
  "20261102T064803493Z-e248a161-1d96-4341-b228-5e2723cdd0d3.json";
export const retryProofFileName =
  "20261102T070001761Z-49dd375b-a1e7-46d9-a5b1-5a67b567e939.json";
export const proofPath = `${proofDirectory}/${proofFileName}`;
export const outlineProofPath = `${proofDirectory}/${outlineProofFileName}`;
export const retryProofPath = `${proofDirectory}/${retryProofFileName}`;

export const noteCreationFeature = readFileSync(
  `${fixtureRoot}note_creation.feature`,
  "utf8",
);

export const accountControlFeature = readFileSync(
  `${fixtureRoot}account_control.feature`,
  "utf8",
);

export const cypressRetryFeature = readFileSync(
  `${fixtureRoot}cypress_retry.feature`,
  "utf8",
);

export const committedProofJson = readFileSync(
  `${fixtureRoot}${proofFileName}`,
  "utf8",
);

export const committedOutlineProofJson = readFileSync(
  `${fixtureRoot}${outlineProofFileName}`,
  "utf8",
);

export const committedRetryProofJson = readFileSync(
  `${fixtureRoot}${retryProofFileName}`,
  "utf8",
);

// One sibling feature with no observations in the committed run file, so
// Intent can show Not observed beside Purpose for an unobserved file.
export const noteDeletionFeature = `Feature: Note deletion
  Scenario: Trash a note
    Given a notebook with a note
    When I trash the note
    Then it is in trash
`;

export const doughnutProofSettings = JSON.stringify(
  {
    intent: {
      locations: [
        {
          path: "e2e_test/features",
          kind: "gherkin",
          proof: proofDirectory,
        },
      ],
    },
  },
  null,
  2,
);

export const proofFiles = {
  [proofPath]: committedProofJson,
  [outlineProofPath]: committedOutlineProofJson,
  [retryProofPath]: committedRetryProofJson,
};

// Fixed "now" one hour after the last note-creation observation's finishedAt
// so every note-creation row floors to "1h ago".
export const observedAt = new Date("2026-11-02T04:03:28.015Z");

// Fixed "now" one hour after the last account_control outline observation.
export const outlineObservedAt = new Date("2026-11-02T07:48:10.993Z");

// Fixed "now" one hour after the retry-assisted observation's finishedAt.
export const retryObservedAt = new Date("2026-11-02T08:00:03.719Z");

export const expectedNoteCreationRows = [
  [
    "Create a new note under a folder in a notebook",
    "Passed",
    "5.9 s",
    "1h ago",
    "d648487",
    "This file version",
  ],
  [
    "Create a note with empty title is rejected",
    "Passed",
    "1.8 s",
    "1h ago",
    "d648487",
    "This file version",
  ],
  [
    "Create a note with an OS-invalid title is rejected",
    "Passed",
    "1.7 s",
    "1h ago",
    "d648487",
    "This file version",
  ],
  [
    "Undo creating a new note",
    "Passed",
    "2.2 s",
    "1h ago",
    "d648487",
    "This file version",
  ],
  [
    "Create a folder at notebook root",
    "Passed",
    "1.6 s",
    "1h ago",
    "d648487",
    "This file version",
  ],
  [
    "Creating a folder named index does not warn",
    "Passed",
    "1.7 s",
    "1h ago",
    "d648487",
    "This file version",
  ],
  [
    "Create a nested folder under an existing folder",
    "Passed",
    "1.7 s",
    "1h ago",
    "d648487",
    "This file version",
  ],
  [
    "Create note under current note as parent",
    "Passed",
    "1.9 s",
    "1h ago",
    "d648487",
    "This file version",
  ],
  [
    "Creating a note titled index warns and still saves",
    "Passed",
    "1.6 s",
    "1h ago",
    "d648487",
    "This file version",
  ],
] as const;

export const expectedAccountControlRows = [
  [
    "Only admins can open failure reports Example: none | sign in",
    "Passed",
    "4.1 s",
    "1h ago",
    "796b350",
    "This file version",
  ],
  [
    "Only admins can open failure reports Example: admin | failure reports",
    "Passed",
    "1.1 s",
    "1h ago",
    "796b350",
    "This file version",
  ],
  [
    "Only admins can open failure reports Example: non_admin | access denied",
    "Passed",
    "909 ms",
    "1h ago",
    "796b350",
    "This file version",
  ],
] as const;

export const expectedCypressRetryRows = [
  [
    "Retry succeeds",
    "Passed after retry (2 attempts)",
    "792 ms",
    "1h ago",
    "6a8a34e",
    "This file version",
  ],
] as const;

export const proofHeader = [
  "Scenario",
  "Latest outcome",
  "Duration",
  "Observed",
  "Commit",
  "Observed on",
] as const;
