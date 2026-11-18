// Canonical status answers and actual browser query observations for activation.
import type { Page } from "@playwright/test";
import type { FrontendServiceState } from "./frontendServiceState.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { putFrontendIntentStory } from "./frontendIntentStory.ts";
import { putFrontendIntentSources } from "./frontendIntentSources.ts";
import { answerFrontendIntentChanges } from "./frontendIntentStory.ts";
import { answerFrontendIntentCi } from "./frontendIntentCi.ts";
import {
  serveFrontendCiStatus,
  storyBoardCiAnswers,
  judgedCiStatus,
} from "./frontendCiStatusAnswers.ts";
import { publishCiStoryBoard } from "./frontendServiceState.ts";
import { failing } from "../intentCiStoryBoard.ts";
import { openDough } from "../intentCodeBrowseFixtures.ts";
import { storyReviewEndpoint } from "../../src/storyReviewContract.ts";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";

export async function prepareActivationProject(
  page: Page,
  services: FrontendServiceState,
  files: Readonly<Record<string, string>>,
  revision = "4774f60",
) {
  putFrontendIntentSources(
    services,
    openDough,
    [
      makeMe.anIntentLocation
        .at("dashboard/tests")
        .ofKind("typescript", ["**/*.spec.ts"])
        .selecting("dashboard/tests/browse.spec.ts")
        .please(),
    ],
    files,
  );
  await answerFrontendIntentCi(page, services.revision);
  return serveFrontendCiStatus(page, {
    main: judgedCiStatus("main", "pass", revision, "Add login"),
  });
}

export async function prepareActivationStory(
  page: Page,
  services: FrontendServiceState,
  files: Readonly<Record<string, string>>,
) {
  const story = makeMe.aBacklogEntry
    .with({
      title: failing.title,
      identity: "SEED-219#failing",
      href: "seeds/SEED-219-story-ci.md#failing",
    })
    .please();
  putFrontendIntentStory(services, { story, branch: failing.branch });
  const status = await prepareActivationProject(page, services, {
    ...services.files,
    ...files,
  });
  publishCiStoryBoard(services);
  await answerFrontendIntentChanges(page, []);
  for (const [branch, answer] of Object.entries(storyBoardCiAnswers()))
    status.answer(branch, answer);
  const queries: {
    endpoint: string;
    intent: string | null;
    source: string | null;
    judged: string | null;
    identity: string | null;
    path: string | null;
    revision: string | null;
  }[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      ![authenticatedReadEndpoint, storyReviewEndpoint].includes(url.pathname)
    )
      return;
    queries.push({
      endpoint: url.pathname,
      identity: url.searchParams.get("identity"),
      path: url.searchParams.get("path"),
      revision: url.searchParams.get("revision"),
      intent: url.searchParams.get("intent"),
      source: url.searchParams.get("source"),
      judged: url.searchParams.get("judged"),
    });
  });
  return queries;
}
