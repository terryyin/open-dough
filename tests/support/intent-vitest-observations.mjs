// Shared construction for the Vitest case-row tests: a passed observation
// of a case in one test file, named by its suite path as Vitest names it.
import { vitestCaseName } from "../../dashboard/src/vitestCaseNames.ts";

export const file = "web/tests/cart.spec.ts";

export const passed = (path, project) => ({
  file,
  name: vitestCaseName(path),
  ...(project === undefined ? {} : { variant: [project] }),
  outcome: "passed",
  attempts: 1,
  durationMs: 12.5,
  finishedAt: "2026-11-04T00:00:00.000Z",
  commit: "aaaaaaa1111",
  fileBlob: "blob",
});

export const lines = (...text) => text.join("\n");
export const namesOf = (rows) => rows.map(({ name }) => name);
