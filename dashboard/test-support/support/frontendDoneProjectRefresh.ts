// Whole-app refresh stimulus: the next revision check reports a later project
// publication. The Done fixture's immutable completion answers stay independent.
import type { Page } from "@playwright/test";
import type { FrontendServiceState } from "./frontendServiceState.ts";
import { passTimeUntilChecked } from "../autoRefreshJourney.ts";
import { untilPageReadsAnswered } from "../pageRequestNotes.ts";

export async function advanceFrontendDoneProject(
  page: Page,
  services: FrontendServiceState,
) {
  const revision = "e5".repeat(20);
  Object.assign(services, {
    revision,
    files: {
      ...services.files,
      ".planning/later-planning.md": "A later project planning update.\n",
    },
    locations: { ...services.locations, revision },
  });
  await passTimeUntilChecked(page);
  await untilPageReadsAnswered(page);
  return revision;
}
