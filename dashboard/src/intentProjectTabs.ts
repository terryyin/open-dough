// Project Intent's applicable views in the shared Intent page. Directly
// activating CI status returns home; keyboard tab choice keeps the reading.
import type { IntentTabOption } from "./IntentTabs.tsx";

export type IntentMode = "ci" | "candidates";

export const projectTabs: readonly IntentTabOption<IntentMode>[] = [
  { value: "ci", label: "CI status" },
  { value: "candidates", label: "Optimization Candidates" },
];

export const backToStoryId = (idPrefix: string) => `${idPrefix}-to-story`;
