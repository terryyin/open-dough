// Story A's landing as a machine keeps it (./ciFollowUpKeptLanding.ts),
// beneath a page that reads the repository itself: the page's own reads
// follow the origin's `main` (../committedOrigin.ts), and the provider
// answers for the landing's run over them.
import type { Page } from "@playwright/test";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import {
  keepRepeatLanding,
  type RepeatLandingFacts,
} from "./ciFollowUpKeptLanding.ts";
import type { AtStage } from "./ciFollowUpRepeatStage.ts";
import type { FakeGitHub } from "./fakeGitHub.ts";
import { originMain } from "./sessionDialog.ts";
import type { StartOrigin } from "./startOrigin.ts";

// The page's reads of the repository following the origin's `main`, which
// holds Story A published as completed, then the story's landing kept as
// `facts` state. Answers the provider's facts by run, and the story's
// completion.
export async function keepRepeatLandingForPage(
  page: Page,
  origin: StartOrigin,
  github: FakeGitHub,
  facts: RepeatLandingFacts & AtStage,
) {
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: await originMain(origin),
    repository: "terryyin/open-dough",
    follows: true,
    realHistory: true,
  });
  return keepRepeatLanding(origin, github, {
    ...facts,
    otherwise: "as served before",
  });
}
