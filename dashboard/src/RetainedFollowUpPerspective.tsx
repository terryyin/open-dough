// A route-known local reader: no live CI owner mounts, including bootstrap.
import { useContext, useEffect, useState } from "react";
import { ciFollowUpEndpoint } from "./ciFollowUp.ts";
import {
  ciFollowUpReadingSchema,
  type CiFollowUpReading,
  type FollowUpDestination,
} from "./ciFollowUpReading.ts";
import { localSettingRequest } from "./localSettingRequest.ts";
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
import type { IntentPerspective } from "./IntentPerspective.tsx";

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

type Props = Parameters<typeof IntentPerspective>[0] & {
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
    const params = new URLSearchParams({ id: source.id, ...destination });
    void localSettingRequest(
      `${ciFollowUpEndpoint}?${params}`,
      undefined,
      "Retained CI follow-up evidence could not be read.",
    )
      .then((value) => {
        if (current) {
          setReading(ciFollowUpReadingSchema.parse(value));
          setProblem(undefined);
        }
      })
      .catch((error: unknown) => {
        if (current)
          setProblem(
            error instanceof Error
              ? error.message
              : "Retained CI follow-up evidence could not be read.",
          );
      });
    return () => {
      current = false;
    };
  }, [source.id, destination.identity, destination.revision, round]);
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
