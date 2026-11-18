// Development React's real StrictMode cleanup/setup, without an app build
// forcing production React and removing that lifecycle witness.
import { StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { useIntentCiComparison } from "../../src/useIntentCiComparison.ts";
import { useIntentCiComparisonEndpointProofs } from "../../src/useIntentCiComparisonEntries.ts";
import type { StrictCiReadingFacts } from "../support/strictCiReadingTypes.ts";

function Reading({ source, identity, answer }: StrictCiReadingFacts) {
  const comparison = useIntentCiComparison(source, identity);
  const proofs = useIntentCiComparisonEndpointProofs(
    source,
    answer,
    comparison.checkedAgain,
  );
  return (
    <>
      <button disabled={comparison.reading} onClick={comparison.checkAgain}>
        Check again
      </button>
      <output data-testid="comparison">
        {comparison.shown?.identity ?? comparison.failed ?? "reading"}
      </output>
      <output data-testid="proofs">
        {JSON.stringify([
          proofs?.baseline.kind,
          proofs?.branch.kind,
          proofs?.landed.kind,
        ])}
      </output>
    </>
  );
}

let root: Root | undefined;
window.mountStrictCiReading = (facts) => {
  const container = document.getElementById("root");
  if (container === null) throw new Error("No CI reading container");
  root = createRoot(container);
  root.render(
    <StrictMode>
      <Reading {...facts} />
    </StrictMode>,
  );
};
window.unmountStrictCiReading = () => {
  root?.unmount();
  root = undefined;
};
