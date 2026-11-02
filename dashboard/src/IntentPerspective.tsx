// The Intent perspective of the selected project: Purpose reads configured
// test-source locations at the observed revision through the authenticated
// read boundary, and Proof shows the committed observations a location's
// proof holds (`./IntentBrowser.tsx`). Unusable locations and failed reads
// each keep their own explanation; remaining locations stay browseable. The
// reading strip (`./IntentModeTabs.tsx`) is drawn here, above those
// explanations, so CI status (`./IntentCiStatus.tsx`), which does not depend
// on Intent locations, is offered whatever their state. The chosen mode is
// kept by the page per project (`./pageIntentMode.tsx`).

import { useEffect, useRef, useState, type ReactNode } from "react";
import { agentSettingsPath } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  readIntentLocationsAt,
  type IntentLocations,
  type IntentSettingsProblem,
} from "./authenticatedIntentRead.ts";
import { IntentBrowser } from "./IntentBrowser.tsx";
import { IntentCiStatusPanel } from "./IntentCiStatus.tsx";
import {
  IntentModeTabs,
  intentModePanelId,
  intentModeTabId,
} from "./IntentModeTabs.tsx";
import { IntentWorkspaceSelectionProvider } from "./intentWorkspaceSelection.ts";
import { useIntentModeChoice, type ModeChoice } from "./pageIntentMode.tsx";
import { useStorySelection } from "./pageStorySelection.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import "./intent-perspective.css";
import "./intent-candidates.css";

function NotConfigured({ label }: { readonly label: string }) {
  return (
    <p className="intent-not-configured">
      No intent locations are configured for {label}. Add an{" "}
      <code>intent.locations</code> setting to <code>{agentSettingsPath}</code>{" "}
      to publish test-source folders for Intent to read.
    </p>
  );
}

function SettingsProblem({
  label,
  problem,
  onRetry,
}: {
  readonly label: string;
  readonly problem: IntentSettingsProblem;
  readonly onRetry: () => void;
}) {
  const explanation =
    problem === "malformed"
      ? `${agentSettingsPath} is not valid JSON, so Intent locations for ${label} could not be read.`
      : `${agentSettingsPath} could not be read, so Intent locations for ${label} are unavailable.`;
  return (
    <p className="intent-settings-problem" role="alert">
      {explanation}{" "}
      <button type="button" onClick={onRetry}>
        Retry
      </button>
    </p>
  );
}

function IntentBody({
  source,
  work,
  mode,
  modeIdPrefix,
  onModeChange,
}: {
  readonly source: PublishedSource;
  readonly work: PublishedWork | undefined;
} & ModeChoice) {
  const [intent, setIntent] = useState<IntentLocations | "loading" | "failed">(
    work === undefined ? { status: "not-configured" } : "loading",
  );
  const [locationsRetry, setLocationsRetry] = useState(0);
  const [proofRereading, setProofRereading] = useState(false);
  const proofReread = useRef<AbortController | undefined>(undefined);
  // Locations are read per revision: the published work's detail completing
  // at the same revision replaces `work`, but neither reads them again nor
  // remounts the browser and its selection.
  const revision = work?.revision;

  useEffect(() => {
    proofReread.current?.abort();
    proofReread.current = undefined;
    setProofRereading(false);
    if (revision === undefined) {
      setIntent({ status: "not-configured" });
      return;
    }
    const controller = new AbortController();
    setIntent("loading");
    void readIntentLocationsAt(source, revision, controller.signal)
      .then((locations) => {
        if (!controller.signal.aborted) setIntent(locations);
      })
      .catch(() => {
        if (!controller.signal.aborted) setIntent("failed");
      });
    return () => {
      controller.abort();
    };
  }, [source, revision, locationsRetry]);

  // A failed proof read is retried by reading the locations again in place:
  // the browser keeps its selection and Purpose, and only a configured
  // answer replaces the locations shown.
  const retryProof = (revision: string) => {
    proofReread.current?.abort();
    const controller = new AbortController();
    proofReread.current = controller;
    setProofRereading(true);
    void readIntentLocationsAt(source, revision, controller.signal)
      .then((locations) => {
        if (!controller.signal.aborted && locations.status === "configured") {
          setIntent(locations);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!controller.signal.aborted) setProofRereading(false);
      });
  };

  // An explanation in place of the locations browser, shown as the panel of
  // whichever location-reading mode is chosen.
  const shown = mode === "ci-status" ? "intent" : mode;
  const explained = (children: ReactNode) => (
    <div
      role="tabpanel"
      id={intentModePanelId(modeIdPrefix, shown)}
      aria-labelledby={intentModeTabId(modeIdPrefix, shown)}
      hidden={mode === "ci-status"}
    >
      {children}
    </div>
  );
  if (work === undefined || intent === "loading") {
    return explained(
      work === undefined ? (
        <NotConfigured label={source.label} />
      ) : (
        <p className="quiet">Reading Intent locations…</p>
      ),
    );
  }
  if (intent === "failed") {
    return explained(
      <p className="intent-settings-problem" role="alert">
        Intent locations for {source.label} could not be read at this revision.{" "}
        <button
          type="button"
          onClick={() => {
            setLocationsRetry((n) => n + 1);
          }}
        >
          Retry
        </button>
      </p>,
    );
  }
  if (intent.status === "not-configured") {
    return explained(<NotConfigured label={source.label} />);
  }
  if (intent.status === "settings-problem") {
    return explained(
      <SettingsProblem
        label={source.label}
        problem={intent.problem}
        onRetry={() => {
          setLocationsRetry((n) => n + 1);
        }}
      />,
    );
  }
  // Remount the selection owner on source/revision so tree and Purpose share
  // one cleared Intent selection for that identity.
  return (
    <IntentWorkspaceSelectionProvider key={`${source.id}:${work.revision}`}>
      <IntentBrowser
        source={source}
        revision={work.revision}
        locations={intent.locations}
        proofRereading={proofRereading}
        onProofRetry={() => {
          retryProof(work.revision);
        }}
        mode={mode}
        modeIdPrefix={modeIdPrefix}
        onModeChange={onModeChange}
      />
    </IntentWorkspaceSelectionProvider>
  );
}

export function IntentPerspective({
  source,
  work,
}: {
  readonly source: PublishedSource;
  readonly work: PublishedWork | undefined;
}) {
  // Intent reads the page's selected story; the comparison overlay uses this
  // identity once it lands.
  const { selectedIdentity } = useStorySelection(source.id);
  const { mode, modeIdPrefix, onModeChange } = useIntentModeChoice(source.id);
  return (
    <main
      className="intent-perspective"
      aria-label="Intent"
      {...(selectedIdentity !== undefined
        ? { "data-selected-story": selectedIdentity }
        : {})}
    >
      <IntentModeTabs
        mode={mode}
        idPrefix={modeIdPrefix}
        onSelect={onModeChange}
      />
      <IntentBody
        source={source}
        work={work}
        mode={mode}
        modeIdPrefix={modeIdPrefix}
        onModeChange={onModeChange}
      />
      <IntentCiStatusPanel
        source={source}
        revision={work?.revision}
        mode={mode}
        modeIdPrefix={modeIdPrefix}
      />
    </main>
  );
}
