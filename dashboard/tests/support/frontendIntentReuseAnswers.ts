// Published service preconditions for whole-app reuse and held-selection proof.
import type { Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  putFrontendCandidates,
  type FrontendServiceState,
} from "./frontendServiceState.ts";
import { putFrontendIntentSources } from "./frontendIntentSources.ts";
import { installFrontendIntentRevisionAnswers } from "./frontendIntentRevisionAnswers.ts";
import { answerFrontendIntentCi } from "./frontendIntentCi.ts";
import { preholdRevisionStreamSlots } from "./revisionStreamSlots.ts";
import {
  pygardon,
  openDough,
  openDoughSettings,
} from "../intentCodeBrowseFixtures.ts";
import {
  featurePath,
  otherPath,
  publishedFeature,
  otherFeature,
} from "../intentJobsFeatureFixtures.ts";
import {
  openDoughSources,
  openDoughCandidatesRecord,
} from "../intentCandidatesFixtures.ts";

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

export async function prepareFrontendReuseCandidates(
  page: Page,
  services: FrontendServiceState,
) {
  putFrontendIntentSources(
    services,
    openDough,
    openDoughSettings.intent.locations.map((location) =>
      makeMe.anIntentLocation
        .at(location.path)
        .ofKind(
          location.path === "tests" ? "shell" : "typescript",
          location.path === "tests" ? ["*.sh"] : ["**/*.spec.ts"],
        )
        .selecting(
          ...Object.keys(openDoughSources).filter((path) =>
            path.startsWith(`${location.path}/`),
          ),
        )
        .please(),
    ),
    openDoughSources,
  );
  putFrontendCandidates(services, {
    revision: openDough.revision,
    candidates: openDoughCandidatesRecord,
  });
  await preholdRevisionStreamSlots(page);
  await answerFrontendIntentCi(page, openDough.revision);
}
