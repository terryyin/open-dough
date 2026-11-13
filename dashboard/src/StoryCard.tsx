// One work item's card in its column (`./Columns.tsx`), read at two levels.
// Its scan view leads with the title, then its priority in the Backlog, the
// assigned or preparing developer, preparation badges with the story's
// start eligibility (`./startEligibility.ts`), dependencies, slice progress
// on Taken work with a brief source
// qualification, its launches (`./StoryCardLaunches.tsx`), and its inspection
// group: Select story, which toggles the page's selected story
// (`./pageStorySelection.tsx`) as an empty-area click does, and highlights the
// card while it is selected; Inspect story, led by a chevron that turns while
// the detail is open, which opens and closes this card's secondary detail
// (`./StoryDetail.tsx`, inspection in `./pageStoryInspection.tsx`) of identity,
// assignment records, explanations, evidence, and source links, from facts
// already read, without changing the selection; and Review changes
// (`./StoryReviewAction.tsx`) when offered.
// While its story starts on this machine (`./storyStartup.ts`), none of the
// card's actions but Select story can run, Inspect story included. Its facts
// stay readable and its source links are shown on the card, so none waits
// behind that unavailable action, and the
// card and each unavailable action are described by its startup status
// (`./protectedFrame.ts`), which the card holds the keyboard on once a
// launch dialog hands the startup off (`./launchDialogLauncher.ts`).

import { useId, useRef, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Icon } from "./Icon.tsx";
import "./frame-controls.css";
import type { PublishedWork, WorkEntry } from "./publishedWork.ts";
import { StoryCardDependencies } from "./StoryCardDependencies.tsx";
import { StoryCardPreparationFacts } from "./StoryCardPreparation.tsx";
import { SliceProgress } from "./SliceProgress.tsx";
import { WorkSourceLinks } from "./WorkSourceLinks.tsx";
import { StoryDetail } from "./StoryDetail.tsx";
import {
  PreparingFacts,
  TakenOwnerFacts,
  type OpenRoster,
} from "./AgentAssignmentFacts.tsx";
import { storyCardMarks } from "./storyCardFocus.ts";
import type { MachineSessions } from "./agentLaunches.ts";
import { StoryCardLaunches } from "./StoryCardLaunches.tsx";
import {
  dependencyStartReason,
  startEligibilityOf,
} from "./startEligibility.ts";
import { StoryReviewAction } from "./StoryReviewAction.tsx";
import { storyCardSessionsOf } from "./agentLaunch.ts";
import { SelectStory, toggleOnEmptyArea } from "./pageStorySelection.tsx";
import { ProtectedFrameReason } from "./protectedFrame.ts";

export function StoryCard({
  work,
  entry,
  priority,
  showsSliceProgress,
  launches,
  offersStart,
  selected,
  onSelect,
  inspected,
  onInspect,
  onOpenRoster,
}: {
  // The published project snapshot containing this entry.
  work: PublishedWork;
  entry: WorkEntry;
  priority: number | undefined;
  // Taken cards only: queued work shows no progress.
  showsSliceProgress: boolean;
  launches: MachineSessions;
  // Backlog cards only: Taken work offers no launch.
  offersStart: boolean;
  // Whether this card is the page's selected story, which highlights it.
  selected: boolean;
  onSelect: (identity: string) => void;
  // Whether this card's detail is open.
  inspected: boolean;
  onInspect: (identity: string) => void;
  onOpenRoster: OpenRoster;
}) {
  const sourceId = work.source.id;
  const cardRef = useRef<HTMLElement>(null);
  const detailId = `story-detail-${entry.identity.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  // Every startup of the story protects its frame.
  const starting =
    launches.storyStartupOf(sourceId, entry.identity) !== undefined;
  const statusId = useId();
  const eligibility = startEligibilityOf(entry);
  const reason = starting ? statusId : undefined;
  return (
    <article
      ref={cardRef}
      className={[
        "story-card",
        selected && "story-card-selected",
        starting && "story-card-starting",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={entry.title}
      aria-describedby={reason}
      onClick={toggleOnEmptyArea(() => {
        onSelect(entry.identity);
      })}
      {...storyCardMarks(entry.identity)}
    >
      <StartupFrame reason={reason}>
        <h3>{entry.title}</h3>
        <div className="story-card-meta">
          {priority !== undefined && (
            <p className="story-card-priority">Priority {priority}</p>
          )}
          <TakenOwnerFacts owner={entry.owner} onOpenRoster={onOpenRoster} />
          <PreparingFacts
            preparing={entry.preparing}
            onOpenRoster={onOpenRoster}
          />
        </div>
        <StoryCardPreparationFacts
          preparation={entry.preparation}
          eligibility={eligibility}
          executionOpen={storyCardSessionsOf(
            launches.launched,
            sourceId,
            entry.identity,
          ).some((record) => record.request.workflow === "execution")}
        />
        <StoryCardDependencies work={work} dependencies={entry.dependencies} />
        {showsSliceProgress && (
          <SliceProgress
            planSlices={entry.planSlices}
            progressSource={entry.progressSource}
            sliceClock={entry.sliceClock}
          />
        )}
        <StoryCardLaunches
          sourceId={sourceId}
          entry={entry}
          launches={launches}
          offersStart={offersStart}
          dependencyProblem={dependencyStartReason(eligibility)}
          statusId={statusId}
        />
      </StartupFrame>
      {/* Select story stays outside the startup protection. */}
      <div
        className="story-card-action-group story-card-inspection-group"
        role="group"
        aria-label="Inspection actions"
      >
        <SelectStory
          selected={selected}
          onToggle={() => {
            onSelect(entry.identity);
          }}
        />
        <StartupFrame reason={reason}>
          <button
            type="button"
            className="inspect-story frame-disclosure-button"
            aria-expanded={inspected}
            aria-controls={detailId}
            aria-describedby={reason}
            onClick={() => {
              onInspect(entry.identity);
              // Closing detail returns focus to this story's card.
              if (inspected) {
                queueMicrotask(() => {
                  cardRef.current?.focus();
                });
              }
            }}
          >
            <Icon icon={ChevronRight} />
            {inspected ? "Hide detail" : "Inspect story"}
          </button>
          <StoryReviewAction
            records={launches.records}
            workspaces={launches.workspaces}
            sourceId={sourceId}
            work={entry}
          />
        </StartupFrame>
      </div>
      <StartupFrame reason={reason}>
        {inspected && <StoryDetail entry={entry} detailId={detailId} />}
        {!inspected && starting && (
          <ul className="story-card-links" aria-label="Source links">
            <WorkSourceLinks entry={entry} />
          </ul>
        )}
      </StartupFrame>
    </article>
  );
}

// A part of the card that its story's startup protects: disabled, with each
// action described by the startup status `reason`, while one is given.
function StartupFrame({
  reason,
  children,
}: {
  readonly reason: string | undefined;
  readonly children: ReactNode;
}) {
  return (
    <fieldset className="story-card-frame" disabled={reason !== undefined}>
      <ProtectedFrameReason value={reason}>{children}</ProtectedFrameReason>
    </fieldset>
  );
}
