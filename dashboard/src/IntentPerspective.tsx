// The Intent perspective of the selected project: Purpose reads configured
// test-source locations at Intent's reading revision, behind whose notice a
// newer observed revision waits (`./IntentRevisionNotice.tsx`), through the
// authenticated read boundary (`./IntentBrowser.tsx`); CI status follows the
// observed work. Unusable locations (`./IntentLocationsUnavailable.tsx`) and
// failed reads each keep their own explanation; remaining locations stay
// browseable. The reading strip (`./IntentModeTabs.tsx`) is drawn here, above
// those explanations. CI status (`./IntentCiStatus.tsx`) is Intent's homepage
// when nothing is selected and is shown beside location explanations whether
// or not locations are configured. The chosen mode is kept by the page per
// project (`./pageIntentMode.tsx`), and so is the reading place: the
// selection, the tree's arrangement and the reading pane's scroll
// (`./pageIntentReading.tsx`), mounted again for each project. With a story
// selected on the page, Intent reads its default Review changes comparison
// (`./useIntentStoryLens.ts`), which the browser overlays on the published
// tree. The Intent reading mode names the story in one summary
// (`./IntentStorySummary.tsx`) heading the locations tree or, without one,
// the explanation in its place; Optimization Candidates shows none.

import { useState, type ReactNode } from "react";
import { IntentBrowser } from "./IntentBrowser.tsx";
import { IntentCiStatus } from "./IntentCiStatus.tsx";
import {
  LocationsNotConfigured,
  LocationsSettingsProblem,
} from "./IntentLocationsUnavailable.tsx";
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
import { IntentReadingPlace } from "./pageIntentReading.tsx";
import {
  IntentRevisionNotice,
  useIntentReadingRevision,
} from "./IntentRevisionNotice.tsx";
import { useStorySelection } from "./pageStorySelection.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import { useIntentLocations } from "./useIntentLocations.ts";
import { useIntentStoryLens } from "./useIntentStoryLens.ts";
import "./intent-perspective.css";
import "./intent-candidates.css";

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
  // A newer observed revision waits behind the notice until **Show latest**.
  const observed = work?.revision;
  const { reading, showLatest } = useIntentReadingRevision(observed);
  const { intent, shownRevision, updating, failedUpdate, retryLocations } =
    useIntentLocations(source, reading);
  const notice = (
    <IntentRevisionNotice
      shown={shownRevision}
      observed={observed}
      updating={updating}
      failedUpdate={failedUpdate}
      onShowLatest={showLatest}
      onRetry={retryLocations}
    />
  );

  // An explanation in place of the locations browser, shown as the panel of
  // whichever location-reading mode is chosen, which takes the reading's
  // focus; the Intent mode's names the selected story above it. CI status
  // sits beside terminal location explanations; it is omitted while locations
  // are still loading so the browser's empty-selection homepage does not
  // remount a second judgment.
  const withNotice = (body: ReactNode) => (
    <>
      {notice}
      {body}
    </>
  );
  const explained = (
    children: ReactNode,
    options: { readonly withCi: boolean } = { withCi: true },
  ) =>
    withNotice(
      <div
        role="tabpanel"
        id={intentTabPanelId(modeIdPrefix, mode)}
        aria-labelledby={intentTabId(modeIdPrefix, mode)}
        tabIndex={-1}
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
      </div>,
    );
  if (work === undefined || intent === "loading") {
    // Withhold CI until locations settle: a cold Intent open can mount with
    // work still unread (NotConfigured placeholder), and mounting CI here
    // would judge once and again when the browser or terminal explanation
    // replaces it.
    return explained(
      work === undefined ? (
        <LocationsNotConfigured label={source.label} />
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
    return explained(<LocationsNotConfigured label={source.label} />);
  }
  if (intent.status === "settings-problem") {
    return explained(
      <LocationsSettingsProblem
        label={source.label}
        problem={intent.problem}
        onRetry={retryLocations}
      />,
    );
  }
  // Tree and Purpose share one Intent selection, kept with the project's
  // reading place, and read the revision shown.
  return withNotice(
    <IntentWorkspaceSelectionProvider>
      <IntentBrowser
        source={source}
        work={work}
        selectedIdentity={selectedIdentity}
        revision={shownRevision ?? work.revision}
        locations={intent.locations}
        mode={mode}
        modeIdPrefix={modeIdPrefix}
        onModeChange={onModeChange}
        storySummary={storySummary}
        story={story}
      />
    </IntentWorkspaceSelectionProvider>,
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
      <IntentReadingPlace
        key={source.id}
        project={source.id}
        story={selectedIdentity}
      >
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
      </IntentReadingPlace>
    </main>
  );
}
