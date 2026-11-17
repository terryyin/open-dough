// Published service preconditions for whole-app reuse and held-selection proof.
import type { Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { FrontendServiceState } from "./frontendServiceState.ts";
import { putFrontendIntentSources } from "./frontendIntentSources.ts";
import { installFrontendIntentRevisionAnswers } from "./frontendIntentRevisionAnswers.ts";
import { answerFrontendIntentCi } from "./frontendIntentCi.ts";
import { preholdRevisionStreamSlots } from "./revisionStreamSlots.ts";
import { pygardon } from "../intentCodeBrowseFixtures.ts";
import {
  featurePath,
  otherPath,
  publishedFeature,
  otherFeature,
} from "../intentJobsFeatureFixtures.ts";

export async function prepareFrontendReuseJobs(
  page: Page,
  services: FrontendServiceState,
) {
  const files = { [featurePath]: publishedFeature, [otherPath]: otherFeature };
  putFrontendIntentSources(
    services,
    pygardon,
    [
      makeMe.anIntentLocation
        .at("e2e_test/features")
        .ofKind("gherkin")
        .selecting(featurePath, otherPath)
        .please(),
    ],
    files,
  );
  const answers = await installFrontendIntentRevisionAnswers(page, services);
  answers.publish({ project: pygardon, locations: services.locations, files });
  await preholdRevisionStreamSlots(page);
  await answerFrontendIntentCi(page, pygardon.revision);
}
