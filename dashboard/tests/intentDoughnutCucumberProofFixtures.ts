// Committed Doughnut Cypress-Cucumber proof bytes and the feature text they
// observed, pinned for Intent's Doughnut proof regression
// (`./intent-doughnut-cucumber-proof.spec.ts`). The proof file is the same
// bytes as Doughnut `e2e_test/proof/20261102T030305438Z-d4182692-ae90-4ae0-981d-a993fec40c59.json`
// on `origin/main` at `6c045ccfd5` (Git blob `2f4f918bd3efe54e1cbf4b8c615a35bd0fb48a4e`);
// the live Intent read of project Doughnut owns first observation.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const fixtureRoot = fileURLToPath(
  new URL("./fixtures/doughnut-cucumber-proof/", import.meta.url),
);

export const noteCreationPath =
  "e2e_test/features/note_creation_and_update/note_creation.feature";
export const noteDeletionPath =
  "e2e_test/features/note_creation_and_update/note_deletion.feature";
export const proofDirectory = "e2e_test/proof";
export const proofFileName =
  "20261102T030305438Z-d4182692-ae90-4ae0-981d-a993fec40c59.json";
export const proofPath = `${proofDirectory}/${proofFileName}`;

export const noteCreationFeature = readFileSync(
  `${fixtureRoot}note_creation.feature`,
  "utf8",
);

export const committedProofJson = readFileSync(
  `${fixtureRoot}${proofFileName}`,
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
};

// Fixed "now" one hour after the last observation's finishedAt so every row
// floors to "1h ago" (earlier rows are a few seconds older than one hour).
export const observedAt = new Date("2026-11-02T04:03:28.015Z");

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

export const proofHeader = [
  "Scenario",
  "Latest outcome",
  "Duration",
  "Observed",
  "Commit",
  "Observed on",
] as const;
