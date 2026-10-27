// Session attention changes listed by the synthetic Claude host. The journey
// in agent-launch-session-state-pace.spec.ts performs the starts and observes
// these changes in the real page, one records-read pace at a time.
import { notRefinedStory, readyStory } from "./launchJourney.ts";
import type { ClaudeSessionChange } from "./support/fakeClaude.ts";

// A host change, with what a blocked session waits for, if it says, and what
// the entry shows then.
type AttentionChange = {
  readonly change: ClaudeSessionChange;
  readonly waitingFor?: string;
  readonly shows: string;
  readonly needsAttention: boolean;
};

// Newest first once launched, each with the two changes its session
// undergoes in turn. One open session per story.
export const attentionLaunches: readonly {
  title: string;
  workflow: "Execution" | "Refinement";
  changes: readonly [AttentionChange, AttentionChange];
}[] = [
  {
    title: notRefinedStory,
    workflow: "Execution",
    changes: [
      {
        change: "blocked",
        waitingFor: "permission to run npm test",
        shows: "Needs input: permission to run npm test",
        needsAttention: true,
      },
      { change: "stopped", shows: "Session stopped", needsAttention: true },
    ],
  },
  {
    title: readyStory,
    workflow: "Refinement",
    changes: [
      {
        change: "done-live",
        shows: "Ready for review",
        needsAttention: true,
      },
      {
        change: "forgotten",
        shows: "Session unavailable",
        needsAttention: false,
      },
    ],
  },
];
