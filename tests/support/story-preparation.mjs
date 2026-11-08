// @ts-check
/** @typedef {Parameters<typeof import("../../src/skills/dough-product-backlog/scripts/product-backlog-story-state-home.mjs").recordPreparation>[1]} Request */

/**
 * The CLI spells the canonical home as --link and flattens the expected basis.
 * @param {Pick<Request, "identity" | "href">} story
 * @param {Omit<Request, "identity" | "href">} facts
 */
export function recordPreparationArgs(story, facts) {
  const args = [
    "record-state",
    "--identity",
    story.identity,
    "--link",
    story.href,
    "--refinement",
    facts.refinement,
    "--approach",
    facts.approach,
  ];
  if (facts.plan !== undefined) args.push("--plan", facts.plan);
  if (facts.assessment !== undefined)
    args.push("--assessment", facts.assessment);
  if (facts.expectedBasis?.document !== undefined)
    args.push("--expect-document", facts.expectedBasis.document);
  if (facts.expectedBasis?.plan !== undefined)
    args.push("--expect-plan", facts.expectedBasis.plan);
  for (const reason of facts.reasons ?? []) args.push("--reason", reason);
  return args;
}
