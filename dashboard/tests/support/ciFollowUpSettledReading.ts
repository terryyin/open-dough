// The Intent reading of a settled automatic CI repeat with no receipt journey
// and no collecting dashboard: Story A's landing as a machine keeps it once
// its rerun request settled (./ciFollowUpPageLanding.ts), read by a page
// whose dashboard collects nothing (./landedCiReader.ts), so every CI fact
// the page shows is one the machine already kept.
import type { Page } from "@playwright/test";
import type { RepeatLandingFacts } from "./ciFollowUpKeptLanding.ts";
import { keepRepeatLandingForPage } from "./ciFollowUpPageLanding.ts";
import type { FakeGitHub } from "./fakeGitHub.ts";
import { publishIntentTrunk } from "./intentStoryWorktree.ts";
import { startLandedCiReader } from "./landedCiReader.ts";
import { queuedClaudePreviewTest as base } from "./preparationPage.ts";
import type { StartOrigin } from "./startOrigin.ts";

export { expect } from "./preparationPage.ts";

// The page's dashboard is the reader itself: no collecting dashboard runs on
// the machine before it or beside it.
export const test = base.extend({
  dashboard: async ({ github, origin }, use) => {
    const reader = await startLandedCiReader({ github }, origin, "preview");
    await use(reader);
    await reader.close();
  },
});

// Trunk with Intent's settings and sources, and Story A published as
// completed there with its landing kept beneath `page`
// (./ciFollowUpPageLanding.ts) at "settled request" as `facts` state, its
// full repeat having passed in `repeatSeconds`. Answers the story's
// completion.
export async function keepSettledRepeat(
  page: Page,
  origin: StartOrigin,
  github: FakeGitHub,
  facts: RepeatLandingFacts & { readonly repeatSeconds: number },
) {
  publishIntentTrunk(origin.project);
  return keepRepeatLandingForPage(page, origin, github, {
    ...facts,
    stage: "settled request",
  });
}

// The Actions requests the provider received so far, by kind: a reading that
// acquires no CI leaves them as they were.
export const actionsRequests = (github: FakeGitHub) =>
  github.calls.flatMap(({ request }) =>
    request.kind.startsWith("actions-") ? [request.kind] : [],
  );
