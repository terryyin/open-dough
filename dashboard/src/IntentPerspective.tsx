// The Intent perspective of the selected project: Purpose reads configured
// test-source locations at Intent's reading revision
// (`./useShownIntentLocations.tsx`) through the authenticated read boundary
// (`./IntentBrowser.tsx`), behind its one revision notice, which each view
// shows under its tabs. Intent shows either
// **Project Intent** (`./IntentProjectView.tsx`), the landing with no selected
// story, or, with a story selected on the page, that story's view
// (`./IntentStoryView.tsx`), each from its own Intent CI evidence owner
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
import { backToStoryId } from "./IntentModeTabs.tsx";
import { IntentProjectView } from "./IntentProjectView.tsx";
import { IntentWorkspaceSelectionProvider } from "./intentWorkspaceSelection.ts";
import {
  useStorySummary,
  type ComparedStory,
  type StorySummary,
} from "./IntentStorySummary.tsx";
import { useIntentScope, type IntentScope } from "./intentStoryTabs.tsx";
import { IntentStoryView, toProjectIntentId } from "./IntentStoryView.tsx";
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
import "./intent-perspective.css";
import "./intent-candidates.css";

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
  const shown = useShownIntentLocations(source, work);
  const { settled, locations } = shown;
  const storyShown = storySummary !== undefined && scope === "story";
  // Project Intent's trunk evidence is read from its first showing on.
  const [projectVisited, setProjectVisited] = useState(!storyShown);
  if (!storyShown && !projectVisited) setProjectVisited(true);
  // Without locations it waits for them to settle, lest the browser's
  // homepage replacing the loading explanation judge twice.
  const projectCiActive =
    projectVisited &&
    (locations !== undefined || (settled && project.mode === "ci"));
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

  return (
    <>
      <IntentCiEvidenceProvider
        source={source}
        work={work}
        selectedIdentity={selection?.identity}
        active={storySummary !== undefined && work !== undefined}
      >
        {storyShown && (
          <IntentReadingScope name="story">
            <IntentWorkspaceSelectionProvider>
              <IntentStoryView
                summary={storySummary}
                selection={selection}
                story={story}
                source={source}
                work={work}
                shown={shown}
                idPrefix={project.modeIdPrefix}
                onProjectIntent={() => {
                  visit("project");
                }}
              />
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
          <IntentReadingScope name="project">
            <IntentWorkspaceSelectionProvider>
              <IntentProjectView
                source={source}
                work={work}
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
          </IntentReadingScope>
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
        <IntentBody
          source={source}
          work={work}
          selection={selection}
          project={project}
          storySummary={storySummary}
          story={compared}
        />
      </IntentReadingPlace>
    </main>
  );
}
