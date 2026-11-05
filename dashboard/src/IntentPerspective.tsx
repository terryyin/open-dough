// The Intent perspective of the selected project: Purpose reads configured
// test-source locations at the observed revision through the authenticated
// read boundary, and Proof shows the last successful proof a location's
// proof holds (`./IntentBrowser.tsx`). Unusable locations and failed reads
// each keep their own explanation; remaining locations stay browseable. The
// reading strip (`./IntentModeTabs.tsx`) is drawn here, above those
// explanations, so CI status (`./IntentCiStatus.tsx`), which does not depend
// on Intent locations, is offered whatever their state. The chosen mode is
// kept by the page per project (`./pageIntentMode.tsx`). With a story selected
// on the page, Intent reads its default Review changes comparison
// (`./useIntentStoryLens.ts`), which the browser overlays on the published
// tree. The Intent reading mode names the story in one summary
// (`./IntentStorySummary.tsx`) heading the locations tree or, without one,
// the explanation in its place; Optimization Candidates and CI status show
// none.

import { useState, type ReactNode } from "react";
import { agentSettingsPath } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import type { IntentSettingsProblem } from "./authenticatedIntentRead.ts";
import { IntentBrowser } from "./IntentBrowser.tsx";
import { IntentCiStatusPanel } from "./IntentCiStatus.tsx";
import { IntentModeTabs } from "./IntentModeTabs.tsx";
import { intentTabId, intentTabPanelId } from "./IntentTabs.tsx";
import { IntentWorkspaceSelectionProvider } from "./intentWorkspaceSelection.ts";
import {
  IntentStorySummary,
  type ComparedStory,
  type StorySummary,
} from "./IntentStorySummary.tsx";
import type { LaunchRecord } from "./launchRecord.ts";
import type { LocalWorkspace } from "./localWorkspace.ts";
import { useIntentModeChoice, type ModeChoice } from "./pageIntentMode.tsx";
import { useStorySelection } from "./pageStorySelection.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import { useIntentLocations } from "./useIntentLocations.ts";
import { useIntentStoryLens } from "./useIntentStoryLens.ts";
import "./intent-perspective.css";
import "./intent-proof.css";
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
  storySummary,
  story,
}: {
  readonly source: PublishedSource;
  readonly work: PublishedWork | undefined;
  // The selected story as the Intent mode's summary names it, and with its
  // comparison once compared.
  readonly storySummary: StorySummary | undefined;
  readonly story: ComparedStory | undefined;
} & ModeChoice) {
  const { intent, retryLocations, proofRereading, retryProof } =
    useIntentLocations(source, work?.revision);

  // An explanation in place of the locations browser, shown as the panel of
  // whichever location-reading mode is chosen; the Intent mode's names the
  // selected story above it.
  const shown = mode === "ci-status" ? "intent" : mode;
  const explained = (children: ReactNode) => (
    <div
      role="tabpanel"
      id={intentTabPanelId(modeIdPrefix, shown)}
      aria-labelledby={intentTabId(modeIdPrefix, shown)}
      hidden={mode === "ci-status"}
    >
      {mode === "intent" && storySummary !== undefined && (
        <IntentStorySummary summary={storySummary} />
      )}
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
  if ("failed" in intent) {
    return explained(
      <p className="intent-settings-problem" role="alert">
        Intent locations for {source.label} could not be read
        {intent.failed === undefined ? "." : `: ${intent.failed.message}`}{" "}
        <button type="button" onClick={retryLocations}>
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
        onRetry={retryLocations}
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
        storySummary={storySummary}
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
  // Intent reads the page's selected story: CI status judges its branch, and
  // the lens reads its comparison for the browser's overlay and the Intent
  // mode's summary.
  const { selectedIdentity } = useStorySelection(source.id);
  const { mode, modeIdPrefix, onModeChange } = useIntentModeChoice(source.id);
  const { story, comparison, compared, retry } = useIntentStoryLens({
    source,
    work,
    selectedIdentity,
    records,
    workspaces,
  });
  // The story whose summary is expanded; another story's starts collapsed.
  const [expandedStory, setExpandedStory] = useState<string | undefined>();
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
        storySummary={
          story === undefined
            ? undefined
            : {
                story,
                comparison,
                onRetry: retry,
                expanded: expandedStory === story.identity,
                onExpand: (expanded) => {
                  setExpandedStory(expanded ? story.identity : undefined);
                },
              }
        }
        story={compared}
      />
      <IntentCiStatusPanel
        source={source}
        work={work}
        selectedIdentity={selectedIdentity}
        mode={mode}
        modeIdPrefix={modeIdPrefix}
      />
    </main>
  );
}
