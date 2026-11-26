// What the dashboard says of a story's changes it cannot show yet or at all:
// the comparison's own status and, in the same words, why Changes only does
// not narrow the Files sidebar.
import type { LensComparison } from "./IntentStoryComparison.tsx";

export const storyChangesGapWords = {
  reading: "Reading the story's changes…",
  unavailable: "No comparison is available.",
  failed: "The story's changes could not be read.",
  unreadable: "The chosen changes could not be read.",
} as const;

// Why the story's comparison cannot narrow the Files sidebar now.
export function unappliedChanges(comparison: LensComparison | undefined) {
  if (comparison === undefined || comparison.state === "compared")
    return undefined;
  const words = storyChangesGapWords[comparison.state];
  return `Not applied: ${words.charAt(0).toLowerCase()}${words.slice(1)}`;
}
