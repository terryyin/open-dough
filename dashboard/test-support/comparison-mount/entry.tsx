import { createRoot, type Root } from "react-dom/client";
import {
  IntentReadingProvider,
  IntentReadingPlace,
  IntentReadingScope,
} from "../../src/pageIntentReading.tsx";
import { IntentCiComparisonPreference } from "../../src/IntentCiComparisonPreference.tsx";
import { IntentCiEvidenceProvider } from "../../src/IntentCiEvidence.tsx";
import { IntentCiStatus } from "../../src/IntentCiStatus.tsx";
import {
  authenticatedPageReads,
  PageReadsOnPage,
} from "../../src/pageReads.tsx";
import { ComparisonMountScope } from "./scope.tsx";
import type { ComparisonMount } from "../support/comparisonMountTypes.ts";
import "../../src/intent-page.css";

let root: Root | undefined;
window.mountCiComparison = ({
  source,
  work,
  identity,
  scope,
  doneEndpoint,
}: ComparisonMount) => {
  const container = document.getElementById("root");
  if (container === null) {
    throw new Error("No comparison mount container");
  }
  root ??= createRoot(container);
  root.render(
    <PageReadsOnPage reads={authenticatedPageReads}>
      <IntentReadingProvider project={source.id}>
        <IntentReadingPlace project={source.id} story={identity}>
          <IntentReadingScope
            name={identity === undefined ? "project" : "story"}
          >
            <IntentCiComparisonPreference>
              <IntentCiEvidenceProvider
                source={source}
                work={work}
                selectedIdentity={identity}
                active
                {...(doneEndpoint === undefined ? {} : { doneEndpoint })}
              >
                {scope === undefined ? (
                  <IntentCiStatus />
                ) : (
                  <ComparisonMountScope key={identity} facts={scope} />
                )}
              </IntentCiEvidenceProvider>
            </IntentCiComparisonPreference>
          </IntentReadingScope>
        </IntentReadingPlace>
      </IntentReadingProvider>
    </PageReadsOnPage>,
  );
};
window.unmountCiComparison = () => {
  root?.unmount();
  root = undefined;
};
