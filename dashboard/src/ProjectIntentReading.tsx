// The project's followed Intent reading (`./useShownIntentLocations.tsx`):
// the locations at Project Intent's reading revision, its refresh notice and
// Show latest, read once for the perspective (`./IntentPerspective.tsx`) under
// its reading place and `project` scope (`./pageIntentReading.tsx`), with the
// page's read recovery. It renders Project Intent (`./IntentPage.tsx`) with
// its own workspace selection while Project Intent shows. The selected story's
// pages read the same followed reading through `storyPages`, under the
// `story` reading scope, so the story's browser follows Show latest too. It
// does not own the story lens, selection, chosen view, scope choice, arrival
// focus or either scope's CI evidence; its caller supplies those around it.

import type { ReactNode } from "react";
import { IntentPage } from "./IntentPage.tsx";
import { IntentWorkspaceSelectionProvider } from "./intentWorkspaceSelection.ts";
import type { ModeChoice } from "./pageIntentMode.tsx";
import { IntentReadingScope } from "./pageIntentReading.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import {
  useShownIntentLocations,
  type ShownIntentLocations,
} from "./useShownIntentLocations.tsx";

export function ProjectIntentReading({
  source,
  work,
  project,
  projectShown,
  onBackToStory,
  storyPages,
}: {
  readonly source: PublishedSource;
  // The project's observed work; undefined while unknown or not yet read.
  readonly work: PublishedWork | undefined;
  // Project Intent's chosen view and its tab ids.
  readonly project: ModeChoice;
  // Whether Project Intent shows.
  readonly projectShown: boolean;
  // Returns to the selected story, when there is one.
  readonly onBackToStory?: (() => void) | undefined;
  // The selected story's pages, given the same followed reading.
  readonly storyPages?: (reading: ShownIntentLocations) => ReactNode;
}) {
  const reading = useShownIntentLocations(source, work);
  return (
    <>
      {storyPages !== undefined && (
        <IntentReadingScope name="story">
          {storyPages(reading)}
        </IntentReadingScope>
      )}
      {projectShown && (
        <IntentWorkspaceSelectionProvider>
          <IntentPage
            source={source}
            shown={reading}
            project={project}
            onBackToStory={onBackToStory}
          />
        </IntentWorkspaceSelectionProvider>
      )}
    </>
  );
}
