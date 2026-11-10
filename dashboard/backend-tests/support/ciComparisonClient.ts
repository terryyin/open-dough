// Drives public client owners; only external HTTP is replaced. This helper
// supplies no domain answer, key, selected subject, or expected result.
import { createCiComparisonReading } from "../../src/ciComparisonReading.ts";
import { createCiComparisonProofs } from "../../src/ciComparisonProofs.ts";
import { activeComparisonOf } from "../../src/storyCiComparisonWording.ts";
import { overallCountsWords } from "../../src/storyCiComparisonCountsWords.ts";
import type { PublishedSource } from "../../src/publishedSource.ts";
import { ciReadingTransport } from "./ciReadingTransport.ts";

export function ciComparisonClient(
  source: PublishedSource,
  answer: (
    query: URLSearchParams,
    index: number,
  ) => Promise<Response> | Response,
) {
  const transport = ciReadingTransport(answer);
  const comparison = createCiComparisonReading();
  const proofs = createCiComparisonProofs();
  return {
    comparison,
    proofs,
    requests: transport.requests,
    readProofs() {
      const state = comparison.getSnapshot();
      return proofs.select(source, state.shown, state.checkedAgain);
    },
    view() {
      const state = comparison.getSnapshot();
      const shown = state.shown;
      const endpoints = proofs.proofsFor(source, shown, state.checkedAgain);
      if (shown?.kind !== "comparison" || endpoints === undefined)
        return undefined;
      const active = activeComparisonOf(shown, endpoints);
      return {
        answer: shown,
        endpoints,
        active,
        counts: overallCountsWords(endpoints.baseline, active.proof),
      };
    },
    counts() {
      return {
        comparisons: transport.requests.filter(({ url }) =>
          url.includes("intent=ci-comparison"),
        ).length,
        proofs: transport.requests.filter(({ url }) =>
          url.includes("intent=ci-proof"),
        ).length,
      };
    },
    dispose() {
      comparison.dispose();
      proofs.dispose();
      transport.restore();
    },
  };
}
