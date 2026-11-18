// Reuse the canonical mounted comparison answers at the full-app service edge.
// The Backend owns endpoint/run selection and acquisition.
import type { Page } from "@playwright/test";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import type { ComparedStory } from "../../../Distribution/tests/support/comparedStoryTestData.mjs";

// Answers `story`'s comparison read, and each run's proof read with the
// entries the story states for that endpoint.
export async function answerFrontendIntentComparison(
  page: Page,
  story: ComparedStory,
) {
  await page.route(
    (url) =>
      url.pathname === authenticatedReadEndpoint &&
      ["ci-comparison", "ci-proof"].includes(
        url.searchParams.get("intent") ?? "",
      ),
    async (route) => {
      const params = new URL(route.request().url()).searchParams;
      if (params.get("intent") === "ci-comparison") {
        if (params.get("identity") !== story.identity) {
          await route.fallback();
          return;
        }
        await route.fulfill({ json: story.answer });
        return;
      }
      const run = Number(params.get("run"));
      const endpoint = story.proof(run);
      if (
        params.get("revision") !== endpoint.revision ||
        Number(params.get("attempt")) !== endpoint.runAttempt
      ) {
        throw new Error(`Unarranged comparison proof ${params.toString()}`);
      }
      await route.fulfill({ json: story.entryProof(run) });
    },
  );
}
