// A selected Done story's Intent view as the page composes it
// (../../src/IntentPerspective.tsx), within Project Intent's followed reading
// (../../src/ProjectIntentReading.tsx): the story's own CI evidence owner
// (../../src/IntentCiEvidence.tsx) around its page (../../src/IntentPage.tsx),
// whose repository result is read at its published completion.
import { page } from "vitest/browser";
import "../page-objects/cssLocator.ts";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { ComparedStory } from "../../../Distribution/tests/support/comparedStoryTestData.mjs";
import { IntentCiEvidenceProvider } from "../../src/IntentCiEvidence.tsx";
import type { IntentCiReadSource } from "../../src/intentCiReadSource.ts";
import { IntentPage, type IntentPageStory } from "../../src/IntentPage.tsx";
import { PageReadsOnPage, type PageReads } from "../../src/pageReads.tsx";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import type { StorySummary } from "../../src/IntentStorySummary.tsx";
import { IntentWorkspaceSelectionProvider } from "../../src/intentWorkspaceSelection.ts";
import {
  IntentReadingProvider,
  ProjectIntentReadingPlace,
} from "../../src/pageIntentReading.tsx";
import { ProjectIntentReading } from "../../src/ProjectIntentReading.tsx";
import { storyComparisonShown } from "../../src/storyComparisonShown.ts";
import type { StoryReview } from "../../src/storyReviewContract.ts";
import { useHistoricalIntentLocations } from "../../src/useHistoricalIntentLocations.tsx";
import type { PublishedSource } from "../../src/publishedSource.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";

const project = {
  mode: "ci",
  modeIdPrefix: "project-intent",
  onModeChange() {},
} as const;

function DoneStory({
  source,
  story,
}: {
  readonly source: PublishedSource;
  readonly story: IntentPageStory;
}) {
  const shown = useHistoricalIntentLocations(source, story.summary);
  return (
    <IntentPage source={source} shown={shown} project={project} story={story} />
  );
}

// The Done story's header and published comparison, with its done record
// still being read.
function summaryOf(story: ComparedStory, completion: string): StorySummary {
  const review = {
    ...makeMe.aStoryReview.published().please(),
    completion,
  } as StoryReview;
  const shown = storyComparisonShown({
    subject: { source: story.source.id, identity: story.identity },
    review,
  });
  if (shown === undefined) throw new Error("No published comparison");
  return {
    story: {
      identity: story.identity,
      title: "Story A",
      completed: true,
      record: { state: "reading" },
    },
    comparison: { state: "compared", shown, review, defaultReview: review },
    sessionChosen: false,
    onRetry() {},
  };
}

// Each case's completion is its own: locations are cached per revision.
export async function mountDoneStory(
  story: ComparedStory,
  completion: string,
  storyResult: PageReads["storyResult"],
  ci: IntentCiReadSource,
) {
  const summary = summaryOf(story, completion);
  const storyPage: IntentPageStory = {
    summary,
    selection: { project: story.source.id, identity: story.identity },
    compared: undefined,
  };
  await mountComponent(
    <PageReadsOnPage reads={pageReadsSupplying({ storyResult, ci })}>
      <IntentReadingProvider project={story.source.id}>
        <ProjectIntentReadingPlace
          project={story.source.id}
          story={story.identity}
        >
          <ProjectIntentReading
            source={story.source}
            work={undefined}
            project={project}
            projectShown={false}
            storyPages={() => (
              <IntentCiEvidenceProvider
                source={story.source}
                work={story.work}
                selectedIdentity={story.identity}
                active
              >
                <IntentWorkspaceSelectionProvider>
                  <DoneStory source={story.source} story={storyPage} />
                </IntentWorkspaceSelectionProvider>
              </IntentCiEvidenceProvider>
            )}
          />
        </ProjectIntentReadingPlace>
      </IntentReadingProvider>
    </PageReadsOnPage>,
    { viewport: { width: 1280, height: 600 } },
  );
  const tab = (name: "CI comparison") =>
    page.getByRole("tab", { name, exact: true });
  const files = page.getByCSS(".intent-locations");
  const failure = files.getByRole("alert");
  return {
    tab,
    title: page
      .getByRole("region", { name: "Selected story", exact: true })
      .getByRole("heading", { level: 2 }),
    headers: page.getByRole("region", { name: "Selected story", exact: true }),
    files,
    failure,
    retry: failure.getByRole("button", { name: "Retry", exact: true }),
  };
}
