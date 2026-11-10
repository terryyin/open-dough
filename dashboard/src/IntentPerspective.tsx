// The Intent perspective of the selected project: Purpose reads configured
// test-source locations at Project Intent's reading revision
// (`./useShownIntentLocations.tsx`) or the Done story's landed result
// (`./useHistoricalIntentLocations.tsx`) through the authenticated read boundary
// (`./IntentBrowser.tsx`). The project alone shows its refresh notice under
// its tabs. Intent shows either
// **Project Intent** (`./IntentPage.tsx`), the landing with no selected
// story, or, with a story selected on the page, that story's view
// (`./IntentPage.tsx`), each from its own Intent CI evidence owner
// (`./IntentCiEvidence.tsx`): Project Intent judges the project's trunk, the
// story's view reads the story's evidence. Each scope keeps its own reading
// place, selection and Hide files choice (`./pageIntentReading.tsx`); which
// one shows is `./intentStoryTabs.tsx`'s. Going between them moves the
// keyboard to the control that comes back. The story's evidence is read as
// soon as work is known, whatever the locations' state, and keeps being
// followed during a visit to Project Intent, so returning reads nothing again;
// the project's trunk evidence is read once Project Intent first shows and
// then followed while Intent stays open. The chosen Project Intent view
// (`./pageIntentMode.tsx`) and the reading place are kept by the page per
// project.

import { useEffect, useRef, useState } from "react";
import { IntentCiEvidenceProvider } from "./IntentCiEvidence.tsx";
import { backToStoryId } from "./intentProjectTabs.ts";
import {
  IntentPage,
  toProjectIntentId,
  type IntentPageStory,
} from "./IntentPage.tsx";
import { IntentWorkspaceSelectionProvider } from "./intentWorkspaceSelection.ts";
import {
  useStorySummary,
  publishedDoneEndpointOf,
  publishedDoneEndpointReasonOf,
  type ComparedStory,
  type StorySummary,
} from "./IntentStorySummary.tsx";
import { useIntentScope, type IntentScope } from "./intentStoryTabs.tsx";
import type { LaunchRecord } from "./launchRecord.ts";
import type { LocalWorkspace } from "./localWorkspace.ts";
import { useIntentModeChoice, type ModeChoice } from "./pageIntentMode.tsx";
import {
  IntentReadingPlace,
  IntentReadingScope,
} from "./pageIntentReading.tsx";
import {
  useStorySelection,
  type SelectedStory,
} from "./pageStorySelection.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import { useShownIntentLocations } from "./useShownIntentLocations.tsx";
import { useIntentStoryLens } from "./useIntentStoryLens.ts";
import { useHistoricalIntentLocations } from "./useHistoricalIntentLocations.tsx";
import "./intent-perspective.css";
import "./intent-candidates.css";

function HistoricalStoryPage({
  source,
  project,
  story,
}: {
  readonly source: PublishedSource;
  readonly project: ModeChoice;
  readonly story: IntentPageStory;
}) {
  const shown = useHistoricalIntentLocations(source, story.summary);
  return (
    <IntentPage source={source} shown={shown} project={project} story={story} />
  );
}

function IntentBody({
  source,
  work,
  selection,
  project,
  storySummary,
  story,
}: {
  readonly source: PublishedSource;
  readonly work: PublishedWork | undefined;
  // The page's selection of a story here, and that story.
  readonly selection: SelectedStory | undefined;
  // Project Intent's chosen view and its tab ids.
  readonly project: ModeChoice;
  // The selected story as its header names it, and with its comparison once
  // compared.
  readonly storySummary: StorySummary | undefined;
  readonly story: ComparedStory | undefined;
}) {
  const { scope, chooseScope } = useIntentScope(selection);
  const storyShown = storySummary !== undefined && scope === "story";
  // Project Intent's trunk evidence is read from its first showing on.
  const [projectVisited, setProjectVisited] = useState(!storyShown);
  if (!storyShown && !projectVisited) setProjectVisited(true);
  // A Done story reads its own source. The project's browser starts on its
  // first visit, retaining any earlier project reading when one exists.
  const shown = useShownIntentLocations(
    source,
    projectVisited || storySummary?.story.completed !== true ? work : undefined,
  );
  // CI starts independently of the locations read. The same mounted owner
  // supplies the loading explanation and the browser once locations settle.
  const projectCiActive = projectVisited && work !== undefined;
  // The control that comes back, focused once the other scope shows.
  const arrival = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (arrival.current === undefined) return;
    document.getElementById(arrival.current)?.focus();
    arrival.current = undefined;
  }, [scope]);
  const visit = (next: IntentScope) => {
    arrival.current =
      next === "project"
        ? backToStoryId(project.modeIdPrefix)
        : toProjectIntentId(project.modeIdPrefix);
    chooseScope(next);
  };
  const storyPage: IntentPageStory | undefined = storyShown
    ? {
        summary: storySummary,
        selection,
        compared: story,
        onProjectIntent: () => {
          visit("project");
        },
      }
    : undefined;

  const doneEndpoint = publishedDoneEndpointOf(storySummary);
  const doneEndpointReason = publishedDoneEndpointReasonOf(storySummary);

  return (
    <>
      <IntentCiEvidenceProvider
        source={source}
        work={work}
        selectedIdentity={selection?.identity}
        active={storySummary !== undefined && work !== undefined}
        {...(doneEndpoint === undefined ? {} : { doneEndpoint })}
        {...(doneEndpointReason === undefined ? {} : { doneEndpointReason })}
      >
        {storyPage !== undefined && (
          <IntentReadingScope name="story">
            <IntentWorkspaceSelectionProvider>
              {storyPage.summary.story.completed ? (
                <HistoricalStoryPage
                  key={storyPage.summary.story.identity}
                  source={source}
                  project={project}
                  story={storyPage}
                />
              ) : (
                <IntentPage
                  source={source}
                  shown={shown}
                  project={project}
                  story={storyPage}
                />
              )}
            </IntentWorkspaceSelectionProvider>
          </IntentReadingScope>
        )}
      </IntentCiEvidenceProvider>
      <IntentCiEvidenceProvider
        source={source}
        work={work}
        selectedIdentity={undefined}
        active={projectCiActive}
      >
        {!storyShown && (
          <IntentWorkspaceSelectionProvider>
            <IntentPage
              source={source}
              shown={shown}
              project={project}
              onBackToStory={
                storySummary === undefined
                  ? undefined
                  : () => {
                      visit("story");
                    }
              }
            />
          </IntentWorkspaceSelectionProvider>
        )}
      </IntentCiEvidenceProvider>
    </>
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
  // the lens reads its comparison for the browser's overlay and the story's
  // header.
  const { selection, selectedIdentity } = useStorySelection(source.id);
  const project = useIntentModeChoice(source.id);
  const { story, comparison, compared, retry } = useIntentStoryLens({
    source,
    work,
    selectedIdentity,
    records,
    workspaces,
  });
  const storySummary = useStorySummary(story, comparison, retry);
  return (
    <main
      className="intent-perspective"
      aria-label="Intent"
      {...(selectedIdentity !== undefined
        ? { "data-selected-story": selectedIdentity }
        : {})}
    >
      <IntentReadingPlace
        key={source.id}
        project={source.id}
        story={selectedIdentity}
      >
        <IntentReadingScope name="project">
          <IntentBody
            source={source}
            work={work}
            selection={selection}
            project={project}
            storySummary={storySummary}
            story={compared}
          />
        </IntentReadingScope>
      </IntentReadingPlace>
    </main>
  );
}
