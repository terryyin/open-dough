import type { FileComparisonRow } from "./intent-summary-comparison-page.ts";

export const modifiedFile = "dashboard/tests/folder/a.spec.ts";
export const addedFile = "dashboard/tests/added.spec.ts";
export const renamedFile = "dashboard/tests/renamed.spec.ts";
export const mergeEditedFile = "dashboard/tests/folder/nested/c.spec.ts";
export const unchangedFile = "dashboard/tests/root.spec.ts";

export const modifiedFileRow: FileComparisonRow = [
  "dashboard/tests/folder/a.spec.ts modified",
  "1 → 2 test cases (+1) → 1 test case (0)",
  "10.0 s",
  "+7.0 s",
  "+4.0 s",
];

export const addedFileRow: FileComparisonRow = [
  "dashboard/tests/added.spec.ts added",
  "added → 1 test case",
  "added",
  "800 ms",
  "800 ms",
];

export const renamedFileRow: FileComparisonRow = [
  "dashboard/tests/renamed.spec.ts renamed",
  "1 test file → 1 test case (different units)",
  "2.0 s (was tests/old.sh)",
  "2.1 s",
  "2.1 s",
];

export const mergeEditedFileRow: FileComparisonRow = [
  "dashboard/tests/folder/nested/c.spec.ts modified",
  "1 test case (no change)",
  "340 ms",
  "+70 ms",
  "+70 ms",
];

export const unchangedFileRow: FileComparisonRow = [
  "dashboard/tests/root.spec.ts",
  "1 test case (no change)",
  "1.2 s",
  "0 ms",
  "0 ms",
];
