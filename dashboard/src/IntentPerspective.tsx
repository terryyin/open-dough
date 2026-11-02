// The Intent perspective of the selected project: Purpose reads configured
// test-source locations at the observed revision through the authenticated
// read boundary, and Proof shows the committed observations a location's
// proof holds (`./IntentBrowser.tsx`). Unusable locations and failed reads
// each keep their own explanation; remaining locations stay browseable. With
// a story selected on the page, Intent names it and reads its default Review
// changes comparison (`./useIntentStoryLens.ts`), which the browser overlays
// on the published tree; the lens explains a comparison it cannot show
// (`./IntentStoryLens.tsx`).

import { useEffect, useRef, useState } from "react";
import { agentSettingsPath } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  readIntentLocationsAt,
  type IntentLocations,
  type IntentSettingsProblem,
} from "./authenticatedIntentRead.ts";
import { IntentBrowser } from "./IntentBrowser.tsx";
import { IntentWorkspaceSelectionProvider } from "./intentWorkspaceSelection.ts";
import { IntentStoryLens, type ComparedStory } from "./IntentStoryLens.tsx";
import type { LaunchRecord } from "./launchRecord.ts";
import type { LocalWorkspace } from "./localWorkspace.ts";
import { useStorySelection } from "./pageStorySelection.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import { useIntentStoryLens } from "./useIntentStoryLens.ts";
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
  story,
}: {
  readonly source: PublishedSource;
  readonly work: PublishedWork | undefined;
  readonly story: ComparedStory | undefined;
}) {
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

  if (work === undefined || intent === "loading") {
    return work === undefined ? (
      <NotConfigured label={source.label} />
    ) : (
      <p className="quiet">Reading Intent locations…</p>
    );
  }
  if (intent === "failed") {
    return (
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
      </p>
    );
  }
  if (intent.status === "not-configured") {
    return <NotConfigured label={source.label} />;
  }
  if (intent.status === "settings-problem") {
    return (
      <SettingsProblem
        label={source.label}
        problem={intent.problem}
        onRetry={() => {
          setLocationsRetry((n) => n + 1);
        }}
      />
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
        story={story}
      />
    </IntentWorkspaceSelectionProvider>
  );
}

export function IntentPerspective({
  source,
  work,
  records,
  workspaces,
}: {
  readonly source: PublishedSource;
  readonly work: PublishedWork | undefined;
  // This machine's kept launch records, unread until supplied, and the
  // worktrees local Git found holding a story's claim.
  readonly records: readonly LaunchRecord[] | undefined;
  readonly workspaces: readonly LocalWorkspace[];
}) {
  const { selectedIdentity } = useStorySelection(source.id);
  const { story, comparison, compared, retry } = useIntentStoryLens({
    source: source.id,
    work,
    selectedIdentity,
    records,
    workspaces,
  });
  return (
    <main
      className="intent-perspective"
      aria-label="Intent"
      {...(selectedIdentity !== undefined
        ? { "data-selected-story": selectedIdentity }
        : {})}
    >
      {story !== undefined && (
        <IntentStoryLens
          story={story}
          comparison={comparison}
          onRetry={retry}
        />
      )}
      <IntentBody source={source} work={work} story={compared} />
    </main>
  );
}
