// The Intent perspective of the selected project: Purpose reads configured
// test-source locations at the observed revision through the authenticated
// read boundary, and Proof shows the last successful proof a location's
// proof holds (`./IntentBrowser.tsx`). Unusable locations and failed reads
// each keep their own explanation; remaining locations stay browseable. The
// reading strip (`./IntentModeTabs.tsx`) is drawn here, above those
// explanations. CI status (`./IntentCiStatus.tsx`) is Intent's homepage when
// nothing is selected and is shown beside location explanations whether or
// not locations are configured. The chosen mode is kept by the page per
// project (`./pageIntentMode.tsx`). With a story selected on the page, Intent
// reads its default Review changes comparison (`./useIntentStoryLens.ts`),
// which the browser overlays on the published tree. The Intent reading mode
// names the story in one summary (`./IntentStorySummary.tsx`) heading the
// locations tree or, without one, the explanation in its place; Optimization
// Candidates shows none.

import { useState, type ReactNode } from "react";
import { agentSettingsPath } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import type { IntentSettingsProblem } from "./authenticatedIntentRead.ts";
import { IntentBrowser } from "./IntentBrowser.tsx";
import { IntentCiStatus } from "./IntentCiStatus.tsx";
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
  selectedIdentity,
  mode,
  modeIdPrefix,
  onModeChange,
  storySummary,
  story,
}: {
  readonly source: PublishedSource;
  readonly work: PublishedWork | undefined;
  readonly selectedIdentity: string | undefined;
  // The selected story as the Intent mode's summary names it, and with its
  // comparison once compared.
  readonly storySummary: StorySummary | undefined;
  readonly story: ComparedStory | undefined;
} & ModeChoice) {
  const { intent, retryLocations, proofRereading, retryProof } =
    useIntentLocations(source, work?.revision);

  // An explanation in place of the locations browser, shown as the panel of
  // whichever location-reading mode is chosen; the Intent mode's names the
  // selected story above it. CI status sits beside terminal location
  // explanations; it is omitted while locations are still loading so the
  // browser's empty-selection homepage does not remount a second judgment.
  const explained = (
    children: ReactNode,
    options: { readonly withCi: boolean } = { withCi: true },
  ) => (
    <div
      role="tabpanel"
      id={intentTabPanelId(modeIdPrefix, mode)}
      aria-labelledby={intentTabId(modeIdPrefix, mode)}
    >
      {mode === "intent" && storySummary !== undefined && (
        <IntentStorySummary summary={storySummary} />
      )}
      {children}
      {mode === "intent" && options.withCi ? (
        <IntentCiStatus
          source={source}
          work={work}
          selectedIdentity={selectedIdentity}
        />
      ) : null}
    </div>
  );
  if (work === undefined || intent === "loading") {
    // Withhold CI until locations settle: a cold Intent open can mount with
    // work still unread (NotConfigured placeholder), and mounting CI here
    // would judge once and again when the browser or terminal explanation
    // replaces it.
    return explained(
      work === undefined ? (
        <NotConfigured label={source.label} />
      ) : (
        <p className="quiet">Reading Intent locations…</p>
      ),
      { withCi: false },
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
        work={work}
        selectedIdentity={selectedIdentity}
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
        selectedIdentity={selectedIdentity}
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
    </main>
  );
}
