// Independent orders distinguish absolute Baseline from signed later changes.
export const mountedSummarySortExpected = {
  baseline: {
    ascending: [
      "folder/",
      "renamed.spec.ts",
      "root.spec.ts",
      "added.spec.ts",
      "gone.spec.ts",
    ],
    descending: [
      "root.spec.ts",
      "renamed.spec.ts",
      "folder/",
      "added.spec.ts",
      "gone.spec.ts",
    ],
  },
  signed: {
    ascending: [
      "renamed.spec.ts",
      "folder/",
      "root.spec.ts",
      "added.spec.ts",
      "gone.spec.ts",
    ],
    descending: [
      "root.spec.ts",
      "folder/",
      "renamed.spec.ts",
      "added.spec.ts",
      "gone.spec.ts",
    ],
  },
} as const;
