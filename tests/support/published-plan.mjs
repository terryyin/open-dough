// @ts-check
// The shared plan reader has no writer. Encode ordinary arranged facts here;
// tests of exact syntax supply their own Markdown.

/** @typedef {import("../../dashboard/src/storyPlan.ts").PlanSlice} PlanSlice */
/** @typedef {Extract<import("../../dashboard/src/storyPlan.ts").PlanCompletion, { advice: string }>} PlanCompletion */
/** @typedef {{ slices: readonly PlanSlice[], completion?: PlanCompletion }} PlanProgress */

/** @param {PlanSlice} slice */
export function renderPlanSlice({
  index,
  name,
  type,
  status,
  proof,
  accepted,
}) {
  return [
    `### ${index}. ${name}`,
    `Type: ${type}`,
    `Status: ${status}`,
    ...(proof === undefined ? [] : [`Proof: ${proof}`]),
    ...(accepted === undefined ? [] : [`Accepted: ${accepted}`]),
  ].join("\n");
}

/**
 * @param {PlanProgress} progress
 * @param {{ preamble?: string, heading?: "Ordered slices" | "Slices" }} [document]
 */
export function renderSlicePlan(
  { slices, completion },
  { preamble = "# Plan", heading = "Ordered slices" } = {},
) {
  const sections = [preamble, `## ${heading}`, ...slices.map(renderPlanSlice)];
  if (completion !== undefined)
    sections.push(
      "## Execution complete",
      `Product advice: ${completion.advice}`,
    );
  return `${sections.join("\n\n")}\n`;
}
