// A route-known local reader: no live CI owner mounts, including bootstrap.
import { useContext, useEffect, useState } from "react";
import type {
  CiFollowUpReading,
  FollowUpDestination,
} from "./ciFollowUpReading.ts";
import { retainedFollowUpUnreadable } from "./ciFollowUpReadSource.ts";
import { useCiFollowUpReads } from "./pageReads.tsx";
import { IntentCiRetainedProvider } from "./IntentCiEvidence.tsx";
import { IntentPage } from "./IntentPage.tsx";
import { useStorySummary, type StorySummary } from "./IntentStorySummary.tsx";
import { useIntentStoryLens } from "./useIntentStoryLens.ts";
import { useHistoricalIntentLocations } from "./useHistoricalIntentLocations.tsx";
import {
  IntentReadingPlace,
  IntentReadingScope,
} from "./pageIntentReading.tsx";
import { useIntentScope } from "./intentStoryTabs.tsx";
import { useIntentModeChoice } from "./pageIntentMode.tsx";
import { useStorySelection } from "./pageStorySelection.tsx";
import { IntentWorkspaceSelectionProvider } from "./intentWorkspaceSelection.ts";
import { FollowUpNavigationOnPage } from "./ciFollowUpNavigation.tsx";
import type { IntentOnPage } from "./IntentPerspective.tsx";
import "./intent-perspective.css";

function HistoricalPage({
  source,
  summary,
  ...props
}: Omit<Parameters<typeof IntentPage>[0], "shown"> & {
  readonly summary: StorySummary;
}) {
  const shown = useHistoricalIntentLocations(source, summary);
  return (
    <IntentReadingScope name="story">
      <IntentWorkspaceSelectionProvider>
        <IntentPage source={source} shown={shown} {...props} />
      </IntentWorkspaceSelectionProvider>
    </IntentReadingScope>
  );
}

type Props = Parameters<typeof IntentOnPage>[0] & {
  readonly destination: FollowUpDestination;
};
function RetainedStory({
  source,
  work,
  records,
  workspaces,
  destination,
}: Props) {
  const [reading, setReading] = useState<CiFollowUpReading>();
  const [problem, setProblem] = useState<string>();
  const [round, setRound] = useState(0);
  const [projectRequested, requestProject] = useState(false);
  const { selection } = useStorySelection(source.id);
  const { chooseScope } = useIntentScope(selection);
  const navigate = useContext(FollowUpNavigationOnPage);
  const reads = useCiFollowUpReads();
  const project = useIntentModeChoice(source.id);
  const lens = useIntentStoryLens({
    source,
    work,
    records,
    workspaces,
    selectedIdentity: destination.identity,
  });
  const summary = useStorySummary(lens.story, lens.comparison, lens.retry);
  // The reading owner commits the scope before this route unmounts it.
  useEffect(() => {
    if (projectRequested) navigate?.(undefined);
  }, [projectRequested, navigate]);

  useEffect(() => {
    let current = true;
    void reads
      .readRetained(source.id, {
        identity: destination.identity,
        revision: destination.revision,
      })
      .then((value) => {
        if (current) {
          setReading(value);
          setProblem(undefined);
        }
      })
      .catch((error: unknown) => {
        if (current)
          setProblem(
            error instanceof Error ? error.message : retainedFollowUpUnreadable,
          );
      });
    return () => {
      current = false;
    };
  }, [source.id, destination.identity, destination.revision, round, reads]);
  return (
    <IntentCiRetainedProvider
      source={source}
      identity={destination.identity}
      revision={destination.revision}
      reading={reading}
      problem={problem}
      retry={() => {
        setRound((value) => value + 1);
      }}
    >
      {summary === undefined ? (
        <p>Reading selected Done story…</p>
      ) : (
        <HistoricalPage
          source={source}
          summary={summary}
          project={project}
          story={{
            summary,
            selection,
            compared: lens.compared,
            onProjectIntent: () => {
              chooseScope("project");
              requestProject(true);
            },
          }}
        />
      )}
    </IntentCiRetainedProvider>
  );
}
export function RetainedFollowUpPerspective(props: Props) {
  return (
    <main
      className="intent-perspective"
      aria-label="Intent"
      data-selected-story={props.destination.identity}
    >
      <IntentReadingPlace
        project={props.source.id}
        story={props.destination.identity}
      >
        <IntentReadingScope name="project">
          <RetainedStory
            key={`${props.source.id}/${props.destination.identity}/${props.destination.revision}`}
            {...props}
          />
        </IntentReadingScope>
      </IntentReadingPlace>
    </main>
  );
}
