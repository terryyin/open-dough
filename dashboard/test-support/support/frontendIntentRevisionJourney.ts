// Whole-app revision stimulus with immutable answers, never a dashboard server.
import type { Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { FrontendServiceState } from "./frontendServiceState.ts";
import type { CatalogPublication } from "../catalogProjectRecords.ts";
import type {
  IntentLocation,
  IntentLocationsAnswer,
} from "../../server/intentLocationsRead.ts";
import { putFrontendIntentSources } from "./frontendIntentSources.ts";
import { installFrontendIntentRevisionAnswers } from "./frontendIntentRevisionAnswers.ts";
import { answerFrontendIntentCi } from "./frontendIntentCi.ts";
import { preholdRevisionStreamSlots } from "./revisionStreamSlots.ts";
import { untilPageReadsAnswered } from "../pageRequestNotes.ts";
import { pausePageClock, passTimeUntilChecked } from "../autoRefreshJourney.ts";
import { pygardon } from "../intentCodeBrowseFixtures.ts";
import { openJobsFeature } from "../intentRevisionJourney.ts";

function jobsLocations(files: Readonly<Record<string, string>>) {
  return [
    makeMe.anIntentLocation
      .at("e2e_test/features")
      .ofKind("gherkin")
      .selecting(
        ...Object.keys(files).filter((path) =>
          path.startsWith("e2e_test/features/"),
        ),
      )
      .please(),
  ];
}

export async function openWithFeatureSelected(
  page: Page,
  services: FrontendServiceState,
  files: Readonly<Record<string, string>>,
  additional?: {
    readonly project: CatalogPublication;
    readonly locations: readonly IntentLocation[];
    readonly files: Readonly<Record<string, string>>;
  },
) {
  await page.setViewportSize({ width: 1280, height: 600 });
  await pausePageClock(page);
  await preholdRevisionStreamSlots(page);
  putFrontendIntentSources(services, pygardon, jobsLocations(files), files);
  const answers = await installFrontendIntentRevisionAnswers(page, services);
  answers.publish({ project: pygardon, locations: services.locations, files });
  if (additional !== undefined) {
    answers.publish({
      ...additional,
      locations: {
        revision: additional.project.revision,
        locations: additional.locations,
      },
    });
  }
  await answerFrontendIntentCi(page, pygardon.revision);
  const { intent, feature, source } = await openJobsFeature(page);
  const moveTrunk = async (
    revision: string,
    moved: Readonly<Record<string, string>>,
    locations: IntentLocationsAnswer = {
      revision,
      locations: jobsLocations(moved),
    },
  ) => {
    answers.publish({
      project: { ...pygardon, revision },
      locations,
      files: moved,
    });
    await passTimeUntilChecked(page);
    await untilPageReadsAnswered(page);
  };
  return { moveTrunk, intent, feature, source };
}
