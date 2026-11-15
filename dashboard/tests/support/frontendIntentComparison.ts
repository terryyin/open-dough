// Reuse the canonical mounted comparison answers at the full-app service edge.
// The Backend owns endpoint/run selection and acquisition.
import type { Page } from "@playwright/test";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import { serveComparison, summaryScopeFacts } from "./comparisonScopeFacts.ts";
import type {
  ComparisonReply,
  ComparisonServices,
} from "./comparisonMountPage.ts";

export async function answerFrontendIntentComparison(
  page: Page,
  facts: ReturnType<typeof summaryScopeFacts>,
) {
  const unarranged = (): ComparisonReply => {
    throw new Error("Unarranged comparison answer");
  };
  const services: Pick<ComparisonServices, "comparison" | "proof"> = {
    comparison: unarranged,
    proof: unarranged,
  };
  serveComparison(services, facts, facts.entries);
  await page.route(
    (url) =>
      url.pathname === authenticatedReadEndpoint &&
      ["ci-comparison", "ci-proof"].includes(
        url.searchParams.get("intent") ?? "",
      ),
    async (route) => {
      const params = new URL(route.request().url()).searchParams;
      let reply: ComparisonReply;
      if (params.get("intent") === "ci-comparison") {
        if (params.get("identity") !== facts.identity) {
          await route.fallback();
          return;
        }
        reply = await services.comparison(params);
      } else {
        const run = Number(params.get("run"));
        const endpoint = facts.proof(run);
        if (
          params.get("revision") !== endpoint.revision ||
          Number(params.get("attempt")) !== endpoint.runAttempt
        ) {
          throw new Error(`Unarranged comparison proof ${params.toString()}`);
        }
        reply = await services.proof(params);
      }
      await route.fulfill({ status: reply.status ?? 200, json: reply.json });
    },
  );
}
