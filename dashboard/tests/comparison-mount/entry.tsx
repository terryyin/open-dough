import { createRoot, type Root } from "react-dom/client";
import {
  IntentReadingProvider,
  IntentReadingPlace,
  IntentReadingScope,
} from "../../src/pageIntentReading.tsx";
import { IntentCiComparisonPreference } from "../../src/IntentCiComparisonPreference.tsx";
import { IntentCiEvidenceProvider } from "../../src/IntentCiEvidence.tsx";
import { IntentCiStatus } from "../../src/IntentCiStatus.tsx";
import { ComparisonMountScope } from "./scope.tsx";
import type {
  ComparisonMount,
  ComparisonSelection,
} from "../support/comparisonMountTypes.ts";
import "../../src/intent-page.css";

let root: Root | undefined;
let update: ((selection: ComparisonSelection) => void) | undefined;
window.mountCiComparison = ({
  source,
  work,
  identity,
  scope,
  doneEndpoint,
  shown,
}: ComparisonMount) => {
  const container = document.getElementById("root");
  if (container === null) {
    throw new Error("No comparison mount container");
  }
  root ??= createRoot(container);
  const mountedRoot = root;
  update = (selection) => {
    mountedRoot.render(
      <IntentReadingProvider project={source.id}>
        <IntentReadingPlace project={source.id} story={selection.identity}>
          <IntentReadingScope
            name={selection.identity === undefined ? "project" : "story"}
          >
            <IntentCiComparisonPreference>
              {selection.shown !== false && (
                <IntentCiEvidenceProvider
                  source={source}
                  work={selection.work}
                  selectedIdentity={selection.identity}
                  active
                  {...(selection.doneEndpoint === undefined
                    ? {}
                    : { doneEndpoint: selection.doneEndpoint })}
                >
                  {selection.scope === undefined ? (
                    <IntentCiStatus />
                  ) : (
                    <ComparisonMountScope
                      key={selection.identity}
                      facts={selection.scope}
                    />
                  )}
                </IntentCiEvidenceProvider>
              )}
            </IntentCiComparisonPreference>
          </IntentReadingScope>
        </IntentReadingPlace>
      </IntentReadingProvider>,
    );
  };
  update({
    work,
    identity,
    scope,
    ...(shown === undefined ? {} : { shown }),
    ...(doneEndpoint === undefined ? {} : { doneEndpoint }),
  });
};
window.updateCiComparison = (selection) => {
  if (update === undefined) {
    throw new Error("No comparison is mounted");
  }
  update(selection);
};
window.unmountCiComparison = () => {
  root?.unmount();
  root = undefined;
  update = undefined;
};
