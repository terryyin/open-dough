// Distinct object ids for mounted story-review records.

const oid = (n: number) => n.toString(16).padStart(40, "0");

export const frontendReviewIds = {
  baseline: oid(1),
  tree: oid(2),
  head: oid(3),
  commit: oid(4),
} as const;
